import { connectDB } from '@/lib/db';
import Service from '@/lib/models/Service';
import Category from '@/lib/models/Category';
import { ApiResponse } from '@/lib/api-response';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    let query: any = {};
    // Search by service name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    // Filter by category
    if (category) {
      const categoryDoc = await Category.findOne({ name: { $regex: category, $options: 'i' } });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      }
    }
   const services = await Service.find(query)
  .populate('vendorId', 'businessName city experience') // ✅ FIXED
  .populate('categoryId', 'name') // optional but recommended
  .limit(50)
  .sort({ createdAt: -1 });

    return ApiResponse.success(services, 'Services fetched successfully');
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return ApiResponse.serverError(error.message);
  }
}


