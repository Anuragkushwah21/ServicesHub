import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { ArrowRight, Zap, Users, TrendingUp } from 'lucide-react';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900">
              Find the Perfect <span className="text-blue-600">Service</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with trusted professionals for all your service needs. From cleaning to repairs, find experts in your area.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/explore">
                <Button size="lg" className="gap-2">
                  Explore Services <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/register?role=vendor">
                <Button size="lg" variant="outline">
                  Become a Provider
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">500+</div>
                <p className="text-gray-600 mt-2">Professional Providers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">10K+</div>
                <p className="text-gray-600 mt-2">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">50K+</div>
                <p className="text-gray-600 mt-2">Services Completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose ServiceHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <Zap className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Quick & Easy</h3>
              <p className="text-gray-600">Book services in minutes. Simple and streamlined process.</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <Users className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Verified Professionals</h3>
              <p className="text-gray-600">All providers are verified and rated by customers.</p>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-lg transition">
              <TrendingUp className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with transparent rates upfront.</p>
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {['Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Moving'].map((category) => (
                <Link key={category} href={`/explore?category=${category.toLowerCase()}`}>
                  <div className="p-6 bg-white rounded-lg border hover:shadow-lg hover:border-blue-300 transition cursor-pointer">
                    <div className="text-4xl mb-2">
                      {category === 'Cleaning' && '🧹'}
                      {category === 'Plumbing' && '🔧'}
                      {category === 'Electrical' && '⚡'}
                      {category === 'Painting' && '🎨'}
                      {category === 'Carpentry' && '🪵'}
                      {category === 'Moving' && '📦'}
                    </div>
                    <h3 className="font-semibold">{category}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-blue-100 text-lg">Join thousands of customers using ServiceHub for their service needs</p>
            <Link href="/explore">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Browse Services Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  );
}
