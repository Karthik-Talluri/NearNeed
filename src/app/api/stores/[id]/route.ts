import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Haversine formula to compute distance in km
function calculateHaversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storeId } = await params;
    const { searchParams } = new URL(request.url);
    const userLat = Number(searchParams.get('lat')) || 30.2672;
    const userLng = Number(searchParams.get('lng')) || -97.7431;

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store || !store.isActive) {
      return NextResponse.json(
        { error: 'Store not found or inactive' },
        { status: 404 }
      );
    }

    const distanceKm = (typeof store.lat === 'number' && typeof store.lng === 'number')
      ? calculateHaversineDistanceKm(userLat, userLng, store.lat, store.lng)
      : 1.2;

    const formattedStore = {
      id: store.id,
      ownerId: store.ownerId,
      name: store.name,
      description: store.description || '',
      address: store.address,
      city: store.city,
      zipCode: store.zipCode,
      phone: store.phone,
      lat: store.lat,
      lng: store.lng,
      rating: store.rating,
      reviewCount: store.reviewCount,
      category: store.category,
      logoUrl: store.logoUrl || '',
      bannerUrl: store.bannerUrl || '',
      isVerified: store.isVerified,
      isActive: store.isActive,
      hours: 'Mon-Sun: 9:00 AM - 9:00 PM',
      distanceKm,
    };

    const formattedProducts = store.products.map((p) => ({
      id: p.id,
      storeId: p.storeId,
      storeName: store.name,
      storeAddress: store.address,
      storeCity: store.city,
      storePhone: store.phone,
      storeDistanceKm: distanceKm,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      sku: p.sku || '',
      stock: p.stock,
      imageUrl: p.imageUrl,
      tags: p.tags || [],
      isActive: p.isActive,
    }));

    return NextResponse.json(
      { store: formattedStore, products: formattedProducts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch store details error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching store details.' },
      { status: 500 }
    );
  }
}
