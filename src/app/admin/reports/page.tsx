'use client';

import React from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { formatCurrency } from '@/lib/formatters';
import { CATEGORIES } from '@/lib/mockData';
import { BarChart3, TrendingUp, Users, Store, CalendarCheck, ShieldCheck } from 'lucide-react';

export default function AdminReportsPage() {
  const { stores, products, reservations, users } = useNearNeed();

  const totalReservations = reservations.length;
  const completedReservations = reservations.filter((r) => r.status === 'COMPLETED').length;
  const totalVolume = reservations.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Analytics & Intelligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Platform Performance & Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time insights into local demand, category volume, and store fulfillment rate.
            </p>
          </div>
        </div>

        {/* Analytics KPI Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Gross Hold Value</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalVolume)}</h2>
            <span className="text-xs text-emerald-600 font-bold block mt-1">+18.4% this month</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Fulfillment Rate</span>
            <h2 className="text-3xl font-extrabold text-emerald-600 mt-1">
              {totalReservations > 0 ? Math.round((completedReservations / totalReservations) * 100) : 100}%
            </h2>
            <span className="text-xs text-slate-500 font-medium block mt-1">{completedReservations} pickups completed</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Avg Distance to Pickup</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">1.4 km</h2>
            <span className="text-xs text-slate-500 font-medium block mt-1">Hyper-local shopper radius</span>
          </div>
        </div>

        {/* Category Breakdown Progress Bars */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Category Demand Breakdown</h2>
            <span className="text-xs text-slate-400">Based on local searches & holds</span>
          </div>

          <div className="space-y-4">
            {CATEGORIES.map((cat, idx) => {
              const percentages = [85, 72, 64, 58, 42, 36];
              const pct = percentages[idx % percentages.length];
              return (
                <div key={cat.id} className="space-y-1 text-xs font-medium">
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="font-bold">{cat.name}</span>
                    <span className="font-mono text-slate-500">{pct}% demand share</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
