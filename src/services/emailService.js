const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send OTP email for password reset
const sendPasswordResetOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - TeamFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">TeamFlow</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              You requested to reset your password. Use the following OTP to complete the process:
            </p>
            
            <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                This OTP will expire in 10 minutes
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2024 TeamFlow. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send email verification OTP
const sendEmailVerificationOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - TeamFlow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">TeamFlow</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email</h2>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              Please verify your email address by entering the following OTP:
            </p>
            
            <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                This OTP will expire in 10 minutes
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              If you didn't create an account, please ignore this email.
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2024 TeamFlow. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetOTP,
  sendEmailVerificationOTP
}; 