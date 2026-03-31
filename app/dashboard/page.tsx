'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Loader2,
  Calendar,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';

interface Booking {
  _id: string;
  service?: {
    name?: string;
    price?: number;
    duration?: number;
  };
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
}

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
  });

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // NEW: profile state for card
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Fetch bookings + stats
 useEffect(() => {
  const fetchUserData = async () => {
    try {
      const bookingsRes = await fetch('/api/user/bookings');
      const bookingsJson = await bookingsRes.json();

      if (!bookingsRes.ok) {
        toast.error(bookingsJson.message || 'Failed to load bookings');
      } else {
        const list: Booking[] = Array.isArray(bookingsJson.data)
          ? bookingsJson.data
          : [];
        setBookings(list);

        const completed = list.filter((b) => b.status === 'completed').length;

        const totalSpent = list
          .filter((b) => b.status === 'completed')
          .reduce((sum, b) => {
            const price = b?.service?.price;
            return typeof price === 'number' ? sum + price : sum;
          }, 0);

        setUserStats({
          totalBookings: list.length,
          completedBookings: completed,
          totalSpent,
        });
      }
    } catch (err) {
      console.error('[USER-DASHBOARD] Error:', err);
      toast.error('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'authenticated') {
    fetchUserData();
  }
}, [status]);

  // NEW: fetch profile for dashboard card
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        const json = await res.json();
        if (res.ok) {
          setProfile(json.data);
        }
      } catch {
        // optional toast
      } finally {
        setProfileLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/user/bookings/${bookingToCancel}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingToCancel ? { ...b, status: 'cancelled' } : b
          )
        );
        toast.success('Booking cancelled successfully');
        setCancelDialogOpen(false);
        setBookingToCancel(null);
      } else {
        toast.error(data.message || 'Failed to cancel booking');
      }
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canCancelBooking = (booking: Booking) =>
    booking.status === 'pending' || booking.status === 'confirmed';

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

  const user = session?.user as any;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hello, {user?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Track your bookings, service status and spending
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => router.push('/explore')}>
                Browse Services
              </Button>
            </div>
          </div>

          {/* NEW: Profile card on dashboard */}
          {!profileLoading && profile && (
            <Card className="mb-2">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {profile.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.profileImage}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard/userProfile')}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {/* USER STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Your Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{userStats.totalBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {userStats.completedBookings}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{userStats.totalSpent}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* BOOKINGS LIST (unchanged) */}
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const serviceName =
                      booking?.service?.name || 'Unknown service';
                    const price =
                      typeof booking?.service?.price === 'number'
                        ? booking.service!.price
                        : 0;
                    const canCancel = canCancelBooking(booking);

                    return (
                      <Card key={booking._id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg truncate pr-4">
                                  {serviceName}
                                </h3>
                                <span className="text-2xl font-bold text-blue-600">
                                  ₹{price}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(
                                    booking.bookingDate
                                  ).toLocaleDateString()}
                                </span>
                                <span>{booking.bookingTime}</span>
                              </div>

                              <span
                                className={`px-3 py-1 text-xs font-medium rounded-full ${booking.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800'
                                    : booking.status === 'completed'
                                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                                      : booking.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                              >
                                {booking.status
                                  .charAt(0)
                                  .toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>

                            <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
                              {canCancel && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setBookingToCancel(booking._id);
                                    setCancelDialogOpen(true);
                                  }}
                                  className="h-9 px-4"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                              {booking.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="h-9 px-4 text-xs"
                                >
                                  Waiting for vendor...
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No bookings found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Book your first service to get started
                  </p>
                  <Button onClick={() => router.push('/explore')}>
                    Browse Services
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be
              undone and may affect your vendor relationship.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setBookingToCancel(null);
              }}
            >
              Keep Booking
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
