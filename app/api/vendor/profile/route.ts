import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User';
import { ApiResponse } from '@/lib/api-response';
import fs from 'fs';
import path from 'path';

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
      return ApiResponse.success(null, 'No vendor profile');
    }

    return ApiResponse.success(vendor, 'Profile fetched');
  } catch (error: any) {
    console.error('[VENDOR] ERROR:', error);
    return ApiResponse.serverError(error.message);
  }
}

async function uploadFile(file: Blob, prefix: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file as any).name?.split('.').pop() || 'png';
  const fileName = `${prefix}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${fileName}`;
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'vendor') {
      return ApiResponse.unauthorized('Only vendors allowed');
    }

    const formData = await request.formData();

    const businessName = String(formData.get('businessName') || '');
    const description = String(formData.get('description') || '');
    const businessType = String(formData.get('businessType') || '');
    const experience = Number(formData.get('experience') || 0);
    const phone = String(formData.get('phone') || '');
    const address = String(formData.get('address') || '');
    const city = String(formData.get('city') || '');
    const state = String(formData.get('state') || '');
    const zipCode = String(formData.get('zipCode') || '');
    const website = String(formData.get('website') || '');
    const bankAccount = String(formData.get('bankAccount') || '');
    const logoField = formData.get('logo');
    const bannerField = formData.get('banner');

    if (!businessName || !description || !businessType) {
      return ApiResponse.error('Required fields missing', 400);
    }

    await connectDB();

    let vendor = await Vendor.findOne({
      userId: (session.user as any).id,
    });

    if (!vendor) {
      const user = await User.findById((session.user as any).id);

      vendor = new Vendor({
        userId: user._id,
        businessName,
        description,
      });
    }

    // Logo upload
    if (logoField && logoField instanceof Blob) {
      const logoUrl = await uploadFile(logoField, 'vendor-logo');
      vendor.logo = logoUrl;
    }

    // Banner upload
    if (bannerField && bannerField instanceof Blob) {
      const bannerUrl = await uploadFile(bannerField, 'vendor-banner');
      vendor.banner = bannerUrl;
    }

    vendor.businessName = businessName;
    vendor.description = description;
    vendor.businessType = businessType;
    vendor.experience = experience || 0;
    vendor.phone = phone;
    vendor.address = address;
    vendor.city = city;
    vendor.state = state;
    vendor.zipCode = zipCode;
    vendor.website = website;
    vendor.bankAccount = bankAccount;
    vendor.profileCompleted = true;

    await vendor.save();

    return ApiResponse.success(vendor, 'Profile completed');
  } catch (error: any) {
    console.error('[VENDOR] ERROR:', error);
    return ApiResponse.serverError(error.message);
  }
}