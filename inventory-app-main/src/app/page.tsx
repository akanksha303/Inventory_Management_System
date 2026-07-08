'use client';

import { useEffect, useState } from 'react';
import {
  Package,
  IndianRupee,
  AlertTriangle,
  ShoppingCart,
  Truck,
  Factory,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Plus,
  BarChart3,
  FileText,
  Activity,
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

interface DashboardData {
  totalProducts: number;
  inventoryValue: number;
  lowStockProducts: number;
  pendingSalesOrders: number;
  pendingPurchaseOrders: number;
  activeManufacturing: number;
  recentSalesOrders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    customer: { name: string } | null;
  }>;
  recentPurchaseOrders: Array<{
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    supplier: { name: string } | null;
  }>;
  topProductsByValue: Array<{ name: string; value: number; quantity: number }>;
  stockLevels: Array<{ name: string; stock: number; low: boolean }>;
  salesStatusChart: Array<{ name: string; value: number }>;
  totalSalesRevenue: number;
  totalPurchasesCost: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Array<{
    id: string; type: string; title: string; description: string; timestamp: string; status: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
    fetch('/api/activity')
      .then((res) => res.json())
      .then(setActivities);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of your inventory operations</p>
          </div>
        </div>
        <div className="stat-cards">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 44, height: 44 }} />
              <div className="stat-card-info">
                <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: 120, height: 24 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="dashboard-grid">
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="skeleton" style={{ width: '100%', height: 240 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory operations</p>
        </div>
      </div>

      {/* Quick Access Panel */}
      <div className="quick-access">
        <Link href="/sales" className="quick-access-btn blue" id="qa-new-sale">
          <div className="quick-access-icon"><ShoppingCart size={20} /></div>
          <span>New Sale Order</span>
        </Link>
        <Link href="/purchases" className="quick-access-btn purple" id="qa-new-purchase">
          <div className="quick-access-icon"><Truck size={20} /></div>
          <span>New Purchase</span>
        </Link>
        <Link href="/products" className="quick-access-btn green" id="qa-add-product">
          <div className="quick-access-icon"><Plus size={20} /></div>
          <span>Add Product</span>
        </Link>
        <Link href="/manufacturing" className="quick-access-btn amber" id="qa-new-batch">
          <div className="quick-access-icon"><Factory size={20} /></div>
          <span>New Batch</span>
        </Link>
        <Link href="/history" className="quick-access-btn indigo" id="qa-history">
          <div className="quick-access-icon"><FileText size={20} /></div>
          <span>View History</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        <div className="stat-card" id="stat-total-products">
          <div className="stat-card-icon blue">
            <Package size={22} />
          </div>
          <div className="stat-card-info">
            <div className="stat-card-label">Total Products</div>
            <div className="stat-card-value">{data.totalProducts}</div>
          </div>
        </div>

        <div className="stat-card" id="stat-inventory-value">
          <div className="stat-card-icon green">
            <IndianRupee size={22} />
          </div>
          <div className="stat-card-info">
            <div className="stat-card-label">Inventory Value</div>
            <div className="stat-card-value currency">{formatCurrency(data.inventoryValue)}</div>
          </div>
        </div>

        <div className="stat-card" id="stat-low-stock">
          <div className="stat-card-icon red">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-card-info">
            <div className="stat-card-label">Low Stock Items</div>
            <div className="stat-card-value">{data.lowStockProducts}</div>
          </div>
        </div>

        <div className="stat-card" id="stat-revenue">
          <div className="stat-card-icon green">
            <TrendingUp size={22} />
          </div>
          <div className="stat-card-info">
            <div className="stat-card-label">Total Sales</div>
            <div className="stat-card-value currency">{formatCurrency(data.totalSalesRevenue)}</div>
          </div>
        </div>

        <div className="stat-card" id="stat-purchases-total">
          <div className="stat-card-icon purple">
            <TrendingDown size={22} />
          </div>
          <div className="stat-card-info">
            <div className="stat-card-label">Total Purchases</div>
            <div className="stat-card-value currency">{formatCurrency(data.totalPurchasesCost)}</div>
          </div>
        </div>

        <div className="stat-card" id="stat-active-mfg">
          <div className="stat-card-icon amber">
            <Factory size={22} />
          </div>
          <div className="stat-card-info">
            <div className="stat-card-label">Active WIP</div>
            <div className="stat-card-value">{data.activeManufacturing}</div>
            <div className="stat-card-trend">Manufacturing Batches</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid">
        {/* Stock Levels Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={16} />
              Stock Levels
            </div>
            <Link href="/products" className="btn btn-ghost btn-sm">
              All Products <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockLevels} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tick={{ fill: 'var(--text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  fontSize={11}
                  tick={{ fill: 'var(--text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: 'var(--shadow-md)',
                  }}
                  formatter={(value) => [`${value} units`, 'Stock']}
                />
                <Bar dataKey="stock" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {data.stockLevels.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.low ? '#ef4444' : '#3b82f6'}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products by Value */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IndianRupee size={16} />
              Top Products by Value
            </div>
          </div>
          <div className="card-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProductsByValue} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis
                  type="number"
                  fontSize={11}
                  tick={{ fill: 'var(--text-tertiary)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  fontSize={11}
                  tick={{ fill: 'var(--text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: 'var(--shadow-md)',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Value']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {data.topProductsByValue.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][index % 6]}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row: Pie Chart + Recent Orders */}
      <div className="dashboard-grid-3">
        {/* Sales Status Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Sales by Status</div>
          </div>
          <div className="card-body" style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {data.salesStatusChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.salesStatusChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {data.salesStatusChart.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [
                      `${value} orders`,
                      getStatusLabel(String(name)),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-small">No sales data yet</p>
            )}
          </div>
          {/* Legend */}
          <div className="chart-legend">
            {data.salesStatusChart.map((entry, i) => (
              <div key={entry.name} className="chart-legend-item">
                <span
                  className="chart-legend-dot"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span>{getStatusLabel(entry.name)}</span>
                <span className="chart-legend-count">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales — compact */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} />
              Recent Sales
            </div>
            <Link href="/sales" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body compact-list">
            {data.recentSalesOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="compact-list-item">
                <div className="compact-list-left">
                  <div className="compact-list-title">{order.orderNumber}</div>
                  <div className="compact-list-sub">{order.customer?.name || '—'}</div>
                </div>
                <div className="compact-list-right">
                  <div className="compact-list-amount currency">{formatCurrency(order.totalAmount)}</div>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
            {data.recentSalesOrders.length === 0 && (
              <p className="text-muted text-small" style={{ padding: 20, textAlign: 'center' }}>No sales yet</p>
            )}
          </div>
        </div>

        {/* Recent Purchases — compact */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={16} />
              Recent Purchases
            </div>
            <Link href="/purchases" className="btn btn-ghost btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body compact-list">
            {data.recentPurchaseOrders.slice(0, 4).map((order) => (
              <div key={order.id} className="compact-list-item">
                <div className="compact-list-left">
                  <div className="compact-list-title">{order.orderNumber}</div>
                  <div className="compact-list-sub">{order.supplier?.name || '—'}</div>
                </div>
                <div className="compact-list-right">
                  <div className="compact-list-amount currency">{formatCurrency(order.totalAmount)}</div>
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
            {data.recentPurchaseOrders.length === 0 && (
              <p className="text-muted text-small" style={{ padding: 20, textAlign: 'center' }}>No purchases yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} />
            Recent Activity
          </div>
        </div>
        <div className="card-body compact-list">
          {activities.slice(0, 8).map((activity) => (
            <div key={activity.id} className="compact-list-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: activity.type === 'sale' ? 'var(--accent-blue-light)'
                    : activity.type === 'purchase' ? 'var(--accent-purple-light)'
                    : 'var(--accent-amber-light)',
                  color: activity.type === 'sale' ? 'var(--accent-blue)'
                    : activity.type === 'purchase' ? 'var(--accent-purple)'
                    : 'var(--accent-amber)',
                }}>
                  {activity.type === 'sale' ? <ShoppingCart size={14} />
                    : activity.type === 'purchase' ? <Truck size={14} />
                    : <Factory size={14} />}
                </div>
                <div className="compact-list-left">
                  <div className="compact-list-title">{activity.title}</div>
                  <div className="compact-list-sub">{activity.description}</div>
                </div>
              </div>
              <div className="compact-list-right">
                <span className="text-small text-muted" style={{ whiteSpace: 'nowrap' }}>
                  {formatDateTime(activity.timestamp)}
                </span>
                <span className={`badge ${getStatusBadgeClass(activity.status)}`}>
                  {getStatusLabel(activity.status)}
                </span>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-muted text-small" style={{ padding: 20, textAlign: 'center' }}>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
