import mongoose, { Schema, Document } from 'mongoose';

export interface IOTPLog extends Document {
  userId: string | mongoose.Types.ObjectId;
  email: string;
  otpHash: string;
  purpose: 'signup' | 'login' | 'password_reset' | 'email_verification';
  status: 'pending' | 'verified' | 'expired' | 'failed';
  attemptCount: number;
  maxAttempts: number;
  createdAt: Date;
  expiresAt: Date;
  verifiedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

const OTPLogSchema = new Schema<IOTPLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'password_reset', 'email_verification'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'expired', 'failed'],
      default: 'pending',
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      index: { expireAfterSeconds: 0 },
    },
    verifiedAt: {
      type: Date,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Index for cleanup and lookups
OTPLogSchema.index({ email: 1, purpose: 1 });
OTPLogSchema.index({ status: 1 });

const OTPLog = mongoose.models.OTPLog || mongoose.model<IOTPLog>('OTPLog', OTPLogSchema);

export default OTPLog;
