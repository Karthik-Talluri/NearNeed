'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNearNeed } from '@/context/NearNeedContext';
import { formatCurrency } from '@/lib/formatters';
import { ReservationStatus } from '@/types';
import { 
  Store as StoreIcon, 
  Package, 
  Boxes, 
  CalendarCheck, 
  IndianRupee, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight, 
  MapPin,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function StoreOwnerDashboard() {
  const { stores, products, reservations, currentUser, updateReservationStatus } = useNearNeed();

  // Active store owned by Marcus Vance or default store
  const myStores = stores.filter((s) => s.ownerId === currentUser.id);
  const activeStore = myStores[0] || stores[0];

  const storeProducts = products.filter((p) => p.storeId === activeStore.id);
  const storeReservations = reservations.filter((r) => r.storeId === activeStore.id);

  const pendingHolds = storeReservations.filter((r) => r.status === 'PENDING').length;
  const readyHolds = storeReservations.filter((r) => r.status === 'READY_FOR_PICKUP').length;
  const completedCount = storeReservations.filter((r) => r.status === 'COMPLETED').length;
  
  const estimatedRevenue = storeReservations
    .filter((r) => r.status === 'COMPLETED' || r.status === 'READY_FOR_PICKUP')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const lowStockCount = storeProducts.filter((p) => p.stock > 0 && p.stock <= 3).length;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Store Active Banner Header */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                Store Owner Portal
              </span>
              <span className="text-xs text-teal-300 font-medium">{activeStore.category}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {activeStore.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{activeStore.address}, {activeStore.city}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <Link
              href="/store-owner/products/new"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>

            <Link
              href={`/store/${activeStore.id}`}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-colors border border-white/20"
            >
              <span>View Public Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Products</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{storeProducts.length}</h3>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                {lowStockCount > 0 ? `${lowStockCount} products low in stock` : 'Stock healthy'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Holds</span>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{pendingHolds}</h3>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">Awaiting store action</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready For Pickup</span>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{readyHolds}</h3>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Customers notified</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Hold Value</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{formatCurrency(estimatedRevenue)}</h3>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">{completedCount} completed pickups</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Incoming Customer Reservations Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Store Operations
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Incoming Product Reservations
              </h2>
            </div>

            <Link
              href="/store-owner/reservations"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All Reservations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {storeReservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Pass #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Product Reserved</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Pickup Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {storeReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {res.reservationNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{res.userName}</div>
                        <div className="text-[11px] text-slate-400">{res.userPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={res.productImage}
                            alt={res.productName}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900 line-clamp-1">{res.productName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold">{res.quantity}</td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-800">{formatCurrency(res.totalPrice)}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {res.pickupDate} ({res.pickupTime})
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          res.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          res.status === 'READY_FOR_PICKUP' ? 'bg-emerald-600 text-white' :
                          res.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {res.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {res.status === 'PENDING' && (
                            <button
                              onClick={() => updateReservationStatus(res.id, 'READY_FOR_PICKUP')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs"
                            >
                              Hold & Ready
                            </button>
                          )}
                          {res.status === 'READY_FOR_PICKUP' && (
                            <button
                              onClick={() => updateReservationStatus(res.id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg"
                            >
                              Complete Pickup
                            </button>
                          )}
                          {res.status !== 'COMPLETED' && res.status !== 'CANCELLED' && (
                            <button
                              onClick={() => updateReservationStatus(res.id, 'CANCELLED')}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Cancel Hold"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No active reservations for this store currently.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
