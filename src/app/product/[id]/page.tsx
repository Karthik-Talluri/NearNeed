'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNearNeed } from '@/context/NearNeedContext';
import { ReservationModal } from '@/components/ReservationModal';
import { ProductCard } from '@/components/ProductCard';
import { Product, Store } from '@/types';
import { 
  MapPin, 
  Store as StoreIcon, 
  Star, 
  Phone, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Share2, 
  ArrowLeft,
  BadgeCheck,
  Tag,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  
  const { products: contextProducts, stores: contextStores, userLocation } = useNearNeed();
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  const [dbProduct, setDbProduct] = useState<Product | null>(null);
  const [dbStore, setDbStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        if (userLocation.lat) queryParams.append('lat', userLocation.lat.toString());
        if (userLocation.lng) queryParams.append('lng', userLocation.lng.toString());

        const res = await fetch(`/api/products/${encodeURIComponent(productId)}?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setDbProduct(data.product);
            setDbStore(data.store);
          }
        } else {
          // Fallback to context product
          const fallbackProd = contextProducts.find((p) => p.id === productId);
          if (fallbackProd && isMounted) {
            setDbProduct(fallbackProd);
            const fallbackStore = contextStores.find((s) => s.id === fallbackProd.storeId);
            setDbStore(fallbackStore || null);
          } else if (isMounted) {
            setError('Product not found in inventory.');
          }
        }
      } catch (err: any) {
        console.error('Error loading product details:', err);
        const fallbackProd = contextProducts.find((p) => p.id === productId);
        if (fallbackProd && isMounted) {
          setDbProduct(fallbackProd);
          const fallbackStore = contextStores.find((s) => s.id === fallbackProd.storeId);
          setDbStore(fallbackStore || null);
        } else if (isMounted) {
          setError(err.message || 'Failed to fetch product details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, userLocation.lat, userLocation.lng, contextProducts, contextStores]);

  const product = dbProduct;
  const store = dbStore || (product ? contextStores.find((s) => s.id === product.storeId) : undefined);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 max-w-md w-full text-center space-y-4 shadow-sm border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Loading Product Details</h3>
            <p className="text-xs text-slate-500 mt-1">Fetching live inventory from PostgreSQL database...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-md border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">The product you are looking for may have been removed or is unavailable.</p>
          <button
            onClick={() => router.push('/search')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  // Related products in same category or same store
  const relatedProducts = contextProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.storeId === product.storeId))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/search" className="hover:text-emerald-700 transition-colors">Search</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold line-clamp-1">{product.name}</span>
        </div>

        {/* Product Details Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Image Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-4/3 w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {/* Distance Tag */}
              {product.storeDistanceKm !== undefined && (
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{product.storeDistanceKm} km from your location</span>
                </div>
              )}
            </div>
          </div>

          {/* Details & Purchase Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  {product.category}
                </span>

                {/* Stock Badge */}
                {isOutOfStock ? (
                  <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({product.stock} items left)
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> In Stock ({product.stock} available)
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* SKU */}
              {product.sku && (
                <p className="text-xs text-slate-400 font-mono">SKU: {product.sku}</p>
              )}

              {/* Price */}
              <div className="pt-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">Pay in-store during pickup</span>
              </div>

              {/* Description */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Overview
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {product.tags.map((tag) => (
                    <span key={tag} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

            </div>

            {/* Action Card & Store Summary */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              
              {/* Store Details Card */}
              {store && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/store/${store.id}`} className="flex items-center gap-2 group">
                      <StoreIcon className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        {store.name}
                      </span>
                      {store.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      )}
                    </Link>

                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{store.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{store.address}, {store.city} ({store.distanceKm || product.storeDistanceKm || 1.2} km away)</span>
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {store.phone}
                    </span>
                    <Link
                      href={`/store/${store.id}`}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                    >
                      View Store Page →
                    </Link>
                  </div>
                </div>
              )}

              {/* Reserve Button */}
              <button
                onClick={() => setIsReservationModalOpen(true)}
                disabled={isOutOfStock}
                className={`w-full py-4 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isOutOfStock
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01]'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Reserve Item for Free Pickup</span>
              </button>

            </div>

          </div>

        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              More Products from Nearby Stores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Reservation Modal */}
      {isReservationModalOpen && (
        <ReservationModal
          product={product}
          onClose={() => setIsReservationModalOpen(false)}
        />
      )}
    </div>
  );
}
