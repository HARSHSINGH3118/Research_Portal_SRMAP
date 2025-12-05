"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

export default function AcceptedPapers() {
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [papers, setPapers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || selectedEvent;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const res = await apiGet("/events");
        setEvents(res?.events || []);
      } catch (err) {
        console.error("Error fetching events", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchAccepted = async () => {
      try {
        const res = await apiGet(`/events/${eventId}/accepted`);
        setPapers(res.papers || []);
      } catch (err) {
        console.error("Error fetching accepted papers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccepted();
  }, [eventId]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
    router.push(`/dashboard/coordinator/accepted?eventId=${eventId}`);
  };

  const handleDownload = async () => {
    if (!eventId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${eventId}/accepted.xlsx`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `accepted-${eventId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed!");
    }
  };

  if (loading) return <Loader />;

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Accepted Papers</h1>
          {eventId && (
            <button
              onClick={handleDownload}
              className="bg-[#494623] hover:bg-[#3a381c] text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              Download Excel
            </button>
          )}
        </div>

        {!eventId && (
          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Select an Event
              </h2>
              {loadingEvents ? (
                <p className="text-gray-600">Loading events...</p>
              ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event: any) => (
                    <button
                      key={event._id}
                      onClick={() => handleEventSelect(event._id)}
                      className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-[#494623] hover:bg-[#494623]/5 transition-all text-left"
                    >
                      <div className="font-semibold text-gray-800">{event.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No events found.</p>
                  <button
                    onClick={() => router.push("/dashboard/coordinator/events/create")}
                    className="bg-[#494623] hover:bg-[#3a381c] text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Create Event
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}

        {eventId && papers.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl border-2 border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-[#494623]/10">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Title</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Track</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Author</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Email</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p: any, i: number) => (
                  <tr key={i} className="border-t border-gray-200 hover:bg-[#494623]/5 transition-colors">
                    <td className="px-4 py-3 text-gray-800">{p.title}</td>
                    <td className="px-4 py-3 text-gray-600">{p.track}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.author?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.author?.email || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : eventId ? (
          <Card>
            <p className="text-gray-600">No accepted papers found.</p>
          </Card>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
