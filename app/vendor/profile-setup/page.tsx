'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-toastify';

interface Category {
  _id: string;
  name: string;
}

export default function VendorProfileSetup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    businessType: '',
    experience: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    bankAccount: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Auth + role guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (session?.user && (session.user as any).role !== 'vendor') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error('Category error:', err);
      }
    };

    fetchCategories();
  }, []);

  // (Optional) existing vendor data preload
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await fetch('/api/vendor/profile');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.data) {
          const v = data.data;
          setFormData({
            businessName: v.businessName || '',
            description: v.description || '',
            businessType: v.businessType || '',
            experience: v.experience?.toString() || '',
            phone: v.phone || '',
            address: v.address || '',
            city: v.city || '',
            state: v.state || '',
            zipCode: v.zipCode || '',
            website: v.website || '',
            bankAccount: v.bankAccount || '',
          });
          if (v.logo) {
            setLogoPreview(v.logo);
          }
        }
      } catch (err) {
        console.error('Vendor preload error:', err);
      }
    };

    if (status === 'authenticated') {
      fetchVendor();
    }
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      fd.append('businessName', formData.businessName);
      fd.append('description', formData.description);
      fd.append('businessType', formData.businessType);
      fd.append(
        'experience',
        formData.experience ? String(Number(formData.experience)) : '0',
      );
      fd.append('phone', formData.phone);
      fd.append('address', formData.address);
      fd.append('city', formData.city);
      fd.append('state', formData.state);
      fd.append('zipCode', formData.zipCode);
      fd.append('website', formData.website);
      fd.append('bankAccount', formData.bankAccount);

      if (logoFile) {
        fd.append('logo', logoFile);
      }

      const response = await fetch('/api/vendor/profile', {
        method: 'PUT',
        body: fd, // multipart/form-data
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to update profile');
        console.error('[VENDOR-SETUP] Error:', data);
        return;
      }

      toast.success('Profile updated successfully!');
      console.log('[VENDOR-SETUP] Profile updated:', data);

      setTimeout(() => {
        router.push('/vendor/vendor-profile');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
      console.error('[VENDOR-SETUP] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Vendor Profile</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Add your business information to start receiving bookings
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo / Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 text-center px-2">
                        No image
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="logo"
                      className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Logo</span>
                    </label>
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: square image, max 2MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <Input
                  type="text"
                  name="businessName"
                  placeholder="Your Business Name"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Category *
                </label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) =>
                    handleSelectChange('businessType', value)
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <Textarea
                  name="description"
                  placeholder="Tell customers about your services and experience"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={4}
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <Input
                  type="number"
                  name="experience"
                  placeholder="5"
                  value={formData.experience}
                  onChange={handleChange}
                  disabled={loading}
                  min="0"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 border rounded-md bg-gray-50 text-sm">
                      +91
                    </span>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    name="website"
                    placeholder="Optional: https://yourbusiness.com"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <Input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <Input
                    type="text"
                    name="zipCode"
                    placeholder="560001"
                    value={formData.zipCode}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Bank Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account (for payouts)
                </label>
                <Input
                  type="text"
                  name="bankAccount"
                  placeholder="Account number"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Profile...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                You can update this information anytime from your vendor
                dashboard
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
