'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNearNeed } from '@/context/NearNeedContext';
import { ReservationStatus } from '@/types';
import { 
  CalendarCheck, 
  MapPin, 
  Store, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Phone, 
  QrCode,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function CustomerReservationsPage() {
  const { reservations, currentUser, cancelReservation } = useNearNeed();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ACTIVE');

  // Filter reservations for current user
  const customerReservations = reservations.filter((r) => r.userId === currentUser.id);

  const filteredReservations = customerReservations.filter((r) => {
    if (activeTab === 'ACTIVE') {
      return r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'READY_FOR_PICKUP';
    }
    if (activeTab === 'COMPLETED') {
      return r.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return r.status === 'CANCELLED';
    }
    return true;
  });

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">Pending Confirmation</span>;
      case 'APPROVED':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">Store Approved</span>;
      case 'READY_FOR_PICKUP':
        return <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs animate-pulse">Ready for Pickup</span>;
      case 'COMPLETED':
        return <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">Completed</span>;
      case 'CANCELLED':
        return <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              My Hold Orders
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Store Pickup Reservations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your active product holds and view past store pickups.
            </p>
          </div>

          <Link
            href="/search"
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors self-start shadow-xs"
          >
            <span>Reserve Another Item</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200 w-fit text-xs font-semibold">
          {[
            { id: 'ACTIVE', label: 'Active Holds' },
            { id: 'ALL', label: 'All History' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reservations List */}
        {filteredReservations.length > 0 ? (
          <div className="space-y-4">
            {filteredReservations.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">RESERVATION PASS</span>
                    <h3 className="font-mono font-bold text-slate-900 text-lg">
                      {res.reservationNumber}
                    </h3>
                  </div>
                  <div>{getStatusBadge(res.status)}</div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Product Thumbnail & Details */}
                  <div className="md:col-span-6 flex items-center gap-4">
                    <img
                      src={res.productImage}
                      alt={res.productName}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <Link href={`/product/${res.productId}`}>
                        <h4 className="font-bold text-slate-900 text-base hover:text-emerald-700 transition-colors line-clamp-1">
                          {res.productName}
                        </h4>
                      </Link>
                      <p className="text-xs text-slate-500 font-medium">
                        Qty: <strong className="text-slate-900">{res.quantity}</strong> × ${res.unitPrice.toFixed(2)}
                      </p>
                      <p className="text-sm font-extrabold text-emerald-800">
                        Total: ${res.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Store & Pickup Info */}
                  <div className="md:col-span-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <strong className="text-slate-900 font-bold">{res.storeName}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{res.storeAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                      <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Scheduled Pickup: <strong>{res.pickupDate}</strong> at <strong>{res.pickupTime}</strong></span>
                    </div>
                  </div>

                </div>

                {/* Footer Controls & Pass */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Show pass at counter for verification</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this reservation?')) {
                            cancelReservation(res.id);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                      >
                        Cancel Hold
                      </button>
                    )}

                    <Link
                      href={`/store/${res.storeId}`}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors"
                    >
                      Store Details
                    </Link>
                  </div>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto space-y-4">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Reservations Found</h3>
            <p className="text-xs text-slate-500">
              You don't have any reservations in this tab. Find physical products in nearby stores and hold them for pickup.
            </p>
            <Link
              href="/search"
              className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Search Nearby Products
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
