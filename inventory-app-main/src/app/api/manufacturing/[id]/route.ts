import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = await prisma.manufacturing.findUnique({
    where: { id: parseInt(id) },
    include: {
      materials: { include: { product: true } },
      outputs: { include: { product: true } },
    },
  });

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
  }

  return NextResponse.json(batch);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const batch = await prisma.manufacturing.update({
    where: { id: parseInt(id) },
    data: {
      notes: body.notes,
    },
    include: {
      materials: { include: { product: true } },
      outputs: { include: { product: true } },
    },
  });

  return NextResponse.json(batch);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Return raw materials to inventory before deleting
  const batch = await prisma.manufacturing.findUnique({
    where: { id: parseInt(id) },
    include: { materials: true },
  });

  if (batch && batch.status !== 'completed') {
    for (const mat of batch.materials) {
      await prisma.product.update({
        where: { id: mat.productId },
        data: { quantity: { increment: mat.quantity } },
      });
    }
  }

  await prisma.manufacturing.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ success: true });
}
