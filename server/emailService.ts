import nodemailer from 'nodemailer';
import cryptoRandomString from 'crypto-random-string';
import { type User } from '@shared/schema';
import { log } from './vite';

// Create a transporter
const getTransporter = () => {
  const service = process.env.EMAIL_SERVICE;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  
  if (!service || !user || !pass) {
    throw new Error('Email configuration missing. Please set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD environment variables.');
  }
  
  return nodemailer.createTransport({
    service,
    auth: {
      user,
      pass
    }
  });
};

// Generate a verification token
export const generateToken = (): string => {
  return cryptoRandomString({ length: 32, type: 'url-safe' });
};

// Send verification email
export const sendVerificationEmail = async (user: User, token: string): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    
    // Construct verification URL (frontend route)
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'UrbanFood - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #3a813a;">Welcome to UrbanFood!</h2>
          <p>Hello ${user.username},</p>
          <p>Thank you for signing up with UrbanFood. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3a813a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #4a4a4a;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br/>The UrbanFood Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    log(`Verification email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send login notification
export const sendLoginNotification = async (user: User): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'UrbanFood - New Login Detected',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #3a813a;">New Login Alert</h2>
          <p>Hello ${user.username},</p>
          <p>We detected a new login to your UrbanFood account.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
          <p>If this was you, you can ignore this email. If you didn't log in recently, please reset your password immediately.</p>
          <p>Best regards,<br/>The UrbanFood Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    log(`Login notification email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending login notification:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (user: User, token: string): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    
    // Construct reset URL (frontend route)
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'UrbanFood - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #3a813a;">Password Reset Request</h2>
          <p>Hello ${user.username},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3a813a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #4a4a4a;">${resetUrl}</p>
          <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
          <p>Best regards,<br/>The UrbanFood Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    log(`Password reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Verify that the email service is properly configured
export const verifyEmailService = async (): Promise<boolean> => {
  try {
    // Check for required environment variables
    const service = process.env.EMAIL_SERVICE;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;
    
    if (!service || !user || !pass) {
      log('Email configuration incomplete: missing one or more required environment variables');
      return false;
    }
    
    // Create a test transporter
    const transporter = nodemailer.createTransport({
      service,
      auth: {
        user,
        pass
      }
    });
    
    // Verify transporter configuration
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
};