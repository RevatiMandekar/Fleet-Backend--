import nodemailer from 'nodemailer';

// Create transporter (you can configure this with your email provider)
const createTransporter = () => {
  // For development/testing, you can use Gmail or any SMTP provider
  return nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS  // your app password
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>You have requested to reset your password for the Fleet Management System.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Fleet Management System.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Successful - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Password Reset Successful</h2>
          <p>Hello ${userName},</p>
          <p>Your password has been successfully reset for the Fleet Management System.</p>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Fleet Management System.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset confirmation:', error);
    return false;
  }
};

// For development/testing without real email
export const sendPasswordResetEmailDev = async (email, resetToken, userName) => {
  console.log('\n=== PASSWORD RESET EMAIL (DEV MODE) ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Password Reset Request - Fleet Management System`);
  console.log(`Hello ${userName},`);
  console.log(`Reset your password by clicking this link:`);
  console.log(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
  console.log('This link will expire in 10 minutes.');
  console.log('=====================================\n');
  return true;
};

export const sendPasswordResetConfirmationDev = async (email, userName) => {
  console.log('\n=== PASSWORD RESET CONFIRMATION (DEV MODE) ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Password Reset Successful - Fleet Management System`);
  console.log(`Hello ${userName},`);
  console.log('Your password has been successfully reset.');
  console.log('==========================================\n');
  return true;
};
