import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  // Fetch recent orders and manufacturing to build an activity feed
  const [recentOrders, recentManufacturing] = await Promise.all([
    prisma.order.findMany({
      include: { customer: true, supplier: true },
      orderBy: { updatedAt: 'desc' },
      take: 8,
    }),
    prisma.manufacturing.findMany({
      orderBy: { startDate: 'desc' },
      take: 4,
    }),
  ]);

  const activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
  }> = [];

  recentOrders.forEach((order) => {
    const partyName =
      order.type === 'sale'
        ? order.customer?.name || 'Unknown'
        : order.supplier?.name || 'Unknown';
    activities.push({
      id: `order-${order.id}`,
      type: order.type === 'sale' ? 'sale' : 'purchase',
      title: `${order.orderNumber}`,
      description: `${order.type === 'sale' ? 'Sale to' : 'Purchase from'} ${partyName} — ₹${order.totalAmount.toLocaleString('en-IN')}`,
      timestamp: order.updatedAt.toISOString(),
      status: order.status,
    });
  });

  recentManufacturing.forEach((mfg) => {
    activities.push({
      id: `mfg-${mfg.id}`,
      type: 'manufacturing',
      title: mfg.batchNumber,
      description: `Manufacturing batch ${mfg.status === 'completed' ? 'completed' : 'in progress'}`,
      timestamp: mfg.startDate.toISOString(),
      status: mfg.status,
    });
  });

  // Sort by timestamp descending
  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json(activities.slice(0, 10));
}
