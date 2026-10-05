import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Haversine formula to compute geographic distance in kilometers
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const inStockOnly = searchParams.get('inStock') === 'true';
    const userLat = Number(searchParams.get('lat')) || 13.0827;
    const userLng = Number(searchParams.get('lng')) || 80.2707;
    const maxDistanceKm = Number(searchParams.get('maxDistance')) || Number(searchParams.get('radius')) || 50;
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    const whereClause: any = {
      isActive: true,
      store: {
        isActive: true,
      },
    };

    // Filter by inStock if requested
    if (inStockOnly) {
      whereClause.stock = { gt: 0 };
    }

    // Filter by category safely without relying on fragile string mode
    if (category && category.toLowerCase() !== 'all') {
      whereClause.category = {
        equals: category,
      };
    }

    // Tokenized multi-word search matching name, description, category, or tags
    if (q) {
      const tokens = q.split(/\s+/).filter(Boolean);

      if (tokens.length === 1) {
        const token = tokens[0];
        whereClause.OR = [
          { name: { contains: token, mode: 'insensitive' } },
          { description: { contains: token, mode: 'insensitive' } },
          { category: { contains: token, mode: 'insensitive' } },
          { tags: { hasSome: [token, token.toLowerCase(), token.toUpperCase()] } },
        ];
      } else if (tokens.length > 1) {
        whereClause.AND = tokens.map((token) => ({
          OR: [
            { name: { contains: token, mode: 'insensitive' } },
            { description: { contains: token, mode: 'insensitive' } },
            { category: { contains: token, mode: 'insensitive' } },
            { tags: { hasSome: [token, token.toLowerCase(), token.toUpperCase()] } },
          ],
        }));
      }
    }

    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        where: whereClause,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              phone: true,
              rating: true,
              lat: true,
              lng: true,
              isActive: true,
            },
          },
        },
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (queryErr: any) {
      console.warn('Primary product search query failed, using resilient fallback:', queryErr?.message || queryErr);
      try {
        // Fallback base query without complex filter clauses if driver adapter error occurs
        products = await prisma.product.findMany({
          where: {
            isActive: true,
            store: {
              isActive: true,
            },
          },
          include: {
            store: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                phone: true,
                rating: true,
                lat: true,
                lng: true,
                isActive: true,
              },
            },
          },
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Perform in-memory keyword & category filtering on fallback results
        if (category && category.toLowerCase() !== 'all') {
          products = products.filter(
            (p) => (p.category || '').toLowerCase() === category.toLowerCase()
          );
        }
        if (q) {
          const qLower = q.toLowerCase();
          products = products.filter(
            (p) =>
              (p.name || '').toLowerCase().includes(qLower) ||
              (p.description || '').toLowerCase().includes(qLower) ||
              (p.category || '').toLowerCase().includes(qLower) ||
              (Array.isArray(p.tags) && p.tags.some((t: string) => typeof t === 'string' && t.toLowerCase().includes(qLower)))
          );
        }
      } catch (fallbackErr: any) {
        console.error('Fallback product search query failed:', fallbackErr?.message || fallbackErr);
        products = [];
      }
    }

    const formattedProducts = (products || [])
      .map((p) => {
        const storeDist = (p.store && typeof p.store.lat === 'number' && typeof p.store.lng === 'number')
          ? calculateHaversineDistanceKm(userLat, userLng, p.store.lat, p.store.lng)
          : 1.2;

        return {
          id: p.id,
          storeId: p.storeId,
          storeName: p.store?.name || 'Local Store',
          storeAddress: p.store?.address || '',
          storeCity: p.store?.city || 'Chennai, Tamil Nadu',
          storePhone: p.store?.phone || '',
          storeDistanceKm: storeDist,
          name: p.name || '',
          description: p.description || '',
          category: p.category || '',
          price: p.price ?? 0,
          sku: p.sku || '',
          stock: p.stock ?? 0,
          imageUrl: p.imageUrl || '',
          tags: Array.isArray(p.tags) ? p.tags : [],
          isActive: p.isActive ?? true,
        };
      })
      .filter((p) => p.storeDistanceKm <= maxDistanceKm);

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error: any) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while searching products.' },
      { status: 500 }
    );
  }
}

