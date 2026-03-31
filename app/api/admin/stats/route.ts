import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Vendor from '@/lib/models/Vendor';
import Booking from '@/lib/models/Booking';
import Service from '@/lib/models/Service';
import Category from '@/lib/models/Category';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'admin') {
      return ApiResponse.unauthorized();
    }

    await connectDB();

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalBookings = await Booking.countDocuments();

    const completedBookings = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + (b.price || 0),
      0
    );

    const bookingsByStatus = {
      pending: await Booking.countDocuments({ status: 'pending' }),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
    };

    const categories = await Category.find();
    const revenueByCategory = await Promise.all(
      categories.map(async (cat) => {
        const services = await Service.find({ categoryId: cat._id });
        const serviceIds = services.map((s) => s._id);

        const categoryBookings = await Booking.find({
          serviceId: { $in: serviceIds },
          status: 'completed',
        });

        const revenue = categoryBookings.reduce(
          (sum, b) => sum + (b.price || 0),
          0
        );

        return { name: cat.name, value: revenue };
      })
    );

    const revenueOverTime = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayBookings = await Booking.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: 'completed',
      });

      const dayRevenue = dayBookings.reduce(
        (sum, b) => sum + (b.price || 0),
        0
      );

      revenueOverTime.push({
        date: dayStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        revenue: dayRevenue,
      });
    }

    return ApiResponse.success(
      {
        totalUsers,
        totalVendors,
        totalBookings,
        totalRevenue,
        bookingsByStatus,
        revenueByCategory: revenueByCategory.filter((r) => r.value > 0),
        revenueOverTime,
      },
      'Admin stats fetched successfully'
    );
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return ApiResponse.serverError(error.message);
  }
}
