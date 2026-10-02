'use client';

import React, { useState, useMemo } from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { ProductCard } from '@/components/ProductCard';
import { ReservationModal } from '@/components/ReservationModal';
import { CATEGORIES } from '@/lib/mockData';
import { Product } from '@/types';
import { 
  Search as SearchIcon, 
  MapPin, 
  Filter, 
  RotateCcw, 
  SlidersHorizontal,
  ArrowUpDown,
  PackageX
} from 'lucide-react';

export default function SearchPage() {
  const { products, stores, searchFilters, setSearchFilters, resetSearchFilters, userLocation } = useNearNeed();
  const [selectedProductToReserve, setSelectedProductToReserve] = useState<Product | null>(null);

  // Local filter states tied to global context
  const query = searchFilters.query;
  const category = searchFilters.category;
  const maxDistanceKm = searchFilters.maxDistanceKm;
  const inStockOnly = searchFilters.inStockOnly;
  const sortBy = searchFilters.sortBy;

  // Filter products algorithm
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Query match
      if (query.trim()) {
        const q = query.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(q);
        const descMatch = product.description.toLowerCase().includes(q);
        const categoryMatch = product.category.toLowerCase().includes(q);
        const tagMatch = product.tags.some((t) => t.toLowerCase().includes(q));
        const storeMatch = product.storeName?.toLowerCase().includes(q);

        if (!nameMatch && !descMatch && !categoryMatch && !tagMatch && !storeMatch) {
          return false;
        }
      }

      // 2. Category match
      if (category && category !== 'all' && product.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      // 3. Distance match
      if (product.storeDistanceKm !== undefined && product.storeDistanceKm > maxDistanceKm) {
        return false;
      }

      // 4. In Stock filter
      if (inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
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
  }, [products, query, category, maxDistanceKm, inStockOnly, sortBy]);

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
              Found <strong className="text-slate-900">{filteredProducts.length}</strong> matching products
            </div>

          </div>

        </div>

        {/* Results Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onReserve={(prod) => setSelectedProductToReserve(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <PackageX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No Products Found</h3>
              <p className="text-xs text-slate-500 mt-1">
                We couldn't find any products matching your search criteria around {userLocation.address}.
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
