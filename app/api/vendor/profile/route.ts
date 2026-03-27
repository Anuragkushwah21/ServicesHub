import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Vendor from '@/lib/models/Vendor';
import User from '@/lib/models/User';
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
      return ApiResponse.success(null, 'No vendor profile');
    }

    // frontend में data.data = vendor expect कर रहे हो
    return ApiResponse.success(vendor, 'Profile fetched');
  } catch (error: any) {
    console.error('[VENDOR] ERROR:', error);
    return ApiResponse.serverError(error.message);
  }
}

// TODO: अपनी upload logic implement करो
async function uploadLogo(file: File): Promise<string> {
  return '/uploads/vendor-logo-placeholder.png';
}
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'vendor') {
      return ApiResponse.unauthorized('Only vendors allowed');
    }

    // ⬇️ अब JSON नहीं, FormData पढ़ेंगे
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
    const logoFile = formData.get('logo') as File | null;

    // ✅ VALIDATION
    if (!businessName || !description || !businessType) {
      return ApiResponse.error('Required fields missing', 400);
    }

    await connectDB();

    let vendor = await Vendor.findOne({
      userId: (session.user as any).id,
    });

    // Create if not exist
    if (!vendor) {
      const user = await User.findById((session.user as any).id);

      vendor = new Vendor({
        userId: user._id,
        businessName,
        description,
      });
    }

    // अगर logo आया है तो upload करके URL set करो
    if (logoFile && logoFile.size > 0) {
      const logoUrl = await uploadLogo(logoFile);
      vendor.logo = logoUrl;
    }

    // Update बाकी fields
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