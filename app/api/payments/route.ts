import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Payment from '@/lib/models/Payment';
import Booking from '@/lib/models/Booking';
import { ApiResponse } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    const { bookingId, amount, method } = await request.json();

    if (!bookingId || !amount) {
      return ApiResponse.error('Missing required fields', 400);
    }

    await connectDB();

    // Get booking details
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return ApiResponse.notFound('Booking not found');
    }

    // Verify user is booking owner
    if (booking.userId.toString() !== (session.user as any).id) {
      return ApiResponse.forbidden('You cannot pay for this booking');
    }

    // Simulate payment processing
    const payment = new Payment({
      bookingId,
      userId: booking.userId,
      vendorId: booking.vendorId,
      amount,
      method: method || 'card',
      status: 'completed', // In production, this would depend on payment gateway response
      transactionId: 'TXN_' + Date.now(),
    });

    await payment.save();

    // Update booking status to confirmed
    booking.status = 'confirmed';
    await booking.save();

    return ApiResponse.success(payment, 'Payment processed successfully', 201);
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return ApiResponse.serverError(error.message);
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    await connectDB();

    const payments = await Payment.find({
      $or: [{ userId: (session.user as any).id }, { vendorId: (session.user as any).id }],
    }).sort({ createdAt: -1 });

    return ApiResponse.success(payments, 'Payments fetched successfully');
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return ApiResponse.serverError(error.message);
  }
}
