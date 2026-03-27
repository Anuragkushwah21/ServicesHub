import ActivityLog from '@/lib/models/ActivityLog';
import { connectDB } from '@/lib/db';

interface LogActivityOptions {
  userId: string;
  userEmail: string;
  userRole: 'user' | 'vendor' | 'admin';
  action: string;
  entity: 'booking' | 'service' | 'category' | 'payment' | 'user' | 'vendor' | 'auth';
  entityId?: string;
  entityName?: string;
  status?: 'success' | 'failure' | 'pending';
  statusCode?: number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(options: LogActivityOptions) {
  try {
    await connectDB();

    const log = await ActivityLog.create({
      userId: options.userId,
      userEmail: options.userEmail,
      userRole: options.userRole,
      action: options.action,
      entity: options.entity,
      entityId: options.entityId,
      entityName: options.entityName,
      status: options.status || 'success',
      statusCode: options.statusCode,
      details: options.details,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });

    const logLevel = options.status === 'failure' ? 'error' : 'info';
    console.log(
      `[ACTIVITY:${logLevel.toUpperCase()}] ${options.action} on ${options.entity}`,
      {
        userId: options.userId,
        email: options.userEmail,
        role: options.userRole,
        entityId: options.entityId,
        status: options.status,
      }
    );

    return log;
  } catch (error) {
    console.error('[ACTIVITY] Error logging activity:', error);
    // Don't throw - logging failures shouldn't break the app
    return null;
  }
}

export async function getActivityLogs(filters: {
  userId?: string;
  userRole?: string;
  entity?: string;
  status?: string;
  limit?: number;
  skip?: number;
}) {
  try {
    await connectDB();

    const query: any = {};

    if (filters.userId) query.userId = filters.userId;
    if (filters.userRole) query.userRole = filters.userRole;
    if (filters.entity) query.entity = filters.entity;
    if (filters.status) query.status = filters.status;

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100)
      .skip(filters.skip || 0);

    const total = await ActivityLog.countDocuments(query);

    return {
      logs,
      total,
      limit: filters.limit || 100,
      skip: filters.skip || 0,
    };
  } catch (error) {
    console.error('[ACTIVITY] Error fetching logs:', error);
    return {
      logs: [],
      total: 0,
      limit: 0,
      skip: 0,
    };
  }
}

export async function getUserActivitySummary(userId: string) {
  try {
    await connectDB();

    const logs = await ActivityLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return logs;
  } catch (error) {
    console.error('[ACTIVITY] Error fetching user activity summary:', error);
    return [];
  }
}

// Helper functions for common logging scenarios
export async function logAuthActivity(
  userId: string,
  userEmail: string,
  action: 'login' | 'logout' | 'registration' | 'password_reset',
  status: 'success' | 'failure',
  options?: {
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, any>;
  }
) {
  return logActivity({
    userId,
    userEmail,
    userRole: 'user',
    action: `Auth: ${action}`,
    entity: 'auth',
    status,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    details: options?.details,
  });
}

export async function logBookingActivity(
  userId: string,
  userEmail: string,
  userRole: 'user' | 'vendor' | 'admin',
  action: string,
  bookingId: string,
  status: 'success' | 'failure' = 'success',
  options?: {
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  return logActivity({
    userId,
    userEmail,
    userRole,
    action: `Booking: ${action}`,
    entity: 'booking',
    entityId: bookingId,
    status,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    details: options?.details,
  });
}

export async function logServiceActivity(
  userId: string,
  userEmail: string,
  action: string,
  serviceId: string,
  serviceName?: string,
  status: 'success' | 'failure' = 'success',
  options?: {
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  return logActivity({
    userId,
    userEmail,
    userRole: 'vendor',
    action: `Service: ${action}`,
    entity: 'service',
    entityId: serviceId,
    entityName: serviceName,
    status,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    details: options?.details,
  });
}
