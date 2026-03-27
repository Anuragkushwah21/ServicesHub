// app/vendor/dashboard/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Loader2,
  Star,
  Briefcase,
  IndianRupee,
} from 'lucide-react';
import Link from 'next/link';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'react-toastify';

interface Vendor {
  businessName: string;
  description: string;
  rating: number;
  totalBookings: number;
  experience?: number;
  city?: string;
  state?: string;
  profileCompleted: boolean;
}

interface Booking {
  _id: string;
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  serviceId: {
    name: string;
    price: number;
    duration?: number;
  };
  userId: {
    name: string;
    city?: string;
  };
}

export default function VendorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [vendorStats, setVendorStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
  });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // only allow vendor
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const role = (session?.user as any)?.role;
    if (status === 'authenticated' && role !== 'vendor') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        // Vendor profile
        const vendorRes = await fetch('/api/vendor/profile');
        const vendorJson = await vendorRes.json();

        if (!vendorRes.ok) {
          toast.error(vendorJson.message || 'Failed to load vendor profile');
        } else {
          setVendor(vendorJson.data);
        }

        // Vendor bookings
        const bookingsRes = await fetch('/api/vendor/bookings');
        const bookingsJson = await bookingsRes.json();
        console.log('Bookings API ',bookingsJson)

        if (!bookingsRes.ok) {
          toast.error(bookingsJson.message || 'Failed to load bookings');
        } else {
          // API returns: { data: { totalBookings, bookings } }
          const { totalBookings, bookings } = bookingsJson.data || {
            totalBookings: 0,
            bookings: [],
          };

          const list: Booking[] = Array.isArray(bookings) ? bookings : [];
          setBookings(list);

          const completed = list.filter(
            (b) => b.status === 'completed',
          ).length;

          const totalEarned = list.reduce(
            (sum, b) => sum + (b.serviceId?.price || 0),
            0,
          );

          setVendorStats({
            totalBookings,
            completedBookings: completed,
            totalEarnings: totalEarned,
          });
        }
      } catch (err) {
        console.error('[VENDOR-DASHBOARD] Error:', err);
        toast.error('Error loading vendor data');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchVendorData();
    }
  }, [status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setUpdatingId(bookingId);
      const res = await fetch(`/api/vendor/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || 'Failed to accept booking');
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: 'confirmed' } : b,
        ),
      );
      toast.success('Booking accepted');
    } catch (err) {
      console.error('[ACCEPT-BOOKING] Error:', err);
      toast.error('Error accepting booking');
    } finally {
      setUpdatingId(null);
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

  const user = session?.user as any;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header + info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hello, {user?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your services, bookings and vendor profile
              </p>

              {vendor && (
                <p className="text-sm text-gray-500 mt-1">
                  Business:{' '}
                  <span className="font-medium">{vendor.businessName}</span>
                  {vendor.city &&
                    ` • ${vendor.city}${vendor.state ? ', ' + vendor.state : ''}`}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/vendor/profile-setup')}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/explore')}
              >
                View Marketplace
              </Button>
            </div>
          </div>

          {/* Vendor stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {vendorStats.totalBookings}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {vendorStats.completedBookings}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{vendorStats.totalEarnings}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Vendor rating + experience */}
          {vendor && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <Link href="/vendor/vendor-profile">
                    Vendor Profile Overview
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Rating
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg font-semibold">
                      {vendor.rating?.toFixed(1) ?? '5.0'}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">/ 5.0</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Experience
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Briefcase className="h-4 w-4 text-gray-600" />
                    <span className="text-lg font-semibold">
                      {vendor.experience ?? 0} years
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Profile Status
                  </p>
                  <p className="mt-1 text-sm">
                    {vendor.profileCompleted ? (
                      <span className="text-green-600">
                        Completed
                      </span>
                    ) : (
                      <span className="text-yellow-600">
                        Incomplete – please update details
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookings tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Your Service Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    All ({bookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="confirmed">
                    Confirmed (
                    {bookings.filter((b) => b.status === 'confirmed').length}
                    )
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed (
                    {bookings.filter((b) => b.status === 'completed').length}
                    )
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending (
                    {bookings.filter((b) => b.status === 'pending').length}
                    )
                  </TabsTrigger>
                </TabsList>

                {/* All bookings */}
                <TabsContent value="all" className="space-y-4 mt-6">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 border rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {booking.serviceId?.name || 'Unknown service'}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Customer: {booking.userId?.name || 'Unknown'}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {new Date(
                                booking.bookingDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                              {booking.bookingTime}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <IndianRupee className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              {booking.serviceId?.price ?? 0}
                            </span>
                          </div>

                          {booking.userId?.city && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">
                                {booking.userId.city}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              disabled={updatingId === booking._id}
                              onClick={() => handleAcceptBooking(booking._id)}
                            >
                              {updatingId === booking._id
                                ? 'Accepting...'
                                : 'Accept booking'}
                            </Button>
                          )}

                          <Button asChild size="sm" variant="outline">
                            <Link href={`/vendor/booking/${booking._id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">
                        No bookings found
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Confirmed */}
                <TabsContent value="confirmed" className="space-y-4 mt-6">
                  {bookings.filter((b) => b.status === 'confirmed').length >
                  0 ? (
                    bookings
                      .filter((b) => b.status === 'confirmed')
                      .map((booking) => (
                        <div
                          key={booking._id}
                          className="p-4 border rounded-lg"
                        >
                          <h3 className="font-semibold">
                            {booking.serviceId?.name || 'Unknown service'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              booking.bookingDate,
                            ).toLocaleDateString()}{' '}
                            at {booking.bookingTime} •{' '}
                            {booking.userId?.name || 'Unknown'}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-center text-gray-600 py-8">
                      No confirmed bookings yet
                    </p>
                  )}
                </TabsContent>

                {/* Completed */}
                <TabsContent value="completed" className="space-y-4 mt-6">
                  {bookings.filter((b) => b.status === 'completed').length >
                  0 ? (
                    bookings
                      .filter((b) => b.status === 'completed')
                      .map((booking) => (
                        <div
                          key={booking._id}
                          className="p-4 border rounded-lg"
                        >
                          <h3 className="font-semibold">
                            {booking.serviceId?.name || 'Unknown service'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Completed on{' '}
                            {new Date(
                              booking.bookingDate,
                            ).toLocaleDateString()}
                            {' • '}
                            {booking.userId?.name || 'Unknown'}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-center text-gray-600 py-8">
                      No completed bookings
                    </p>
                  )}
                </TabsContent>

                {/* Pending */}
                <TabsContent value="pending" className="space-y-4 mt-6">
                  {bookings.filter((b) => b.status === 'pending').length >
                  0 ? (
                    bookings
                      .filter((b) => b.status === 'pending')
                      .map((booking) => (
                        <div
                          key={booking._id}
                          className="p-4 border rounded-lg"
                        >
                          <h3 className="font-semibold">
                            {booking.serviceId?.name || 'Unknown service'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Waiting for confirmation •{' '}
                            {booking.userId?.name || 'Unknown customer'}
                          </p>

                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              disabled={updatingId === booking._id}
                              onClick={() =>
                                handleAcceptBooking(booking._id)
                              }
                            >
                              {updatingId === booking._id
                                ? 'Accepting...'
                                : 'Accept booking'}
                            </Button>

                            <Button asChild size="sm" variant="outline">
                              <Link
                                href={`/vendor/booking/${booking._id}`}
                              >
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-center text-gray-600 py-8">
                      No pending bookings
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
