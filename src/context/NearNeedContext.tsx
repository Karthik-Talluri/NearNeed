'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Store, Product, Reservation, UserRole, SearchFilters, ReservationStatus } from '@/types';
import { INITIAL_USERS, INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_RESERVATIONS } from '@/lib/mockData';

interface NearNeedContextType {
  currentUser: User;
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  users: User[];
  switchRole: (role: UserRole) => void;
  loginUser: (email: string, password?: string) => Promise<User | null>;
  registerUser: (userData: Partial<User> & { password?: string }) => Promise<User | null>;
  logoutUser: () => Promise<void>;
  
  // Stores
  stores: Store[];
  addStore: (storeData: Omit<Store, 'id' | 'rating' | 'reviewCount' | 'isVerified' | 'isActive'>) => Promise<Store | null>;
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
  location: 'Chennai, Tamil Nadu',
  maxDistanceKm: 10,
  inStockOnly: false,
  sortBy: 'distance',
};

const NearNeedContext = createContext<NearNeedContextType | undefined>(undefined);

export const NearNeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Customer by default
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);
  const [stores, setStores] = useState<Store[]>(INITIAL_STORES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  
  const [userLocation, setUserLocation] = useState({
    address: 'T Nagar, Chennai, Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
  });

  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);

  // Function to load stores from PostgreSQL database via /api/stores
  const loadDatabaseStores = async (isStoreOwner = false) => {
    try {
      const url = isStoreOwner ? '/api/stores?mine=true' : '/api/stores';
      const storesRes = await fetch(url);
      if (storesRes.ok) {
        const storesData = await storesRes.json();
        if (storesData.stores && storesData.stores.length > 0) {
          setStores((prevStores) => {
            const dbMap = new Map(storesData.stores.map((s: Store) => [s.id, s]));
            const merged = [...storesData.stores];
            prevStores.forEach((s) => {
              if (!dbMap.has(s.id)) {
                merged.push(s);
              }
            });
            return merged;
          });
        }
      }
    } catch (err) {
      console.error('Error fetching stores from DB:', err);
    }
  };

  // Restore authenticated session from /api/auth/me on mount
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            await loadDatabaseStores(data.user.role === 'STORE_OWNER');
          } else {
            setIsAuthenticated(false);
            await loadDatabaseStores(false);
          }
        } else {
          await loadDatabaseStores(false);
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
        setIsAuthenticated(false);
      } finally {
        setIsAuthLoaded(true);
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
      setIsAuthenticated(true);
    } else {
      setCurrentUser({
        ...currentUser,
        role,
        name: role === 'ADMIN' ? 'Admin User' : role === 'STORE_OWNER' ? 'Store Owner' : 'Customer User',
      });
      setIsAuthenticated(true);
    }
  };

  const loginUser = async (email: string, password?: string): Promise<User | null> => {
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
          setIsAuthenticated(true);
          await loadDatabaseStores(data.user.role === 'STORE_OWNER');
          return data.user;
        }
      }
      return null;
    } catch (err) {
      console.error('Login failed:', err);
      return null;
    }
  };

  const registerUser = async (userData: Partial<User> & { password?: string }): Promise<User | null> => {
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
          setIsAuthenticated(true);
          await loadDatabaseStores(data.user.role === 'STORE_OWNER');
          return data.user;
        }
      }
      return null;
    } catch (err) {
      console.error('Registration failed:', err);
      return null;
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(INITIAL_USERS[0]);
      setIsAuthenticated(false);
    }
  };

  // Store Management
  const addStore = async (storeData: Omit<Store, 'id' | 'rating' | 'reviewCount' | 'isVerified' | 'isActive'>): Promise<Store | null> => {
    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.store) {
          const createdStore: Store = data.store;
          setStores((prev) => [createdStore, ...prev.filter((s) => s.id !== createdStore.id)]);
          return createdStore;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Failed to create store via API:', errData.error);
      }
    } catch (err) {
      console.error('API Error adding store:', err);
    }

    // Fallback if API call fails
    const fallbackStore: Store = {
      ...storeData,
      id: `store-${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
      isVerified: true,
      isActive: true,
      distanceKm: Math.floor(Math.random() * 5 * 10) / 10 + 0.5,
    };
    setStores((prev) => [fallbackStore, ...prev]);
    return fallbackStore;
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
      userPhone: currentUser.phone || '+91 98765 43210',
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
        isAuthenticated,
        isAuthLoaded,
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
