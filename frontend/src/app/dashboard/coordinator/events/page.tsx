"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

export default function CoordinatorEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiGet("/events");
        setEvents(res?.events || res); // depending on backend return structure
      } catch (err) {
        console.error("Error fetching events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <Loader />;

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">All Events</h1>
          <button
            onClick={() => router.push("/dashboard/coordinator/events/create")}
            className="bg-[#494623] hover:bg-[#3a381c] text-white px-4 py-2 rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
          >
            + Create Event
          </button>
        </div>

        {/* Events List */}
        {events.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl border-2 border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-[#494623]/10">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Title</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Description</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => (
                  <tr key={event._id} className="border-t border-gray-200 hover:bg-[#494623]/5 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">{event.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(event.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                      {event.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/coordinator/stats?eventId=${event._id}`)
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                        >
                          Stats
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/dashboard/coordinator/assignments?eventId=${event._id}`)
                          }
                          className="bg-[#494623] hover:bg-[#3a381c] text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                        >
                          Assignments
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/dashboard/coordinator/accepted?eventId=${event._id}`)
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                        >
                          Accepted
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card>
            <p className="text-gray-600">No events found. Create one to begin.</p>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
