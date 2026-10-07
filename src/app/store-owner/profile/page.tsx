'use client';

import React, { useState } from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { Store as StoreIcon, MapPin, Phone, Clock, BadgeCheck, Settings, Save } from 'lucide-react';

export default function StoreOwnerProfilePage() {
  const { stores, updateStore, currentUser } = useNearNeed();
  const myStores = stores.filter((s) => s.ownerId === currentUser.id);
  const activeStore = myStores[0] || null;

  const [name, setName] = useState(activeStore?.name || '');
  const [description, setDescription] = useState(activeStore?.description || '');
  const [address, setAddress] = useState(activeStore?.address || '');
  const [phone, setPhone] = useState(activeStore?.phone || '');
  const [hours, setHours] = useState(activeStore?.hours || '');

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStore) {
      updateStore(activeStore.id, {
        name,
        description,
        address,
        phone,
        hours,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Store Settings
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Manage Store Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Update store contact information, operating hours, and location address.
            </p>
          </div>
        </div>

        {savedMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
            Store profile settings updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Store Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Store Phone Line
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Physical Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Store Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Store Profile</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
