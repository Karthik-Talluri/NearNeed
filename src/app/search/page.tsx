'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { ProductCard } from '@/components/ProductCard';
import { ReservationModal } from '@/components/ReservationModal';
import { CATEGORIES } from '@/lib/mockData';
import { Product } from '@/types';
import { 
  Search as SearchIcon, 
  MapPin, 
  RotateCcw, 
  ArrowUpDown,
  PackageX,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function SearchPage() {
  const { searchFilters, setSearchFilters, resetSearchFilters, userLocation } = useNearNeed();
  const [selectedProductToReserve, setSelectedProductToReserve] = useState<Product | null>(null);

  // API Search State
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Local filter states tied to global context
  const query = searchFilters.query;
  const category = searchFilters.category;
  const maxDistanceKm = searchFilters.maxDistanceKm;
  const inStockOnly = searchFilters.inStockOnly;
  const sortBy = searchFilters.sortBy;

  // Fetch search results from PostgreSQL Prisma API route
  useEffect(() => {
    let isMounted = true;

    async function fetchSearchResults() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.append('q', query.trim());
        if (category && category !== 'all') params.append('category', category);
        if (inStockOnly) params.append('inStock', 'true');
        if (userLocation.lat) params.append('lat', userLocation.lat.toString());
        if (userLocation.lng) params.append('lng', userLocation.lng.toString());
        params.append('maxDistance', maxDistanceKm.toString());

        const res = await fetch(`/api/products/search?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Search request failed (${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          setDbProducts(data.products || []);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to fetch search results from API:', err);
          setError(err.message || 'An error occurred while connecting to the database search service.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSearchResults();

    return () => {
      isMounted = false;
    };
  }, [query, category, inStockOnly, maxDistanceKm, userLocation.lat, userLocation.lng]);

  // Client-side sorting for distance and price
  const filteredProducts = useMemo(() => {
    return [...dbProducts].sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.storeDistanceKm || 0) - (b.storeDistanceKm || 0);
      }
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      return 0;
    });
  }, [dbProducts, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Product Finder
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Search Local Products & Inventory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Showing physical stores around <strong className="text-slate-800">{userLocation.address}</strong>
              </p>
            </div>

            <button
              onClick={resetSearchFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors self-start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>

          {/* Search Inputs Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            
            {/* Query */}
            <div className="sm:col-span-6 relative flex items-center bg-slate-50 rounded-2xl border border-slate-300 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
              <SearchIcon className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setSearchFilters({ ...searchFilters, query: e.target.value })}
                placeholder="Search product name, e.g. formal shirt, headphones, coffee..."
                className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder-slate-400"
              />
            </div>

            {/* Category */}
            <div className="sm:col-span-3 bg-slate-50 rounded-2xl border border-slate-300 px-3 py-2.5">
              <select
                value={category}
                onChange={(e) => setSearchFilters({ ...searchFilters, category: e.target.value })}
                className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="sm:col-span-3 bg-slate-50 rounded-2xl border border-slate-300 px-3 py-2.5 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSearchFilters({ ...searchFilters, sortBy: e.target.value as any })}
                className="w-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="distance">Sort by: Nearest Distance</option>
                <option value="price_asc">Sort by: Price (Low to High)</option>
                <option value="price_desc">Sort by: Price (High to Low)</option>
              </select>
            </div>

          </div>

          {/* Secondary Filter Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            
            {/* Radius Slider */}
            <div className="flex items-center gap-3 bg-slate-100/70 px-3 py-1.5 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700">Max Distance:</span>
              <input
                type="range"
                min={1}
                max={25}
                value={maxDistanceKm}
                onChange={(e) => setSearchFilters({ ...searchFilters, maxDistanceKm: Number(e.target.value) })}
                className="w-24 accent-emerald-600 cursor-pointer"
              />
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {maxDistanceKm} km
              </span>
            </div>

            {/* In Stock Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-100/70 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setSearchFilters({ ...searchFilters, inStockOnly: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="font-semibold text-slate-700">Show In Stock Only</span>
            </label>

            {/* Results Count */}
            <div className="text-slate-500 font-medium">
              {loading ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching database...</span>
                </span>
              ) : (
                <>Found <strong className="text-slate-900">{filteredProducts.length}</strong> matching products</>
              )}
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
              <h3 className="text-base font-bold text-slate-900">Searching Database</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fetching live products from PostgreSQL Prisma inventory...
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
              <h3 className="text-base font-bold text-red-900">Search Error</h3>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={resetSearchFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* RESULTS GRID */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onReserve={(prod) => setSelectedProductToReserve(prod)}
              />
            ))}
          </div>
        )}

        {/* NO PRODUCTS FOUND STATE */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <PackageX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No Products Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                We couldn't find any products matching your search criteria in the PostgreSQL database around {userLocation.address}.
              </p>
            </div>
            <button
              onClick={resetSearchFilters}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

      </div>

      {/* Reservation Modal */}
      {selectedProductToReserve && (
        <ReservationModal
          product={selectedProductToReserve}
          onClose={() => setSelectedProductToReserve(null)}
        />
      )}
    </div>
  );
}
