'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import Link from 'next/link';

type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type AuthorStats = {
  totalPapers: number;
  pendingPapers: number;
  reviewedPapers: number;
};

type ReviewerStats = {
  totalAssigned: number;
  reviewed: number;
  pending: number;
};

type CoordinatorStats = {
  totalUsers: number;
  totalEvents: number;
  totalPapers: number;
  totalReviews: number;
};

export default function DashboardIndex() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorStats, setAuthorStats] = useState<AuthorStats | null>(null);
  const [reviewerStats, setReviewerStats] = useState<ReviewerStats | null>(null);
  const [coordinatorStats, setCoordinatorStats] = useState<CoordinatorStats | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const userData = raw ? JSON.parse(raw) : null;

    if (!token || !userData) {
      router.replace('/login');
      return;
    }

    setUser(userData);
    loadStats(userData);
  }, [router]);

  const loadStats = async (userData: User) => {
    try {
      const roles: string[] = Array.isArray(userData?.roles) ? userData.roles : [];
      const roleSet = new Set(roles.map((r) => r.toLowerCase()));

      const promises: Promise<any>[] = [];

      if (roleSet.has('author')) {
        promises.push(
          apiGet('/paper/my')
            .then((res) => {
              const papers = res?.papers || [];
              const totalPapers = papers.length;
              const pendingPapers = papers.filter(
                (p: any) => p.status === 'submitted' || p.status === 'under_review'
              ).length;
              const reviewedPapers = papers.filter(
                (p: any) => p.status === 'accepted' || p.status === 'rejected'
              ).length;
              setAuthorStats({ totalPapers, pendingPapers, reviewedPapers });
            })
            .catch(() => setAuthorStats(null))
        );
      }

      if (roleSet.has('reviewer')) {
        promises.push(
          apiGet('/review/assigned')
            .then((res) => {
              const papers = res?.papers || [];
              const totalAssigned = papers.length;
              const reviewed = papers.filter((p: any) => p.reviewed).length;
              const pending = totalAssigned - reviewed;
              setReviewerStats({ totalAssigned, reviewed, pending });
            })
            .catch(() => setReviewerStats(null))
        );
      }

      if (roleSet.has('coordinator')) {
        promises.push(
          apiGet('/admin/stats')
            .then((res) => {
              const summary = res?.summary || {};
              setCoordinatorStats({
                totalUsers: summary.totalUsers || 0,
                totalEvents: summary.totalEvents || 0,
                totalPapers: summary.totalPapers || 0,
                totalReviews: summary.totalReviews || 0,
              });
            })
            .catch(() => setCoordinatorStats(null))
        );
      }

      await Promise.all(promises);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-700 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
  const roleSet = new Set(roles.map((r) => r.toLowerCase()));
  const showAuthor = roleSet.has('author');
  const showReviewer = roleSet.has('reviewer');
  const showCoordinator = roleSet.has('coordinator');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 border-b bg-white">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard Home</h1>
        <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {showAuthor && (
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Author Statistics</h2>
              <Link
                href="/dashboard/author"
                className="text-sm text-[#494623] hover:text-[#3a381c] font-medium"
              >
                View Details →
              </Link>
            </div>
            {authorStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Total Papers</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {authorStats.totalPapers}
                  </div>
                </div>
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Pending Review</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {authorStats.pendingPapers}
                  </div>
                </div>
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Reviewed</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {authorStats.reviewedPapers}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Unable to load author statistics</div>
            )}
          </section>
        )}

        {showReviewer && (
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Reviewer Statistics</h2>
              <Link
                href="/dashboard/reviewer"
                className="text-sm text-[#494623] hover:text-[#3a381c] font-medium"
              >
                View Details →
              </Link>
            </div>
            {reviewerStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Assigned Papers</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {reviewerStats.totalAssigned}
                  </div>
                </div>
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Reviewed</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {reviewerStats.reviewed}
                  </div>
                </div>
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {reviewerStats.pending}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Unable to load reviewer statistics</div>
            )}
          </section>
        )}

        {showCoordinator && (
          <section className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Coordinator Statistics</h2>
              <Link
                href="/dashboard/coordinator"
                className="text-sm text-[#494623] hover:text-[#3a381c] font-medium"
              >
                View Details →
              </Link>
            </div>
            {coordinatorStats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Total Users</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {coordinatorStats.totalUsers}
                  </div>
                </div>
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Total Events</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {coordinatorStats.totalEvents}
                  </div>
                </div>
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Total Papers</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {coordinatorStats.totalPapers}
                  </div>
                </div>
                <div className="bg-[#494623]/5 rounded-lg p-4 border border-[#494623]/10">
                  <div className="text-sm text-gray-600">Total Reviews</div>
                  <div className="text-2xl font-bold text-[#494623] mt-1">
                    {coordinatorStats.totalReviews}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Unable to load coordinator statistics</div>
            )}
          </section>
        )}

        {!showAuthor && !showReviewer && !showCoordinator && (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-gray-600">No roles assigned. Please contact an administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
}
