import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


export function generateOTP(length = 6) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
}

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certs for dev
  },
});

export async function sendOTPEmail({ to, otp }) {
  const mailOptions = {
    from: `"QuickCourt" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your QuickCourt OTP Code',
    html: `
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 20px;">
          <h1 style="color: #667eea; margin: 0; font-size: 28px; font-weight: bold;">⚡ QuickCourt</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Your Sports Booking Platform</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h2 style="color: #374151; margin: 0 0 10px 0; font-size: 22px;">Email Verification</h2>
          <p style="color: #6b7280; margin: 0; font-size: 16px;">Enter this code to verify your account:</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 25px 0; padding: 20px; border-radius: 10px;">
          <div style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
        </div>
        
        <div style="margin: 25px 0;">
          <p style="color: #ef4444; margin: 0; font-size: 14px; font-weight: 600;">⏰ This code expires in 1 minute</p>
          <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            Best regards,<br>
            The QuickCourt Team
          </p>
        </div>
      </div>
    </div>`,
  };
  await transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail({ to, resetUrl, name }) {
  const mailOptions = {
    from: `"QuickCourt" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your QuickCourt Password',
    html: `
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 20px;">
          <h1 style="color: #667eea; margin: 0; font-size: 28px; font-weight: bold;">⚡ QuickCourt</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Your Sports Booking Platform</p>
        </div>
        
        <div style="margin: 30px 0;">
          <h2 style="color: #374151; margin: 0 0 10px 0; font-size: 22px;">Password Reset Request</h2>
          <p style="color: #6b7280; margin: 0; font-size: 16px;">Hello ${name || 'User'},</p>
          <p style="color: #6b7280; margin: 10px 0; font-size: 16px;">We received a request to reset your password.</p>
        </div>
        
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Reset Your Password
          </a>
        </div>
        
        <div style="margin: 25px 0;">
          <p style="color: #ef4444; margin: 0; font-size: 14px; font-weight: 600;">⏰ This link expires in 15 minutes</p>
          <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">If you didn't request this password reset, please ignore this email.</p>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">For security, you can also copy and paste this link: ${resetUrl}</p>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">
            Best regards,<br>
            The QuickCourt Team
          </p>
        </div>
      </div>
    </div>`,
  };
  await transporter.sendMail(mailOptions);
}