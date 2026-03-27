import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { ApiResponse } from '@/lib/api-response';
import mongoose from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.notFound('Invalid booking id');
    }

    await connectDB();

    // Only allow the booking owner (user) to cancel
    const booking = await Booking.findOne({
      _id: id,
      userId: (session.user as any).id,
    });

    if (!booking) {
      return ApiResponse.notFound('Booking not found');
    }

    if (booking.status === 'cancelled') {
      return ApiResponse.error('Booking already cancelled', 400);
    }

    booking.status = 'cancelled';
    await booking.save();

    return ApiResponse.success(booking, 'Booking cancelled successfully');
  } catch (error: any) {
    console.error('[USER-BOOKING-CANCEL] Error:', error);
    return ApiResponse.serverError(error.message);
  }
}
