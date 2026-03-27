import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Service from '@/lib/models/Service';
import Vendor from '@/lib/models/Vendor';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    await connectDB();

    const vendor = await Vendor.findOne({ userId: (session.user as any).id });

    if (!vendor) {
      return ApiResponse.notFound('Vendor profile not found');
    }

    const services = await Service.find({ vendorId: vendor._id })
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    return ApiResponse.success(services, 'Services fetched successfully');
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return ApiResponse.serverError(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'vendor') {
      return ApiResponse.unauthorized();
    }

    const { name, description, price, duration, categoryId } = await request.json();

    if (!name || !description || !price || !duration || !categoryId) {
      return ApiResponse.error('Missing required fields', 400);
    }

    await connectDB();

    const vendor = await Vendor.findOne({ userId: (session.user as any).id });

    if (!vendor) {
      return ApiResponse.notFound('Vendor profile not found');
    }

    const service = new Service({
      vendorId: vendor._id,
      categoryId,
      name,
      description,
      price: parseFloat(price),
      duration: parseInt(duration),
    });

    await service.save();
    await service.populate('categoryId', 'name icon');

    return ApiResponse.success(service, 'Service created successfully', 201);
  } catch (error: any) {
    console.error('Error creating service:', error);
    return ApiResponse.serverError(error.message);
  }
}
