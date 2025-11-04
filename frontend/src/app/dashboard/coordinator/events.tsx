'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from 'react-toastify';

export default function CoordinatorEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiGet('/events');
        if (res?.ok) setEvents(res.events || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading events...
      </div>
    );

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Manage Events</h1>

      <a
        href="/dashboard/coordinator/create-event"
        className="inline-block mb-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
      >
        + Create New Event
      </a>

      {events.length === 0 ? (
        <p className="text-gray-600">No events created yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="border bg-white p-4 rounded-lg shadow-sm hover:shadow"
            >
              <h2 className="font-medium text-gray-800">{ev.title}</h2>
              <p className="text-sm text-gray-500">{ev.description}</p>
              <p className="text-sm text-gray-500 mt-1">
                Date: {new Date(ev.date).toLocaleDateString()}
              </p>
              <div className="mt-2 space-x-3 text-sm">
                <a
                  href={`/dashboard/coordinator/assignments?event=${ev._id}`}
                  className="text-orange-600 underline"
                >
                  Assign Papers
                </a>
                <a
                  href={`/dashboard/coordinator/stats?event=${ev._id}`}
                  className="text-orange-600 underline"
                >
                  View Stats
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
