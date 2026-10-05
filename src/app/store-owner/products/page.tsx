'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNearNeed } from '@/context/NearNeedContext';
import { formatCurrency } from '@/lib/formatters';
import { CATEGORIES } from '@/lib/mockData';
import { Product } from '@/types';
import { Plus, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, Package } from 'lucide-react';

export default function StoreOwnerProductsPage() {
  const { stores, products, deleteProduct, updateProduct, currentUser } = useNearNeed();
  const [searchQuery, setSearchQuery] = useState('');
  
  const myStores = stores.filter((s) => s.ownerId === currentUser.id);
  const activeStore = myStores[0] || stores[0];

  const storeProducts = products.filter((p) => p.storeId === activeStore.id);
  const filteredProducts = storeProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Inventory Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Store Product Catalog ({storeProducts.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage items offered at <strong className="text-slate-800">{activeStore.name}</strong>
            </p>
          </div>

          <Link
            href="/store-owner/products/new"
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-colors shadow-md self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex items-center bg-slate-50 rounded-xl border border-slate-300 px-3.5 py-2 w-full max-w-md">
            <Search className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by product name, category..."
              className="w-full bg-transparent text-xs font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* Catalog Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.map((product) => {
                    const isOut = product.stock <= 0;
                    const isLow = product.stock > 0 && product.stock <= 3;
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <Link href={`/product/${product.id}`}>
                                <h4 className="font-bold text-slate-900 text-sm hover:text-emerald-700 line-clamp-1">
                                  {product.name}
                                </h4>
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px]">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{product.sku || 'N/A'}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatCurrency(product.price)}</td>
                        <td className="py-3.5 px-4 font-bold">
                          {isOut ? (
                            <span className="text-rose-600 flex items-center gap-1">0 (Out of stock)</span>
                          ) : isLow ? (
                            <span className="text-amber-600 flex items-center gap-1">{product.stock} left</span>
                          ) : (
                            <span className="text-emerald-700">{product.stock} in stock</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => updateProduct(product.id, { isActive: !product.isActive })}
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              product.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {product.isActive ? 'Active' : 'Draft/Hidden'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${product.name}?`)) deleteProduct(product.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-400 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p>No products found in your store catalog.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
