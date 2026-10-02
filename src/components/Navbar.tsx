'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNearNeed } from '@/context/NearNeedContext';
import { 
  MapPin, 
  Search, 
  ShoppingBag, 
  Store, 
  User as UserIcon, 
  Menu, 
  X, 
  ChevronDown,
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  BarChart3,
  LogOut,
  CalendarCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, userLocation, setUserLocation, reservations, logoutUser } = useNearNeed();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState(userLocation.address);

  // Active customer reservations
  const activeReservationsCount = reservations.filter(
    (r) => r.userId === currentUser.id && r.status !== 'CANCELLED' && r.status !== 'COMPLETED'
  ).length;

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserLocation({
      ...userLocation,
      address: tempLocation,
    });
    setLocationModalOpen(false);
  };

  const isCustomer = currentUser.role === 'CUSTOMER';
  const isStoreOwner = currentUser.role === 'STORE_OWNER';
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5 fill-white/20 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-tight">
                    Near<span className="text-emerald-600">Need</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 tracking-wider uppercase -mt-0.5">
                    Nearby Product Finder
                  </span>
                </div>
              </Link>

              {/* Location Selector Pill */}
              <button
                onClick={() => setLocationModalOpen(true)}
                className="hidden md:flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 text-xs px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
                title="Change Location"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="max-w-[160px] truncate font-medium">{userLocation.address}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 font-medium text-sm">
              {isCustomer && (
                <>
                  <Link
                    href="/"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/search"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/search' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    Find Products
                  </Link>
                  <Link
                    href="/stores"
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      pathname === '/stores' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    Nearby Stores
                  </Link>
                  <Link
                    href="/reservations"
                    className={`relative px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/reservations' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>My Reservations</span>
                    {activeReservationsCount > 0 && (
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                        {activeReservationsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {isStoreOwner && (
                <>
                  <Link
                    href="/store-owner/dashboard"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/store-owner/dashboard' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/store-owner/products"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname.startsWith('/store-owner/products') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>My Products</span>
                  </Link>
                  <Link
                    href="/store-owner/inventory"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/store-owner/inventory' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Boxes className="w-4 h-4" />
                    <span>Inventory</span>
                  </Link>
                  <Link
                    href="/store-owner/reservations"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/store-owner/reservations' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Reservations</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/admin/dashboard' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Hub</span>
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/admin/users' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Users</span>
                  </Link>
                  <Link
                    href="/admin/stores"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/admin/stores' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Stores</span>
                  </Link>
                  <Link
                    href="/admin/reports"
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/admin/reports' ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                  </Link>
                </>
              )}
            </nav>

            {/* User Profile & Auth Actions */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={isStoreOwner ? '/store-owner/profile' : isCustomer ? '/profile' : '/admin/dashboard'}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80"
                  >
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={logoutUser}
                    className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-xs transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setLocationModalOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                title="Location"
              >
                <MapPin className="w-5 h-5 text-emerald-600" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
              Navigation ({currentUser.role.replace('_', ' ')})
            </div>

            {isCustomer && (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Home
                </Link>
                <Link
                  href="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Search Products
                </Link>
                <Link
                  href="/stores"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Nearby Stores
                </Link>
                <Link
                  href="/reservations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  My Reservations ({activeReservationsCount})
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Profile & Settings
                </Link>
              </>
            )}

            {isStoreOwner && (
              <>
                <Link
                  href="/store-owner/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Store Dashboard
                </Link>
                <Link
                  href="/store-owner/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Manage Products
                </Link>
                <Link
                  href="/store-owner/inventory"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Stock Inventory
                </Link>
                <Link
                  href="/store-owner/reservations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Store Reservations
                </Link>
                <Link
                  href="/store-owner/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Store Settings
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin/stores"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Manage Stores
                </Link>
                <Link
                  href="/admin/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 font-medium hover:bg-slate-100"
                >
                  Analytics & Reports
                </Link>
              </>
            )}

            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={logoutUser}
                className="w-full text-left px-3 py-2 text-rose-600 font-medium rounded-lg hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({currentUser.name})</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Location Selector Modal */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Select Your Location</span>
              </div>
              <button
                onClick={() => setLocationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLocationSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  City or Address
                </label>
                <input
                  type="text"
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="e.g. Downtown Austin, TX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Popular Locations
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Downtown, Austin, TX', 'South Lamar, Austin, TX', 'East Austin, TX', 'Domain, Austin, TX'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setTempLocation(loc)}
                      className={`text-xs p-2 rounded-lg border text-left transition-colors ${
                        tempLocation === loc
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Update Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
