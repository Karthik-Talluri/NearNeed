import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { ReservationStatus } from '@prisma/client';

const ALLOWED_PREVIOUS_STATUSES: Record<string, ReservationStatus[]> = {
  APPROVED: ['PENDING'],
  READY_FOR_PICKUP: ['APPROVED'],
  COMPLETED: ['READY_FOR_PICKUP'],
  CANCELLED: ['PENDING', 'APPROVED'],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: reservationId } = await params;
    const body = await request.json().catch(() => ({}));
    const targetStatus = body.status as ReservationStatus;

    if (!targetStatus || !Object.values(ReservationStatus).includes(targetStatus)) {
      return NextResponse.json(
        { error: 'Invalid or missing target status' },
        { status: 400 }
      );
    }

    const allowedPrevious = ALLOWED_PREVIOUS_STATUSES[targetStatus];
    if (!allowedPrevious) {
      return NextResponse.json(
        { error: `No valid transition path to status '${targetStatus}'` },
        { status: 400 }
      );
    }

    // Perform atomic status transition, stock restoration, and order creation inside a transaction
    const txResult = await prisma.$transaction(async (tx) => {
      // 2. Fetch reservation to check existence and store ownership
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { store: true, product: true },
      });

      if (!reservation) {
        return { error: 'Reservation not found', status: 404 };
      }

      // 3. Security Check: Server-side store ownership verification
      if (reservation.store.ownerId !== session.userId) {
        return {
          error: 'Forbidden. You do not own the store associated with this reservation.',
          status: 403,
        };
      }

      if (reservation.status === targetStatus) {
        return {
          error: `Reservation is already in status '${targetStatus}'`,
          status: 400,
        };
      }

      if (!allowedPrevious.includes(reservation.status)) {
        return {
          error: `Invalid status transition from '${reservation.status}' to '${targetStatus}'.`,
          status: 400,
        };
      }

      // 4. ATOMIC CONDITIONAL UPDATE:
      // updateMany guarantees that only 1 concurrent request can match the expected previous status.
      const updateResult = await tx.reservation.updateMany({
        where: {
          id: reservationId,
          status: { in: allowedPrevious },
        },
        data: {
          status: targetStatus,
        },
      });

      if (updateResult.count === 0) {
        return {
          error: 'Conflict: The reservation status was modified by another concurrent request.',
          status: 409,
        };
      }

      // 5. Restore product stock ONLY IF cancellation succeeded in this atomic update
      if (targetStatus === 'CANCELLED') {
        await tx.product.update({
          where: { id: reservation.productId },
          data: { stock: { increment: reservation.quantity } },
        });
      }

      // 6. Create Order record ONLY IF completion succeeded in this atomic update
      if (targetStatus === 'COMPLETED') {
        const existingOrder = await tx.order.findUnique({
          where: { reservationId: reservation.id },
        });
        if (!existingOrder) {
          await tx.order.create({
            data: {
              reservationId: reservation.id,
              userId: reservation.userId,
              amount: reservation.totalPrice,
              status: 'COMPLETED',
            },
          });
        }
      }

      // 7. Fetch the updated record to format response
      const updatedReservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: {
          product: true,
          store: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      });

      return { reservation: updatedReservation, status: 200 };
    });

    if ('error' in txResult && txResult.error) {
      return NextResponse.json({ error: txResult.error }, { status: txResult.status });
    }

    const updatedReservation = txResult.reservation!;
    const formatted = {
      id: updatedReservation.id,
      reservationNumber: updatedReservation.reservationNumber,
      userId: updatedReservation.userId,
      userName: updatedReservation.user.name,
      userEmail: updatedReservation.user.email,
      userPhone: updatedReservation.user.phone || '',
      storeId: updatedReservation.storeId,
      storeName: updatedReservation.store.name,
      storeAddress: updatedReservation.store.address,
      productId: updatedReservation.productId,
      productName: updatedReservation.product.name,
      productImage: updatedReservation.product.imageUrl,
      quantity: updatedReservation.quantity,
      unitPrice: updatedReservation.unitPrice,
      totalPrice: updatedReservation.totalPrice,
      status: updatedReservation.status,
      pickupDate: updatedReservation.pickupDate,
      pickupTime: updatedReservation.pickupTime,
      notes: updatedReservation.notes || '',
      createdAt: updatedReservation.createdAt.toISOString(),
    };

    return NextResponse.json({ reservation: formatted }, { status: 200 });
  } catch (error) {
    console.error('Update store owner reservation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the reservation.' },
      { status: 500 }
    );
  }
}
