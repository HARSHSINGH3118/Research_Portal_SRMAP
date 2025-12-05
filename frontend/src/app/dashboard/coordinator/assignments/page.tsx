"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import Loader from "@/components/ui/Loader";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

export default function CoordinatorAssignments() {
  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [selectedPaper, setSelectedPaper] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    const fetchData = async () => {
      try {
        const [assignRes, reviewerRes, paperRes] = await Promise.all([
          apiGet(`/events/${eventId}/assignments`),
          apiGet(`/events/reviewers/all`),
          apiGet(`/events/${eventId}/submissions`),
        ]);
        setAssignments(assignRes.assignments || []);
        setReviewers(reviewerRes.reviewers || []);
        setPapers(paperRes.papers || []);
      } catch (err) {
        console.error("Error fetching assignment data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleAssign = async () => {
    if (!selectedReviewer || !selectedPaper)
      return alert("Please select both a reviewer and a paper.");

    setSubmitting(true);
    try {
      const res = await apiPost(`/events/${eventId}/assign`, {
        reviewerId: selectedReviewer,
        paperIds: [selectedPaper],
      });
      if (res.ok) {
        alert("✅ Paper assigned successfully!");
        const refresh = await apiGet(`/events/${eventId}/assignments`);
        setAssignments(refresh.assignments || []);
      } else alert("❌ Assignment failed.");
    } catch (err) {
      console.error("Error assigning paper", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
    router.push(`/dashboard/coordinator/assignments?eventId=${eventId}`);
  };

  if (loading) return <Loader />;

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Assignments</h1>

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

        <Card>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Reviewer Select */}
            <div className="flex-1">
              <label className="block text-sm text-gray-700 font-medium mb-2">
                Select Reviewer
              </label>
              <select
                value={selectedReviewer}
                onChange={(e) => setSelectedReviewer(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-white text-gray-800 border-2 border-gray-200 focus:border-[#494623] focus:ring-2 focus:ring-[#494623]/20 outline-none transition-all"
              >
                <option value="">Choose Reviewer</option>
                {reviewers.map((r: any) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Paper Select */}
            <div className="flex-1">
              <label className="block text-sm text-gray-700 font-medium mb-2">
                Select Paper
              </label>
              <select
                value={selectedPaper}
                onChange={(e) => setSelectedPaper(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-white text-gray-800 border-2 border-gray-200 focus:border-[#494623] focus:ring-2 focus:ring-[#494623]/20 outline-none transition-all"
              >
                <option value="">Choose Paper</option>
                {papers.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.title} — {p.track}
                  </option>
                ))}
              </select>
            </div>

            <button
              disabled={submitting}
              onClick={handleAssign}
              className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${
                submitting 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-[#494623] hover:bg-[#3a381c] shadow-md hover:shadow-lg"
              }`}
            >
              {submitting ? "Assigning..." : "Assign Paper"}
            </button>
          </div>
        </Card>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Current Assignments
          </h2>
          {assignments.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-xl border-2 border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-[#494623]/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Paper Title</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Track</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Reviewer</th>
                    <th className="px-4 py-3 text-left text-gray-700 font-semibold">Assigned On</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a: any) => (
                    <tr key={a._id} className="border-t border-gray-200 hover:bg-[#494623]/5 transition-colors">
                      <td className="px-4 py-3 text-gray-800">{a.paperId?.title}</td>
                      <td className="px-4 py-3 text-gray-600">{a.paperId?.track}</td>
                      <td className="px-4 py-3 text-gray-600">{a.reviewerId?.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(a.assignedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 bg-white p-4 rounded-xl border-2 border-gray-200">No assignments found for this event.</p>
          )}
        </section>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
