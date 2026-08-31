const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env'), override: true });
const env = require('../config/env');

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST || env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || env.SMTP_USER;
  const pass = process.env.SMTP_PASS || env.SMTP_PASS;

  return { host, port, user, pass };
};

const createTransporter = () => {
  const { host, port, user, pass } = getSmtpConfig();

  if (user && user !== 'test@ethereal.email' && pass && pass !== 'password') {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
  return null;
};

const sendInvitationEmail = async ({ toEmail, inviteToken, orgName, inviterName }) => {
  const acceptUrl = `${env.CLIENT_URL || 'http://localhost:5173'}/accept-invite?token=${inviteToken}`;
  const { user } = getSmtpConfig();

  console.log(`===================================================================`);
  console.log(`[EMAIL SERVICE] INVITATION CREATED FOR: ${toEmail}`);
  console.log(`[EMAIL SERVICE] Organization: ${orgName || 'Workspace'}`);
  console.log(`[EMAIL SERVICE] Invited By: ${inviterName || 'Admin'}`);
  console.log(`[EMAIL SERVICE] Accept Link: ${acceptUrl}`);
  console.log(`[EMAIL SERVICE] Invitation Token: ${inviteToken}`);
  console.log(`===================================================================`);

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"DevFlow Workspace" <${user}>`,
        to: toEmail,
        subject: `You've been invited to join ${orgName || 'DevFlow Workspace'}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0B0D10; color: #F5F7FA; padding: 30px; border-radius: 12px;">
            <h2 style="color: #2563EB;">Join ${orgName || 'DevFlow Workspace'}</h2>
            <p>${inviterName || 'An admin'} has invited you to collaborate on DevFlow.</p>
            <div style="margin: 25px 0;">
              <a href="${acceptUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept Invitation</a>
            </div>
            <p style="color: #8B949E; font-size: 12px;">Or copy and paste this link into your browser: <br>${acceptUrl}</p>
          </div>
        `,
      });
      console.log(`[EMAIL SERVICE] Real SMTP email dispatched successfully via ${user} to ${toEmail}`);
      return { sent: true };
    } catch (err) {
      console.warn(`[EMAIL SERVICE WARN] Real SMTP email sending failed: ${err.message}.`);
      return { sent: false, error: err.message };
    }
  } else {
    console.log(`[EMAIL SERVICE INFO] Real SMTP not configured in .env. Use the Accept Link above in local dev.`);
    return { sent: false, error: 'SMTP password not configured' };
  }
};

const sendPasswordResetEmail = async ({ toEmail, resetToken }) => {
  const resetUrl = `${env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const { user } = getSmtpConfig();

  console.log(`===================================================================`);
  console.log(`[EMAIL SERVICE] PASSWORD RESET REQUESTED FOR: ${toEmail}`);
  console.log(`[EMAIL SERVICE] Reset Link: ${resetUrl}`);
  console.log(`[EMAIL SERVICE] Reset Token: ${resetToken}`);
  console.log(`===================================================================`);

  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"DevFlow Support" <${user}>`,
        to: toEmail,
        subject: `Reset Your DevFlow Password`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0B0D10; color: #F5F7FA; padding: 30px; border-radius: 12px;">
            <h2 style="color: #2563EB;">DevFlow Password Reset Request</h2>
            <p>You requested a password reset for your DevFlow account.</p>
            <div style="margin: 25px 0;">
              <a href="${resetUrl}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #8B949E; font-size: 12px;">This reset link will expire in 1 hour.</p>
            <p style="color: #8B949E; font-size: 12px;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`[EMAIL SERVICE] Real SMTP password reset email dispatched successfully via ${user} to ${toEmail}`);
      return { sent: true };
    } catch (err) {
      console.warn(`[EMAIL SERVICE WARN] Real SMTP reset email failed: ${err.message}.`);
      return { sent: false, error: err.message };
    }
  } else {
    console.log(`[EMAIL SERVICE INFO] Real SMTP pass not configured in .env. Use the Reset Link printed above.`);
    return { sent: false, error: 'SMTP password not configured' };
  }
};

module.exports = {
  sendInvitationEmail,
  sendPasswordResetEmail,
};
