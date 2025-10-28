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

// Send trip assignment notification email
export const sendTripAssignmentEmail = async (driverEmail, driverName, tripData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: driverEmail,
      subject: 'New Trip Assignment - Fleet Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">New Trip Assignment</h2>
          <p>Hello ${driverName},</p>
          <p>You have been assigned a new trip. Please review the details below:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Trip Details</h3>
            <p><strong>Route:</strong> ${tripData.origin} → ${tripData.destination}</p>
            <p><strong>Vehicle:</strong> ${tripData.vehicle.vehicleNumber} (${tripData.vehicle.type})</p>
            <p><strong>Scheduled Start:</strong> ${new Date(tripData.startTime).toLocaleString()}</p>
            ${tripData.endTime ? `<p><strong>Scheduled End:</strong> ${new Date(tripData.endTime).toLocaleString()}</p>` : ''}
            ${tripData.distance ? `<p><strong>Distance:</strong> ${tripData.distance} km</p>` : ''}
            ${tripData.notes ? `<p><strong>Notes:</strong> ${tripData.notes}</p>` : ''}
          </div>
          
          <p>Please ensure you are ready for the trip and contact your fleet manager if you have any questions.</p>
          
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
    console.error('Error sending trip assignment email:', error);
    return false;
  }
};

// Send maintenance alert email
export const sendMaintenanceAlertEmail = async (fleetManagerEmails, vehicleData, alertType, description) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: fleetManagerEmails.join(', '),
      subject: `Maintenance Alert: ${vehicleData.vehicleNumber} - Fleet Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">🚨 Maintenance Alert</h2>
          <p>A maintenance alert has been triggered for one of your vehicles.</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Vehicle Information</h3>
            <p><strong>Vehicle Number:</strong> ${vehicleData.vehicleNumber}</p>
            <p><strong>Type:</strong> ${vehicleData.type}</p>
            <p><strong>Current Status:</strong> ${vehicleData.status}</p>
            <p><strong>Alert Type:</strong> ${alertType}</p>
            <p><strong>Description:</strong> ${description}</p>
            ${vehicleData.assignedDriver ? `<p><strong>Assigned Driver:</strong> ${vehicleData.assignedDriver.name}</p>` : ''}
          </div>
          
          <p>Please take appropriate action to address this maintenance issue.</p>
          
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
    console.error('Error sending maintenance alert email:', error);
    return false;
  }
};

// Send overdue trip alert email
export const sendOverdueTripAlertEmail = async (fleetManagerEmails, tripData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: fleetManagerEmails.join(', '),
      subject: `Overdue Trip Alert: ${tripData.origin} → ${tripData.destination} - Fleet Management System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">⏰ Overdue Trip Alert</h2>
          <p>A scheduled trip is now overdue and requires attention.</p>
          
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="color: #721c24; margin-top: 0;">Trip Information</h3>
            <p><strong>Route:</strong> ${tripData.origin} → ${tripData.destination}</p>
            <p><strong>Driver:</strong> ${tripData.driver.name}</p>
            <p><strong>Vehicle:</strong> ${tripData.vehicle.vehicleNumber} (${tripData.vehicle.type})</p>
            <p><strong>Scheduled Start:</strong> ${new Date(tripData.startTime).toLocaleString()}</p>
            <p><strong>Current Status:</strong> ${tripData.status}</p>
            <p><strong>Overdue By:</strong> ${Math.round((new Date() - new Date(tripData.startTime)) / (1000 * 60))} minutes</p>
          </div>
          
          <p>Please contact the driver or take appropriate action to address this overdue trip.</p>
          
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
    console.error('Error sending overdue trip alert email:', error);
    return false;
  }
};

// Development mode email functions
export const sendTripAssignmentEmailDev = async (driverEmail, driverName, tripData) => {
  console.log('\n=== TRIP ASSIGNMENT EMAIL (DEV MODE) ===');
  console.log(`To: ${driverEmail}`);
  console.log(`Subject: New Trip Assignment - Fleet Management System`);
  console.log(`Hello ${driverName},`);
  console.log('You have been assigned a new trip:');
  console.log(`Route: ${tripData.origin} → ${tripData.destination}`);
  console.log(`Vehicle: ${tripData.vehicle.vehicleNumber} (${tripData.vehicle.type})`);
  console.log(`Scheduled Start: ${new Date(tripData.startTime).toLocaleString()}`);
  console.log('=====================================\n');
  return true;
};

export const sendMaintenanceAlertEmailDev = async (fleetManagerEmails, vehicleData, alertType, description) => {
  console.log('\n=== MAINTENANCE ALERT EMAIL (DEV MODE) ===');
  console.log(`To: ${fleetManagerEmails.join(', ')}`);
  console.log(`Subject: Maintenance Alert: ${vehicleData.vehicleNumber} - Fleet Management System`);
  console.log('Maintenance Alert Details:');
  console.log(`Vehicle: ${vehicleData.vehicleNumber} (${vehicleData.type})`);
  console.log(`Alert Type: ${alertType}`);
  console.log(`Description: ${description}`);
  console.log('=====================================\n');
  return true;
};

export const sendOverdueTripAlertEmailDev = async (fleetManagerEmails, tripData) => {
  console.log('\n=== OVERDUE TRIP ALERT EMAIL (DEV MODE) ===');
  console.log(`To: ${fleetManagerEmails.join(', ')}`);
  console.log(`Subject: Overdue Trip Alert: ${tripData.origin} → ${tripData.destination} - Fleet Management System`);
  console.log('Overdue Trip Details:');
  console.log(`Route: ${tripData.origin} → ${tripData.destination}`);
  console.log(`Driver: ${tripData.driver.name}`);
  console.log(`Vehicle: ${tripData.vehicle.vehicleNumber} (${tripData.vehicle.type})`);
  console.log(`Scheduled Start: ${new Date(tripData.startTime).toLocaleString()}`);
  console.log(`Overdue By: ${Math.round((new Date() - new Date(tripData.startTime)) / (1000 * 60))} minutes`);
  console.log('=====================================\n');
  return true;
};