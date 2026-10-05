'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { MapPin, Store, CheckCircle, AlertTriangle, ArrowRight, Bookmark } from 'lucide-react';

import { formatCurrency } from '@/lib/formatters';

interface ProductCardProps {
  product: Product;
  onReserve?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onReserve }) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Distance Badge */}
        {product.storeDistanceKm !== undefined && (
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{product.storeDistanceKm} km away</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <AlertTriangle className="w-3 h-3" /> Only {product.stock} Left
            </span>
          ) : (
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <CheckCircle className="w-3 h-3" /> In Stock ({product.stock})
            </span>
          )}
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Category */}
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            {product.category}
          </span>

          {/* Product Title */}
          <Link href={`/product/${product.id}`}>
            <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors mt-0.5">
              {product.name}
            </h3>
          </Link>

          {/* Store Info */}
          {product.storeName && (
            <Link
              href={`/store/${product.storeId}`}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 mt-1.5 transition-colors font-medium"
            >
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{product.storeName}</span>
            </Link>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              {formatCurrency(product.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/product/${product.id}`}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Details
            </Link>

            <button
              onClick={() => onReserve && onReserve(product)}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1 transition-all ${
                isOutOfStock
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-md'
              }`}
            >
              <span>Reserve</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
