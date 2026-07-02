const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// In development, log emails to console instead of sending them
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.example.com') {
    // Use ethereal (fake SMTP) or just log
    return {
      sendMail: async (options) => {
        logger.info('📧 [Email Placeholder] Would send email:');
        logger.info(`  To: ${options.to}`);
        logger.info(`  Subject: ${options.subject}`);
        logger.info(`  Body: ${options.text || '(HTML)'}`);
        return { messageId: `dev-${Date.now()}`, accepted: [options.to] };
      },
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Internship Portal <noreply@example.com>',
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error('Email sending failed:', err);
    throw err;
  }
};

module.exports = { sendEmail };
