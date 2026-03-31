// app/explore/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Footer } from '@/components/footer';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  rating: number;
  vendorId?: {
    businessName: string;
    city?: string;
    phone?: string;
    experience?: number;
  };
}

interface Category {
  _id: string;
  name: string;
}

function ExploreContent() {
  const { data: session, status } = useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  // Categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []));
  }, []);

  // Services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const res = await fetch(`/api/services?${params}`);
      const data = await res.json();

      let filtered: Service[] = data.data || [];

      if (priceRange === 'budget') {
        filtered = filtered.filter((s) => s.price < 100);
      } else if (priceRange === 'mid') {
        filtered = filtered.filter((s) => s.price < 300);
      } else if (priceRange === 'premium') {
        filtered = filtered.filter((s) => s.price >= 300);
      }

      setServices(filtered);
      setLoading(false);
    };

    const timer = setTimeout(fetchServices, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, priceRange]);

  const isUser = !!session && (session.user as any)?.role === 'user';

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6">Browse Services</h1>

            {/* Filters */}
            <div className="space-y-4">
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* CATEGORY */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>

                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* PRICE */}
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="budget">Budget (&lt;₹100)</SelectItem>
                    <SelectItem value="mid">Mid (₹100–300)</SelectItem>
                    <SelectItem value="premium">Premium (&gt;₹300)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : services.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <Card key={s._id} className="hover:shadow-lg">
                  <CardContent className="p-4">
                    {/* Top: service title + price */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link href={`/service/${s._id}`}>
                          <p className="font-semibold text-lg hover:underline truncate">
                            {s.name}
                          </p>
                        </Link>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {s.description}
                        </p>
                      </div>

                      {/* RIGHT: vendor name + location + experience */}
                      {s.vendorId && (
                        <div className="w-40 text-right text-xs md:text-sm">
                          <p className="font-semibold text-gray-800 truncate">
                            {s.vendorId.businessName}
                          </p>
                          <p className="text-gray-600 truncate">
                            {s.vendorId.city && <>📍 {s.vendorId.city}</>}
                          </p>
                          <p className="text-gray-600 truncate">
                            {s.vendorId.phone && <> {s.vendorId.phone}</>}
                          </p>
                          {typeof s.vendorId.experience === 'number' && (
                            <p className="text-gray-500">
                              {s.vendorId.experience} yrs exp.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Middle: rating + duration */}
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        {s.rating || 5}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {s.duration} min
                      </span>
                    </div>

                    {/* Bottom: price + CTA */}
                    <div className="flex justify-between mt-4 items-center">
                      <span className="font-bold text-blue-600">
                        ₹{s.price}
                      </span>

                      {status === 'loading' ? (
                        <Button size="sm" disabled>
                          Checking...
                        </Button>
                      ) : !session ? (
                        <Link href="/auth/login">
                          <Button size="sm">
                            Login to book
                          </Button>
                        </Link>
                      ) : !isUser ? (
                        <Button size="sm" disabled>
                          Booking restricted
                        </Button>
                      ) : (
                        <Link href={`/service/${s._id}`}>
                          <Button size="sm">
                            Book service
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No services found</p>
          )}
        </section>
      </main>
      <Footer/>
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
