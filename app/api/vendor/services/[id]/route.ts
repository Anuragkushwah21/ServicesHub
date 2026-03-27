import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Service from '@/lib/models/Service';
import Vendor from '@/lib/models/Vendor';
import { ApiResponse } from '@/lib/api-response';

// GET /api/vendor/services/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ unwrap

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.notFound('Invalid service id');
    }

    const service = await Service.findById(id)
      .populate('vendorId', 'businessName description city isVerified')
      .populate('categoryId', 'name icon');

    if (!service) {
      return ApiResponse.notFound('Service not found');
    }

    return ApiResponse.success(service, 'Service fetched successfully');
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return ApiResponse.serverError(error.message);
  }
}

// PUT /api/vendor/services/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ unwrap

    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'vendor') {
      return ApiResponse.unauthorized('Only vendors allowed');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.notFound('Invalid service id');
    }

    const body = await request.json();
    const { name, description, price, duration, categoryId } = body;

    if (!name || !description || price == null || duration == null || !categoryId) {
      return ApiResponse.error('Missing required fields', 400);
    }

    await connectDB();

    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return ApiResponse.notFound('Vendor profile not found');
    }

    // Check ownership
    const service = await Service.findById(id);
    if (!service || service.vendorId.toString() !== vendor._id.toString()) {
      return ApiResponse.forbidden('Service not found or not authorized');
    }

    service.name = name;
    service.description = description;
    service.price = typeof price === 'number' ? price : parseFloat(price);
    service.duration = typeof duration === 'number' ? duration : parseInt(duration, 10);
    service.categoryId = categoryId;

    await service.save();
    await service.populate('categoryId', 'name icon');

    return ApiResponse.success(service, 'Service updated successfully');
  } catch (error: any) {
    console.error('Error updating service:', error);
    return ApiResponse.serverError(error.message);
  }
}

// DELETE /api/vendor/services/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ unwrap

    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'vendor') {
      return ApiResponse.unauthorized('Only vendors allowed');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.notFound('Invalid service id');
    }

    await connectDB();

    const vendor = await Vendor.findOne({ userId: (session.user as any).id });
    if (!vendor) {
      return ApiResponse.notFound('Vendor profile not found');
    }

    const service = await Service.findOneAndDelete({
      _id: id,
      vendorId: vendor._id,
    });

    if (!service) {
      return ApiResponse.notFound('Service not found or not authorized');
    }

    return ApiResponse.success(null, 'Service deleted successfully');
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return ApiResponse.serverError(error.message);
  }
}
