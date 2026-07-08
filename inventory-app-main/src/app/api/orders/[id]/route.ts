import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      customer: true,
      supplier: true,
      items: { include: { product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Delete existing items and recreate
  await prisma.orderItem.deleteMany({
    where: { orderId: parseInt(id) },
  });

  const order = await prisma.order.update({
    where: { id: parseInt(id) },
    data: {
      customerId: body.customerId || null,
      supplierId: body.supplierId || null,
      notes: body.notes || null,
      totalAmount: body.items
        ? body.items.reduce(
            (sum: number, item: { quantity: number; price: number }) =>
              sum + item.quantity * item.price,
            0
          )
        : undefined,
      items: body.items
        ? {
            create: body.items.map(
              (item: { productId: number; quantity: number; price: number }) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })
            ),
          }
        : undefined,
    },
    include: {
      customer: true,
      supplier: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json(order);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.order.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
