// Verify OTP (only needs email and otp)
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    if (user.isEmailVerified) throw new ApiError(400, "Email already verified");
    if (user.otp !== otp || user.otpExpiry < Date.now())
      throw new ApiError(400, "Invalid or expired OTP");
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email verified successfully!"));
  }
  // If user does not exist yet, just accept OTP for now (simulate verification)
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully!"));
});

// ================= IMPORTS =================
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "../utils/generateToken.js";
import { generateOTP, sendOTPEmail, sendPasswordResetEmail } from "../utils/emailUtils.js";
import { validatePassword } from "../utils/passwordValidator.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= CONTROLLERS =================

// Check if email exists and its verification status
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  
  const user = await User.findOne({ email });
  
  if (!user) {
    // Email doesn't exist, can proceed with registration
    return res.status(200).json(
      new ApiResponse(200, { 
        exists: false, 
        verified: false,
        message: "Email available for registration" 
      })
    );
  }
  
  if (user.isEmailVerified && user.username) {
    // User is fully registered
    return res.status(400).json(
      new ApiResponse(400, { 
        exists: true, 
        verified: true,
        message: "Email already registered. Please sign in instead." 
      }, "Email already registered")
    );
  }
  
  // User exists but not fully registered (email verified but no username/password)
  return res.status(200).json(
    new ApiResponse(200, { 
      exists: true, 
      verified: user.isEmailVerified,
      message: user.isEmailVerified 
        ? "Complete your registration" 
        : "Please verify your email first"
    })
  );
});

// Send OTP for email verification (only needs email)
const sendOtp = asyncHandler(async (req, res) => {
  const { email, purpose = "signup" } = req.body;
  let user = await User.findOne({ email });
  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min

  if (purpose === "login") {
    if (!user) {
      console.error(`[OTP LOGIN ERROR] No user found for email: ${email}`);
      throw new ApiError(400, "This email is not registered.");
    }
    if (!user.isEmailVerified) {
      console.error(`[OTP LOGIN ERROR] Email not verified for: ${email}`);
      throw new ApiError(400, "This email is not verified.");
    }
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    console.log(`DEBUG OTP for login (${email}):`, otp); // Debug log
    await sendOTPEmail({ to: email, otp });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "OTP sent to registered email."));
  }

  // Default: signup flow
  if (user && user.isEmailVerified && user.username) {
    return res.status(400).json(
      new ApiResponse(400, { 
        exists: true, 
        verified: true,
        message: "Email already registered. Please sign in instead." 
      }, "Email already registered")
    );
  }
  
  if (!user) {
    user = new User({ email, otp, otpExpiry, isEmailVerified: false });
    await user.save();
    console.log(`DEBUG OTP for signup (created new user: ${email}):`, otp);
  } else {
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    console.log(`DEBUG OTP for signup (${email}):`, otp);
  }
  await sendOTPEmail({ to: email, otp });
  res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent to email. Please verify."));
});

// Signup (register) - create account and send OTP
const signup = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, role } = req.body;
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new ApiError(400, passwordValidation.errors.join('. '));
  }
  
  // Check if user already exists with verified email and username
  let user = await User.findOne({ email });
  
  if (user && user.isEmailVerified && user.username) {
    return res.status(400).json(
      new ApiResponse(400, { 
        exists: true, 
        verified: true,
        message: "Email already registered. Please sign in instead." 
      }, "Email already registered")
    );
  }

  // Check if username is already taken by another user
  const usernameExists = await User.findOne({ username });
  if (usernameExists && usernameExists.email !== email) {
    throw new ApiError(400, "Username already taken");
  }

  // Validate role if provided
  if (role && !["player", "facility_owner"].includes(role)) {
    throw new ApiError(
      400,
      'Invalid role. Must be either "player" or "facility_owner"'
    );
  }

  const otp = generateOTP();
  const otpExpiry = Date.now() + 1 * 60 * 1000; // 1 min

  if (user) {
    // Update existing user with new details
    user.fullName = fullName;
    user.username = username;
    user.password = password;
    user.role = role; // Don't default to player - let frontend handle role selection
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.isEmailVerified = false; // Reset verification status
  } else {
    // Create new user
    user = new User({
      fullName,
      username, 
      email,
      password,
      role: role, // Don't default to player - let frontend handle role selection
      otp,
      otpExpiry,
      isEmailVerified: false
    });
  }

  // Handle profile picture upload if file is provided
  if (req.file) {
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        public_id: `profile_${user._id || Date.now()}_${Date.now()}`,
      });
      user.profilePicture = uploadResult.secure_url;
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      throw new ApiError(500, "Failed to upload profile picture");
    }
  }

  await user.save();
  
  // Send OTP email
  try {
    await sendOTPEmail({ to: email, otp });
    console.log(`DEBUG OTP for signup (${email}):`, otp);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new ApiError(500, "Failed to send verification email");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { 
      message: "Account created! Please verify your email.", 
      email: email 
    }, "Account created successfully"));
});

