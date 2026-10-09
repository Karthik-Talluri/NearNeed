import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();

    // 1. Security Check: Authenticated session & STORE_OWNER role required
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.role !== 'STORE_OWNER') {
      return NextResponse.json(
        { error: 'Forbidden. Store Owner role required.' },
        { status: 403 }
      );
    }

    // 2. Derive storeId server-side from session.userId
    const store = await prisma.store.findFirst({
      where: { ownerId: session.userId },
    });

    if (!store) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    // 3. Fetch products belonging strictly to this store
    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Fetch store owner products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store products.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();

    // 1. Security Check: Authenticated session & STORE_OWNER role required
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required to add products.' },
        { status: 401 }
      );
    }

    if (session.role !== 'STORE_OWNER') {
      return NextResponse.json(
        { error: 'Forbidden. Store Owner role required.' },
        { status: 403 }
      );
    }

    // 2. Find Store belonging to the session user (never trust frontend storeId)
    const store = await prisma.store.findFirst({
      where: { ownerId: session.userId },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'No store registered for this store owner. Please create a store first.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      sku,
      stock,
      imageUrl,
      tags,
      isActive,
    } = body;

    // 3. Validate required fields
    if (!name || price === undefined || price === null || !category) {
      return NextResponse.json(
        { error: 'Product name, category, and price are required.' },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid positive number.' },
        { status: 400 }
      );
    }

    const numericStock = stock !== undefined && stock !== null ? parseInt(String(stock), 10) : 10;

    // 4. Create product securely linked to store.id
    const newProduct = await prisma.product.create({
      data: {
        storeId: store.id,
        name,
        description: description || '',
        category,
        price: numericPrice,
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        stock: isNaN(numericStock) ? 10 : numericStock,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
        tags: Array.isArray(tags) ? tags : [],
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product. Please try again.' },
      { status: 500 }
    );
  }
}
