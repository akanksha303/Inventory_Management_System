import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const [
    totalProducts,
    lowStockProducts,
    pendingSalesOrders,
    pendingPurchaseOrders,
    activeManufacturing,
    recentSalesOrders,
    recentPurchaseOrders,
    products,
    allSalesOrders,
    allPurchaseOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({
      where: { quantity: { lt: 50 } },
    }),
    prisma.order.count({
      where: {
        type: 'sale',
        status: { not: 'completed' },
      },
    }),
    prisma.order.count({
      where: {
        type: 'purchase',
        status: { not: 'completed' },
      },
    }),
    prisma.manufacturing.count({
      where: { status: 'in_progress' },
    }),
    prisma.order.findMany({
      where: { type: 'sale' },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.order.findMany({
      where: { type: 'purchase' },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.product.findMany({
      orderBy: { quantity: 'asc' },
    }),
    prisma.order.findMany({
      where: { type: 'sale' },
      select: { status: true, totalAmount: true },
    }),
    prisma.order.findMany({
      where: { type: 'purchase' },
      select: { status: true, totalAmount: true },
    }),
  ]);

  // Inventory value
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  // Top 6 products by stock value for bar chart
  const topProductsByValue = products
    .map((p) => ({
      name: p.name.length > 18 ? p.name.slice(0, 16) + '…' : p.name,
      value: p.price * p.quantity,
      quantity: p.quantity,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Stock levels for bar chart
  const stockLevels = products.slice(0, 8).map((p) => ({
    name: p.name.length > 14 ? p.name.slice(0, 12) + '…' : p.name,
    stock: p.quantity,
    low: p.quantity < 50,
  }));

  // Sales order status distribution for pie chart
  const salesByStatus: Record<string, number> = {};
  allSalesOrders.forEach((o) => {
    salesByStatus[o.status] = (salesByStatus[o.status] || 0) + 1;
  });

  const salesStatusChart = Object.entries(salesByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // Revenue vs purchases
  const totalSalesRevenue = allSalesOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalPurchasesCost = allPurchaseOrders.reduce((s, o) => s + o.totalAmount, 0);

  return NextResponse.json({
    totalProducts,
    inventoryValue,
    lowStockProducts,
    pendingSalesOrders,
    pendingPurchaseOrders,
    activeManufacturing,
    recentSalesOrders,
    recentPurchaseOrders,
    topProductsByValue,
    stockLevels,
    salesStatusChart,
    totalSalesRevenue,
    totalPurchasesCost,
  });
}
