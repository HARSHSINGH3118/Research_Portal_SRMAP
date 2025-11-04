'use client';

export default function ReviewerHome() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Reviewer Dashboard</h1>
      <a
        href="/dashboard/reviewer/assigned-papers"
        className="inline-block bg-orange-500 text-white px-4 py-2 rounded-lg"
      >
        View Assigned Papers
      </a>
    </main>
  );
}
