'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const raw =
      typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = raw ? JSON.parse(raw) : null;

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
    const target = roles.includes('coordinator')
      ? '/dashboard/coordinator'
      : roles.includes('reviewer')
      ? '/dashboard/reviewer'
      : '/dashboard/author';

    router.replace(target);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-700 text-sm">Redirecting to your dashboard…</div>
    </div>
  );
}
