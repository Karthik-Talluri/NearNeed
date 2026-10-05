import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Haversine formula to compute geographic distance in kilometers
function calculateHaversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Default to Chennai, Tamil Nadu coordinates (13.0827, 80.2707) if lat/lng not provided
    const userLat = Number(searchParams.get('lat')) || 13.0827;
    const userLng = Number(searchParams.get('lng')) || 80.2707;
    const radius = Number(searchParams.get('radius')) || 50; // max distance in km
    const category = searchParams.get('category')?.trim() || '';
    const q = searchParams.get('q')?.trim() || searchParams.get('query')?.trim() || '';

    const whereClause: any = {
      isActive: true,
    };

    if (category && category.toLowerCase() !== 'all') {
      whereClause.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    // Calculate Haversine distance for each store
    const storesWithDistance = stores
      .map((store) => {
        const distanceKm = calculateHaversineDistanceKm(
          userLat,
          userLng,
          store.lat,
          store.lng
        );
        return {
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
          activeProductsCount: store._count.products,
        };
      })
      // Filter by requested radius
      .filter((store) => store.distanceKm <= radius)
      // Sort nearest store first
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({ stores: storesWithDistance }, { status: 200 });
  } catch (error) {
    console.error('Nearby stores API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching nearby stores.' },
      { status: 500 }
    );
  }
}
