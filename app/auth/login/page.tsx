'use client';

import { useState } from 'react';
// import { signIn } from 'next-auth/react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);

  try {
    const result = await signIn('credentials', {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes('Email not verified')) {
        toast.error('Please verify your email first.');
      } else if (result.error.includes('User not found')) {
        toast.error('User not found.');
      } else if (result.error.includes('Invalid password')) {
        toast.error('Incorrect password.');
      } else {
        toast.error('Login failed. Please try again.');
      }
      return;
    }

    toast.success('Logged in successfully!');

    // Naya: session leke role check
    const session = await getSession();
    const role = (session?.user as any)?.role || 'user';

    const callbackUrl = searchParams.get('callbackUrl');

    if (callbackUrl) {
      router.push(callbackUrl);
      return;
    }

    // Role‑based redirect
    if (role === 'admin') {
      router.push('/admin');      // apna admin dashboard route
    } else if (role === 'vendor') {
      router.push('/vendor/dashboard');     // ya '/dashboard' jaha VendorDashboard load ho
    } else {
      router.push('/dashboard');            // normal user dashboard
    }
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    toast.error('Something went wrong. Try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Don't have an account{' '}
            <Link href="/auth/register" className="text-blue-600 font-medium">
              Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
