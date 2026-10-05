'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNearNeed } from '@/context/NearNeedContext';
import { CATEGORIES } from '@/lib/mockData';
import { Store as StoreIcon, MapPin, Phone, Clock, FileText, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export default function StoreRegistrationPage() {
  const router = useRouter();
  const { addStore, currentUser, switchRole } = useNearNeed();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Chennai, Tamil Nadu');
  const [zipCode, setZipCode] = useState('600017');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('Mon-Sat: 10:00 AM - 8:00 PM');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=200');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Switch active role to STORE_OWNER
    switchRole('STORE_OWNER');

    const newStore = addStore({
      ownerId: currentUser.id,
      name,
      description,
      address,
      city,
      zipCode,
      lat: 13.0418,
      lng: 80.2341,
      phone,
      category,
      logoUrl,
      bannerUrl,
      hours,
    });

    router.push('/store-owner/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Merchant Onboarding
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Register Your Physical Retail Store
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Connect your local retail inventory with thousands of nearby shoppers looking to buy products today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Store Business Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chennai Fashion Hub"
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Store Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Store Counter Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
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
                placeholder="e.g. No. 45, Usman Road, T Nagar"
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  City & State
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Mon-Sat: 10:00 AM - 8:00 PM"
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
                placeholder="Describe your retail boutique, products offered, specialization..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-extrabold text-white bg-teal-700 hover:bg-teal-800 shadow-md text-sm transition-colors"
              >
                Complete Store Registration →
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
