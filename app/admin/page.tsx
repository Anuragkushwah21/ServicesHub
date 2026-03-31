'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Loader2, TrendingUp, Users, Briefcase, DollarSign, Plus, Trash2 } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';


interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  totalRevenue: number;
  bookingsByStatus: Record<string, number>;
  revenueByCategory: { name: string; value: number }[];
  revenueOverTime: { date: string; revenue: number }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    // fetch categories for management tab
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (status === 'authenticated') {
      fetchStats();
      fetchCategories();
    }
  }, [status, router, session]);

    const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    setCategoryLoading(true);
    setCategoryError('');

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCategories([...categories, data.data]);
        setNewCategory('');
        console.log(`[ADMIN] Category created: ${newCategory}`);
      } else {
        const error = await response.json();
        setCategoryError(error.error || 'Failed to create category');
        console.error(`[ADMIN] Failed to create category: ${error.error}`);
      }
    } catch (error) {
      setCategoryError('Error creating category');
      console.error('[ADMIN] Category creation error:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter((c) => c._id !== categoryId));
        console.log(`[ADMIN] Category deleted: ${categoryName}`);
      } else {
        const error = await response.json();
        setCategoryError(error.error || 'Failed to delete category');
        console.error(`[ADMIN] Failed to delete category: ${error.error}`);
      }
    } catch (error) {
      setCategoryError('Error deleting category');
      console.error('[ADMIN] Category deletion error:', error);
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

  if (!stats) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">Failed to load admin dashboard</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Platform analytics and management
              </p>
            </div>

            <div>
              <Link href="/admin/manage-users">
                <Button className="inline-flex flex-col items-start gap-0 px-4 py-2">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Manage Users</span>
                  </span>
                </Button>
              </Link>
            </div>
          </div>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Vendors</CardTitle>
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.totalVendors}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Bookings</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{stats.totalBookings}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">${stats.totalRevenue}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-200 rounded-md p-1">
              <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="status">Booking Status</TabsTrigger>
              <TabsTrigger value="manage-categories">Manage Categories</TabsTrigger>

            </TabsList>

            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.revenueOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.revenueByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: $${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.revenueByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {stats.revenueByCategory.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">
                            {item.name}: ${item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          <span className="text-gray-600">{count} bookings</span>
                        </div>
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${status === 'confirmed'
                              ? 'bg-green-500'
                              : status === 'completed'
                                ? 'bg-blue-500'
                                : status === 'pending'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                            style={{
                              width: `${(count / stats.totalBookings) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage-categories">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Service Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Category Form */}
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        disabled={categoryLoading}
                      />
                      <Button
                        type="submit"
                        disabled={categoryLoading}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Category
                      </Button>
                    </div>
                    {categoryError && (
                      <p className="text-sm text-red-600">{categoryError}</p>
                    )}
                  </form>

                  {/* Categories List */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Current Categories</h3>
                    {categories.length === 0 ? (
                      <p className="text-gray-500 text-sm">No categories yet. Add one to get started.</p>
                    ) : (
                      <div className="grid gap-2">
                        {categories.map((category: any) => (
                          <div
                            key={category._id}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{category.name}</p>
                              <p className="text-xs text-gray-500">
                                ID: {category._id}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category._id || category.id, category.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
