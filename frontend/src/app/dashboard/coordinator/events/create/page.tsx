"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import ProtectedRoute from "@/components/ui/ProtectedRoute";

export default function CreateEvent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!title || !date) return alert("Please fill all required fields");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    if (banner) formData.append("banner", banner);

    setSubmitting(true);
    try {
      const res = await apiPost("/events/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.ok) {
        alert("Event created successfully!");
        router.push("/dashboard/coordinator/events");
      } else {
        alert(res.message || "Failed to create event");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["coordinator"]}>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Create New Event</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Banner (optional)</label>
            <input
              type="file"
              onChange={(e) => setBanner(e.target.files?.[0] || null)}
              className="w-full text-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 rounded-md text-white ${
              submitting ? "bg-gray-600" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
