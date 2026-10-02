'use client';

import React from 'react';
import Link from 'next/link';
import { useNearNeed } from '@/context/NearNeedContext';
import { 
  ShieldAlert, 
  Users, 
  Store as StoreIcon, 
  Package, 
  CalendarCheck, 
  BarChart3, 
  TrendingUp, 
  BadgeCheck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { users, stores, products, reservations } = useNearNeed();

  const customerCount = users.filter((u) => u.role === 'CUSTOMER').length;
  const storeOwnerCount = users.filter((u) => u.role === 'STORE_OWNER').length;
  const verifiedStoresCount = stores.filter((s) => s.isVerified).length;
  const activeProductsCount = products.filter((p) => p.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                System Administrator
              </span>
              <span className="text-xs text-slate-400">Platform Control Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              NearNeed Platform Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Monitor network health, approve store listings, manage users, and review reservation telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/reports"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Full Analytics</span>
            </Link>
          </div>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{users.length}</h3>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                {customerCount} Customers • {storeOwnerCount} Owners
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Stores</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stores.length}</h3>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                {verifiedStoresCount} Verified Partners
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <StoreIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog Items</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{products.length}</h3>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                {activeProductsCount} Live Listings
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Holds</span>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{reservations.length}</h3>
              <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                Total Reservations Logged
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/admin/users" className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-400 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
              User Accounts
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              View customer profiles, store owner accounts, role permissions, and access status.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-4">
              Manage Users →
            </span>
          </Link>

          <Link href="/admin/stores" className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-400 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <StoreIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
              Retail Stores
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify merchant registrations, manage store active status, and audit locations.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-4">
              Manage Stores Directory →
            </span>
          </Link>

          <Link href="/admin/reports" className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-400 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
              Analytics & Reports
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Platform-wide search trends, popular product categories, and local pickup metrics.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-4">
              View Analytics →
            </span>
          </Link>

        </div>

      </div>
    </div>
  );
}
