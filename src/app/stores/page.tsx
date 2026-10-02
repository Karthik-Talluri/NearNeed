'use client';

import React, { useState, useMemo } from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { StoreCard } from '@/components/StoreCard';
import { CATEGORIES } from '@/lib/mockData';
import { Store as StoreIcon, Search, MapPin, Filter, BadgeCheck } from 'lucide-react';

export default function StoresPage() {
  const { stores, userLocation } = useNearNeed();
  const [storeQuery, setStoreQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxDistance, setMaxDistance] = useState(15);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      // 1. Text query
      if (storeQuery.trim()) {
        const q = storeQuery.toLowerCase();
        const nameMatch = store.name.toLowerCase().includes(q);
        const descMatch = store.description.toLowerCase().includes(q);
        const addrMatch = store.address.toLowerCase().includes(q);
        if (!nameMatch && !descMatch && !addrMatch) return false;
      }

      // 2. Category
      if (selectedCategory !== 'all' && store.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 3. Distance
      if (store.distanceKm !== undefined && store.distanceKm > maxDistance) {
        return false;
      }

      return true;
    });
  }, [stores, storeQuery, selectedCategory, maxDistance]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Retail Partner Directory
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Nearby Verified Stores
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore local brick-and-mortar retail shops around <strong className="text-slate-800">{userLocation.address}</strong>
              </p>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3.5 py-2 rounded-xl self-start">
              <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              <span>{stores.length} Partner Stores Active</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-100">
            
            <div className="sm:col-span-6 relative flex items-center bg-slate-50 rounded-2xl border border-slate-300 px-3.5 py-2.5">
              <Search className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={storeQuery}
                onChange={(e) => setStoreQuery(e.target.value)}
                placeholder="Search store name, street address..."
                className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="sm:col-span-3 bg-slate-50 rounded-2xl border border-slate-300 px-3 py-2.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 bg-slate-50 rounded-2xl border border-slate-300 px-3 py-2.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Max Distance</span>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="bg-transparent font-semibold text-slate-900 focus:outline-none text-xs cursor-pointer"
                >
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={20}>Within 20 km</option>
                  <option value={50}>Within 50 km</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Stores Grid */}
        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-3">
            <StoreIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Stores Found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search filters or increasing the distance radius.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
