'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  MapPin,
  Phone,
  Globe,
  Star,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Vendor {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  logo?: string;
  banner?: string;
  rating: number;
  totalBookings: number;
  categories: { _id: string; name: string }[];
  isVerified: boolean;
  businessType?: string;
  experience?: number;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  bankAccount?: string;
  profileCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function VendorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth + role guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (session?.user && (session.user as any).role !== 'vendor') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch vendor profile
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const res = await fetch('/api/vendor/profile', {
          method: 'GET',
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || 'Failed to load vendor profile');
          console.error('[VENDOR-PROFILE] Error:', data);
          return;
        }

        setVendor(data.data);
      } catch (err: any) {
        toast.error('Error loading vendor profile');
        console.error('[VENDOR-PROFILE] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchVendorProfile();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Vendor Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              No vendor profile found. Please complete your profile first.
            </p>
            <Button onClick={() => router.push('/vendor/profile-setup')}>
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullAddress = [vendor.address, vendor.city, vendor.state, vendor.zipCode]
    .filter(Boolean)
    .join(', ');

  const initial =
    vendor.businessName && vendor.businessName.length > 0
      ? vendor.businessName[0].toUpperCase()
      : '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top banner + main info */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            {vendor.banner && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vendor.banner}
                alt="Vendor banner"
                className="h-40 w-full object-cover"
              />
            )}
            {/* Logo / avatar */}
            <div className="absolute -bottom-12 left-6 flex items-center gap-4">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden flex items-center justify-center text-3xl font-bold text-blue-600">
                {vendor.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vendor.logo}
                    alt={vendor.businessName || 'Vendor logo'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div className="mt-10">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {vendor.businessName || 'Vendor'}
                  </h1>
                </div>
                {vendor.city && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {vendor.city}
                      {vendor.state ? `, ${vendor.state}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="pt-16 px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white">
            <div>
              <p className="text-xs uppercase text-gray-500">Rating</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-lg font-semibold">
                  {Number.isFinite(vendor.rating)
                    ? vendor.rating.toFixed(1)
                    : '5.0'}
                </span>
                <span className="text-xs text-gray-500 ml-1">/ 5.0</span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">Total Bookings</p>
              <p className="text-lg font-semibold mt-1">
                {vendor.totalBookings ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">Experience</p>
              <div className="flex items-center gap-1 mt-1">
                <Briefcase className="h-4 w-4 text-gray-600" />
                <p className="text-lg font-semibold">
                  {vendor.experience ?? 0} years
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Bottom: About + contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About / description */}
          <Card >
            <CardHeader>
              <CardTitle>About the Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {vendor.description || 'No description provided yet.'}
              </p>

              {vendor.categories && vendor.categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Service Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.categories.map((cat) => (
                      <span
                        key={cat._id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/vendor/profile-setup')}
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact & details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Contact & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              {/* IDs */}
              <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                <p>
                  <span className="font-semibold">Vendor Name:</span>{' '}
                  {vendor.businessName}
                </p>
                <p>
                  <span className="font-semibold">User ID:</span>{' '}
                  {vendor.userId}
                </p>
              </div>

              {/* Business type (raw id for now) */}
              {vendor.businessType && (
                <div>
                  <p className="font-medium mb-1">Business Type</p>
                  <p>{vendor.businessType}</p>
                </div>
              )}

              {/* Address */}
              {fullAddress && (
                <div>
                  <p className="font-medium mb-1">Address</p>
                  <p>{fullAddress}</p>
                </div>
              )}

              {/* Phone */}
              {vendor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span>{vendor.phone}</span>
                </div>
              )}

              {/* Website */}
              {vendor.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-600" />
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {vendor.website}
                  </a>
                </div>
              )}

              {/* Bank account */}
              {vendor.bankAccount && (
                <div>
                  <p className="font-medium mb-1">Bank Account</p>
                  <p>{vendor.bankAccount}</p>
                </div>
              )}

              {/* Created / Updated */}
              {(vendor.createdAt || vendor.updatedAt) && (
                <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                  {vendor.createdAt && (
                    <p>
                      <span className="font-semibold">Created:</span>{' '}
                      {new Date(vendor.createdAt).toLocaleString()}
                    </p>
                  )}
                  {vendor.updatedAt && (
                    <p>
                      <span className="font-semibold">Updated:</span>{' '}
                      {new Date(vendor.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-gray-100 mt-3">
                <p className="text-xs text-gray-500">
                  Bank account and sensitive payout information are stored
                  securely.
                </p>
                {!vendor.profileCompleted && (
                  <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded mt-3 p-2">
                    Your profile is not fully completed yet. Please update your
                    details so customers can trust your business more.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
