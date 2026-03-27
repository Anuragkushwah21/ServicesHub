import { connectDB } from '@/lib/db';
import Category from '@/lib/models/Category';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return ApiResponse.success(categories, 'Categories fetched successfully');
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return ApiResponse.serverError(error.message);
  }
}
