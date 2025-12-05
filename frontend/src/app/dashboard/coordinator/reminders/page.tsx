"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

export default function CoordinatorReminders() {
  const [loading, setLoading] = useState(true);
  const [reviewers, setReviewers] = useState<any[]>([]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await apiGet("/admin/reviewers/reminders");
        setReviewers(res.reminders || []);
      } catch (err) {
        console.error("Error fetching reminders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  if (loading) return <Loader />;

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Reviewer Reminders</h1>

        {reviewers.length ? (
          <div className="overflow-x-auto bg-white rounded-xl border-2 border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-[#494623]/10">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Reviewer</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Email</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">
                    Reviews Submitted
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviewers.map((r: any, i: number) => (
                  <tr key={i} className="border-t border-gray-200 hover:bg-[#494623]/5 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.totalReviews ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card>
            <p className="text-gray-600">No reviewer data available.</p>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}



