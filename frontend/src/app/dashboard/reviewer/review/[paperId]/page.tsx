'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '@/components/ui/Loader';
import { Card } from '@/components/ui/Card';

export default function ReviewPaper() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.paperId as string;
  
  const [paper, setPaper] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState('');
  const [insights, setInsights] = useState<string[]>(['']);
  const [newInsight, setNewInsight] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [paperRes, reviewRes] = await Promise.all([
          apiGet(`/paper/${paperId}`).catch(() => null),
          apiGet(`/review/${paperId}`).catch(() => null),
        ]);

        if (paperRes?.paper) {
          setPaper(paperRes.paper);
        } else {
          toast.error('Paper not found');
          router.push('/dashboard/reviewer/assigned-papers');
          return;
        }

        if (reviewRes?.reviews) {
          const userData = typeof window !== 'undefined' 
            ? JSON.parse(localStorage.getItem('user') || '{}')
            : null;
          const userId = userData?.id || userData?._id;
          
          const myReview = reviewRes.reviews.find((r: any) => {
            const reviewerId = r.reviewer?._id || r.reviewer?.id || r.reviewer;
            return reviewerId?.toString() === userId?.toString();
          });
          if (myReview) {
            setExistingReview(myReview);
            setComments(myReview.comments || '');
            setInsights(myReview.insights?.length > 0 ? myReview.insights : ['']);
          }
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load paper details');
      } finally {
        setLoading(false);
      }
    };

    if (paperId) {
      fetchData();
    }
  }, [paperId, router]);

  const handleAddInsight = () => {
    if (newInsight.trim()) {
      setInsights([...insights, newInsight.trim()]);
      setNewInsight('');
    }
  };

  const handleRemoveInsight = (index: number) => {
    setInsights(insights.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comments.trim()) {
      toast.error('Please provide review comments');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiPost(`/review/${paperId}`, {
        comments: comments.trim(),
        insights: insights.filter(i => i.trim()),
      });

      if (res?.ok) {
        toast.success('Review submitted successfully!');
        setTimeout(() => {
          router.push('/dashboard/reviewer/assigned-papers');
        }, 1500);
      } else {
        toast.error(res?.message || 'Failed to submit review');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!paper) return null;

  return (
    <div className="p-6 space-y-6">
      <ToastContainer />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Review Paper</h1>
        <button
          onClick={() => router.push('/dashboard/reviewer/assigned-papers')}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          ← Back to Assigned Papers
        </button>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{paper.title}</h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Track:</span> {paper.track}</p>
              {paper.author && (
                <p><span className="font-medium">Author:</span> {paper.author.name} ({paper.author.email})</p>
              )}
              {paper.eventId && (
                <p><span className="font-medium">Event:</span> {paper.eventId.title}</p>
              )}
              <p><span className="font-medium">Status:</span> {paper.status}</p>
            </div>
          </div>
          
          {paper.fileUrl && (
            <div>
              <a
                href={paper.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#494623] hover:bg-[#3a381c] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View Paper PDF
              </a>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Review Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-[#494623] focus:ring-2 focus:ring-[#494623]/20 outline-none transition-all text-gray-800 resize-none"
              placeholder="Enter your detailed review comments..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Key Insights
            </label>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={insight}
                    onChange={(e) => {
                      const newInsights = [...insights];
                      newInsights[index] = e.target.value;
                      setInsights(newInsights);
                    }}
                    className="flex-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-[#494623] focus:ring-2 focus:ring-[#494623]/20 outline-none transition-all text-gray-800"
                    placeholder={`Insight ${index + 1}`}
                  />
                  {insights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveInsight(index)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddInsight}
                className="text-sm text-[#494623] hover:text-[#3a381c] font-medium"
              >
                + Add Insight
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#494623] hover:bg-[#3a381c] text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/reviewer/assigned-papers')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>

      {existingReview && (
        <Card>
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Previous Review Submitted:</p>
            <p>{new Date(existingReview.createdAt).toLocaleString()}</p>
          </div>
        </Card>
      )}
    </div>
  );
}

