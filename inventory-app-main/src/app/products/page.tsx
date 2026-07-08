'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  X,
  Save,
  Printer,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Product {
  id: number;
  productCode: string;
  name: string;
  description: string | null;
  weight: number | null;
  price: number;
  quantity: number;
  lastUpdated: string;
}

type SortKey = 'name' | 'productCode' | 'price' | 'quantity' | 'lastUpdated';
type SortDir = 'asc' | 'desc';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [form, setForm] = useState({
    productCode: '',
    name: '',
    description: '',
    weight: '',
    price: '',
    quantity: '',
  });

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`/api/products?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sortable products
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let valA: string | number = a[sortKey] ?? '';
      let valB: string | number = b[sortKey] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown size={12} className="sort-icon" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="sort-icon active" />
      : <ArrowDown size={12} className="sort-icon active" />;
  };

  const lowStockCount = products.filter((p) => p.quantity < 50).length;

  const openCreate = () => {
    setForm({ productCode: '', name: '', description: '', weight: '', price: '', quantity: '' });
    setEditMode(false);
    setShowModal(true);
  };

  const openEdit = () => {
    if (!selected) return;
    setForm({
      productCode: selected.productCode,
      name: selected.name,
      description: selected.description || '',
      weight: selected.weight?.toString() || '',
      price: selected.price.toString(),
      quantity: selected.quantity.toString(),
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editMode ? `/api/products/${selected!.id}` : '/api/products';
    const method = editMode ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const saved = await res.json();
      setShowModal(false);
      await fetchProducts();
      setSelected(saved);
    }
  };

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this product?')) return;
    await fetch(`/api/products/${selected.id}`, { method: 'DELETE' });
    setSelected(null);
    await fetchProducts();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product inventory</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate} id="btn-add-product">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Low stock alert bar */}
      {lowStockCount > 0 && (
        <div className="low-stock-bar">
          <AlertTriangle size={14} />
          <span><strong>{lowStockCount}</strong> product{lowStockCount > 1 ? 's' : ''} below reorder point (50 units)</span>
        </div>
      )}

      <div className="master-detail">
        {/* Master List */}
        <div className="master-list">
          <div className="master-list-header">
            <div className="master-list-search">
              <Search />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="product-search"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="text-small text-muted">
                {products.length} products
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className={`btn btn-ghost btn-sm ${sortKey === 'name' ? '' : ''}`}
                  onClick={() => handleSort('name')}
                  title="Sort by name"
                  style={{ fontSize: 11 }}
                >
                  Name <SortIcon column="name" />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleSort('quantity')}
                  title="Sort by quantity"
                  style={{ fontSize: 11 }}
                >
                  Qty <SortIcon column="quantity" />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleSort('price')}
                  title="Sort by price"
                  style={{ fontSize: 11 }}
                >
                  Price <SortIcon column="price" />
                </button>
              </div>
            </div>
          </div>
          <div className="master-list-items">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="master-list-item" style={{ padding: 16 }}>
                  <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '40%', height: 12 }} />
                </div>
              ))
            ) : sortedProducts.length === 0 ? (
              <div className="empty-state">
                <Package />
                <div className="empty-state-title">No products found</div>
                <div className="empty-state-text">Add your first product to get started</div>
              </div>
            ) : (
              sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className={`master-list-item ${selected?.id === product.id ? 'active' : ''}`}
                  onClick={() => setSelected(product)}
                >
                  <div className="master-list-item-title">{product.name}</div>
                  <div className="master-list-item-subtitle">{product.productCode}</div>
                  <div className="master-list-item-meta">
                    <span className="currency" style={{ fontWeight: 600, fontSize: 13 }}>
                      {formatCurrency(product.price)}
                    </span>
                    <span className={`badge ${product.quantity < 50 ? 'badge-red' : 'badge-green'}`}>
                      Qty: {product.quantity}
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
                <div className="detail-panel-title">{selected.name}</div>
                <div className="detail-panel-actions">
                  <button className="btn btn-outline btn-sm print-btn" onClick={handlePrint} title="Print details">
                    <Printer size={14} /> Print
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={openEdit} id="btn-edit-product">
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete} id="btn-delete-product">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
              <div className="detail-panel-body">
                <div className="detail-section">
                  <div className="detail-section-title">Product Information</div>
                  <div className="detail-grid">
                    <div className="detail-field">
                      <span className="detail-field-label">Product Code</span>
                      <span className="detail-field-value" style={{ fontFamily: 'monospace' }}>
                        {selected.productCode}
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">Price</span>
                      <span className="detail-field-value currency">
                        {formatCurrency(selected.price)}
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">Quantity in Stock</span>
                      <span className="detail-field-value">
                        {selected.quantity} units
                        {selected.quantity < 50 && (
                          <span className="badge badge-red" style={{ marginLeft: 8 }}>Low Stock</span>
                        )}
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">Weight</span>
                      <span className="detail-field-value">
                        {selected.weight ? `${selected.weight} kg` : '—'}
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">Total Value</span>
                      <span className="detail-field-value currency" style={{ color: 'var(--accent-green)' }}>
                        {formatCurrency(selected.price * selected.quantity)}
                      </span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field-label">Last Updated</span>
                      <span className="detail-field-value">
                        {formatDateTime(selected.lastUpdated)}
                      </span>
                    </div>
                  </div>
                </div>

                {selected.description && (
                  <div className="detail-section">
                    <div className="detail-section-title">Description</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {selected.description}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>
              <Package />
              <div className="empty-state-title">Select a product</div>
              <div className="empty-state-text">
                Choose a product from the list to view its details
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editMode ? 'Edit Product' : 'Add New Product'}
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Code</label>
                  <input
                    className="form-input"
                    placeholder="e.g., PRD-011"
                    value={form.productCode}
                    onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                    id="input-product-code"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    className="form-input"
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    id="input-product-name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Product description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  id="input-product-desc"
                />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    id="input-product-price"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    id="input-product-qty"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    id="input-product-weight"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} id="btn-save-product">
                <Save size={16} /> {editMode ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
