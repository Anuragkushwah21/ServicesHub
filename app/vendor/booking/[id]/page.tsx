'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Calendar,
  Clock,
  ArrowLeft,
  IndianRupee,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface BookingDetail {
  _id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | string;
  bookingDate: string;
  bookingTime: string;
  notes?: string;
  price: number;                // 👈 from booking
  customerCity?: string;        // 👈 extra fields saved in booking
  customerPhone?: string;
  serviceId: {
    name: string;
    price: number;
    duration: number;
  };
  userId: {
    name: string;
    email: string;
    city?: string;
  };
}

export default function VendorBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await fetch(`/api/vendor/bookings/${params.id}`);
        const json = await res.json();
        console.log('booking detail json', json);

        if (!res.ok) {
          toast.error(json.message || 'Failed to load booking');
          router.push('/vendor');
          return;
        }

        setBooking(json.data);
      } catch (err) {
        console.error('[VENDOR-BOOKING-DETAIL] Error:', err);
        toast.error('Error loading booking');
        router.push('/vendor');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && params?.id) {
      loadBooking();
    }
  }, [status, params, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = async (
    newStatus: 'confirmed' | 'completed' | 'cancelled',
  ) => {
    if (!booking) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/vendor/bookings/${booking._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || 'Failed to update status');
        return;
      }

      setBooking(json.data);
      toast.success('Status updated');
    } catch (err) {
      console.error('[UPDATE-STATUS] Error:', err);
      toast.error('Error updating status');
    } finally {
      setUpdating(false);
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

  if (!booking) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <p className="text-center text-gray-600">Booking not found.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                {booking.serviceId?.name || 'Service'}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Booking ID: {booking._id}
              </p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() +
                booking.status.slice(1)}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Date / time / price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(booking.bookingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{booking.bookingTime}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <IndianRupee className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {booking.price ?? booking.serviceId?.price ?? 0}
                </span>
              </div>
            </div>

            {/* Booking info */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm text-gray-700 border-t pt-4">
              {/* Customer */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
                <div className="space-y-1">
                  <p>Name: {booking.userId?.name ?? 'Unknown'}</p>
                  <p>Email: {booking.userId?.email ?? 'Not provided'}</p>
                  <p>
                    City:{' '}
                    {booking.userId?.city ||
                      booking.customerCity ||
                      'Not provided'}
                  </p>
                  {booking.customerPhone && (
                    <p>Phone: {booking.customerPhone}</p>
                  )}
                </div>
              </div>

              {/* Service */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Service</h3>
                <div className="space-y-1">
                  <p>Service: {booking.serviceId?.name ?? 'Unknown'}</p>
                  <p>Duration: {booking.serviceId?.duration ?? 0} min</p>
                  <p>Price: ₹{booking.price}</p>
                </div>
              </div>

              {/* Booking */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Booking</h3>
                <div className="space-y-1">
                  <p>
                    Date:{' '}
                    {booking.bookingDate &&
                      new Date(booking.bookingDate).toLocaleDateString()}
                  </p>
                  <p>Time: {booking.bookingTime}</p>
                  <p>
                    Status:{' '}
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </p>
                  {booking.notes && <p>Notes: {booking.notes}</p>}
                </div>
              </div>
            </div>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
              {booking.status === 'pending' && (
                <Button
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('confirmed')}
                >
                  {updating && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Mark as Confirmed
                </Button>
              )}

              {booking.status === 'confirmed' && (
                <Button
                  size="sm"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('completed')}
                >
                  {updating && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Mark as Completed
                </Button>
              )}

              {booking.status !== 'cancelled' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updating}
                  onClick={() => handleUpdateStatus('cancelled')}
                >
                  {updating && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Cancel Booking
                </Button>
              )}
            </div>

            {/* Notes (optional) */}
            {booking.notes && (
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2">
                  Notes
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {booking.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}