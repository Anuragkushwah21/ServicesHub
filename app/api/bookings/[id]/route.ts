import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { ApiResponse } from '@/lib/api-response';


export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return ApiResponse.unauthorized();

    await connectDB();

    const booking = await Booking.findById(params.id)
      .populate('serviceId', 'name price duration')   // 👈 use serviceId
      .populate('vendorId', 'businessName city')      // 👈 use vendorId
      .populate('userId', 'name email city');              // 👈 use userId

    if (!booking) return ApiResponse.notFound('Booking not found');

    if (
      booking.userId.toString() !== (session.user as any).id &&
      booking.vendorId.toString() !== (session.user as any).id &&
      (session.user as any).role !== 'admin'
    ) {
      return ApiResponse.forbidden('You do not have access to this booking');
    }

    return ApiResponse.success(booking, 'Booking fetched successfully');
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return ApiResponse.serverError(error.message);
  }
}



export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    const { status } = await request.json();

    await connectDB();

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return ApiResponse.notFound('Booking not found');
    }

    // Only user or vendor can update their own booking
    if (
      booking.userId.toString() !== (session.user as any).id &&
      booking.vendorId.toString() !== (session.user as any).id &&
      (session.user as any).role !== 'admin'
    ) {
      return ApiResponse.forbidden('You do not have access to this booking');
    }

    booking.status = status;
    await booking.save();

    return ApiResponse.success(booking, 'Booking updated successfully');
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return ApiResponse.serverError(error.message);
  }
}
