'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { StaffRole } from '@/types';

interface UseAuthOptions {
  required?: boolean;
  roles?: StaffRole[];
  redirectTo?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { required = false, roles = [], redirectTo = '/login' } = options;
  const sessionResult = useSession();
  const { data: session, status } = sessionResult || { data: undefined, status: 'loading' };
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    if (required && status === 'unauthenticated') {
      router.push(redirectTo);
      return;
    }

    if (roles.length > 0 && session?.user) {
      const userRole = (session.user as { role?: StaffRole }).role;
      if (!userRole || !roles.includes(userRole)) {
        router.push('/unauthorized');
      }
    }
  }, [status, required, roles, redirectTo, router, session, pathname]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    signIn: () => signIn(),
    signOut: () => signOut(),
  };
}

export function useRequireAuth(redirectTo = '/login') {
  const sessionResult = useSession();
  const { status } = sessionResult || { status: 'loading' };
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(redirectTo);
    }
  }, [status, redirectTo, router]);

  return {
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
