import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    await connectDB();

   const rawBookings = await Booking.find({ userId: (session.user as any).id})
  .populate('serviceId', 'name price duration')
  .populate('vendorId', 'businessName city')
  .sort({ createdAt: -1 })
  .lean();

const bookings = rawBookings.map((b) => ({
  ...b,
  service: b.serviceId,
  vendor: b.vendorId,
}));

    return ApiResponse.success(bookings, 'Bookings fetched successfully');
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return ApiResponse.serverError(error.message);
  }
}