// Signin (login with password)
const signin = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  const user = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  });
  
  if (!user) throw new ApiError(400, "User not found");
  
  if (!user.isEmailVerified) {
    // Send OTP for email verification
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    await sendOTPEmail({ to: user.email, otp });
    console.log(`DEBUG OTP for email verification (${user.email}):`, otp);
    
    return res.status(400).json(
      new ApiResponse(400, {
        needsVerification: true,
        email: user.email
      }, "Email not verified. OTP sent to your email.")
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(400, "Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();
  setAuthCookies(res, accessToken, refreshToken);

  // Return user data and token for frontend
  const userData = {
    id: user._id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    profilePicture: user.profilePicture,
    isEmailVerified: user.isEmailVerified,
  };

  res.json(
    new ApiResponse(
      200,
      { token: accessToken, user: userData },
      "Login successful"
    )
  );
});

// Refresh JWT token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new ApiError(401, "No refresh token");

  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== refreshToken)
    throw new ApiError(401, "Invalid refresh token");

  const newAccessToken = generateAccessToken(user);
  setAuthCookies(res, newAccessToken, refreshToken);
  
  res.json(
    new ApiResponse(
      200, 
      { token: newAccessToken }, 
      "Token refreshed successfully"
    )
  );
});

// Login with OTP
const loginWithOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`LOGIN OTP FAIL: No user for email ${email}`);
    throw new ApiError(400, "Invalid or expired OTP");
  }
  if (user.otp !== otp) {
    console.log(
      `LOGIN OTP FAIL: OTP mismatch for ${email}. Expected: ${user.otp}, Received: ${otp}`
    );
    throw new ApiError(400, "Invalid or expired OTP");
  }
  if (user.otpExpiry < Date.now()) {
    console.log(
      `LOGIN OTP FAIL: OTP expired for ${email}. Expiry: ${
        user.otpExpiry
      }, Now: ${Date.now()}`
    );
    throw new ApiError(400, "Invalid or expired OTP");
  }
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();
  setAuthCookies(res, accessToken, refreshToken);

  // Return user data and token for frontend
  const userData = {
    id: user._id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    profilePicture: user.profilePicture,
    isEmailVerified: user.isEmailVerified,
  };

  res.json(
    new ApiResponse(
      200,
      { token: accessToken, user: userData },
      "Login successful"
    )
  );
});

// Logout (signout)
const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  // Optionally, invalidate refresh token in DB if you want
  if (req.body.email) {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }
  res.json(new ApiResponse(200, null, "Logged out successfully"));
});

// Google OAuth Authentication
const googleAuth = asyncHandler(async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    throw new ApiError(400, "Google credential is required");
  }

  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.profilePicture && picture) {
        user.profilePicture = picture;
      }
      // Update role if provided and user doesn't have one
      if (role && !user.role) {
        if (!["player", "facility_owner"].includes(role)) {
          throw new ApiError(
            400,
            'Invalid role. Must be either "player" or "facility_owner"'
          );
        }
        user.role = role;
      }
      
      // If user still doesn't have a role after all checks, the frontend will show role modal
      await user.save();
    } else {
      // Validate role for new user (only if provided)
      if (role && !["player", "facility_owner"].includes(role)) {
        throw new ApiError(
          400,
          'Invalid role. Must be either "player" or "facility_owner"'
        );
      }

      // Create new user
      const username = email.split("@")[0];

      // Check if username already exists
      let finalUsername = username;
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      user = new User({
        email,
        fullName: name,
        username: finalUsername,
        googleId,
        profilePicture: picture,
        isEmailVerified: true, // Google emails are pre-verified
        authProvider: "google",
        role: role || undefined, // Don't set default role - let frontend handle role selection
      });
      await user.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    // Prepare user data for response
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role, // Include role in response
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      authProvider: user.authProvider || "google",
    };

    res.json(
      new ApiResponse(
        200,
        { token: accessToken, user: userData },
        "Google authentication successful"
      )
    );
  } catch (error) {
    console.error("Google auth error:", error);
    throw new ApiError(401, "Invalid Google token");
  }
});

// Forgot Password - Send reset link to email
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    // For security, don't reveal if email exists or not
    return res.status(200).json(
      new ApiResponse(200, null, "If your email is registered, you will receive a password reset link.")
    );
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  user.passwordResetToken = resetToken;
  user.passwordResetExpiry = resetTokenExpiry;
  await user.save();

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  // Send email
  try {
    await sendPasswordResetEmail({ to: email, resetUrl, name: user.fullName });
    console.log(`Password reset link sent to ${email}: ${resetUrl}`);
  } catch (error) {
    // Clear reset token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
    throw new ApiError(500, "Failed to send password reset email");
  }

  res.status(200).json(
    new ApiResponse(200, null, "If your email is registered, you will receive a password reset link.")
  );
});

// Reset Password - Verify token and update password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  // Validate password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new ApiError(400, passwordValidation.errors.join('. '));
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpiry: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // Update password and clear reset token
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, null, "Password reset successful. You can now login with your new password.")
  );
});

// ================= EXPORTS =================
export {
  checkEmail,
  signup,
  signin,
  sendOtp,
  loginWithOtp,
  refreshToken,
  logout,
  verifyOtp,
  googleAuth,
  forgotPassword,
  resetPassword,
};
