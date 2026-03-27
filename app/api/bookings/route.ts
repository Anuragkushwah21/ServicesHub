import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/lib/models/Booking';
import Service from '@/lib/models/Service';
import { ApiResponse } from '@/lib/api-response';
import { NextRequest } from 'next/server';
import Vendor from '@/lib/models/Vendor';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    if ((session.user as any).role !== 'user') {
      return ApiResponse.unauthorized('Only users can book services not vendors');
    }

    // body matches what frontend sends
    const {
      serviceId,
      bookingDate,
      bookingTime,
      customerName,
      phone,
      location,
      notes,
    } = await request.json();

    if (!serviceId) {
      return ApiResponse.error('Service ID is required', 400);
    }

    await connectDB();

    const service = await Service.findById(serviceId);
    if (!service) {
      return ApiResponse.notFound('Service not found');
    }

    const finalBookingDate =
      bookingDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const finalBookingTime = bookingTime || '10:00';

    const existing = await Booking.findOne({
      userId: (session.user as any).id,
      serviceId,
      bookingDate: finalBookingDate,
      bookingTime: finalBookingTime,
    });

    if (existing) {
      return ApiResponse.error(
        'You have already booked this service at this time',
        400,
      );
    }

    const booking = await Booking.create({
      userId: (session.user as any).id,
      serviceId,
      vendorId: service.vendorId,
      bookingDate: finalBookingDate,
      bookingTime: finalBookingTime,
      price: service.price,
      notes,
      status: 'pending',
      customerName,
      phone,
      location,
    });

    await booking.populate([
      { path: 'serviceId', select: 'name price duration' },
      { path: 'vendorId', select: 'businessName city' },
    ]);

    return ApiResponse.success(booking, 'Booking created successfully', 201);
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return ApiResponse.serverError(error.message);
  }
}


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only logged-in vendors allowed
    if (!session?.user || (session.user as any).role !== 'vendor') {
      return ApiResponse.unauthorized('Only vendors can view these bookings');
    }

    await connectDB();

    // Find vendor profile by userId
    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return ApiResponse.notFound('Vendor profile not found');
    }

    // All bookings where this vendor is the vendor
    const bookings = await Booking.find({ vendorId: vendor._id })
      .populate('serviceId', 'name price duration')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return ApiResponse.success(bookings, 'Vendor bookings fetched successfully');
  } catch (error: any) {
    console.error('[VENDOR-BOOKINGS] Error:', error);
    return ApiResponse.serverError(error.message);
  }
}