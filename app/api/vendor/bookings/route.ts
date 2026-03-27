import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Vendor from '@/lib/models/Vendor';
import '@/lib/models/Service';
import '@/lib/models/User';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    await connectDB();

    const vendor = await Vendor.findOne({
      userId: (session.user as any).id,
    });

    if (!vendor) {
      return ApiResponse.notFound('Vendor profile not found');
    }

    // Count only this vendor's bookings
    const totalBookings = await Booking.countDocuments({
      vendorId: vendor._id,
    });

    // Get all bookings for this vendor
    const bookings = await Booking.find({ vendorId: vendor._id })
      .populate('serviceId', 'name price')
      .populate('userId', 'name email city phone')
      .sort({ createdAt: -1 })
      .lean();

    return ApiResponse.success(
      { totalBookings, bookings },
      'Bookings fetched successfully'
    );
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return ApiResponse.serverError(error.message);
  }
}
