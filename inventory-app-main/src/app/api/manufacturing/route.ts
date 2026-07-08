import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const batches = await prisma.manufacturing.findMany({
    where,
    include: {
      materials: { include: { product: true } },
      outputs: { include: { product: true } },
    },
    orderBy: { startDate: 'desc' },
  });

  return NextResponse.json(batches);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const batch = await prisma.manufacturing.create({
    data: {
      batchNumber: body.batchNumber,
      notes: body.notes || null,
      materials: {
        create: body.materials.map(
          (m: { productId: number; quantity: number }) => ({
            productId: m.productId,
            quantity: m.quantity,
          })
        ),
      },
      outputs: {
        create: body.outputs.map(
          (o: { productId: number; quantity: number }) => ({
            productId: o.productId,
            quantity: o.quantity,
          })
        ),
      },
    },
    include: {
      materials: { include: { product: true } },
      outputs: { include: { product: true } },
    },
  });

  // Deduct raw materials from inventory on start
  for (const mat of body.materials) {
    await prisma.product.update({
      where: { id: mat.productId },
      data: { quantity: { decrement: mat.quantity } },
    });
  }

  return NextResponse.json(batch, { status: 201 });
}
