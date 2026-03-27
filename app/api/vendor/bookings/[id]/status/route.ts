import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Vendor from '@/lib/models/Vendor';
import { ApiResponse } from '@/lib/api-response';
import mongoose from 'mongoose';

type AllowedStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'vendor') {
      return ApiResponse.unauthorized('Only vendors can update booking status');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.notFound('Invalid booking id');
    }

    const body = await request.json();
    const { status }: { status?: AllowedStatus } = body;

    if (!status) {
      return ApiResponse.error('Status is required', 400);
    }

    const allowed: AllowedStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return ApiResponse.error('Invalid status value', 400);
    }

    await connectDB();

    const vendor = await Vendor.findOne({
      userId: (session.user as any).id,
    });

    if (!vendor) {
      return ApiResponse.notFound('Vendor profile not found');
    }

    // Ensure vendor owns this booking
    const booking = await Booking.findOne({
      _id: id,
      vendorId: vendor._id,
    });

    if (!booking) {
      return ApiResponse.notFound('Booking not found for this vendor');
    }

    // Optional: enforce flow pending -> confirmed -> completed
    const flowOrder: AllowedStatus[] = ['pending', 'confirmed', 'completed'];
    const currentIndex = flowOrder.indexOf(booking.status as AllowedStatus);
    const nextIndex = flowOrder.indexOf(status);

    if (
      flowOrder.includes(status) &&
      (currentIndex === -1 || nextIndex < currentIndex)
    ) {
      return ApiResponse.error('Invalid status transition', 400);
    }

    booking.status = status;
    await booking.save();

    return ApiResponse.success(booking, 'Booking status updated successfully');
  } catch (error: any) {
    console.error('[VENDOR-BOOKING-STATUS] Error:', error);
    return ApiResponse.serverError(error.message);
  }
}
