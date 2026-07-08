'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  X,
  Save,
  Trash2,
  Factory,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';

interface Product {
  id: number;
  productCode: string;
  name: string;
  price: number;
}

interface WIPItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

interface Batch {
  id: number;
  batchNumber: string;
  status: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  materials: WIPItem[];
  outputs: WIPItem[];
}

export default function ManufacturingPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<Batch | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    batchNumber: '',
    notes: '',
    materials: [{ productId: '', quantity: '' }],
    outputs: [{ productId: '', quantity: '' }],
  });

  const fetchBatches = useCallback(async () => {
    const res = await fetch('/api/manufacturing');
    const data = await res.json();
    setBatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBatches();
    fetch('/api/products').then((r) => r.json()).then(setProducts);
  }, [fetchBatches]);

  const openCreate = () => {
    setForm({
      batchNumber: `MFG-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, '0')}`,
      notes: '',
      materials: [{ productId: '', quantity: '' }],
      outputs: [{ productId: '', quantity: '' }],
    });
    setShowModal(true);
  };

  const addMaterial = () => {
    setForm({ ...form, materials: [...form.materials, { productId: '', quantity: '' }] });
  };

  const addOutput = () => {
    setForm({ ...form, outputs: [...form.outputs, { productId: '', quantity: '' }] });
  };

  const updateMaterial = (index: number, field: string, value: string) => {
    const arr = [...form.materials];
    arr[index] = { ...arr[index], [field]: value };
    setForm({ ...form, materials: arr });
  };

  const updateOutput = (index: number, field: string, value: string) => {
    const arr = [...form.outputs];
    arr[index] = { ...arr[index], [field]: value };
    setForm({ ...form, outputs: arr });
  };

  const removeMaterial = (index: number) => {
    setForm({ ...form, materials: form.materials.filter((_, i) => i !== index) });
  };

  const removeOutput = (index: number) => {
    setForm({ ...form, outputs: form.outputs.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    const res = await fetch('/api/manufacturing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchNumber: form.batchNumber,
        notes: form.notes || null,
        materials: form.materials
          .filter((m) => m.productId)
          .map((m) => ({ productId: parseInt(m.productId), quantity: parseInt(m.quantity) || 1 })),
        outputs: form.outputs
          .filter((o) => o.productId)
          .map((o) => ({ productId: parseInt(o.productId), quantity: parseInt(o.quantity) || 1 })),
      }),
    });
    if (res.ok) {
      const saved = await res.json();
      setShowModal(false);
      await fetchBatches();
      setSelected(saved);
    }
  };

  const handleComplete = async () => {
    if (!selected || !confirm('Mark this batch as completed? Output products will be added to inventory.')) return;
    const res = await fetch(`/api/manufacturing/${selected.id}/complete`, { method: 'POST' });
    if (res.ok) {
      const updated = await res.json();
      setSelected(updated);
      await fetchBatches();
    }
  };

  const handleDelete = async () => {
    if (!selected || !confirm('Delete this manufacturing batch?')) return;
    await fetch(`/api/manufacturing/${selected.id}`, { method: 'DELETE' });
    setSelected(null);
    await fetchBatches();
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.notes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Manufacturing (WIP)</h1>
          <p className="page-subtitle">Track work-in-progress batches</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate} id="btn-new-batch">
            <Plus size={16} /> New Batch
          </button>
        </div>
      </div>

      <div className="master-detail">
        <div className="master-list">
          <div className="master-list-header">
            <div className="master-list-search">
              <Search />
              <input
                type="text"
                placeholder="Search batches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="mfg-search"
              />
            </div>
            <div className="text-small text-muted">{filteredBatches.length} batches</div>
          </div>
          <div className="master-list-items">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="master-list-item" style={{ padding: 16 }}>
                  <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '40%', height: 12 }} />
                </div>
              ))
            ) : filteredBatches.length === 0 ? (
              <div className="empty-state">
                <Factory />
                <div className="empty-state-title">No batches</div>
                <div className="empty-state-text">Start a new manufacturing batch</div>
              </div>
            ) : (
              filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className={`master-list-item ${selected?.id === batch.id ? 'active' : ''}`}
                  onClick={() => setSelected(batch)}
                >
                  <div className="master-list-item-title">{batch.batchNumber}</div>
                  <div className="master-list-item-subtitle">{batch.notes || 'No description'}</div>
                  <div className="master-list-item-meta">
                    <span className="text-small text-muted">{formatDate(batch.startDate)}</span>
                    <span className={`badge ${getStatusBadgeClass(batch.status)}`}>
                      {getStatusLabel(batch.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="detail-panel">
          {selected ? (
            <>
              <div className="detail-panel-header">
                <div>
                  <div className="detail-panel-title">{selected.batchNumber}</div>
                  <div className="text-small text-muted mt-2">
                    Started {formatDate(selected.startDate)}
                    {selected.endDate && ` • Completed ${formatDate(selected.endDate)}`}
                  </div>
                </div>
                <div className="detail-panel-actions">
                  {selected.status === 'in_progress' && (
                    <button className="btn btn-success btn-sm" onClick={handleComplete} id="btn-complete-batch">
                      <CheckCircle size={14} /> Mark Complete
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={handleDelete} id="btn-delete-batch">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="detail-panel-body">
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  <span className={`badge ${getStatusBadgeClass(selected.status)}`} style={{ fontSize: 13, padding: '4px 14px' }}>
                    {getStatusLabel(selected.status)}
                  </span>
                </div>

                {/* Raw Materials */}
                <div className="detail-section">
                  <div className="detail-section-title">Raw Materials (Input)</div>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Code</th>
                          <th className="text-right">Qty Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.materials.map((mat) => (
                          <tr key={mat.id}>
                            <td style={{ fontWeight: 500 }}>{mat.product.name}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{mat.product.productCode}</td>
                            <td className="text-right">{mat.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Outputs */}
                <div className="detail-section">
                  <div className="detail-section-title">Output Products</div>
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Code</th>
                          <th className="text-right">Qty Produced</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.outputs.map((out) => (
                          <tr key={out.id}>
                            <td style={{ fontWeight: 500 }}>{out.product.name}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{out.product.productCode}</td>
                            <td className="text-right">{out.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              <Factory />
              <div className="empty-state-title">Select a batch</div>
              <div className="empty-state-text">Choose a manufacturing batch to view details</div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Manufacturing Batch</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Batch Number</label>
                  <input className="form-input" value={form.batchNumber}
                    onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} id="input-batch-number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" placeholder="Batch description..."
                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} id="input-batch-notes" />
                </div>
              </div>

              {/* Raw Materials */}
              <div className="form-group">
                <label className="form-label">Raw Materials (Deducted from inventory)</label>
                <table className="items-table">
                  <thead><tr><th style={{ width: '60%' }}>Product</th><th>Quantity</th><th></th></tr></thead>
                  <tbody>
                    {form.materials.map((mat, index) => (
                      <tr key={index}>
                        <td>
                          <select className="form-select" value={mat.productId}
                            onChange={(e) => updateMaterial(index, 'productId', e.target.value)}>
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.productCode} — {p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input className="form-input" type="number" min="1" placeholder="1"
                            value={mat.quantity} onChange={(e) => updateMaterial(index, 'quantity', e.target.value)} />
                        </td>
                        <td>
                          {form.materials.length > 1 && (
                            <button className="btn btn-ghost" onClick={() => removeMaterial(index)}>
                              <Trash2 size={14} color="var(--accent-red)" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn btn-outline btn-sm mt-2" onClick={addMaterial}>
                  <Plus size={14} /> Add Material
                </button>
              </div>

              {/* Outputs */}
              <div className="form-group mt-4">
                <label className="form-label">Output Products (Added to inventory on completion)</label>
                <table className="items-table">
                  <thead><tr><th style={{ width: '60%' }}>Product</th><th>Quantity</th><th></th></tr></thead>
                  <tbody>
                    {form.outputs.map((out, index) => (
                      <tr key={index}>
                        <td>
                          <select className="form-select" value={out.productId}
                            onChange={(e) => updateOutput(index, 'productId', e.target.value)}>
                            <option value="">Select product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.productCode} — {p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input className="form-input" type="number" min="1" placeholder="1"
                            value={out.quantity} onChange={(e) => updateOutput(index, 'quantity', e.target.value)} />
                        </td>
                        <td>
                          {form.outputs.length > 1 && (
                            <button className="btn btn-ghost" onClick={() => removeOutput(index)}>
                              <Trash2 size={14} color="var(--accent-red)" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn btn-outline btn-sm mt-2" onClick={addOutput}>
                  <Plus size={14} /> Add Output
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} id="btn-save-batch">
                <Save size={16} /> Create Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
