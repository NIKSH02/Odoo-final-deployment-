import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  refreshToken: String,
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  passwordResetToken: String,
  passwordResetExpiry: Date,
  role: {
    type: String,
    enum: ["player", "facility_owner", "admin"],
    required: false, // Make it optional so users can be created without a role
  },
  authProvider: { type: String, enum: ["local", "google"], default: "local" },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
