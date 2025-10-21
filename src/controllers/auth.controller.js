import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendPasswordResetEmailDev, sendPasswordResetConfirmationDev } from "../services/emailService.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid credentials",
        forgotPasswordAvailable: true,
        forgotPasswordMessage: "Having trouble logging in? You can reset your password."
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: "Account temporarily locked due to too many failed login attempts. Please try again later.",
        forgotPasswordAvailable: true,
        forgotPasswordMessage: "Account locked? You can reset your password to unlock it."
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      // Get updated user data to check current attempts
      const updatedUser = await User.findById(user._id);
      
      // Provide forgot password option based on login attempts
      const response = {
        message: "Invalid credentials",
        forgotPasswordAvailable: true,
        forgotPasswordMessage: "Having trouble remembering your password? You can reset it."
      };

      // Add additional context based on login attempts
      if (updatedUser.loginAttempts >= 3) {
        response.forgotPasswordMessage = "Multiple failed attempts detected. Consider resetting your password for security.";
        response.showForgotPasswordPrompt = true;
      }

      return res.status(400).json(response);
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot password endpoint
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent.",
        success: true
      });
    }

    // Check if user has too many recent reset attempts (prevent spam)
    const recentResetAttempts = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() - 5 * 60 * 1000 } // Within last 5 minutes
    });

    if (recentResetAttempts) {
      return res.status(429).json({
        message: "Password reset email already sent recently. Please wait 5 minutes before requesting another.",
        success: false,
        retryAfter: 300 // seconds
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send email (using dev version for now)
    const emailSent = await sendPasswordResetEmailDev(email, resetToken, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ 
        message: "Error sending email. Please try again.",
        success: false
      });
    }

    res.status(200).json({ 
      message: "If an account with that email exists, a password reset link has been sent.",
      success: true,
      // In development, also return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Enhanced forgot password endpoint for login screen integration
export const forgotPasswordFromLogin = async (req, res) => {
  try {
    const { email, loginAttempts } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Email is required",
        success: false
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For login screen integration, we can be slightly more helpful
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent.",
        success: true,
        emailSent: false // Frontend can use this to show appropriate message
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send email (using dev version for now)
    const emailSent = await sendPasswordResetEmailDev(email, resetToken, user.name);
    
    if (!emailSent) {
      return res.status(500).json({ 
        message: "Error sending email. Please try again.",
        success: false
      });
    }

    res.status(200).json({ 
      message: "Password reset link has been sent to your email.",
      success: true,
      emailSent: true,
      // In development, also return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      success: false
    });
  }
};

// Reset password endpoint
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendPasswordResetConfirmationDev(user.email, user.name);

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
