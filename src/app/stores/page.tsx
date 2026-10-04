'use client';

import React, { useState, useEffect } from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { StoreCard } from '@/components/StoreCard';
import { CATEGORIES } from '@/lib/mockData';
import { Store } from '@/types';
import { 
  Store as StoreIcon, 
  Search, 
  MapPin, 
  BadgeCheck, 
  Loader2, 
  AlertCircle,
  RotateCcw 
} from 'lucide-react';

export default function StoresPage() {
  const { userLocation } = useNearNeed();
  const [storeQuery, setStoreQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxDistance, setMaxDistance] = useState(20);

  // API State
  const [dbStores, setDbStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch nearby stores from API
  useEffect(() => {
    let isMounted = true;

    async function fetchNearbyStores() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (userLocation.lat) params.append('lat', userLocation.lat.toString());
        if (userLocation.lng) params.append('lng', userLocation.lng.toString());
        params.append('radius', maxDistance.toString());
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (storeQuery.trim()) {
          params.append('q', storeQuery.trim());
        }

        const res = await fetch(`/api/stores/nearby?${params.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch nearby stores (${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          setDbStores(data.stores || []);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching nearby stores:', err);
          setError(err.message || 'Unable to connect to nearby stores service.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchNearbyStores();

    return () => {
      isMounted = false;
    };
  }, [userLocation.lat, userLocation.lng, maxDistance, selectedCategory, storeQuery]);

  const resetFilters = () => {
    setStoreQuery('');
    setSelectedCategory('all');
    setMaxDistance(20);
  };

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
              <span>{loading ? '...' : dbStores.length} Stores Available</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-100">
            
            {/* Search Input */}
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

            {/* Category Filter */}
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

            {/* Max Distance */}
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

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Locating Nearby Stores</h3>
              <p className="text-xs text-slate-500 mt-1">
                Calculating distance to local stores from PostgreSQL database...
              </p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="bg-red-50 rounded-3xl p-8 border border-red-200 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">Error Loading Stores</h3>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* STORES GRID */}
        {!loading && !error && dbStores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dbStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}

        {/* NO STORES FOUND */}
        {!loading && !error && dbStores.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-3">
            <StoreIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Stores Found</h3>
            <p className="text-xs text-slate-500">
              No active retail stores were found within {maxDistance} km of your location matching your criteria.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors mt-2"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
