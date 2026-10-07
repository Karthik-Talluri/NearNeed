import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const mineOnly = searchParams.get('mine') === 'true';

    // If a store owner asks for their own stores, filter by their authenticated session userId
    if (session && session.role === 'STORE_OWNER' && mineOnly) {
      const stores = await prisma.store.findMany({
        where: { ownerId: session.userId },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ stores }, { status: 200 });
    }

    // Otherwise return all active stores for public catalog/search
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error) {
    console.error('Fetch stores error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();

    // 1. Security & Role Check: Only authenticated STORE_OWNER can create a store
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to create a store.' },
        { status: 401 }
      );
    }

    if (session.role !== 'STORE_OWNER') {
      return NextResponse.json(
        { error: 'Forbidden. Only users with STORE_OWNER role can create a store.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      address,
      city,
      zipCode,
      phone,
      category,
      logoUrl,
      bannerUrl,
      lat,
      lng,
    } = body;

    // 2. Validate required store fields
    if (!name || !address || !zipCode || !phone || !category) {
      return NextResponse.json(
        { error: 'Store name, address, zip code, phone number, and category are required.' },
        { status: 400 }
      );
    }

    // 3. Security: ownerId is ALWAYS derived from session.userId, never from body input
    const newStore = await prisma.store.create({
      data: {
        ownerId: session.userId,
        name,
        description: description || null,
        address,
        city: city || 'Chennai, Tamil Nadu',
        zipCode,
        lat: typeof lat === 'number' ? lat : 13.0418,
        lng: typeof lng === 'number' ? lng : 80.2341,
        phone,
        rating: 5.0,
        reviewCount: 1,
        category,
        logoUrl: logoUrl || 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=200',
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
        isVerified: true,
        isActive: true,
      },
    });

    return NextResponse.json({ store: newStore }, { status: 201 });
  } catch (error) {
    console.error('Create store error:', error);
    return NextResponse.json(
      { error: 'Failed to create store. Please check the fields and try again.' },
      { status: 500 }
    );
  }
}
