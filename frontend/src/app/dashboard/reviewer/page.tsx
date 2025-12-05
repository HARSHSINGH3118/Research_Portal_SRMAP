'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';

export default function ReviewerHome() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reviewer Dashboard</h1>
      
      <Card>
        <div className="space-y-4">
          <p className="text-gray-700">
            Welcome to the Reviewer Dashboard. Here you can view and review assigned papers.
          </p>
          <button
            onClick={() => router.push('/dashboard/reviewer/assigned-papers')}
            className="bg-[#494623] hover:bg-[#3a381c] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            View Assigned Papers
          </button>
        </div>
      </Card>
    </div>
  );
}
