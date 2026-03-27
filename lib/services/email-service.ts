import nodemailer from 'nodemailer';

// Validate email configuration
const validateEmailConfig = () => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('[EMAIL] Missing SMTP_EMAIL or SMTP_PASSWORD in environment variables');
    console.warn('[EMAIL] Email functionality will not work. Please configure .env variables.');
    return false;
  }
  return true;
};

// Email service configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // In development mode without SMTP config, log and continue
    if (process.env.NODE_ENV === 'development' && (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD)) {
      console.warn('[EMAIL] Dev mode: Email not configured. To enable emails, set SMTP_EMAIL and SMTP_PASSWORD in .env');
      console.log('[EMAIL] Email would be sent to:', options.to);
      console.log('[EMAIL] Subject:', options.subject);
      return true; // Don't fail - allow registration to proceed
    }

    // Production mode - require email config
    if (!validateEmailConfig()) {
      console.error('[EMAIL] Email not configured. Set SMTP_EMAIL and SMTP_PASSWORD in .env');
      return false;
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[EMAIL] Sent to ${options.to}`);
    return true;
  } catch (error: any) {
    console.error('[EMAIL] Error:', error.message);
    // In dev mode, don't fail - allow registration to proceed
    if (process.env.NODE_ENV === 'development') {
      console.warn('[EMAIL] Dev mode: Continuing despite email error');
      return true;
    }
    return false;
  }
};

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">ServiceHub - Email Verification</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with ServiceHub. To verify your email, please use the following OTP:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="color: #3B82F6; letter-spacing: 3px; margin: 0;">${otp}</h1>
        <p style="color: #6b7280; margin: 10px 0 0 0;">Valid for 5 minutes</p>
      </div>
      <p>If you did not request this verification, please ignore this email.</p>
      <p>Best regards,<br/>ServiceHub Team</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px;">
      <p style="color: #9ca3af; font-size: 12px;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'ServiceHub - Email Verification OTP',
    html,
  });
};

// Send welcome email
export const sendWelcomeEmail = async (email: string, name: string, role: string): Promise<boolean> => {
  const roleText = role === 'vendor' ? 'Vendor' : 'User';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Welcome to ServiceHub, ${name}!</h2>
      <p>We're excited to have you join our platform as a ${roleText}.</p>
      ${role === 'vendor' ? `
        <p>As a vendor, you can:</p>
        <ul style="color: #374151;">
          <li>Create and manage your service listings</li>
          <li>Receive and manage bookings</li>
          <li>Build your business reputation with customer reviews</li>
          <li>Track your earnings and performance</li>
        </ul>
        <p><a href="${process.env.NEXTAUTH_URL}/vendor" style="color: #3B82F6; text-decoration: none;">Visit your vendor dashboard</a></p>
      ` : `
        <p>As a user, you can:</p>
        <ul style="color: #374151;">
          <li>Browse and book professional services</li>
          <li>Manage your bookings and payments</li>
          <li>Leave reviews and ratings</li>
          <li>Track your service history</li>
        </ul>
        <p><a href="${process.env.NEXTAUTH_URL}/explore" style="color: #3B82F6; text-decoration: none;">Start exploring services</a></p>
      `}
      <p>Best regards,<br/>ServiceHub Team</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px;">
      <p style="color: #9ca3af; font-size: 12px;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to ServiceHub, ${name}!`,
    html,
  });
};

// Send booking confirmation
export const sendBookingConfirmationEmail = async (
  email: string,
  userName: string,
  serviceName: string,
  bookingDate: string,
  amount: number
): Promise<boolean> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3B82F6;">Booking Confirmation</h2>
      <p>Hi ${userName},</p>
      <p>Your booking has been confirmed! Here are the details:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Amount:</strong> Rs. ${amount.toFixed(2)}</p>
      </div>
      <p>You can track your booking status in your dashboard.</p>
      <p>Best regards,<br/>ServiceHub Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Booking Confirmation - ServiceHub',
    html,
  });
};
