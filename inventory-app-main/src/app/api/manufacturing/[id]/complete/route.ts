import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Mark manufacturing batch as completed & add outputs to inventory
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const batch = await prisma.manufacturing.findUnique({
    where: { id: parseInt(id) },
    include: { outputs: true },
  });

  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
  }

  if (batch.status === 'completed') {
    return NextResponse.json(
      { error: 'Batch is already completed' },
      { status: 400 }
    );
  }

  // Add output products to inventory
  for (const output of batch.outputs) {
    await prisma.product.update({
      where: { id: output.productId },
      data: { quantity: { increment: output.quantity } },
    });
  }

  const updated = await prisma.manufacturing.update({
    where: { id: parseInt(id) },
    data: {
      status: 'completed',
      endDate: new Date(),
    },
    include: {
      materials: { include: { product: true } },
      outputs: { include: { product: true } },
    },
  });

  return NextResponse.json(updated);
}
