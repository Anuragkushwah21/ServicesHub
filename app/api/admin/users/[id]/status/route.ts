import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { ApiResponse } from '@/lib/api-response';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return ApiResponse.unauthorized('Admin access required');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.notFound('Invalid user id');
    }

    await connectDB();

    const body = await request.json();
    const { isActive } = body as { isActive?: boolean };

    if (typeof isActive !== 'boolean') {
      return ApiResponse.error('isActive must be boolean', 400);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('name email role isActive');

    if (!user) {
      return ApiResponse.notFound('User not found');
    }

    return ApiResponse.success(user, 'User status updated');
  } catch (error: any) {
    console.error('[ADMIN-USER-STATUS] Error:', error);
    return ApiResponse.serverError(error.message);
  }
}
