import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'User is not authenticated' },
        { status: 401 }
      );
    }

    const { id: reservationId } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'CANCEL';

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (reservation.userId !== session.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to modify this reservation' },
        { status: 403 }
      );
    }

    if (action === 'CANCEL') {
      if (reservation.status !== 'PENDING') {
        return NextResponse.json(
          { error: `Cannot cancel reservation with status '${reservation.status}'` },
          { status: 400 }
        );
      }

      // Cancel reservation and restore product stock
      const updatedReservation = await prisma.$transaction(async (tx) => {
        const updated = await tx.reservation.update({
          where: { id: reservationId },
          data: { status: 'CANCELLED' },
          include: {
            product: true,
            store: true,
            user: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        });

        // Restore stock
        await tx.product.update({
          where: { id: reservation.productId },
          data: { stock: { increment: reservation.quantity } },
        });

        return updated;
      });

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
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update reservation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating reservation.' },
      { status: 500 }
    );
  }
}
