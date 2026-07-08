import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Move order to next stage & auto-update inventory
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  let nextStatus = '';

  if (order.type === 'sale') {
    const saleFlow: Record<string, string> = {
      quotation: 'packing',
      packing: 'dispatch',
      dispatch: 'completed',
    };
    nextStatus = saleFlow[order.status] || '';

    // Deduct inventory on dispatch
    if (order.status === 'packing' && nextStatus === 'dispatch') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }
  } else {
    const purchaseFlow: Record<string, string> = {
      quotation_received: 'unpaid',
      unpaid: 'paid',
      paid: 'completed',
    };
    nextStatus = purchaseFlow[order.status] || '';

    // Add inventory on completion
    if (order.status === 'paid' && nextStatus === 'completed') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }
  }

  if (!nextStatus) {
    return NextResponse.json(
      { error: 'Order cannot be advanced further' },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: parseInt(id) },
    data: { status: nextStatus },
    include: {
      customer: true,
      supplier: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json(updated);
}
