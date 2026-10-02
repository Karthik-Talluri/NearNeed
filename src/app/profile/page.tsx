'use client';

import React, { useState } from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { StoreCard } from '@/components/StoreCard';
import { User, MapPin, Mail, Phone, Heart, Settings, ShieldCheck, LogOut } from 'lucide-react';

export default function CustomerProfilePage() {
  const { currentUser, stores, logoutUser, userLocation, setUserLocation } = useNearNeed();
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');

  const savedStores = stores.filter((s) => currentUser.savedStores?.includes(s.id));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.address = address;
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 text-center sm:text-left">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-extrabold text-slate-900">{currentUser.name}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 justify-center sm:justify-start">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Primary Location: {userLocation.address}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>

        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Update Account Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Default Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Saved Stores Wishlist */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Saved Favorite Stores ({savedStores.length})</span>
          </h2>

          {savedStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedStores.map((s) => (
                <StoreCard key={s.id} store={s} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
              No saved stores yet. Click the heart icon on any store card to add it to your favorites.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
