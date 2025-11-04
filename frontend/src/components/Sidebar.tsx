'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-sm ${
        active
          ? 'bg-orange-100 text-orange-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    setUser(raw ? JSON.parse(raw) : null);
  }, []);

  const roles = useMemo(() => new Set((user?.roles || []).map((r) => r.toLowerCase())), [user]);

  const showAuthor = roles.has('author') || roles.has('publisher'); // legacy support
  const showReviewer = roles.has('reviewer');
  const showCoordinator = roles.has('coordinator');

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 sticky top-0 h-screen">
      {/* Header */}
      <div className="px-3 py-2 mb-4">
        <div className="text-lg font-semibold text-gray-800">UROP Portal</div>
        <div className="text-xs text-gray-500">
          {user?.name} {user?.roles?.length ? `• ${user.roles.join(', ')}` : ''}
        </div>
      </div>

      {/* Navigation */}
      <nav className="overflow-y-auto pr-1">
        <NavGroup title="Home">
          <NavItem href="/dashboard" label="Dashboard Home" />
        </NavGroup>

        {/* ✅ Author section (removed "My Submissions") */}
        {showAuthor && (
          <NavGroup title="Author">
            <NavItem href="/dashboard/author" label="Overview" />
            <NavItem href="/dashboard/author/submit-paper" label="Submit Paper" />
            {/* ❌ Removed My Submissions */}
          </NavGroup>
        )}

        {/* Reviewer section */}
        {showReviewer && (
          <NavGroup title="Reviewer">
            <NavItem href="/dashboard/reviewer" label="Overview" />
            <NavItem href="/dashboard/reviewer/assigned-papers" label="Assigned Papers" />
          </NavGroup>
        )}

        {/* Coordinator section */}
        {showCoordinator && (
          <NavGroup title="Coordinator">
            <NavItem href="/dashboard/coordinator" label="Overview" />
            <NavItem href="/dashboard/coordinator/events" label="Manage Events" />
            <NavItem href="/dashboard/coordinator/assignments" label="Assignments" />
            <NavItem href="/dashboard/coordinator/accepted" label="Accepted / Export" />
            <NavItem href="/dashboard/coordinator/reminders" label="Reviewer Reminders" />
            <NavItem href="/dashboard/coordinator/stats" label="Stats & Reports" />
          </NavGroup>
        )}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
