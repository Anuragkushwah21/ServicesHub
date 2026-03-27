import crypto from 'crypto';
import OTPLog from '@/lib/models/OTPLog';
import { connectDB } from '@/lib/db';

interface OTPOptions {
  userId?: string;
  email: string;
  purpose: 'signup' | 'login' | 'password_reset' | 'email_verification';
  ipAddress?: string;
  userAgent?: string;
}

interface VerifyOTPOptions {
  email: string;
  otp: string;
  purpose: 'signup' | 'login' | 'password_reset' | 'email_verification';
}

export async function generateOTP(options: OTPOptions) {
  await connectDB();

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP for storage
  const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

  try {
    // Clear previous OTPs for this email and purpose if pending
    await OTPLog.updateMany(
      { email: options.email, purpose: options.purpose, status: 'pending' },
      { status: 'expired' }
    );

    // Create new OTP log
    const otpLog = await OTPLog.create({
      userId: options.userId,
      email: options.email,
      otp: otp,
      otpHash: otpHash,
      purpose: options.purpose,
      status: 'pending',
      attemptCount: 0,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });

    console.log(`[OTP] Generated OTP for ${options.email} (Purpose: ${options.purpose})`);

    return {
      success: true,
      message: 'OTP generated successfully',
      otpId: otpLog._id.toString(),
      otp: otp, // Return OTP for development/testing only - remove in production
    };
  } catch (error) {
    console.error(`[OTP] Error generating OTP for ${options.email}:`, error);
    return {
      success: false,
      message: 'Failed to generate OTP',
    };
  }
}

export async function verifyOTP(options: VerifyOTPOptions) {
  await connectDB();

  const otpHash = crypto.createHash('sha256').update(options.otp).digest('hex');

  try {
    const otpLog = await OTPLog.findOne({
      email: options.email,
      purpose: options.purpose,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!otpLog) {
      console.log(`[OTP] No pending OTP found for ${options.email} (Purpose: ${options.purpose})`);
      return {
        success: false,
        message: 'OTP not found or expired',
      };
    }

    // Check if max attempts exceeded
    if (otpLog.attemptCount >= otpLog.maxAttempts) {
      await OTPLog.updateOne(
        { _id: otpLog._id },
        { status: 'failed' }
      );
      console.log(`[OTP] Max attempts exceeded for ${options.email} (Purpose: ${options.purpose})`);
      return {
        success: false,
        message: 'Maximum verification attempts exceeded',
      };
    }

    // Compare OTP
    const isMatch = crypto
      .createHash('sha256')
      .update(options.otp)
      .digest('hex') === otpLog.otpHash;

    if (!isMatch) {
      // Increment attempt count
      await OTPLog.updateOne(
        { _id: otpLog._id },
        { $inc: { attemptCount: 1 } }
      );
      console.log(`[OTP] Invalid OTP attempt for ${options.email} (Purpose: ${options.purpose}) - Attempt: ${otpLog.attemptCount + 1}/${otpLog.maxAttempts}`);
      return {
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: otpLog.maxAttempts - otpLog.attemptCount - 1,
      };
    }

    // OTP is valid, mark as verified
    const verifiedOTP = await OTPLog.findByIdAndUpdate(
      otpLog._id,
      {
        status: 'verified',
        verifiedAt: new Date(),
      },
      { new: true }
    );

    console.log(`[OTP] Successfully verified OTP for ${options.email} (Purpose: ${options.purpose})`);

    return {
      success: true,
      message: 'OTP verified successfully',
      otpId: verifiedOTP._id.toString(),
      userId: verifiedOTP.userId,
    };
  } catch (error) {
    console.error(`[OTP] Error verifying OTP for ${options.email}:`, error);
    return {
      success: false,
      message: 'Error verifying OTP',
    };
  }
}

export async function getOTPStatus(email: string, purpose: 'signup' | 'login' | 'password_reset' | 'email_verification') {
  await connectDB();

  try {
    const otpLog = await OTPLog.findOne({
      email: email,
      purpose: purpose,
      status: 'pending',
    });

    if (!otpLog) {
      return {
        hasPending: false,
      };
    }

    const now = new Date();
    const isExpired = otpLog.expiresAt < now;

    return {
      hasPending: !isExpired,
      expiresAt: otpLog.expiresAt,
      attemptsRemaining: Math.max(0, otpLog.maxAttempts - otpLog.attemptCount),
    };
  } catch (error) {
    console.error(`[OTP] Error checking OTP status for ${email}:`, error);
    return {
      hasPending: false,
    };
  }
}
