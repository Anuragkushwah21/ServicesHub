'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, Calendar, Clock, MapPin, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface BookingDetails {
  _id: string;
  service: {
    name: string;
    price: number;
    duration: number;
  };
  vendor: {
    businessName: string;
    city: string;
  };
  user: {
    name: string;
    email: string;
  };
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // local state for resolved id
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // unwrap params Promise once
  useEffect(() => {
    let cancelled = false;

    const resolveParams = async () => {
      try {
        const resolved = await params;
        if (!cancelled) setBookingId(resolved.id);
      } catch (e) {
        console.error('Error resolving params', e);
        toast.error('Invalid booking link');
      }
    };

    resolveParams();
    return () => {
      cancelled = true;
    };
  }, [params]);

  // fetch booking when bookingId is available
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        console.log('Fetch booking res',response)
        if (response.ok) {
          const data = await response.json();
          setBooking(data.data);
        } else if (response.status === 404) {
          toast.error('Booking not found');
          router.push('/dashboard');
        } else {
          toast.error('Failed to load booking');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Error fetching booking');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !booking) {
      toast.error('Invalid booking');
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await fetch(`/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount: booking.service.price,
          method: 'card',
        }),
      });

      if (!response.ok) {
        toast.error('Payment failed');
        setPaymentLoading(false);
        return;
      }

      setPaid(true);
      toast.success('Payment successful');

      // Update booking status
      const patchRes = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      });

      if (!patchRes.ok) {
        toast.warn('Payment done, but failed to update booking status');
      } else {
        setBooking((prev) =>
          prev ? { ...prev, status: 'confirmed' } : prev,
        );
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error processing payment');
    } finally {
      setPaymentLoading(false);
    }
  };

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

  if (loading || !bookingId) {
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
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-lg text-gray-600 mb-4">Booking not found</p>
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 mb-6 inline-block"
          >
            ← Back to Dashboard
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Booking Details</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {booking.service.name}
                    </h3>
                    <p className="text-gray-600">
                      {booking.vendor.businessName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">
                        Date & Time
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>
                          {new Date(
                            booking.bookingDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{booking.bookingTime}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span>{booking.vendor.city}</span>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-gray-600 text-sm mb-2">Notes</p>
                      <p className="bg-gray-50 p-3 rounded text-gray-700">
                        {booking.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Provider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {booking.vendor.businessName}
                    </h3>
                    <p className="text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {booking.vendor.city}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Section */}
            <div className="lg:col-span-1">
              {paid ? (
                <Card className="sticky top-24 border-green-2 00 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Payment Successful
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Amount Paid</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${booking.service.price}
                      </p>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-green-200">
                      <p className="text-sm text-gray-600">
                        Transaction Status
                      </p>
                      <Badge className="bg-green-100 text-green-800">
                        Confirmed
                      </Badge>
                    </div>
                    <Button
                      asChild
                      className="w-full mt-6 bg-green-600 hover:bg-green-700"
                    >
                      <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : booking.status === 'confirmed' ? (
                <Card className="sticky top-24 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-blue-600" />
                      Booking Confirmed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800">
                      Your booking has been confirmed by the service provider.
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">
                        Total Amount
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        ${booking.service.price}
                      </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span>{booking.service.duration} min</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span>${booking.service.price}</span>
                      </div>
                    </div>

                    <form
                      onSubmit={handlePayment}
                      className="space-y-3 pt-4 border-t"
                    >
                      <div>
                        <label className="text-xs font-medium text-gray-600">
                          Card Number
                        </label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={cardData.cardNumber}
                          onChange={(e) =>
                            setCardData({
                              ...cardData,
                              cardNumber: e.target.value,
                            })
                          }
                          required
                          disabled={paymentLoading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-600">
                            Expiry
                          </label>
                          <Input
                            placeholder="MM/YY"
                            value={cardData.expiryDate}
                            onChange={(e) =>
                              setCardData({
                                ...cardData,
                                expiryDate: e.target.value,
                              })
                            }
                            required
                            disabled={paymentLoading}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">
                            CVV
                          </label>
                          <Input
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) =>
                              setCardData({
                                ...cardData,
                                cvv: e.target.value,
                              })
                            }
                            required
                            disabled={paymentLoading}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={paymentLoading}
                        className="w-full"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </Button>
                    </form>

                    <p className="text-xs text-gray-500 text-center mt-3">
                      Demo Card: Use any number for testing
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
