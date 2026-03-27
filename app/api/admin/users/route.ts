import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return ApiResponse.unauthorized('Admin access required');
    }

    await connectDB();

    const users = await User.find({})
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 });

    return ApiResponse.success(users, 'Users fetched successfully');
  } catch (error: any) {
    console.error('[ADMIN-USERS] Error:', error);
    return ApiResponse.serverError(error.message);
  }
}
