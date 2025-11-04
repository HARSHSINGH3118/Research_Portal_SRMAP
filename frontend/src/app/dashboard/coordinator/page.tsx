'use client';

import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    setUser(raw ? JSON.parse(raw) : null);
  }, []);

  const roles: string[] = (user?.roles || []).map((r: string) => r.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
      <p className="text-gray-600 mb-6">Choose a section from the sidebar.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(roles.includes('author') || roles.includes('publisher')) && (
          <a href="/dashboard/author" className="bg-white border p-4 rounded-xl shadow-sm hover:shadow">
            <div className="font-medium text-gray-800">Author</div>
            <div className="text-sm text-gray-500">Submit papers & track status</div>
          </a>
        )}

        {roles.includes('reviewer') && (
          <a href="/dashboard/reviewer" className="bg-white border p-4 rounded-xl shadow-sm hover:shadow">
            <div className="font-medium text-gray-800">Reviewer</div>
            <div className="text-sm text-gray-500">See assignments & review</div>
          </a>
        )}

        {roles.includes('coordinator') && (
          <a href="/dashboard/coordinator" className="bg-white border p-4 rounded-xl shadow-sm hover:shadow">
            <div className="font-medium text-gray-800">Coordinator</div>
            <div className="text-sm text-gray-500">Manage events, assignments & stats</div>
          </a>
        )}
      </div>
    </div>
  );
}
