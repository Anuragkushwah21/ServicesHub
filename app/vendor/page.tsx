'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  Trash2,
  Edit
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-toastify';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  totalBookings: number;
  rating: number;
  categoryId?: string;
}

interface Booking {
  _id: string;
  service: { name: string; price: number };
  user: { name: string; email: string };
  bookingDate: string;
  bookingTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export default function VendorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vendor, setVendor] = useState<any | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [stats, setStats] = useState({
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    categoryId: '',
  });

  // Load data on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status !== 'authenticated') return;

    const role = (session?.user as any)?.role;
    if (role !== 'vendor') {
      router.push('/dashboard');
      return;
    }

    const loadData = async () => {
      try {
        // Profile check
        const profileRes = await fetch('/api/vendor/profile');
        const profileData = await profileRes.json();
        if (profileData.data?.profileCompleted === false) {
          router.push('/vendor/profile-setup');
          return;
        }

        // Categories
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.data || []);
        }

        // Services
        const serviceRes = await fetch('/api/vendor/services');
        console.log("service response", serviceRes)
        if (serviceRes.ok) {
          const serviceData = await serviceRes.json();
          const list = serviceData.data || [];
          setServices(list);

          const totalRevenue = list.reduce(
            (sum: number, s: Service) => sum + (s.price || 0) * (s.totalBookings || 0),
            0
          );
          const totalBookings = list.reduce(
            (sum: number, s: Service) => sum + (s.totalBookings || 0),
            0
          );
          const avgRating =
            list.length > 0
              ? (list.reduce((sum: number, s: Service) => sum + (s.rating || 5), 0) / list.length).toFixed(1)
              : '0';

          setStats({
            totalServices: list.length,
            totalBookings,
            totalRevenue,
            avgRating: parseFloat(avgRating),
          });
        }

        // Bookings
        const bookingRes = await fetch('/api/vendor/bookings');
        if (bookingRes.ok) {
          const bookingData = await bookingRes.json();
          setBookings(bookingData.data || []);
        }
      } catch (err) {
        console.error('[VENDOR] Error:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [status, session, router]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!openDialog) {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        categoryId: '',
      });
    }
  }, [openDialog]);

  // Populate form when editing
  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        description: editingService.description,
        price: editingService.price.toString(),
        duration: editingService.duration.toString(),
        categoryId: editingService.categoryId || '',
      });
    }
  }, [editingService]);

  // fetch vendor profile once (example)
  useEffect(() => {
    const loadVendor = async () => {
      const res = await fetch('/api/vendor/profile');
      const json = await res.json();
      setVendor(json.data);
    };
    loadVendor();
  }, []);

  // derive flag from vendor
  const isProfileComplete = vendor?.profileCompleted === true;

  // Add/Edit Service
  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1) Block if profile incomplete
    if (!isProfileComplete) {
      toast.warn('Please complete your profile before you add a service.');
      return;
    }

    // 2) Basic field validation
    if (!formData.name || !formData.price || !formData.duration) {
      toast.warn('Please fill all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const url = editingService
        ? `/api/vendor/services/${editingService._id}`
        : '/api/vendor/services';

      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration, 10),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingService) {
          setServices((prev) =>
            prev.map((s) => (s._id === editingService._id ? data.data : s)),
          );
          toast.success('Service updated successfully');
        } else {
          setServices((prev) => [...prev, data.data]);
          toast.success('Service added successfully');
        }
        setOpenDialog(false);
      } else {
        toast.error('Failed to save service');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };


  // Delete Service
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      const res = await fetch(`/api/vendor/services/${serviceToDelete}`, {
        method: 'DELETE',
      });
      console.log("Delete service", res)
      if (res.ok) {
        setServices(prev => prev.filter(s => s._id !== serviceToDelete));
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
        toast.success('Service deleted successfully');
      } else {
        toast.error('Failed to delete service');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete service');
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/vendor/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setBookings(prev => prev.map((b) => (b._id === id ? { ...b, status: status as any } : b)));
        toast.success('Booking status updated');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update booking');
    }
  };

  // Edit Service Handler
  const handleEditService = (service: Service) => {
    setEditingService(service);
    setOpenDialog(true);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your services and bookings</p>
            </div>
            <Button onClick={() => setOpenDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalServices}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.totalBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">${stats.totalRevenue}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">{stats.avgRating}</p>
              </CardContent>
            </Card>
          </div>

          {/* Single Tabs Structure */}
          <Tabs defaultValue="services" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              {services.length > 0 ? (
                services.map((service) => (
                  <Card key={service._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-blue-600 font-semibold">${service.price}</span>
                            <span className="text-gray-600">{service.duration} min</span>
                            <span className="text-gray-600">
                              {service.totalBookings} bookings
                            </span>
                            <span className="text-yellow-600 font-semibold">
                              {service.rating || 5} ⭐
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditService(service)}
                            className="h-8 px-3"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setServiceToDelete(service._id);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 px-3"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No services yet</p>
                    <Button onClick={() => setOpenDialog(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Service
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Card key={booking._id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{booking.service.name}</h3>
                          <p className="text-sm text-gray-600">{booking.user.name}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </span>
                            <span>{booking.bookingTime}</span>
                            <span>${booking.service.price}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge
                            className={`${booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          {booking.status === 'pending' && (
                            <Select
                              onValueChange={(value) => handleUpdateBookingStatus(booking._id, value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Update status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirm</SelectItem>
                                <SelectItem value="cancelled">Cancel</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                            >
                              Mark Done
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No bookings yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Add/Edit Service Dialog */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </DialogTitle>
              </DialogHeader>

              {!isProfileComplete && (
                <p className="text-sm text-red-600 mb-2">
                  Before adding a service, please complete your profile.
                </p>
              )}

              <form onSubmit={handleSubmitService} className="space-y-4">
                <Input
                  placeholder="Service Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={!isProfileComplete}
                />
                <Textarea
                  placeholder="Service Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={!isProfileComplete}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Price ($)"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    disabled={!isProfileComplete}
                  />
                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    required
                    disabled={!isProfileComplete}
                  />
                </div>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  disabled={!isProfileComplete}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !isProfileComplete}
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingService ? 'Update Service' : 'Add Service'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>


          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Service</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this service? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setServiceToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteService}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Service'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
