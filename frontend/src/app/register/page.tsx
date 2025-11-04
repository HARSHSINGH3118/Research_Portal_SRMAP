'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState(''); // ✅ new optional field
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCheckbox = (role: string) => {
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (roles.length === 0) {
      toast.error('Please select at least one role');
      setLoading(false);
      return;
    }

    try {
      const res = await apiPost('/auth/register', {
        name,
        email,
        password,
        roles,
        contactNumber: contactNumber || undefined, // ✅ include only if filled
      });

      if (res?.ok) {
        toast.success('Registration successful!');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        toast.error(res?.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Register New User
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              required
            />
          </div>

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

          {/* ✅ Optional contact number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number (optional)
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g., 9876543210"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Role(s)
            </label>
            <div className="space-y-1">
              {['author', 'reviewer', 'coordinator'].map((r) => (
                <label key={r} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={roles.includes(r)}
                    onChange={() => handleCheckbox(r)}
                    className="accent-orange-500"
                  />
                  <span className="capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-orange-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
