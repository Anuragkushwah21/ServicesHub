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
  vendor: {
    businessName: string;
    description: string;
    city: string;
    isVerified: boolean;
    rating: number;
  };
  categoryId: {
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

setBookingLoading(true);
try {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId: id,
      bookingDate: day,   // sent as bookingDate
      bookingTime: time,  // sent as bookingTime
      customerName,
      phone,
      city,
      notes: '',
    }),
  });

    if (response.ok) {
      const data = await response.json();
      toast.success('Booking created successfully');
      router.push(`/booking/${data.data._id}`);
    } else {
      toast.error('You have already booked this service at this times');
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  if (!service) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-lg text-gray-600 mb-4">Service not found</p>
              <Link href="/explore">
                <Button>Back to Services</Button>
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
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/explore"
            className="text-blue-600 hover:text-blue-700 mb-6 inline-block"
          >
            ← Back to Services
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      {service.categoryId.name}
                    </span>
                    <h1 className="text-4xl font-bold text-gray-900">
                      {service.name}
                    </h1>
                  </div>
                  <div className="text-3xl">{service.categoryId.icon}</div>
                </div>

                <div className="flex items-center gap-6 text-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>{service.totalBookings} bookings</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span>{service.duration} minutes</span>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>About This Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{service.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Booking Card + Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ready to book?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Price</p>
                    <p className="text-4xl font-bold text-blue-600">
                      ${service.price}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">
                        {service.duration} min
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium">${service.price}</span>
                    </div>
                  </div>

                  {/* Booking form */}
                  <div className="space-y-3 pt-4 border-t">
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
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City / Address"
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
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      'Book Service'
                    )}
                  </Button>

                  {!session && (
                    <p className="text-xs text-gray-500 text-center">
                      You&apos;ll be redirected to sign in
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
