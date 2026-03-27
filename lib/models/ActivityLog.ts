import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  userId: string;
  userEmail: string;
  userRole: 'user' | 'vendor' | 'admin';
  action: string;
  entity: 'booking' | 'service' | 'category' | 'payment' | 'user' | 'vendor' | 'auth';
  entityId?: string;
  entityName?: string;
  status: 'success' | 'failure' | 'pending';
  statusCode?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userRole: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    entity: {
      type: String,
      enum: ['booking', 'service', 'category', 'payment', 'user', 'vendor', 'auth'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: false,
    },
    entityName: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'pending'],
      default: 'success',
      index: true,
    },
    statusCode: {
      type: Number,
      required: false,
    },
    details: {
      type: Schema.Types.Mixed,
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

// Indexes for common queries
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ entity: 1, action: 1 });
ActivityLogSchema.index({ status: 1, createdAt: -1 });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
