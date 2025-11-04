'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AuthorSubmissions() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const userRaw = localStorage.getItem('user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        if (!user) return;

        // ✅ Fetch all papers for this author
        const res = await apiGet(`/users/${user.id}/papers`);
        if (res?.ok) setPapers(res.papers || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading submissions...
      </div>
    );

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Submissions</h1>

      <a
        href="/dashboard/author/submit-paper"
        className="inline-block mb-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
      >
        Submit New Paper
      </a>

      {papers.length === 0 ? (
        <p className="text-gray-600">You haven’t submitted any papers yet.</p>
      ) : (
        <div className="space-y-3">
          {papers.map((p) => (
            <div
              key={p._id}
              className="border bg-white p-4 rounded-lg shadow-sm hover:shadow"
            >
              <h2 className="font-medium text-gray-800">{p.title}</h2>
              <p className="text-sm text-gray-500">{p.track}</p>
              <p className="text-sm mt-1">
                <span className="font-medium">Status:</span>{' '}
                <span
                  className={`${
                    p.resultStatus === 'selected'
                      ? 'text-green-600'
                      : p.resultStatus === 'rejected'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {p.resultStatus}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
