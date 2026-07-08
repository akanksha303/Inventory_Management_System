import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search') || '';

  const products = await prisma.product.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { productCode: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { lastUpdated: 'desc' },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      productCode: body.productCode,
      name: body.name,
      description: body.description || null,
      weight: body.weight ? parseFloat(body.weight) : null,
      price: parseFloat(body.price),
      quantity: parseInt(body.quantity) || 0,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
