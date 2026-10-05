'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, Clock, Store, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <MapPin className="w-5 h-5 fill-slate-950/20 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Near<span className="text-emerald-400">Need</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Find What You Need Near You. Connecting local shoppers with nearby brick-and-mortar stores for instant product availability and hassle-free reservation.
            </p>
            <div className="flex items-center gap-4 text-slate-400 text-xs pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verified Stores
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-emerald-400" /> Real-time Stock
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Customers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="hover:text-emerald-400 transition-colors">
                  Search Products
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-emerald-400 transition-colors">
                  Browse Nearby Stores
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-emerald-400 transition-colors">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-emerald-400 transition-colors">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Owners */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Store Owners</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/store-owner/register" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" /> Register Your Store
                </Link>
              </li>
              <li>
                <Link href="/store-owner/dashboard" className="hover:text-emerald-400 transition-colors">
                  Store Owner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/store-owner/products" className="hover:text-emerald-400 transition-colors">
                  Product Management
                </Link>
              </li>
              <li>
                <Link href="/store-owner/inventory" className="hover:text-emerald-400 transition-colors">
                  Inventory Stock Controls
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">Support & Admin</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin/dashboard" className="hover:text-emerald-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-emerald-400" /> support@nearneed.com
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-emerald-400" /> 1800 123 NEAR (+91)
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NearNeed Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Store Partner Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
