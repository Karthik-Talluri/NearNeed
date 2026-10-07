'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNearNeed } from '@/context/NearNeedContext';
import { formatCurrency } from '@/lib/formatters';
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
  ShoppingBag,
  User,
  AlertCircle
} from 'lucide-react';

export default function StoreOwnerDashboard() {
  const router = useRouter();
  const { stores, products, reservations, currentUser, isAuthenticated, isAuthLoaded, updateReservationStatus } = useNearNeed();

  useEffect(() => {
    if (isAuthLoaded) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (currentUser.role !== 'STORE_OWNER') {
        if (currentUser.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthLoaded, isAuthenticated, currentUser, router]);

  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Verifying store owner session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || currentUser.role !== 'STORE_OWNER') {
    return null;
  }

  // Active store owned by logged-in user
  const myStores = stores.filter((s) => s.ownerId === currentUser.id);
  const activeStore = myStores[0] || null;

  const storeProducts = activeStore ? products.filter((p) => p.storeId === activeStore.id) : [];
  const storeReservations = activeStore ? reservations.filter((r) => r.storeId === activeStore.id) : [];

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
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                Store Owner Portal
              </span>
              <span className="text-xs text-slate-500">Welcome, {currentUser.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Store Owner Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeStore ? (
              <Link
                href="/store-owner/products/new"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            ) : (
              <Link
                href="/store-owner/register"
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <StoreIcon className="w-4 h-4" />
                <span>Register Your Store</span>
              </Link>
            )}
          </div>
        </div>

        {/* Store Status Banner */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {activeStore ? (
            <>
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-slate-950 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    {activeStore.isVerified ? 'Verified Store' : 'Pending Verification'}
                  </span>
                  <span className="text-xs text-teal-300 font-medium">{activeStore.category}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {activeStore.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{activeStore.address}, {activeStore.city} ({activeStore.zipCode})</span>
                </p>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <Link
                  href={`/store/${activeStore.id}`}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-colors border border-white/20"
                >
                  <span>View Public Store Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-2 relative z-10 py-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-amber-300">No Store Registered Yet</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Complete your Store Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Register your physical retail storefront to start listing products to nearby shoppers in Chennai.
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Link href="/store-owner/products" className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Products Catalog</span>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{storeProducts.length} Items Listed</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Manage product items & catalog</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>

          <Link href="/store-owner/inventory" className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Levels</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{storeProducts.length} Items Tracked</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{lowStockCount > 0 ? `${lowStockCount} items low in stock` : 'Stock levels healthy'}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>

          <Link href="/store-owner/reservations" className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reservations</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{storeReservations.length} Active Holds</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{pendingHolds} pending, {readyHolds} ready for pickup</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders & Sales</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{completedCount} Completed Pickups</h3>
            <p className="text-xs text-slate-400 mt-1">Total revenue value: {formatCurrency(estimatedRevenue)}</p>
          </div>

          <Link href="/store-owner/register" className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Store Profile</span>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{activeStore ? activeStore.name : 'Store Setup'}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{activeStore ? 'Edit store info & operating hours' : 'Register new storefront'}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </Link>

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
