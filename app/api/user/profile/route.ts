import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { ApiResponse } from '@/lib/api-response';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    await connectDB();

    const user = await User.findById((session.user as any).id).select('-password');

    if (!user) {
      return ApiResponse.notFound('User not found');
    }

    return ApiResponse.success(user, 'User profile retrieved');
  } catch (error: any) {
    console.error('[USER-PROFILE] Error fetching profile:', error);
    return ApiResponse.serverError(error.message);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiResponse.unauthorized();
    }

    await connectDB();

    const contentType = request.headers.get('content-type') || '';

    let name: string | undefined;
    let phone: string | undefined;
    let city: string | undefined;
    let address: string | undefined;
    let bio: string | undefined;
    let profileImage: string | undefined;

    // Case 1: multipart/form-data (text + file in one request)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      name = String(formData.get('name') || '');
      phone = String(formData.get('phone') || '');
      city = String(formData.get('city') || '');
      address = String(formData.get('address') || '');
      bio = String(formData.get('bio') || '');
      profileImage = String(formData.get('profileImage') || '');

      const file = formData.get('file') as File | null;

      if (file && typeof file !== 'string') {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        if (!fs .existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        const url = `/uploads/${fileName}`;
        profileImage = url;
      }
    } else {
      // Case 2: JSON body (no file upload)
      const body = await request.json();
      name = body.name;
      phone = body.phone;
      city = body.city;
      address = body.address;
      bio = body.bio;
      profileImage = body.profileImage;
    }

    if (!name) {
      return ApiResponse.error('Name is required', 400);
    }

    const user = await User.findByIdAndUpdate(
      (session.user as any).id,
      {
        name,
        phone: phone || '',
        city: city || '',
        address: address || '',
        bio: bio || '',
        profileImage: profileImage || '',
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return ApiResponse.notFound('User not found');
    }

    console.log(`[USER-PROFILE] Updated profile for user ${user._id}`);

    return ApiResponse.success(user, 'Profile updated successfully');
  } catch (error: any) {
    console.error('[USER-PROFILE] Error updating profile:', error);
    return ApiResponse.serverError(error.message);
  }
}