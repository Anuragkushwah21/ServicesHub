import { connectDB } from '@/lib/db';
import OTPLog from '@/lib/models/OTPLog';
import { ApiResponse } from '@/lib/api-response';
import { sendOTPEmail } from '@/lib/services/email-service';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return ApiResponse.error('Email is required', 400);
    }

    await connectDB();

    // Find existing OTP for this email
    const existingOTP = await OTPLog.findOne({
      email: email.toLowerCase(),
      purpose: 'signup',
      status: { $in: ['pending', 'expired'] },
    });

    if (!existingOTP) {
      return ApiResponse.error('No registration found for this email', 400);
    }

    // Check if user is trying to resend too quickly (within 30 seconds)
    const timeSinceCreation = Date.now() - existingOTP.createdAt.getTime();
    if (timeSinceCreation < 30000) {
      return ApiResponse.error('Please wait 30 seconds before requesting a new OTP', 429);
    }

    // Generate new 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpHash = crypto.createHash('sha256').update(newOtp).digest('hex');

    // Update OTP record
    const updatedOTP = await OTPLog.findByIdAndUpdate(
      existingOTP._id,
      {
        otpHash: newOtpHash,
        status: 'pending',
        attemptCount: 0,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
      { new: true }
    );

    // Send new OTP via email
    const emailSent = await sendOTPEmail(email, newOtp, 'User');
    if (!emailSent) {
      console.error(`[RESEND] Failed to send OTP to ${email}`);
      return ApiResponse.error('Failed to send OTP email', 500);
    }

    console.log(`[RESEND] New OTP sent to ${email}`);

    return ApiResponse.success(
      { email, otpSent: true },
      'New OTP sent to your email'
    );
  } catch (error: any) {
    console.error('[RESEND] Error:', error.message);
    return ApiResponse.serverError('Failed to resend OTP');
  }
}
