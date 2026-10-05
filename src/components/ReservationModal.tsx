'use client';

import React, { useState } from 'react';
import { Product, Reservation } from '@/types';
import { useNearNeed } from '@/context/NearNeedContext';
import { formatCurrency } from '@/lib/formatters';
import { X, Calendar, Clock, MapPin, Store, CheckCircle2, AlertCircle, Phone, ShieldCheck, Loader2 } from 'lucide-react';

interface ReservationModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess?: (reservation: Reservation) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const { currentUser, loginUser } = useNearNeed();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [quantity, setQuantity] = useState(1);
  const [pickupDate, setPickupDate] = useState(defaultDateStr);
  const [pickupTime, setPickupTime] = useState('02:00 PM');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  const totalPrice = product.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      let res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          pickupDate,
          pickupTime,
          notes,
        }),
      });

      // Handle unauthenticated state by logging in default customer session
      if (res.status === 401) {
        const loggedIn = await loginUser('alex.customer@nearneed.com', 'password123');
        if (loggedIn) {
          res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product.id,
              quantity,
              pickupDate,
              pickupTime,
              notes,
            }),
          });
        }
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create reservation.');
      }

      const data = await res.json();
      setConfirmedReservation(data.reservation);
      if (onSuccess) onSuccess(data.reservation);
    } catch (err: any) {
      console.error('Reservation submission error:', err);
      setErrorMsg(err.message || 'Failed to create reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Product Hold & Pickup
            </span>
            <h2 className="text-xl font-extrabold tracking-tight mt-0.5">
              {confirmedReservation ? 'Reservation Confirmed!' : 'Reserve Item for Store Pickup'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedReservation ? (
          /* Confirmation View */
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Reservation #{confirmedReservation.reservationNumber}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                Your Product is Reserved!
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                The store has been notified to set aside your item for pickup.
              </p>
            </div>

            {/* Ticket Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={confirmedReservation.productImage}
                  alt={confirmedReservation.productName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {confirmedReservation.productName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Qty: {confirmedReservation.quantity} × {formatCurrency(confirmedReservation.unitPrice)}
                  </p>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    Total: {formatCurrency(confirmedReservation.totalPrice)}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold">{confirmedReservation.storeName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{confirmedReservation.storeAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pickup Date: {confirmedReservation.pickupDate} at {confirmedReservation.pickupTime}</span>
                </div>
              </div>

              {/* QR Code Pass */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between bg-white p-3 rounded-xl border border-dashed border-slate-300">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pickup Pass</span>
                  <p className="text-xs font-mono font-bold text-slate-900">{confirmedReservation.reservationNumber}</p>
                  <span className="text-[10px] text-emerald-600 font-medium">Present at store counter</span>
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[9px] font-mono text-center p-1 font-bold">
                  QR PASS
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors text-sm shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Product Summary Header */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">{product.storeName}</span>
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(product.price)} each
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {product.stock} available
                  </span>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-slate-900 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Maximum available: {product.stock}
                </span>
              </div>
            </div>

            {/* Pickup Date & Time Slot */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pickup Date</span>
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Time Slot</span>
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="10:00 AM">Morning (10:00 AM)</option>
                  <option value="12:30 PM">Midday (12:30 PM)</option>
                  <option value="02:00 PM">Afternoon (02:00 PM)</option>
                  <option value="05:30 PM">Evening (05:30 PM)</option>
                  <option value="07:00 PM">Late Evening (07:00 PM)</option>
                </select>
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contact Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Special Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please hold size Medium in Black"
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Price Breakdown */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-900 block">Total Due at Store Pickup</span>
                <span className="text-[11px] text-emerald-700">No advance online payment required</span>
              </div>
              <span className="text-xl font-extrabold text-emerald-800">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Reservation</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
