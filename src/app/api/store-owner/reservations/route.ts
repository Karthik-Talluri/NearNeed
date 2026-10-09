import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
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

    // 2. Derive store(s) server-side from session.userId (never trust client storeId)
    const stores = await prisma.store.findMany({
      where: { ownerId: session.userId },
      select: { id: true },
    });

    if (stores.length === 0) {
      return NextResponse.json({ reservations: [] }, { status: 200 });
    }

    const storeIds = stores.map((s) => s.id);

    // 3. Fetch reservations for products/stores owned by this store owner
    const reservations = await prisma.reservation.findMany({
      where: {
        storeId: { in: storeIds },
      },
      include: {
        product: true,
        store: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedReservations = reservations.map((r) => ({
      id: r.id,
      reservationNumber: r.reservationNumber,
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      userPhone: r.user.phone || '',
      storeId: r.storeId,
      storeName: r.store.name,
      storeAddress: r.store.address,
      productId: r.productId,
      productName: r.product.name,
      productImage: r.product.imageUrl,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      totalPrice: r.totalPrice,
      status: r.status,
      pickupDate: r.pickupDate,
      pickupTime: r.pickupTime,
      notes: r.notes || '',
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ reservations: formattedReservations }, { status: 200 });
  } catch (error) {
    console.error('Fetch store owner reservations error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching store owner reservations.' },
      { status: 500 }
    );
  }
}
