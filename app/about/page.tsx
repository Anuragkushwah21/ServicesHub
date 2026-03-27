// app/about/page.tsx
'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { CheckCircle, Users, Clock, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <p className="text-sm font-medium text-blue-600 mb-3">About ServiceHub</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Making local services simple, fast, and trusted.
            </h1>
            <p className="text-gray-600 max-w-2xl">
              ServiceHub connects you with verified service professionals in your city so you
              can book home services in a few taps—instead of endless phone calls and searches.
            </p>
          </div>
        </section>

        {/* Mission / stats */}
        <section className="bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">Our mission</h2>
              <p className="text-gray-600">
                We want to make booking local services as smooth as ordering food online. No
                more guessing prices, chasing vendors, or worrying if someone will actually
                show up. With transparent listings, reviews, and easy booking, you stay in
                control.
              </p>
              <p className="text-gray-600">
                We are starting from Bengaluru and gradually expanding, focusing on quality
                providers and a reliable experience for every booking.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-white shadow-sm border p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Why ServiceHub?
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Verified vendors with clear service details.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Simple booking flow with upfront pricing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Support whenever something doesn&apos;t go as planned.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white border-t">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Built for customers and vendors
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border bg-gray-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-gray-900 text-sm">For customers</p>
                </div>
                <p className="text-sm text-gray-600">
                  Find trusted providers, compare services, and book in minutes with clear
                  prices and ratings.
                </p>
              </div>

              <div className="rounded-xl border bg-gray-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-gray-900 text-sm">Save time</p>
                </div>
                <p className="text-sm text-gray-600">
                  No more calling multiple vendors. One place to browse, book, and manage your
                  service appointments.
                </p>
              </div>

              <div className="rounded-xl border bg-gray-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-gray-900 text-sm">Local focus</p>
                </div>
                <p className="text-sm text-gray-600">
                  We focus on local areas like Bengaluru first so we can ensure quality and
                  quick response times.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-300 uppercase tracking-wide">
                Get started
              </p>
              <h3 className="text-xl font-semibold text-white mt-1">
                Ready to book your next service?
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Explore services, compare vendors, and schedule a booking that fits your time.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/explore"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Explore services
              </a>
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-800"
              >
                Become a vendor
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
