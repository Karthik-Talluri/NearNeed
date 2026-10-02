'use client';

import React from 'react';
import Link from 'next/link';
import { Store } from '@/types';
import { useNearNeed } from '@/context/NearNeedContext';
import { MapPin, Star, Phone, BadgeCheck, Clock, ArrowRight, Heart } from 'lucide-react';

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { currentUser, toggleSaveStore, products } = useNearNeed();
  const isSaved = currentUser.savedStores?.includes(store.id);

  // Count active products for this store
  const storeProductsCount = products.filter(
    (p) => p.storeId === store.id && p.isActive
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden flex flex-col group">
      
      {/* Banner & Logo Header */}
      <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
        <img
          src={store.bannerUrl}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />

        {/* Distance Badge */}
        {store.distanceKm !== undefined && (
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{store.distanceKm} km away</span>
          </div>
        )}

        {/* Bookmark Button */}
        <button
          onClick={() => toggleSaveStore(store.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-500 transition-colors shadow-xs"
          title={isSaved ? 'Remove from Saved' : 'Save Store'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Store Logo Avatar */}
        <div className="absolute -bottom-4 left-4 w-12 h-12 rounded-xl bg-white border-2 border-white shadow-md overflow-hidden">
          <img
            src={store.logoUrl}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Store Information Body */}
      <div className="p-4 pt-6 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              {store.category}
            </span>

            {/* Rating */}
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{store.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({store.reviewCount})</span>
            </div>
          </div>

          {/* Store Name */}
          <Link href={`/store/${store.id}`}>
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors flex items-center gap-1.5 mt-0.5">
              <span>{store.name}</span>
              {store.isVerified && (
                <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 flex-shrink-0" />
              )}
            </h3>
          </Link>

          {/* Address */}
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{store.address}, {store.city}</span>
          </p>

          {/* Hours */}
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-normal">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{store.hours}</span>
          </p>
        </div>

        {/* Action & Stats Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
            {storeProductsCount} Products in Stock
          </span>

          <Link
            href={`/store/${store.id}`}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 transition-colors shadow-xs"
          >
            <span>Visit Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};
