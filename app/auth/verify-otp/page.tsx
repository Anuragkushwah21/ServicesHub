'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email) {
        toast.error('Email not found. Please register again.');
        setLoading(false);
        return;
      }

      if (!otp || otp.length !== 6) {
        toast.error('Enter 6-digit OTP');
        setLoading(false);
        return;
      }

      if (timeLeft <= 0) {
        toast.error('OTP expired. Please register again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Verification failed');
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success('Email verified successfully!');
      console.log('[OTP] Verified:', email);

      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (error: any) {
      toast.error('Error occurred. Try again.');
      console.error('[OTP] Error:', error);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email not found');
      return;
    }

    setResending(true);

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to resend OTP');
        setResending(false);
        return;
      }

      setOtp('');
      setTimeLeft(300);
      setCanResend(false);
      toast.success('OTP resent successfully');
      console.log('[OTP] Resent to:', email);
    } catch (error: any) {
      toast.error('Error resending OTP');
      console.error('[OTP] Resend error:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <p className="text-sm text-gray-600">
            We've sent a 6-digit code to {email}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-green-700 font-medium">
                Email verified successfully!
              </p>
              <p className="text-sm text-gray-600">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {/* Error boxes अब toast पर चले गए, लेकिन expired info ऊपर रहेगा */}

              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium text-gray-700"
                >
                  Enter OTP Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="text-center text-2xl font-bold tracking-widest"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 text-center">
                  {timeLeft > 0 ? (
                    <>Expires in {formatTime(timeLeft)}</>
                  ) : (
                    <span className="text-red-600">OTP has expired</span>
                  )}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading || timeLeft <= 0 || !otp}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || resending || !canResend}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
                      Resending...
                    </>
                  ) : canResend ? (
                    'Resend OTP'
                  ) : (
                    `Resend in ${formatTime(timeLeft)}`
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center">
            <Link
              href="/auth/register"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Back to Register
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
