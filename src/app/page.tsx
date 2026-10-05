'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNearNeed } from '@/context/NearNeedContext';
import { ProductCard } from '@/components/ProductCard';
import { StoreCard } from '@/components/StoreCard';
import { ReservationModal } from '@/components/ReservationModal';
import { CATEGORIES } from '@/lib/mockData';
import { Product } from '@/types';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Store as StoreIcon, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  ShoppingBag,
  Shirt,
  Smartphone,
  Home,
  Dumbbell,
  PackageCheck
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { products, stores, userLocation, searchFilters, setSearchFilters } = useNearNeed();
  
  const [queryInput, setQueryInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [distanceKm, setDistanceKm] = useState(10);
  const [selectedProductToReserve, setSelectedProductToReserve] = useState<Product | null>(null);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFilters({
      ...searchFilters,
      query: queryInput,
      category: selectedCategory,
      maxDistanceKm: distanceKm,
    });
    router.push('/search');
  };

  const handleQuickChipSearch = (chipText: string) => {
    setSearchFilters({
      ...searchFilters,
      query: chipText,
    });
    router.push('/search');
  };

  // Trending featured products (top 4)
  const featuredProducts = products.filter((p) => p.featured || p.isActive).slice(0, 4);

  // Featured stores (top 3)
  const featuredStores = stores.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Decorative background glow shapes */}
        <div className="absolute -top-24 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 backdrop-blur-md text-emerald-200 border border-emerald-700/60 text-xs font-semibold px-4 py-1.5 rounded-full shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Local Inventory Finder</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Find What You Need <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
              Near You.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Need a product today? Search physical stores in your neighborhood, view real-time availability, and hold items instantly for pickup.
          </p>

          {/* SEARCH BAR CONTAINER CARD */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-3 sm:p-4 shadow-2xl text-slate-900 border border-slate-200/80 mt-8">
            <form onSubmit={handleHeroSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Product Query Input */}
              <div className="md:col-span-5 relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
                <Search className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder='e.g. "I need a black formal shirt"'
                  className="w-full bg-transparent text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Category Select */}
              <div className="md:col-span-3 bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
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

              {/* Location & Radius Slider */}
              <div className="md:col-span-2 flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2.5 text-xs text-slate-700 font-medium">
                <MapPin className="w-4 h-4 text-emerald-600 mr-1.5 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Radius</span>
                  <select
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="bg-transparent font-bold text-slate-900 focus:outline-none text-xs"
                  >
                    <option value={2}>Within 2 km</option>
                    <option value={5}>Within 5 km</option>
                    <option value={10}>Within 10 km</option>
                    <option value={25}>Within 25 km</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
              </div>

            </form>

            {/* Popular Search Quick Chips */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular Searches:</span>
              {[
                'Black Formal Shirt',
                'Wireless Headphones',
                'Running Shoes',
                'USB-C Charger',
                'Filter Coffee',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickChipSearch(chip)}
                  className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition-colors font-medium text-[11px]"
                >
                  {chip}
                </button>
              ))}
            </div>

          </div>

          {/* Trust Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Store Inventory</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Free Instant Hold (No Pre-payment)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Pick Up Today in 30 Mins</span>
            </span>
          </div>

        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Explore Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Popular Product Categories
            </h2>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSearchFilters({ ...searchFilters, category: cat.name });
                router.push('/search');
              }}
              className="group bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all text-left flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full rounded-xl bg-slate-100 overflow-hidden mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {cat.count}+ nearby items
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* TRENDING NEARBY PRODUCTS */}
      <section className="bg-slate-100/60 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                In Stock Right Now
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Popular Products Available Nearby
              </h2>
            </div>
            <Link
              href="/search"
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
            >
              <span>Browse {products.length} Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onReserve={(prod) => setSelectedProductToReserve(prod)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* NEARBY STORES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Local Partners
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Verified Nearby Stores
            </h2>
          </div>
          <Link
            href="/stores"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All Nearby Stores ({stores.length})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* HOW NEARNEED WORKS */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-800">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              How NearNeed Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Say goodbye to shipping delays and out-of-stock disappointments. Get what you need today in four easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 flex flex-col space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xl border border-emerald-500/30">
                1
              </div>
              <h3 className="font-bold text-lg text-white">Search Your Product</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Type what you need e.g. "black formal shirt" or "GaN charger". NearNeed scans verified nearby store catalogs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 flex flex-col space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xl border border-emerald-500/30">
                2
              </div>
              <h3 className="font-bold text-lg text-white">Check Real-Time Stock</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare price, distance (e.g. 0.8 km), and exact stock quantity at physical retail counters near your location.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 flex flex-col space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xl border border-emerald-500/30">
                3
              </div>
              <h3 className="font-bold text-lg text-white">Hold Item Instantly</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reserve the item with a single tap. The store clerk immediately holds it under your pickup reservation pass.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/60 flex flex-col space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xl border border-emerald-500/30">
                4
              </div>
              <h3 className="font-bold text-lg text-white">Pick Up & Pay at Store</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visit the store at your chosen time slot, inspect the item in person, pay at the counter and take it home!
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* STORE OWNER CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 max-w-2xl relative z-10 text-center md:text-left">
            <span className="bg-emerald-900/80 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-700">
              For Local Merchants
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Own a Physical Store? Showcase Your Inventory to Nearby Buyers.
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base">
              List your products on NearNeed and capture high-intent customers who are looking to buy items in your neighborhood today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
            <Link
              href="/store-owner/register"
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-extrabold text-sm hover:bg-emerald-50 transition-colors text-center shadow-lg hover:scale-105 transition-transform"
            >
              Register Your Store
            </Link>
            <Link
              href="/store-owner/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-sm transition-colors text-center border border-emerald-600/60"
            >
              Owner Portal Demo
            </Link>
          </div>

        </div>
      </section>

      {/* Reservation Modal Popup */}
      {selectedProductToReserve && (
        <ReservationModal
          product={selectedProductToReserve}
          onClose={() => setSelectedProductToReserve(null)}
        />
      )}

    </div>
  );
}
