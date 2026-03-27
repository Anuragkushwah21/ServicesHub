'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
}

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    bio: '',
    profileImage: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const json = await res.json();

        if (!res.ok) {
          toast.error(json.message || 'Failed to load profile');
          return;
        }

        const u = json.data as any;
        setProfile({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          city: u.city || '',
          address: u.address || '',
          bio: u.bio || '',
          profileImage: u.profileImage || '',
        });
        if (u.profileImage) {
          setPreviewUrl(u.profileImage);
        }
      } catch {
        toast.error('Error loading profile');
      } finally {
        setLoading(false);
        setProfileLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('phone', profile.phone || '');
      formData.append('city', profile.city || '');
      formData.append('address', profile.address || '');
      formData.append('bio', profile.bio || '');
      // send existing profileImage so backend can keep it if no new file
      formData.append('profileImage', profile.profileImage || '');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || 'Failed to update profile');
        return;
      }

      const updated = json.data as any;
      setProfile((prev) => ({
        ...prev,
        profileImage: updated.profileImage || prev.profileImage,
      }));
      if (updated.profileImage) {
        setPreviewUrl(updated.profileImage);
      }

      toast.success('Profile updated successfully');
    } catch {
      toast.error('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top profile card */}
          {!profileLoading && profile && (
            <Card className="mb-6">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {previewUrl || profile.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl || profile.profileImage}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No photo</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{profile.name}</p>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                  {(profile.city || profile.phone) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {profile.city && `📍 ${profile.city}`}{' '}
                      {profile.phone && ` • 📞 ${profile.phone}`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit form */}
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo */}
                <div>
                  <label className="text-sm font-medium block mb-1">
                    Profile Photo
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG/PNG/WEBP. Max size depends on server settings.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={profile.email}
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    value={profile.phone || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input
                      name="city"
                      value={profile.city || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      name="address"
                      value={profile.address || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    name="bio"
                    value={profile.bio || ''}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
