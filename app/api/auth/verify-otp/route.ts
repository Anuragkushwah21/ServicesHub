import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import OTPLog from '@/lib/models/OTPLog';
import { ApiResponse } from '@/lib/api-response';
import { sendWelcomeEmail } from '@/lib/services/email-service';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    let { email, otp } = await request.json();

    if (!email || !otp) {
      return ApiResponse.error('Email and OTP are required', 400);
    }

    // ✅ normalize email
    otp = otp.trim();
    email = email.toLowerCase().trim();

    await connectDB();

    // ✅ get latest OTP (not just pending blindly)
    const otpLog = await OTPLog.findOne({
      email,
      purpose: 'signup',
    }).sort({ createdAt: -1 });

    if (!otpLog) {
      console.log(`[OTP] No OTP found in DB for email: ${email}`);
      return ApiResponse.error('No OTP found. Please register again.', 400);
    }

    // ✅ debug log
    console.log("[OTP DEBUG]", {
      dbEmail: otpLog.email,
      status: otpLog.status,
      expiresAt: otpLog.expiresAt,
    });

    // ❌ already verified
    if (otpLog.status === 'verified') {
      return ApiResponse.error('OTP already verified. Please login.', 400);
    }

    // ❌ expired
    if (new Date() > otpLog.expiresAt) {
      otpLog.status = 'expired';
      await otpLog.save();
      return ApiResponse.error('OTP expired. Please register again.', 400);
    }

    // ❌ max attempts
    if (otpLog.attemptCount >= otpLog.maxAttempts) {
      otpLog.status = 'failed';
      await otpLog.save();
      return ApiResponse.error('Max attempts exceeded. Please register again.', 400);
    }

    // ✅ verify OTP
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    if (otpLog.otpHash !== otpHash) {
      otpLog.attemptCount += 1;
      await otpLog.save();

      const remaining = otpLog.maxAttempts - otpLog.attemptCount;

      return ApiResponse.error(
        `Invalid OTP. ${remaining} attempts remaining.`,
        400
      );
    }

    // ✅ success
    otpLog.status = 'verified';
    otpLog.verifiedAt = new Date();
    await otpLog.save();

    // ✅ update user
    const user = await User.findById(otpLog.userId);

    if (user) {
      user.isEmailVerified = true;
      await user.save();

      // send welcome email (optional)
      try {
        await sendWelcomeEmail(user.email, user.name, user.role);
      } catch (e) {
        console.warn("Welcome email failed (ignore for now)");
      }
    }

    return ApiResponse.success(
      {
        userId: otpLog.userId,
        email,
        verified: true,
      },
      'Email verified successfully'
    );

  } catch (error: any) {
    console.error('[OTP ERROR]', error);
    return ApiResponse.serverError(error.message || 'OTP verification failed');
  }
}