'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNearNeed } from '@/context/NearNeedContext';
import { formatCurrency } from '@/lib/formatters';
import { Reservation, ReservationStatus } from '@/types';
import { 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Mail, 
  User, 
  Store as StoreIcon, 
  Loader2, 
  AlertCircle,
  PackageCheck,
  ChevronRight,
  FileText
} from 'lucide-react';

export default function StoreOwnerReservationsPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isAuthLoaded, updateReservationStatus } = useNearNeed();
  
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchStoreOwnerReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/store-owner/reservations');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to fetch reservations (${res.status})`);
      }
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (err: any) {
      console.error('Fetch store owner reservations error:', err);
      setError(err.message || 'Unable to load store reservations from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoaded) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (currentUser.role !== 'STORE_OWNER') {
        router.push('/');
      } else {
        fetchStoreOwnerReservations();
      }
    }
  }, [isAuthLoaded, isAuthenticated, currentUser, router]);

  const handleStatusTransition = async (reservationId: string, nextStatus: ReservationStatus) => {
    setActionError(null);
    setUpdatingId(reservationId);

    try {
      const res = await fetch(`/api/store-owner/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to update status to ${nextStatus}`);
      }

      const data = await res.json();
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? data.reservation : r))
      );
      // Also sync context state
      await updateReservationStatus(reservationId, nextStatus).catch(() => {});
    } catch (err: any) {
      console.error('Status transition error:', err);
      setActionError(err.message || 'Error updating reservation status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthLoaded || !isAuthenticated || currentUser.role !== 'STORE_OWNER') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Verifying store owner session...</p>
        </div>
      </div>
    );
  }

  const filteredReservations = reservations.filter(
    (r) => filterStatus === 'ALL' || r.status === filterStatus
  );

  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length;
  const approvedCount = reservations.filter((r) => r.status === 'APPROVED').length;
  const readyCount = reservations.filter((r) => r.status === 'READY_FOR_PICKUP').length;

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Approved / Preparing</span>
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs animate-pulse flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Ready for Pickup</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Completed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Store Operations
              </span>
              {(pendingCount > 0 || readyCount > 0) && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                  {pendingCount} Pending • {readyCount} Ready for Pickup
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Customer Product Holds ({reservations.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review incoming hold passes, update hold statuses, and process in-store customer pickups.
            </p>
          </div>

          <button
            onClick={fetchStoreOwnerReservations}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-center disabled:opacity-50"
          >
            <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Holds</span>
          </button>
        </div>

        {/* Action Error Alert */}
        {actionError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-fit text-xs font-semibold">
          {[
            { id: 'ALL', label: `All (${reservations.length})` },
            { id: 'PENDING', label: `Pending (${pendingCount})` },
            { id: 'APPROVED', label: `Approved (${approvedCount})` },
            { id: 'READY_FOR_PICKUP', label: `Ready for Pickup (${readyCount})` },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                filterStatus === st.id
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Loading Reservations</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fetching live customer hold requests from database...
              </p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="bg-rose-50 rounded-3xl p-8 border border-rose-200 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-900">Error Loading Reservations</h3>
              <p className="text-xs text-rose-600 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchStoreOwnerReservations}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* RESERVATIONS LIST */}
        {!loading && !error && filteredReservations.length > 0 && (
          <div className="space-y-4">
            {filteredReservations.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                      {res.reservationNumber}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Hold placed {new Date(res.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>{getStatusBadge(res.status)}</div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Product & Store info */}
                  <div className="md:col-span-6 flex items-start gap-4">
                    <img
                      src={res.productImage}
                      alt={res.productName}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{res.productName}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Qty Reserved: <strong className="text-slate-900">{res.quantity} unit(s)</strong> × {formatCurrency(res.unitPrice)}
                      </p>
                      <p className="text-sm font-extrabold text-emerald-800 mt-1">
                        Total Amount: {formatCurrency(res.totalPrice)}
                      </p>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                        <StoreIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{res.storeName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Customer & Pickup Details */}
                  <div className="md:col-span-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-900">
                        <User className="w-4 h-4 text-emerald-600" />
                        {res.userName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">Customer Info</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{res.userPhone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{res.userEmail}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-slate-800 font-medium">
                      <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Scheduled Pickup: <strong>{res.pickupDate}</strong> at <strong>{res.pickupTime}</strong></span>
                    </div>

                    {res.notes && (
                      <div className="mt-2 text-[11px] bg-amber-50/80 border border-amber-200/60 text-amber-900 p-2 rounded-xl flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Note:</strong> {res.notes}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Controls & Transition Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    Status: <strong className="text-slate-800">{res.status.replace('_', ' ')}</strong>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    
                    {/* Transitions from PENDING */}
                    {res.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusTransition(res.id, 'APPROVED')}
                          disabled={updatingId === res.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {updatingId === res.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Approve Hold</span>
                        </button>

                        <button
                          onClick={() => handleStatusTransition(res.id, 'CANCELLED')}
                          disabled={updatingId === res.id}
                          className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          Reject Request
                        </button>
                      </>
                    )}

                    {/* Transitions from APPROVED */}
                    {res.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => handleStatusTransition(res.id, 'READY_FOR_PICKUP')}
                          disabled={updatingId === res.id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {updatingId === res.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <PackageCheck className="w-3.5 h-3.5" />
                          )}
                          <span>Mark Ready for Pickup</span>
                        </button>

                        <button
                          onClick={() => handleStatusTransition(res.id, 'CANCELLED')}
                          disabled={updatingId === res.id}
                          className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          Cancel Hold
                        </button>
                      </>
                    )}

                    {/* Transitions from READY_FOR_PICKUP */}
                    {res.status === 'READY_FOR_PICKUP' && (
                      <button
                        onClick={() => handleStatusTransition(res.id, 'COMPLETED')}
                        disabled={updatingId === res.id}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {updatingId === res.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Complete Pickup</span>
                      </button>
                    )}

                    {/* Terminal States */}
                    {(res.status === 'COMPLETED' || res.status === 'CANCELLED') && (
                      <span className="text-slate-400 text-xs font-medium italic">
                        No further status actions available
                      </span>
                    )}

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredReservations.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Reservations Found</h3>
            <p className="text-xs text-slate-500">
              There are no customer product holds matching status: <strong className="text-slate-800">{filterStatus}</strong>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
