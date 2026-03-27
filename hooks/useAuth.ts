import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requiredRole?: string) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (requiredRole && status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole !== requiredRole) {
        console.log(`[AUTH] User role ${userRole} does not match required role ${requiredRole}`);
        // Redirect to appropriate dashboard based on role
        if (userRole === 'vendor') {
          router.push('/vendor');
        } else if (userRole === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [status, session, requiredRole, router]);

  return { session, status, isLoading: status === 'loading' };
}

export function useRole() {
  const { data: session } = useSession();
  return (session?.user as any)?.role;
}
