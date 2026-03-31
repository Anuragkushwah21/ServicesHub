// app/service/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, MapPin, Clock, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  rating: number;
  totalBookings: number;
  vendorId?: {
    businessName: string;
    description: string;
    city: string;
    isVerified: boolean;
    rating: number;
  };
  categoryId?: {
    name: string;
    icon: string;
  };
}

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { data: session } = useSession();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // booking form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      toast.error('Invalid service ID');
      return;
    }

    const fetchService = async () => {
      try {
        const response = await fetch(`/api/vendor/services/${id}`);
        if (response.ok) {
          const data = await response.json();
          // data.data should already have vendorId populated from API
          setService(data.data);
        } else if (response.status === 404) {
          toast.error('Service not found');
        } else {
          toast.error('Failed to load service');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Error loading service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const handleBooking = async () => {
    if (!session) {
      toast.info('Please login to book');
      router.push('/auth/login');
      return;
    }

    if (!id) {
      toast.error('Invalid service ID');
      return;
    }

    if (!customerName || !phone || !city || !day || !time) {
      toast.warn('Please fill all booking details');
      return;
    }

    const username = session.user?.name || customerName;
    const email = session.user?.email || '';

    setBookingLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: id,
          bookingDate: day,   // yyyy-mm-dd (string)
          bookingTime: time,  // hh:mm
          notes: '',
          customer: {
            username,
            name: customerName,
            email,
            phone,
            city,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Booking created successfully');
        router.push(`/booking/${data.data._id}`);
      } else if (response.status === 400) {
        toast.error('You have already booked this service at this time');
      } else {
        toast.error('Booking failed, please try again');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error creating booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Service not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Service details */}
          <section className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-semibold">{service.name}</h1>
                    <p className="text-sm text-gray-600">
                      {service.categoryId?.icon} {service.categoryId?.name}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{service.price}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm">{service.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>
                      {service.rating.toFixed(1)} · {service.totalBookings} bookings
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>
                      By {service.vendorId?.businessName ?? 'Unknown vendor'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700">
                <p className="font-medium">
                  {service.vendorId?.businessName ?? 'Unknown vendor'}
                </p>
                {service.vendorId?.description && (
                  <p className="text-gray-600">{service.vendorId.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span>{service.vendorId?.city ?? 'Unknown location'}</span>
                </div>
                {service.vendorId?.isVerified && (
                  <p className="text-xs text-green-600 mt-1">
                    Verified vendor · Rating {service.vendorId.rating.toFixed(1)}
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Booking card */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Book this service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-1">
                    <Label htmlFor="customerName">Name</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2 border rounded-md bg-gray-50 text-sm">
                        +91
                      </span>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="city">City / Address</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bengaluru / your area"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="day">Day</Label>
                    <Input
                      id="day"
                      type="date"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-2"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating booking...
                    </>
                  ) : (
                    'Book Now'
                  )}
                </Button>

                {!session && (
                  <p className="text-xs text-gray-500 text-center">
                    You will be asked to login before completing booking.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>
                By booking, you agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}