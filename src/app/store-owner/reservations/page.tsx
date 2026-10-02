'use client';

import React, { useState } from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { ReservationStatus } from '@/types';
import { CalendarCheck, Clock, CheckCircle2, XCircle, Phone, MapPin, User } from 'lucide-react';

export default function StoreOwnerReservationsPage() {
  const { stores, reservations, updateReservationStatus, currentUser } = useNearNeed();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const myStores = stores.filter((s) => s.ownerId === currentUser.id);
  const activeStore = myStores[0] || stores[0];

  const storeReservations = reservations.filter((r) => r.storeId === activeStore.id);
  const filtered = storeReservations.filter((r) => filterStatus === 'ALL' || r.status === filterStatus);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {activeStore.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Customer Hold Reservations ({storeReservations.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Process customer pickup requests, verify holds, and manage status transitions.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200 w-fit text-xs font-semibold">
          {['ALL', 'PENDING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                filterStatus === st
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={res.productImage}
                    alt={res.productName}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {res.reservationNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        res.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        res.status === 'READY_FOR_PICKUP' ? 'bg-emerald-600 text-white' :
                        res.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {res.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{res.productName}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{res.userName}</strong> ({res.userPhone})
                    </p>
                    <p className="text-xs text-slate-500">
                      Pickup: <strong>{res.pickupDate}</strong> at <strong>{res.pickupTime}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Payment</span>
                    <p className="text-lg font-extrabold text-emerald-800">${res.totalPrice.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {res.status === 'PENDING' && (
                      <button
                        onClick={() => updateReservationStatus(res.id, 'READY_FOR_PICKUP')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Approve & Mark Ready
                      </button>
                    )}
                    {res.status === 'READY_FOR_PICKUP' && (
                      <button
                        onClick={() => updateReservationStatus(res.id, 'COMPLETED')}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                      >
                        Complete Order
                      </button>
                    )}
                    {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateReservationStatus(res.id, 'CANCELLED')}
                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-xs text-slate-400">
              No reservations matching status: {filterStatus}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
