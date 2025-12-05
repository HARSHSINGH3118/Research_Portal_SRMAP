"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiGet("/admin/stats");
        setStats(res);
      } catch (err) {
        console.error("Error loading coordinator stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="p-6 space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800">Coordinator Dashboard</h1>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <div className="text-gray-600 text-sm font-medium mb-1">Total Users</div>
            <div className="text-3xl font-semibold text-[#494623]">
              {stats?.summary?.totalUsers ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-gray-600 text-sm font-medium mb-1">Total Events</div>
            <div className="text-3xl font-semibold text-[#494623]">
              {stats?.summary?.totalEvents ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-gray-600 text-sm font-medium mb-1">Total Papers</div>
            <div className="text-3xl font-semibold text-[#494623]">
              {stats?.summary?.totalPapers ?? 0}
            </div>
          </Card>
          <Card>
            <div className="text-gray-600 text-sm font-medium mb-1">Total Reviews</div>
            <div className="text-3xl font-semibold text-[#494623]">
              {stats?.summary?.totalReviews ?? 0}
            </div>
          </Card>
        </div>

        {/* Recent Events */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Recent Events</h2>
          {stats?.recentEvents?.length ? (
            <div className="overflow-x-auto bg-white rounded-xl border-2 border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-[#494623]/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEvents.map((event: any) => (
                    <tr key={event._id} className="border-t border-gray-200 hover:bg-[#494623]/5 transition-colors">
                      <td className="px-4 py-3 text-gray-800">{event.title}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 bg-white p-4 rounded-xl border-2 border-gray-200">No recent events found.</p>
          )}
        </section>

        {/* Recent Papers */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Recent Papers</h2>
          {stats?.recentPapers?.length ? (
            <div className="overflow-x-auto bg-white rounded-xl border-2 border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-[#494623]/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Track</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Author</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPapers.map((p: any) => (
                    <tr key={p._id} className="border-t border-gray-200 hover:bg-[#494623]/5 transition-colors">
                      <td className="px-4 py-3 text-gray-800">{p.title}</td>
                      <td className="px-4 py-3 text-gray-600">{p.track}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.author?.name ?? p.publisher?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.eventId?.title ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 bg-white p-4 rounded-xl border-2 border-gray-200">No recent papers found.</p>
          )}
        </section>
      </div>
    </ProtectedRoute>
  );
}
