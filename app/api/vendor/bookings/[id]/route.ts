import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { ApiResponse } from '@/lib/api-response';
import Vendor from '@/lib/models/Vendor';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    const { status } = await request.json();

    if (!status) {
      return ApiResponse.error('Missing status field', 400);
    }

    await connectDB();

    const booking = await Booking.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return ApiResponse.notFound('Booking not found');
    }

    return ApiResponse.success(booking, 'Booking updated successfully');
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return ApiResponse.serverError(error.message);
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
 if (!session?.user) return ApiResponse.unauthorized();

await connectDB();

if (!mongoose.Types.ObjectId.isValid(id)) {
  return ApiResponse.notFound('Invalid booking id');
}

const vendor = await Vendor.findOne({ userId: (session.user as any).id });
if (!vendor) return ApiResponse.notFound('Vendor profile not found');

const booking = await Booking.findOne({ _id: id, vendorId: vendor._id })
  .populate('serviceId', 'name price duration')
  .populate('userId', 'name email city')
  .lean();

if (!booking) {
  return ApiResponse.notFound('Booking not found for this vendor');
}


    return ApiResponse.success(booking, 'Booking fetched successfully');
  } catch (error: any) {
    console.error('[VENDOR-BOOKING-DETAIL] Error:', error);
    return ApiResponse.serverError(error.message);
  }
}