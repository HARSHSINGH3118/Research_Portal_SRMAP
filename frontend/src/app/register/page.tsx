'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiPost } from '@/lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SRMAPLogo from '@/assets/SRMAP-Logo.png';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
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
        contactNumber: contactNumber || undefined,
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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden py-6">
      <ToastContainer />
      
      <div className="absolute inset-0 bg-gradient-to-br from-[#494623]/5 via-white to-[#494623]/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(73,70,35,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(73,70,35,0.08),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(73,70,35,0.02)_25%,rgba(73,70,35,0.02)_50%,transparent_50%,transparent_75%,rgba(73,70,35,0.02)_75%,rgba(73,70,35,0.02)_100%)] bg-[length:20px_20px] opacity-30"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6">
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_20px_60px_-15px_rgba(73,70,35,0.2)]">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <Image
                src={SRMAPLogo}
                alt="SRM University AP Logo"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Create Account
            </h1>
            <p className="text-sm text-gray-600">Register to get started</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#494623]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-[#494623] focus:ring-2 focus:ring-[#494623]/20 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#575221]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-[#494623] focus:ring-2 focus:ring-[#494623]/20 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#494623]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g., 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-[#494623] focus:ring-2 focus:ring-[#494623]/20 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-[#494623]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-[#494623] focus:ring-2 focus:ring-[#494623]/20 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 text-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Role(s) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl p-3">
                {['author', 'reviewer', 'coordinator'].map((r) => (
                  <label 
                    key={r} 
                    className="flex items-center space-x-2 cursor-pointer group hover:bg-white/50 p-2.5 rounded-lg transition-colors duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={roles.includes(r)}
                      onChange={() => handleCheckbox(r)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#494623] focus:ring-2 focus:ring-[#494623]/20 focus:ring-offset-0 cursor-pointer transition-all duration-200"
                      style={{ accentColor: '#494623' }}
                    />
                    <span className="capitalize text-gray-700 font-medium text-sm group-hover:text-[#494623] transition-colors duration-200">
                      {r}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#494623] hover:bg-[#3a381c] text-white py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-[#494623]/30 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="font-semibold text-[#494623] hover:text-[#3a381c] transition-colors duration-200 underline decoration-2 underline-offset-2"
              >
                Login here
              </a>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200/50">
            <p className="text-xs text-center text-gray-500">
              SRM University AP Research Portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
