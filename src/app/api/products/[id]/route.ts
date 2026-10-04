import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function calculateHaversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
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
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userLat = Number(searchParams.get('lat')) || 30.2672;
    const userLng = Number(searchParams.get('lng')) || -97.7431;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const dist = (product.store && typeof product.store.lat === 'number' && typeof product.store.lng === 'number')
      ? calculateHaversineDistanceKm(userLat, userLng, product.store.lat, product.store.lng)
      : 1.2;

    const formattedProduct = {
      id: product.id,
      storeId: product.storeId,
      storeName: product.store.name,
      storeDistanceKm: dist,
      storeAddress: product.store.address,
      storePhone: product.store.phone,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      sku: product.sku || '',
      stock: product.stock,
      imageUrl: product.imageUrl,
      tags: product.tags || [],
      isActive: product.isActive,
    };

    const formattedStore = {
      id: product.store.id,
      ownerId: product.store.ownerId,
      name: product.store.name,
      description: product.store.description || '',
      address: product.store.address,
      city: product.store.city,
      zipCode: product.store.zipCode,
      lat: product.store.lat,
      lng: product.store.lng,
      phone: product.store.phone,
      rating: product.store.rating,
      reviewCount: product.store.reviewCount,
      category: product.store.category,
      logoUrl: product.store.logoUrl || '',
      bannerUrl: product.store.bannerUrl || '',
      isVerified: product.store.isVerified,
      isActive: product.store.isActive,
      hours: 'Mon-Sat: 9am - 8pm, Sun: 10am - 6pm',
      distanceKm: dist,
    };

    return NextResponse.json({ product: formattedProduct, store: formattedStore }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching product details.' },
      { status: 500 }
    );
  }
}
