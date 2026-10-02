'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNearNeed } from '@/context/NearNeedContext';
import { MapPin, Mail, Lock, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, switchRole } = useNearNeed();
  const [email, setEmail] = useState('alex.customer@nearneed.com');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const success = await loginUser(email, password);
      if (success) {
        router.push('/');
      } else {
        setErrorMsg('Invalid email address or password. Please try again.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (userEmail: string, role: any) => {
    setEmail(userEmail);
    setPassword('password123');
    setIsLoading(true);
    setErrorMsg('');
    try {
      const success = await loginUser(userEmail, 'password123');
      if (success) {
        switchRole(role);
        if (role === 'STORE_OWNER') {
          router.push('/store-owner/dashboard');
        } else if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setErrorMsg(`Account ${userEmail} not found in database. Please register a new account.`);
      }
    } catch (err) {
      setErrorMsg('Quick login failed. Please try manual login or registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Logo Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <MapPin className="w-5 h-5 fill-white/20 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Near<span className="text-emerald-600">Need</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Sign in to NearNeed</h2>
          <p className="text-xs text-slate-500">Access your product holds, store dashboard, or account settings</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            </button>

          </form>

          {/* Quick Demo Access Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick 1-Click Demo Accounts
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.customer@nearneed.com', 'CUSTOMER')}
                className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 text-xs font-bold text-left flex items-center justify-between transition-colors"
              >
                <span>Log in as Customer (Alex Morgan)</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('marcus.owner@nearneed.com', 'STORE_OWNER')}
                className="w-full p-2.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 text-teal-900 text-xs font-bold text-left flex items-center justify-between transition-colors"
              >
                <span>Log in as Store Owner (Marcus Vance)</span>
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@nearneed.com', 'ADMIN')}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold text-left flex items-center justify-between transition-colors"
              >
                <span>Log in as Platform Admin</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-emerald-700 hover:underline">
              Create account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
