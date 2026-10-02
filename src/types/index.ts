export type UserRole = 'CUSTOMER' | 'STORE_OWNER' | 'ADMIN';

export type ReservationStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'READY_FOR_PICKUP' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  avatarUrl?: string;
  savedStores?: string[];
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  zipCode: string;
  lat: number;
  lng: number;
  phone: string;
  rating: number;
  reviewCount: number;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  isVerified: boolean;
  isActive: boolean;
  hours: string;
  distanceKm?: number;
}

export interface Product {
  id: string;
  storeId: string;
  storeName?: string;
  storeDistanceKm?: number;
  storeAddress?: string;
  storePhone?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sku: string;
  stock: number;
  imageUrl: string;
  tags: string[];
  isActive: boolean;
  featured?: boolean;
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: ReservationStatus;
  pickupDate: string;
  pickupTime: string;
  notes?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  slug: string;
  image: string;
}

export interface SearchFilters {
  query: string;
  category: string;
  location: string;
  maxDistanceKm: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  sortBy: 'distance' | 'price_asc' | 'price_desc' | 'rating';
}
