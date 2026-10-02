'use client';

import React from 'react';
import Link from 'next/link';
import { useNearNeed } from '@/context/NearNeedContext';
import { Store as StoreIcon, BadgeCheck, MapPin, Phone, Star } from 'lucide-react';

export default function AdminStoresPage() {
  const { stores, updateStore } = useNearNeed();

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Governance & Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Retail Stores Management ({stores.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify store credentials, toggle active status, and audit merchant listings.
            </p>
          </div>
        </div>

        {/* Stores Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.logoUrl}
                          alt={s.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <Link href={`/store/${s.id}`}>
                            <h4 className="font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1">
                              <span>{s.name}</span>
                              {s.isVerified && <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
                            </h4>
                          </Link>
                          <span className="text-[11px] text-slate-400">{s.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{s.address}, {s.city}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-500">{s.rating.toFixed(1)} ★</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => updateStore(s.id, { isVerified: !s.isVerified })}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.isVerified ? 'Verified' : 'Pending Review'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => updateStore(s.id, { isActive: !s.isActive })}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.isActive ? 'bg-slate-900 text-white' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
