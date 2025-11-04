'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AssignedPapers() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await apiGet('/events/current/assigned');
        if (res?.ok) setAssignments(res.items || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch assigned papers');
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading assigned papers...
      </div>
    );

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Assigned Papers</h1>

      {assignments.length === 0 ? (
        <p className="text-gray-600">No papers assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.paperId}
              className="border bg-white p-4 rounded-lg shadow-sm hover:shadow"
            >
              <h2 className="font-medium text-gray-800">{a.title}</h2>
              <p className="text-sm text-gray-500">{a.track}</p>
              <p className="text-sm mt-1">
                Reviewed:{" "}
                <span
                  className={
                    a.reviewed ? 'text-green-600' : 'text-orange-600'
                  }
                >
                  {a.reviewed ? 'Yes' : 'Pending'}
                </span>
              </p>
              <a
                href={`/dashboard/reviewer/review/${a.paperId}`}
                className="text-orange-600 text-sm underline"
              >
                Open Review
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
