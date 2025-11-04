'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CoordinatorEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [banner, setBanner] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Load all events on page load
  const fetchEvents = async () => {
    try {
      const res = await apiGet('/events');
      if (res?.ok) {
        setEvents(res.events);
      } else {
        toast.error('Failed to load events');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error loading events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      toast.error('Title and Date are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', date);
    if (banner) formData.append('banner', banner);

    setLoading(true);
    try {
      const res = await apiPost('/events/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.ok) {
        toast.success('Event created successfully!');
        setTitle('');
        setDescription('');
        setDate('');
        setBanner(null);
        await fetchEvents();
      } else {
        toast.error(res?.message || 'Failed to create event');
      }
    } catch (err: any) {
      console.error('Create event error:', err);
      toast.error(err?.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <ToastContainer />
      <div className="max-w-5xl mx-auto space-y-10">
        <section className="bg-white p-6 rounded-2xl shadow-md">
          <h1 className="text-2xl font-semibold mb-6">Create New Event</h1>
          <form onSubmit={handleCreateEvent} className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="e.g. SRM AP Research Day"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                placeholder="Short description of the event"
              ></textarea>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banner Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBanner(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-700"
                />
                {banner && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {banner.name}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">All Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">No events created yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="bg-white p-4 rounded-xl shadow-sm border hover:shadow transition"
                >
                  <h3 className="text-lg font-medium">{ev.title}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(ev.date).toLocaleDateString()}
                  </p>
                  {ev.bannerUrl && (
                    <img
                      src={`http://localhost:8080/${ev.bannerUrl}`}
                      alt={ev.title}
                      className="mt-2 rounded-lg w-full h-32 object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
