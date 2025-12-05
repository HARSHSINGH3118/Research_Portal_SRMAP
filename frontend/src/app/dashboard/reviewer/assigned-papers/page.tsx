'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '@/components/ui/Loader';
import { Card } from '@/components/ui/Card';
import { toPublicUrl } from '@/lib/utils';

export default function AssignedPapers() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await apiGet('/review/assigned');
        if (res?.ok) {
          setPapers(res.papers || []);
        } else {
          toast.error('Failed to fetch assigned papers');
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err?.response?.data?.message || 'Failed to fetch assigned papers');
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-gray-800">Assigned Papers</h1>

      {papers.length === 0 ? (
        <Card>
          <p className="text-gray-600">No papers assigned for review yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map((paper) => (
            <Card key={paper._id}>
              <div className="space-y-3">
                <div>
                  <h2 className="font-semibold text-gray-800 text-lg mb-1">{paper.title}</h2>
                  <p className="text-sm text-gray-600">Track: {paper.track}</p>
                  {paper.eventId && (
                    <p className="text-sm text-gray-600">Event: {paper.eventId.title}</p>
                  )}
                  {paper.author && (
                    <p className="text-sm text-gray-600">Author: {paper.author.name}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-sm text-gray-600">Status: </span>
                    <span
                      className={`text-sm font-medium ${
                        paper.reviewed ? 'text-green-600' : 'text-[#494623]'
                      }`}
                    >
                      {paper.reviewed ? 'Reviewed' : 'Pending Review'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {paper.fileUrl && (
                      <a
                        href={toPublicUrl(paper.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#494623] hover:text-[#3a381c] font-medium underline"
                      >
                        View Paper
                      </a>
                    )}
                    <button
                      onClick={() => router.push(`/dashboard/reviewer/review/${paper._id}`)}
                      className="text-sm bg-[#494623] hover:bg-[#3a381c] text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      {paper.reviewed ? 'View Review' : 'Review'}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

