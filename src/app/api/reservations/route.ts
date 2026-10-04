import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'User is not authenticated' },
        { status: 401 }
      );
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId: session.userId },
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
    console.error('Fetch reservations error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching reservations.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'User is not authenticated. Please log in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity, pickupDate, pickupTime, notes } = body;

    const parsedQty = Number(quantity);
    if (!productId || isNaN(parsedQty) || parsedQty <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // 1. Fetch real Product and Store from PostgreSQL
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    if (!product.store || !product.store.isActive) {
      return NextResponse.json(
        { error: 'Store is not active' },
        { status: 400 }
      );
    }

    // 2. Validate stock
    if (parsedQty > product.stock) {
      return NextResponse.json(
        { error: `Requested quantity (${parsedQty}) exceeds available stock (${product.stock})` },
        { status: 400 }
      );
    }

    // 3. Server-side price calculation
    const unitPrice = product.price;
    const totalPrice = unitPrice * parsedQty;

    // Generate unique reservation number
    const reservationNumber = `NN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Create Reservation in PostgreSQL & decrement product stock
    const reservation = await prisma.$transaction(async (tx) => {
      const createdRes = await tx.reservation.create({
        data: {
          reservationNumber,
          userId: session.userId,
          storeId: product.storeId,
          productId: product.id,
          quantity: parsedQty,
          unitPrice,
          totalPrice,
          status: 'PENDING',
          pickupDate: pickupDate || new Date().toISOString().split('T')[0],
          pickupTime: pickupTime || '02:00 PM',
          notes: notes || null,
        },
        include: {
          product: true,
          store: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      // Update product stock
      await tx.product.update({
        where: { id: product.id },
        data: { stock: product.stock - parsedQty },
      });

      return createdRes;
    });

    const formatted = {
      id: reservation.id,
      reservationNumber: reservation.reservationNumber,
      userId: reservation.userId,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      userPhone: reservation.user.phone || '',
      storeId: reservation.storeId,
      storeName: reservation.store.name,
      storeAddress: reservation.store.address,
      productId: reservation.productId,
      productName: reservation.product.name,
      productImage: reservation.product.imageUrl,
      quantity: reservation.quantity,
      unitPrice: reservation.unitPrice,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      pickupDate: reservation.pickupDate,
      pickupTime: reservation.pickupTime,
      notes: reservation.notes || '',
      createdAt: reservation.createdAt.toISOString(),
    };

    return NextResponse.json({ reservation: formatted }, { status: 201 });
  } catch (error: any) {
    console.error('Create reservation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating reservation.' },
      { status: 500 }
    );
  }
}
