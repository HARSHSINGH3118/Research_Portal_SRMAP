'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Event {
  _id: string;
  title: string;
  date: string;
  description?: string;
}

export default function SubmitPaper() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Load events when page opens
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await apiGet('/events');
        if (res?.ok) setEvents(res.events || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };
    loadEvents();
  }, []);

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return toast.error('Please upload your paper file!');
    if (!selectedEvent) return toast.error('Please select an event!');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('track', track);
      formData.append('eventId', selectedEvent); // ✅ connect to event
      formData.append('file', file);

      const res = await apiPost('/paper/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.ok) {
        toast.success('Paper submitted successfully!');
        setTitle('');
        setTrack('');
        setFile(null);
        setSelectedEvent('');
      } else {
        toast.error(res.message || 'Submission failed.');
      }
    } catch (err: any) {
      console.error('Error submitting paper:', err);
      toast.error(err?.response?.data?.message || 'Server error during upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Submit Research Paper
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paper Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Paper Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#494623]/20 focus:border-[#494623] outline-none"
              required
            />
          </div>

          {/* Select Event */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#494623]/20 focus:border-[#494623] outline-none"
              required
            >
              <option value="">-- Select Event --</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title} ({new Date(e.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Manual Track Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Research Track</label>
            <input
              type="text"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              placeholder="e.g., AI/ML, IoT, Quantum Computing"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#494623]/20 focus:border-[#494623] outline-none"
              required
            />
          </div>

          {/* Upload PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Paper (PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#494623] hover:bg-[#3a381c] text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Paper'}
          </button>
        </form>
      </div>
    </div>
  );
}
