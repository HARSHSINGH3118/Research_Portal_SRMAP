'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { saveAuthTokens } from '@/lib/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // clear any stale auth
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      const res = await apiPost('/auth/login', { email, password });

      if (res?.accessToken && res?.user) {
        saveAuthTokens(res.accessToken, res.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.user));

        toast.success(`Welcome ${res.user.name || 'User'} 👋`);

        // navigate + hard fallback if soft nav fails (middleware loops etc.)
        setTimeout(() => {
          router.replace('/dashboard');
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.location.pathname === '/login') {
              window.location.href = '/dashboard';
            }
          }, 60);
        }, 0);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Research Portal Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don’t have an account?{' '}
          <a href="/register" className="text-orange-600 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
