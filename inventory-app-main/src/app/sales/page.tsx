'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  X,
  Save,
  ArrowRight,
  Trash2,
  ShoppingCart,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';

interface Product {
  id: number;
  productCode: string;
  name: string;
  price: number;
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: number;
  orderNumber: string;
  type: string;
  status: string;
  customerId: number | null;
  customer: Customer | null;
  items: OrderItem[];
  notes: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

const SALE_STAGES = ['quotation', 'packing', 'dispatch', 'completed'];

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    customerId: '',
    notes: '',
    items: [{ productId: '', quantity: '', price: '' }],
  });

  const fetchOrders = useCallback(async () => {
    const res = await fetch(`/api/orders?type=sale&search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchOrders();
    fetch('/api/products').then((r) => r.json()).then(setProducts);
    fetch('/api/customers').then((r) => r.json()).then(setCustomers);
  }, [fetchOrders]);

  const openCreate = () => {
    setForm({
      customerId: '',
      notes: '',
      items: [{ productId: '', quantity: '', price: '' }],
    });
    setShowModal(true);
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productId: '', quantity: '', price: '' }],
    });
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill price when product is selected
    if (field === 'productId') {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) {
        newItems[index].price = product.price.toString();
      }
    }

    setForm({ ...form, items: newItems });
  };

  const getFormTotal = () => {
    return form.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
    }, 0);
  };

  const handleSave = async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sale',
        customerId: form.customerId ? parseInt(form.customerId) : null,
        notes: form.notes || null,
        items: form.items
          .filter((item) => item.productId)
          .map((item) => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
          })),
      }),
    });

    if (res.ok) {
      const saved = await res.json();
      setShowModal(false);
      await fetchOrders();
      setSelected(saved);
    }
  };

  const handleAdvance = async () => {
    if (!selected) return;
    const res = await fetch(`/api/orders/${selected.id}/advance`, {
      method: 'POST',
    });
    if (res.ok) {
      const updated = await res.json();
      setSelected(updated);
      await fetchOrders();
    }
  };

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this order?')) return;
    await fetch(`/api/orders/${selected.id}`, { method: 'DELETE' });
    setSelected(null);
    await fetchOrders();
  };

  const getNextStageLabel = (status: string) => {
    const map: Record<string, string> = {
      quotation: 'Move to Packing',
      packing: 'Move to Dispatch',
      dispatch: 'Mark Completed',
    };
    return map[status];
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Sales Orders</h1>
          <p className="page-subtitle">Manage customer sales and quotations</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate} id="btn-new-sale">
            <Plus size={16} /> New Sale Order
          </button>
        </div>
      </div>

      <div className="master-detail">
        {/* Master List */}
        <div className="master-list">
          <div className="master-list-header">
            <div className="master-list-search">
              <Search />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="sale-search"
              />
            </div>
            <div className="text-small text-muted">{orders.length} orders</div>
          </div>
          <div className="master-list-items">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="master-list-item" style={{ padding: 16 }}>
                  <div className="skeleton" style={{ width: '50%', height: 14, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '70%', height: 12 }} />
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart />
                <div className="empty-state-title">No sales orders</div>
                <div className="empty-state-text">Create your first sale order</div>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className={`master-list-item ${selected?.id === order.id ? 'active' : ''}`}
                  onClick={() => setSelected(order)}
                >
                  <div className="master-list-item-title">{order.orderNumber}</div>
                  <div className="master-list-item-subtitle">
                    {order.customer?.name || 'No customer'}
                  </div>
                  <div className="master-list-item-meta">
                    <span className="currency" style={{ fontWeight: 600, fontSize: 13 }}>
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="detail-panel">
          {selected ? (
            <>
              <div className="detail-panel-header">
                <div>
                  <div className="detail-panel-title">{selected.orderNumber}</div>
                  <div className="text-small text-muted mt-2">
                    Created {formatDate(selected.createdAt)}
                  </div>
                </div>
                <div className="detail-panel-actions">
                  <button className="btn btn-outline btn-sm print-btn" onClick={() => window.print()} title="Print order">
                    <Printer size={14} /> Print
                  </button>
                  {selected.status !== 'completed' && (
                    <button className="btn btn-success btn-sm" onClick={handleAdvance} id="btn-advance-sale">
                      <ChevronRight size={14} /> {getNextStageLabel(selected.status)}
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={handleDelete} id="btn-delete-sale">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="detail-panel-body">
                {/* Pipeline */}
                <div className="pipeline">
                  {SALE_STAGES.map((stage) => {
                    const currentIdx = SALE_STAGES.indexOf(selected.status);
                    const stageIdx = SALE_STAGES.indexOf(stage);
                    let cls = 'pipeline-stage';
                    if (stageIdx < currentIdx) cls += ' completed';
                    else if (stageIdx === currentIdx) cls += ' active';
                    return (
                      <div key={stage} className={cls}>
                        {getStatusLabel(stage)}
                      </div>
                    );
                  })}
                </div>

                {/* Customer Info */}
                <div className="detail-section">
                  <div className="detail-section-title">Customer Information</div>
                  {selected.customer ? (
                    <div className="detail-grid">
                      <div className="detail-field">
                        <span className="detail-field-label">Name</span>
                        <span className="detail-field-value">{selected.customer.name}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-field-label">Email</span>
                        <span className="detail-field-value">{selected.customer.email || '—'}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-field-label">Phone</span>
                        <span className="detail-field-value">{selected.customer.phone || '—'}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-field-label">Address</span>
                        <span className="detail-field-value">{selected.customer.address || '—'}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted text-small">No customer assigned</p>
                  )}
                </div>

                {/* Order Items */}
                <div className="detail-section">
                  <div className="detail-section-title">Order Items ({selected.items.length})</div>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Code</th>
                          <th className="text-right">Qty</th>
                          <th className="text-right">Price</th>
                          <th className="text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map((item) => (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 500 }}>{item.product.name}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                              {item.product.productCode}
                            </td>
                            <td className="text-right">{item.quantity}</td>
                            <td className="text-right currency">{formatCurrency(item.price)}</td>
                            <td className="text-right currency" style={{ fontWeight: 600 }}>
                              {formatCurrency(item.quantity * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="items-total">
                    <span>Total Amount:</span>
                    <span className="currency" style={{ fontSize: 18, color: 'var(--accent-blue)' }}>
                      {formatCurrency(selected.totalAmount)}
                    </span>
                  </div>
                </div>

                {selected.notes && (
                  <div className="detail-section">
                    <div className="detail-section-title">Notes</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.notes}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>
              <ShoppingCart />
              <div className="empty-state-title">Select an order</div>
              <div className="empty-state-text">Choose an order from the list to view details</div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Sale Order</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <select
                    className="form-select"
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    id="select-customer"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input
                    className="form-input"
                    placeholder="Order notes..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    id="input-sale-notes"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Order Items</label>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Product</th>
                      <th>Quantity</th>
                      <th>Price (₹)</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-select"
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          >
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.productCode} — {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            min="1"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                          />
                        </td>
                        <td className="currency text-right" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {formatCurrency(
                            (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)
                          )}
                        </td>
                        <td>
                          {form.items.length > 1 && (
                            <button className="btn btn-ghost" onClick={() => removeItem(index)}>
                              <Trash2 size={14} color="var(--accent-red)" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn btn-outline btn-sm mt-2" onClick={addItem} id="btn-add-item">
                  <Plus size={14} /> Add Product
                </button>
                <div className="items-total">
                  <span>Order Total:</span>
                  <span className="currency" style={{ fontSize: 18, color: 'var(--accent-blue)' }}>
                    {formatCurrency(getFormTotal())}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} id="btn-save-sale">
                <Save size={16} /> Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
