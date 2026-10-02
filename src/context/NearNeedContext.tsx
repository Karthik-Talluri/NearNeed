'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Store, Product, Reservation, UserRole, SearchFilters, ReservationStatus } from '@/types';
import { INITIAL_USERS, INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_RESERVATIONS } from '@/lib/mockData';

interface NearNeedContextType {
  currentUser: User;
  users: User[];
  switchRole: (role: UserRole) => void;
  loginUser: (email: string, password?: string) => Promise<boolean>;
  registerUser: (userData: Partial<User> & { password?: string }) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  
  // Stores
  stores: Store[];
  addStore: (storeData: Omit<Store, 'id' | 'rating' | 'reviewCount' | 'isVerified' | 'isActive'>) => Store;
  updateStore: (id: string, storeData: Partial<Store>) => void;
  deleteStore: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'storeName' | 'storeDistanceKm' | 'storeAddress' | 'storePhone'>) => Product;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Reservations
  reservations: Reservation[];
  createReservation: (reservationData: {
    productId: string;
    quantity: number;
    pickupDate: string;
    pickupTime: string;
    notes?: string;
  }) => Reservation;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  cancelReservation: (id: string) => void;
  
  // Location & Search
  userLocation: { address: string; lat: number; lng: number };
  setUserLocation: (loc: { address: string; lat: number; lng: number }) => void;
  searchFilters: SearchFilters;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  resetSearchFilters: () => void;
  
  // Saved Stores
  toggleSaveStore: (storeId: string) => void;
}

const defaultSearchFilters: SearchFilters = {
  query: '',
  category: 'all',
  location: 'Austin, TX',
  maxDistanceKm: 10,
  inStockOnly: false,
  sortBy: 'distance',
};

const NearNeedContext = createContext<NearNeedContextType | undefined>(undefined);

export const NearNeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Customer by default
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  
  const [userLocation, setUserLocation] = useState({
    address: 'Downtown, Austin, TX',
    lat: 30.2672,
    lng: -97.7431,
  });

  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);

  // Restore authenticated session from /api/auth/me on mount
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
      }
    }
    checkAuthSession();
  }, []);

  // Sync products with stores information whenever stores update
  useEffect(() => {
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const matchingStore = stores.find((s) => s.id === prod.storeId);
        if (matchingStore) {
          return {
            ...prod,
            storeName: matchingStore.name,
            storeDistanceKm: matchingStore.distanceKm || 1.2,
            storeAddress: matchingStore.address,
            storePhone: matchingStore.phone,
          };
        }
        return prod;
      })
    );
  }, [stores]);

  const switchRole = (role: UserRole) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    } else {
      setCurrentUser({
        ...currentUser,
        role,
        name: role === 'ADMIN' ? 'Admin User' : role === 'STORE_OWNER' ? 'Store Owner' : 'Customer User',
      });
    }
  };

  const loginUser = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'password123' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const registerUser = async (userData: Partial<User> & { password?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Registration failed:', err);
      return false;
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(INITIAL_USERS[0]);
    }
  };

  // Store Management
  const addStore = (storeData: Omit<Store, 'id' | 'rating' | 'reviewCount' | 'isVerified' | 'isActive'>) => {
    const newStore: Store = {
      ...storeData,
      id: `store-${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
      isVerified: true,
      isActive: true,
      distanceKm: Math.floor(Math.random() * 5 * 10) / 10 + 0.5,
    };
    setStores((prev) => [newStore, ...prev]);
    return newStore;
  };

  const updateStore = (id: string, storeData: Partial<Store>) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...storeData } : s))
    );
  };

  const deleteStore = (id: string) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
  };

  // Product Management
  const addProduct = (productData: Omit<Product, 'id' | 'storeName' | 'storeDistanceKm' | 'storeAddress' | 'storePhone'>) => {
    const matchingStore = stores.find((s) => s.id === productData.storeId);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      storeName: matchingStore?.name || 'Local Store',
      storeDistanceKm: matchingStore?.distanceKm || 1.0,
      storeAddress: matchingStore?.address || 'Main St',
      storePhone: matchingStore?.phone || '',
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Reservations
  const createReservation = (data: {
    productId: string;
    quantity: number;
    pickupDate: string;
    pickupTime: string;
    notes?: string;
  }) => {
    const targetProduct = products.find((p) => p.id === data.productId);
    if (!targetProduct) throw new Error('Product not found');
    const targetStore = stores.find((s) => s.id === targetProduct.storeId);

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      reservationNumber: `NN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: currentUser.phone || '+1 (555) 000-0000',
      storeId: targetProduct.storeId,
      storeName: targetStore?.name || targetProduct.storeName || 'Store',
      storeAddress: targetStore?.address || targetProduct.storeAddress || '',
      productId: targetProduct.id,
      productName: targetProduct.name,
      productImage: targetProduct.imageUrl,
      quantity: data.quantity,
      unitPrice: targetProduct.price,
      totalPrice: targetProduct.price * data.quantity,
      status: 'PENDING',
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) =>
      prev.map((p) =>
        p.id === data.productId
          ? { ...p, stock: Math.max(0, p.stock - data.quantity) }
          : p
      )
    );

    setReservations((prev) => [newRes, ...prev]);
    return newRes;
  };

  const updateReservationStatus = (id: string, status: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const cancelReservation = (id: string) => {
    updateReservationStatus(id, 'CANCELLED');
  };

  const resetSearchFilters = () => {
    setSearchFilters(defaultSearchFilters);
  };

  const toggleSaveStore = (storeId: string) => {
    setCurrentUser((prev) => {
      const saved = prev.savedStores || [];
      const updated = saved.includes(storeId)
        ? saved.filter((id) => id !== storeId)
        : [...saved, storeId];
      return { ...prev, savedStores: updated };
    });
  };

  return (
    <NearNeedContext.Provider
      value={{
        currentUser,
        users,
        switchRole,
        loginUser,
        registerUser,
        logoutUser,
        stores,
        addStore,
        updateStore,
        deleteStore,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        reservations,
        createReservation,
        updateReservationStatus,
        cancelReservation,
        userLocation,
        setUserLocation,
        searchFilters,
        setSearchFilters,
        resetSearchFilters,
        toggleSaveStore,
      }}
    >
      {children}
    </NearNeedContext.Provider>
  );
};

export const useNearNeed = () => {
  const context = useContext(NearNeedContext);
  if (!context) {
    throw new Error('useNearNeed must be used within a NearNeedProvider');
  }
  return context;
};
