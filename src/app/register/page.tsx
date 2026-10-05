'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNearNeed } from '@/context/NearNeedContext';
import { UserRole } from '@/types';
import { MapPin, UserCheck, Store, Mail, Lock, User, Phone } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser } = useNearNeed();

  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Chennai, Tamil Nadu');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const success = await registerUser({
        name,
        email,
        password,
        role,
        phone,
        address,
        city: 'Chennai, Tamil Nadu',
      });

      if (success) {
        if (role === 'STORE_OWNER') {
          router.push('/store-owner/register');
        } else {
          router.push('/');
        }
      } else {
        setErrorMsg('Registration failed. An account with this email may already exist.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <MapPin className="w-5 h-5 fill-white/20 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Near<span className="text-emerald-600">Need</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Create your NearNeed Account</h2>
          <p className="text-xs text-slate-500">Join as a shopper or list your retail store</p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
          
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                role === 'CUSTOMER'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('STORE_OWNER')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                role === 'STORE_OWNER'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Store Owner</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              {isLoading
                ? 'Creating Account...'
                : role === 'STORE_OWNER'
                ? 'Continue to Store Setup →'
                : 'Register Account'}
            </button>

          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-emerald-700 hover:underline">
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
