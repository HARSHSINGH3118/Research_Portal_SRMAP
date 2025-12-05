'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';

type EventRow = {
  _id: string;
  title: string;
  date?: string;
};

type PaperRow = {
  _id: string;
  title: string;
  track?: string;
  fileUrl?: string;
  status?: 'pending' | 'submitted' | 'processing' | 'reviewed';
  createdAt?: string;
};

export default function AuthorOverview() {
  const router = useRouter();

  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [papers, setPapers] = useState<PaperRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingPapers, setLoadingPapers] = useState(true);

  useEffect(() => {
    // read user from localStorage
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = raw ? JSON.parse(raw) : null;

      if (!user) {
        router.replace('/login');
        return;
      }

      setAuthorName(user?.name || '');
      setAuthorEmail(user?.email || '');
      setContactNumber(user?.contactNumber || '');
    } catch {
      router.replace('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiGet('/events'); // GET /api/events -> { ok, events }
        setEvents(Array.isArray(res?.events) ? res.events : []);
      } catch (e) {
        console.error('Error loading events:', e);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await apiGet('/paper/my'); // GET /api/paper/my -> { ok, papers }
        setPapers(Array.isArray(res?.papers) ? res.papers : []);
      } catch (e) {
        console.error('Error loading papers:', e);
      } finally {
        setLoadingPapers(false);
      }
    };
    fetchPapers();
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 py-6 border-b bg-white">
        <h1 className="text-2xl font-semibold text-gray-800">Author Overview</h1>
        <p className="text-sm text-gray-500">Welcome to your dashboard.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Author Details */}
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Name</div>
              <div className="text-gray-900 font-medium">{authorName || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div className="text-gray-900 font-medium">{authorEmail || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">Contact Number</div>
              <div className="text-gray-900 font-medium">{contactNumber || '—'}</div>
            </div>
          </div>
        </section>

        {/* Events List */}
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Available Events</h2>
          </div>

          {loadingEvents ? (
            <div className="text-sm text-gray-500">Loading events…</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-gray-500">No events found.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="border rounded-lg p-4 hover:shadow transition bg-white"
                >
                  <div className="font-medium text-gray-900">{ev.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {ev.date ? `Date: ${formatDate(ev.date)}` : 'Date: —'}
                  </div>
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/author/submit-paper?eventId=${ev._id}&eventTitle=${encodeURIComponent(
                          ev.title
                        )}`
                      )
                    }
                    className="mt-3 w-full text-center bg-[#494623] hover:bg-[#3a381c] text-white text-sm py-2 rounded-lg"
                  >
                    Submit Paper
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Submissions */}
        <section className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">My Submissions</h2>
            <button
              onClick={() => router.push('/dashboard/author/submit-paper')}
              className="text-sm bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg"
            >
              New Submission
            </button>
          </div>

          {loadingPapers ? (
            <div className="text-sm text-gray-500">Loading submissions…</div>
          ) : papers.length === 0 ? (
            <div className="text-sm text-gray-500">You haven’t submitted any papers yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Track</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Submitted</th>
                    <th className="py-2 pr-4">File</th>
                  </tr>
                </thead>
                <tbody>
                  {papers.map((p) => (
                    <tr key={p._id} className="border-b last:border-none">
                      <td className="py-2 pr-4 text-gray-900">{p.title}</td>
                      <td className="py-2 pr-4 text-gray-700">{p.track || '—'}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border">
                          {p.status || 'submitted'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-700">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-2 pr-4">
                        {p.fileUrl ? (
                          <a
                            href={p.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#494623] hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
