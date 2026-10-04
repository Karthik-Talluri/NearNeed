'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNearNeed } from '@/context/NearNeedContext';
import { ProductCard } from '@/components/ProductCard';
import { ReservationModal } from '@/components/ReservationModal';
import { Product, Store } from '@/types';
import { 
  MapPin, 
  Phone, 
  Star, 
  BadgeCheck, 
  Clock, 
  Search, 
  Heart, 
  ChevronRight,
  Package,
  Navigation,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.id as string;

  const { currentUser, toggleSaveStore, userLocation } = useNearNeed();
  
  // API Fetch State
  const [store, setStore] = useState<Store | null>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [catalogQuery, setCatalogQuery] = useState('');
  const [selectedProductToReserve, setSelectedProductToReserve] = useState<Product | null>(null);

  useEffect(() => {
    if (!storeId) return;

    let isMounted = true;

    async function fetchStoreDetails() {
      setLoading(true);
      setNotFound(false);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (userLocation.lat) queryParams.append('lat', userLocation.lat.toString());
        if (userLocation.lng) queryParams.append('lng', userLocation.lng.toString());

        const res = await fetch(`/api/stores/${encodeURIComponent(storeId)}?${queryParams.toString()}`);
        
        if (res.status === 404) {
          if (isMounted) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch store (${res.status})`);
        }

        const data = await res.json();
        if (isMounted) {
          setStore(data.store);
          setDbProducts(data.products || []);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error loading store details:', err);
          setError(err.message || 'Failed to load store details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStoreDetails();

    return () => {
      isMounted = false;
    };
  }, [storeId, userLocation.lat, userLocation.lng]);

  const isSaved = store ? currentUser.savedStores?.includes(store.id) : false;

  // Filter store products for in-store catalog search
  const filteredStoreProducts = useMemo(() => {
    return dbProducts.filter((p) => {
      if (!catalogQuery.trim()) return true;
      const q = catalogQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [dbProducts, catalogQuery]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center space-y-4 shadow-sm border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Loading Store Details</h3>
            <p className="text-xs text-slate-500 mt-1">Fetching inventory and store information from database...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not Found state
  if (notFound || !store) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-md border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Store Not Found</h2>
          <p className="text-xs text-slate-500">The store you are looking for may have closed or does not exist in our directory.</p>
          <button
            onClick={() => router.push('/stores')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Back to Stores Directory
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-md border border-red-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Error Loading Store</h2>
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={() => router.push('/stores')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Back to Stores Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      
      {/* Banner & Header Hero */}
      <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
        <img
          src={store.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200'}
          alt={store.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Floating Top Navigation */}
        <div className="absolute top-6 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between text-white z-10">
          <Link
            href="/stores"
            className="px-3.5 py-2 rounded-full bg-slate-900/60 backdrop-blur-md hover:bg-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Stores
          </Link>

          <button
            onClick={() => toggleSaveStore(store.id)}
            className="px-3.5 py-2 rounded-full bg-slate-900/60 backdrop-blur-md hover:bg-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            <span>{isSaved ? 'Saved Store' : 'Save Store'}</span>
          </button>
        </div>

        {/* Store Title & Logo Content Overlay */}
        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 flex flex-col sm:flex-row sm:items-end gap-4 text-white z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-2xl border-2 border-white flex-shrink-0">
            <img
              src={store.logoUrl || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=200'}
              alt={store.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {store.category}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-slate-900/70 backdrop-blur-md px-2.5 py-0.5 rounded-md">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{store.rating.toFixed(1)} ({store.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{store.name}</span>
              {store.isVerified && (
                <BadgeCheck className="w-6 h-6 text-emerald-400 fill-emerald-950 flex-shrink-0" />
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{store.address}, {store.city}, {store.zipCode}</span>
              {store.distanceKm !== undefined && (
                <span className="text-emerald-400 font-bold">• {store.distanceKm} km away</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Info Grid (Hours, Phone, Description & Map Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Store About & Info */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About the Store</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {store.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <Clock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Operating Hours</strong>
                  <span className="text-slate-600">{store.hours}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <Phone className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Direct Counter Line</strong>
                  <span className="text-slate-600">{store.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map & Directions Preview Box */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>Store Location</span>
                </h3>
                {store.distanceKm !== undefined && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {store.distanceKm} km
                  </span>
                )}
              </div>
              
              {/* Simulated Map Visual */}
              <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden text-center p-4">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:12px_12px]" />
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg animate-bounce z-10">
                  <MapPin className="w-5 h-5 fill-white/20" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 z-10 mt-1">
                  {store.address}
                </span>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(store.address + ' ' + store.city)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Get Driving Directions</span>
            </a>
          </div>

        </div>

        {/* Store Product Catalog Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                In-Store Inventory
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Products Available at {store.name}
              </h2>
            </div>

            {/* Catalog Search */}
            <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-300 px-3.5 py-2 w-full sm:w-72">
              <Search className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Search inside this store..."
                className="w-full bg-transparent text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {filteredStoreProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredStoreProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onReserve={(prod) => setSelectedProductToReserve(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-md mx-auto space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No Matching Items</h3>
              <p className="text-xs text-slate-500">
                No active products match your catalog search for this store.
              </p>
            </div>
          )}
        </div>

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
