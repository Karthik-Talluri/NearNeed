'use client';

import React from 'react';
import { useNearNeed } from '@/context/NearNeedContext';
import { Boxes, Plus, Minus, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function StoreInventoryPage() {
  const { stores, products, updateProduct, currentUser } = useNearNeed();

  const myStores = stores.filter((s) => s.ownerId === currentUser.id);
  const activeStore = myStores[0] || stores[0];

  const storeProducts = products.filter((p) => p.storeId === activeStore.id);

  const updateStock = (productId: string, delta: number) => {
    const prod = storeProducts.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    updateProduct(productId, { stock: newStock });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {activeStore.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Live Stock Inventory Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Adjust stock quantities in real-time. Changes immediately update customer search results nearby.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200 text-xs font-semibold">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>{storeProducts.length} Items Listed</span>
          </div>
        </div>

        {/* Inventory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeProducts.map((p) => {
            const isOut = p.stock <= 0;
            const isLow = p.stock > 0 && p.stock <= 3;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">${p.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Status Indicator */}
                  {isOut ? (
                    <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  ) : isLow ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      Low Stock ({p.stock})
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      In Stock ({p.stock})
                    </span>
                  )}

                  {/* Stock Quantity Controls */}
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateStock(p.id, -1)}
                      className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Decrease stock"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                      {p.stock}
                    </span>
                    <button
                      onClick={() => updateStock(p.id, 1)}
                      className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Increase stock"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
