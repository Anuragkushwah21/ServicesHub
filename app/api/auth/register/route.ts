import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import OTPLog from '@/lib/models/OTPLog';
import { ApiResponse } from '@/lib/api-response';
import { sendOTPEmail } from '@/lib/services/email-service';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    const confirmPassword = body.confirmPassword;
    const role = body.role || 'user';
    const phone = body.phone;
    const city = body.city;

    // ✅ Validation
    if (!name || !email || !password) {
      return ApiResponse.error('All required fields must be filled', 400);
    }

    if (password !== confirmPassword) {
      return ApiResponse.error('Passwords do not match', 400);
    }

    if (password.length < 8) {
      return ApiResponse.error('Password must be at least 8 characters', 400);
    }

    await connectDB();

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return ApiResponse.error('User already exists. Please login.', 400);
      }

      // 🔥 If not verified → allow resend OTP instead of creating new user
      await OTPLog.deleteMany({ email, purpose: 'signup' });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

      await OTPLog.create({
        userId: existingUser._id,
        email,
        otpHash,
        purpose: 'signup',
        status: 'pending',
        attemptCount: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      });

      await sendOTPEmail(email, otp, existingUser.name);

      return ApiResponse.success(
        { email, otpSent: true },
        'OTP resent. Please verify your email.'
      );
    }

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      city,
      isEmailVerified: false,
    });

    console.log(`[REGISTER] User created: ${user._id}`);

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await OTPLog.create({
      userId: user._id,
      email,
      otpHash,
      purpose: 'signup',
      status: 'pending',
      attemptCount: 0,
      maxAttempts: 5,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // ✅ Send Email
    const emailSent = await sendOTPEmail(email, otp, name);

    if (!emailSent && process.env.NODE_ENV === 'production') {
      return ApiResponse.error('Failed to send OTP email', 500);
    }

    return ApiResponse.success(
      {
        id: user._id,
        email,
        role,
        otpSent: true,
      },
      'Registration successful. Verify OTP to continue.'
    );
  } catch (error: any) {
    console.error('[REGISTER ERROR]', error);
    return ApiResponse.serverError('Registration failed');
  }
}