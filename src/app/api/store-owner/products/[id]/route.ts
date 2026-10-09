import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();

    // 1. Security Check: Authenticated session & STORE_OWNER role
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

    // 2. Find Store belonging to session user
    const store = await prisma.store.findFirst({
      where: { ownerId: session.userId },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'No store registered for this store owner.' },
        { status: 403 }
      );
    }

    // 3. Verify product exists and belongs strictly to store.id
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct || existingProduct.storeId !== store.id) {
      return NextResponse.json(
        { error: 'Product not found or does not belong to your store.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.stock !== undefined) updateData.stock = parseInt(String(body.stock), 10);
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.tags !== undefined && Array.isArray(body.tags)) updateData.tags = body.tags;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();

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

    const store = await prisma.store.findFirst({
      where: { ownerId: session.userId },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'No store registered for this store owner.' },
        { status: 403 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct || existingProduct.storeId !== store.id) {
      return NextResponse.json(
        { error: 'Product not found or does not belong to your store.' },
        { status: 404 }
      );
    }

    // Soft delete / deactivate product to preserve reservations and relational integrity
    const deactivatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { product: deactivatedProduct, message: 'Product deactivated successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Deactivate product error:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate product.' },
      { status: 500 }
    );
  }
}
