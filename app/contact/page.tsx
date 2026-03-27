// app/contact/page.tsx
'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-600 mb-2">Contact</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Get in touch with ServiceHub
            </h1>
            <p className="text-gray-600 text-sm">
              Have a question, feedback, or need help with a booking? Send us a message
              or find us at our Bengaluru office using the map below.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            {/* Contact form */}
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">Name</label>
                  <Input placeholder="Your name" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <Input type="email" placeholder="you@example.com" className="mt-1" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Subject</label>
                <Input placeholder="What can we help you with?" className="mt-1" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Message</label>
                <Textarea
                  rows={4}
                  placeholder="Write your message here..."
                  className="mt-1 resize-none"
                />
              </div>

              <Button className="mt-2">Send message</Button>

              <p className="text-xs text-gray-400 mt-2">
                We typically respond within 24 hours on business days.
              </p>
            </div>

            {/* Map + contact info */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="h-64 sm:h-72">
                  <iframe
                    title="ServiceHub Bengaluru location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.019915063505!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b1b6d7%3A0x9f1b3f5d8f3e!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-5 space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Office</p>
                    <p className="text-xs text-gray-600">
                      Bengaluru, Karnataka, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a
                      href="mailto:support@example.com"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      support@example.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-xs text-gray-600">+91-98765-43210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
