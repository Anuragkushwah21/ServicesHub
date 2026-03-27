'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  isActive: boolean;
  createdAt: string;
}

const PAGE_SIZE = 10;

export default function AdminManageUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'vendor' | 'admin'>('all');
  const [page, setPage] = useState(1);

  // Protect route: only admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (
      status === 'authenticated' &&
      (session?.user as any)?.role !== 'admin'
    ) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        const json = await res.json();

        if (!res.ok) {
          toast.error(json.message || 'Failed to load users');
          return;
        }

        setUsers(json.data || []);
      } catch (err) {
        toast.error('Error loading users');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      loadUsers();
    }
  }, [status, session]);

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/users/${user._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || 'Failed to update status');
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !user.isActive } : u,
        ),
      );

      toast.success(
        `User ${!user.isActive ? 'activated' : 'deactivated'} successfully`,
      );
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  // Reset page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return users.filter((u) => {
      const matchesRole =
        roleFilter === 'all' ? true : u.role === roleFilter;

      const matchesSearch =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term);

      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Users & Vendors
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top search + role filter */}
              <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <Input
                  className="w-full md:w-72"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={roleFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setRoleFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={roleFilter === 'user' ? 'default' : 'outline'}
                    onClick={() => setRoleFilter('user')}
                  >
                    Users
                  </Button>
                  <Button
                    size="sm"
                    variant={roleFilter === 'vendor' ? 'default' : 'outline'}
                    onClick={() => setRoleFilter('vendor')}
                  >
                    Vendors
                  </Button>
                  <Button
                    size="sm"
                    variant={roleFilter === 'admin' ? 'default' : 'outline'}
                    onClick={() => setRoleFilter('admin')}
                  >
                    Admins
                  </Button>
                </div>
              </div>

              {/* Row-by-row table */}
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-600 mt-3">
                  No accounts match your filters.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto mt-3">
                    <table className="min-w-full border text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left border">Name</th>
                          <th className="px-3 py-2 text-left border">Email</th>
                          <th className="px-3 py-2 text-left border">Role</th>
                          <th className="px-3 py-2 text-left border">Status</th>
                          <th className="px-3 py-2 text-left border">Created</th>
                          <th className="px-3 py-2 text-right border">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border">
                              {u.name || '(no name)'}
                            </td>
                            <td className="px-3 py-2 border">{u.email}</td>
                            <td className="px-3 py-2 border capitalize">
                              {u.role}
                            </td>
                            <td className="px-3 py-2 border">
                              {u.isActive ? 'Active' : 'Inactive'}
                            </td>
                            <td className="px-3 py-2 border">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 border text-right">
                              <Button
                                size="sm"
                                variant={u.isActive ? 'destructive' : 'outline'}
                                onClick={() => handleToggleActive(u)}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <span>
                      Showing{' '}
                      {Math.min(
                        (currentPage - 1) * PAGE_SIZE + 1,
                        filtered.length,
                      )}{' '}
                      –{' '}
                      {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{' '}
                      {filtered.length}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <span className="px-2 py-1">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
