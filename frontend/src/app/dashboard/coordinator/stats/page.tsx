"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

export default function CoordinatorStats() {
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
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
    const fetchStats = async () => {
      try {
        const res = await apiGet(`/admin/stats/event/${eventId}`);
        setStats(res);
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [eventId]);

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
    router.push(`/dashboard/coordinator/stats?eventId=${eventId}`);
  };

  if (loading) return <Loader />;

  const data = stats?.eventStats;
  const paperData = [
    { name: "Selected", value: data?.papers?.selected || 0 },
    { name: "Rejected", value: data?.papers?.rejected || 0 },
    { name: "Pending", value: data?.papers?.pending || 0 },
  ];

  const trackData = (data?.trackBreakdown || []).map((t: any) => ({
    name: t.track,
    value: t.count,
  }));

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Event Statistics</h1>

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

        {eventId && (
          <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-gray-600 text-sm font-medium mb-1">Total Papers</div>
            <div className="text-3xl font-semibold text-[#494623]">
              {data?.papers?.total ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-gray-600 text-sm font-medium mb-1">Total Reviews</div>
            <div className="text-3xl font-semibold text-[#494623]">
              {data?.reviews?.total ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-gray-600 text-sm font-medium mb-1">Assignments</div>
            <div className="text-3xl font-semibold text-[#494623]">
              {data?.assignments?.total ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-gray-600 text-sm font-medium mb-1">Reviewers Assigned</div>
            <div className="text-3xl font-semibold text-[#494623]">
              {data?.assignments?.reviewersAssigned ?? 0}
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Paper Decision Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paperData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#494623" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Track-wise Paper Distribution
          </h2>
          {trackData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={trackData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {trackData.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">No track data available.</p>
          )}
        </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
