'use client';

import { useEffect, useState } from 'react';
import { Download, History as HistoryIcon, Search } from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';

interface Order {
  id: number;
  orderNumber: string;
  type: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  customer: { name: string } | null;
  supplier: { name: string } | null;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: { name: string; productCode: string };
  }>;
}

interface Batch {
  id: number;
  batchNumber: string;
  status: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  materials: Array<{ quantity: number; product: { name: string; productCode: string } }>;
  outputs: Array<{ quantity: number; product: { name: string; productCode: string } }>;
}

type TabType = 'all' | 'sales' | 'purchases' | 'manufacturing';

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [tab, setTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then((r) => r.json()),
      fetch('/api/manufacturing').then((r) => r.json()),
    ]).then(([o, b]) => {
      setOrders(o);
      setBatches(b);
      setLoading(false);
    });
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (tab === 'sales') return o.type === 'sale';
    if (tab === 'purchases') return o.type === 'purchase';
    if (tab === 'manufacturing') return false;
    return true;
  }).filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
    o.supplier?.name.toLowerCase().includes(search.toLowerCase())
  );

  const showManufacturing = tab === 'all' || tab === 'manufacturing';

  const filteredBatches = batches.filter(
    (b) =>
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.notes?.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    let csv = '';

    if (tab !== 'manufacturing') {
      csv += 'Order Number,Type,Status,Party,Total Amount,Date,Notes\n';
      filteredOrders.forEach((o) => {
        const party = o.type === 'sale' ? o.customer?.name || '' : o.supplier?.name || '';
        csv += `"${o.orderNumber}","${o.type}","${getStatusLabel(o.status)}","${party}","${o.totalAmount}","${formatDate(o.createdAt)}","${o.notes || ''}"\n`;
      });
    }

    if (showManufacturing && filteredBatches.length > 0) {
      if (csv) csv += '\n';
      csv += 'Batch Number,Status,Start Date,End Date,Notes\n';
      filteredBatches.forEach((b) => {
        csv += `"${b.batchNumber}","${getStatusLabel(b.status)}","${formatDate(b.startDate)}","${b.endDate ? formatDate(b.endDate) : ''}","${b.notes || ''}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-history-${tab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Order History</h1>
          <p className="page-subtitle">View and export past transactions</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" onClick={exportCSV} id="btn-export-csv">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['all', 'sales', 'purchases', 'manufacturing'] as TabType[]).map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
            id={`tab-${t}`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ maxWidth: 400, marginBottom: 20 }}>
        <div className="master-list-search">
          <Search />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="history-search"
          />
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div className="skeleton" style={{ width: '15%', height: 16 }} />
                <div className="skeleton" style={{ width: '20%', height: 16 }} />
                <div className="skeleton" style={{ width: '10%', height: 16 }} />
                <div className="skeleton" style={{ width: '15%', height: 16 }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          {tab !== 'manufacturing' && (
            <div className="card mb-4">
              <div className="card-header">
                <div className="card-title">
                  {tab === 'sales' ? 'Sales' : tab === 'purchases' ? 'Purchases' : 'Sales & Purchases'} Orders
                </div>
                <span className="badge badge-gray">{filteredOrders.length} records</span>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table" id="history-orders-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Type</th>
                      <th>Party</th>
                      <th>Items</th>
                      <th className="text-right">Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                        <td>
                          <span className={`badge ${order.type === 'sale' ? 'badge-blue' : 'badge-purple'}`}>
                            {order.type === 'sale' ? 'Sale' : 'Purchase'}
                          </span>
                        </td>
                        <td>
                          {order.type === 'sale'
                            ? order.customer?.name || '—'
                            : order.supplier?.name || '—'}
                        </td>
                        <td>{order.items.length} items</td>
                        <td className="text-right currency" style={{ fontWeight: 500 }}>
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="text-muted">{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center" style={{ padding: 40, color: 'var(--text-tertiary)' }}>
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Manufacturing Table */}
          {showManufacturing && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Manufacturing Batches</div>
                <span className="badge badge-gray">{filteredBatches.length} records</span>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table" id="history-mfg-table">
                  <thead>
                    <tr>
                      <th>Batch #</th>
                      <th>Materials</th>
                      <th>Outputs</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map((batch) => (
                      <tr key={batch.id}>
                        <td style={{ fontWeight: 600 }}>{batch.batchNumber}</td>
                        <td>
                          {batch.materials.map((m) => (
                            <div key={m.product.productCode} className="text-small">
                              {m.product.name} ×{m.quantity}
                            </div>
                          ))}
                        </td>
                        <td>
                          {batch.outputs.map((o) => (
                            <div key={o.product.productCode} className="text-small">
                              {o.product.name} ×{o.quantity}
                            </div>
                          ))}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(batch.status)}`}>
                            {getStatusLabel(batch.status)}
                          </span>
                        </td>
                        <td className="text-muted">{formatDate(batch.startDate)}</td>
                        <td className="text-muted">{batch.endDate ? formatDate(batch.endDate) : '—'}</td>
                        <td className="text-muted text-small">{batch.notes || '—'}</td>
                      </tr>
                    ))}
                    {filteredBatches.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center" style={{ padding: 40, color: 'var(--text-tertiary)' }}>
                          No manufacturing records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
