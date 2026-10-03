import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const inStockOnly = searchParams.get('inStock') === 'true';
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

    // Filter by category if specified and not 'all'
    if (category && category.toLowerCase() !== 'all') {
      whereClause.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    // Search query matching name, description, category, or tags
    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q, q.toLowerCase(), q.toUpperCase()] } },
      ];
    }

    const products = await prisma.product.findMany({
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
            isActive: true,
          },
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedProducts = products.map((p) => ({
      id: p.id,
      storeId: p.storeId,
      storeName: p.store?.name || 'Local Store',
      storeAddress: p.store?.address || '',
      storeCity: p.store?.city || 'Austin, TX',
      storePhone: p.store?.phone || '',
      storeDistanceKm: 1.2,
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

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while searching products.' },
      { status: 500 }
    );
  }
}
