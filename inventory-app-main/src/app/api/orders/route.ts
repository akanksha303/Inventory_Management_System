import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const search = searchParams.get('search') || '';

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customer: { name: { contains: search } } },
      { supplier: { name: { contains: search } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: true,
      supplier: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Generate order number
  const count = await prisma.order.count({
    where: { type: body.type },
  });
  const prefix = body.type === 'sale' ? 'SO' : 'PO';
  const orderNumber = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      type: body.type,
      status: body.type === 'sale' ? 'quotation' : 'quotation_received',
      customerId: body.customerId || null,
      supplierId: body.supplierId || null,
      notes: body.notes || null,
      totalAmount: body.items.reduce(
        (sum: number, item: { quantity: number; price: number }) =>
          sum + item.quantity * item.price,
        0
      ),
      items: {
        create: body.items.map(
          (item: { productId: number; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })
        ),
      },
    },
    include: {
      customer: true,
      supplier: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
