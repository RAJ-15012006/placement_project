import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { customers as customersApi, products as productsApi, challans as challansApi } from '../../services/api';
import { Customer, Product, ChallanItem } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function CreateChallanPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);

  // Customer selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDropdown, setCustomerDropdown] = useState(false);

  // Product selection
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [productDropdown, setProductDropdown] = useState(false);
  const [lineItems, setLineItems] = useState<ChallanItem[]>([]);

  // Saving
  const [saving, setSaving] = useState(false);
  const [saveAs, setSaveAs] = useState<'draft' | 'confirmed'>('draft');

  const productSearchRef = useRef<HTMLDivElement>(null);

  // Search customers
  useEffect(() => {
    if (!customerSearch.trim()) { setCustomerResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await customersApi.getAll({ search: customerSearch, limit: 8 });
        setCustomerResults(res.data.customers || res.data.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  // Search products
  useEffect(() => {
    if (!productSearch.trim()) { setProductResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await productsApi.getAll({ search: productSearch, limit: 8 });
        setProductResults(res.data.products || res.data.data || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch]);

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustomerSearch(c.name);
    setCustomerDropdown(false);
  };

  const addProduct = (p: Product) => {
    const exists = lineItems.find(l => l.product_id === p.id);
    if (exists) { showToast('Product already added', 'warning'); return; }
    setLineItems(prev => [...prev, {
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      unit_price: Number(p.unit_price),
      quantity: 1,
      current_stock: p.current_stock,
    }]);
    setProductSearch('');
    setProductResults([]);
    setProductDropdown(false);
  };

  const updateQty = (product_id: number, qty: number) => {
    setLineItems(prev => prev.map(l => l.product_id === product_id ? { ...l, quantity: qty } : l));
  };

  const removeItem = (product_id: number) => {
    setLineItems(prev => prev.filter(l => l.product_id !== product_id));
  };

  const totalQty = lineItems.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lineItems.reduce((s, l) => s + l.quantity * l.unit_price, 0);

  const handleSubmit = async (status: 'draft' | 'confirmed') => {
    if (!selectedCustomer) { showToast('Please select a customer', 'error'); return; }
    if (lineItems.length === 0) { showToast('Please add at least one product', 'error'); return; }
    setSaving(true);
    try {
      const res = await challansApi.create({
        customer_id: selectedCustomer.id,
        items: lineItems.map(l => ({ product_id: l.product_id, quantity: l.quantity })),
        status,
      });
      showToast(`Challan ${status === 'draft' ? 'saved as draft' : 'confirmed'} 🎉`, 'success');
      const challanId = res.data.challan?.id || res.data.id;
      navigate(`/challans/${challanId}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create challan';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/challans')}>← Back</button>
        <h2>🧾 Create New Challan</h2>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.06)', width: 'fit-content' }}>
        {[
          { n: 1, label: '1. Select Customer' },
          { n: 2, label: '2. Add Products' },
          { n: 3, label: '3. Review & Save' },
        ].map(s => (
          <button
            key={s.n}
            onClick={() => { if (s.n < step || (s.n === 2 && selectedCustomer) || (s.n === 3 && lineItems.length > 0)) setStep(s.n); }}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem',
              background: step === s.n ? 'linear-gradient(135deg, var(--primary), #8b7cf8)' : 'transparent',
              color: step === s.n ? 'white' : 'rgba(255,255,255,0.45)',
              boxShadow: step === s.n ? '0 4px 15px rgba(108,99,255,0.4)' : 'none',
              transition: 'all 0.25s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="challan-builder">
        <div>
          {/* Step 1: Customer */}
          {step === 1 && (
            <div className="glass-card card-padding">
              <h3 style={{ marginBottom: 20 }}>👥 Select Customer</h3>
              <div className="form-group">
                <label className="form-label">Search Customer</label>
                <div className="relative">
                  <input
                    className="form-control"
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setCustomerDropdown(true); setSelectedCustomer(null); }}
                    onFocus={() => setCustomerDropdown(true)}
                    placeholder="Type customer name, mobile..."
                  />
                  {customerDropdown && customerResults.length > 0 && (
                    <div className="product-search-result">
                      {customerResults.map(c => (
                        <div key={c.id} className="product-search-result-item" onClick={() => selectCustomer(c)}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>{c.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{c.business_name} • {c.mobile}</div>
                          </div>
                          <span className={`badge badge-${c.status}`}>{c.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedCustomer && (
                <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 12, padding: '16px 20px', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>✅ {selectedCustomer.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                        {selectedCustomer.business_name} • {selectedCustomer.mobile}
                      </div>
                    </div>
                    <span className={`badge badge-${selectedCustomer.customer_type}`}>{selectedCustomer.customer_type}</span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24 }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!selectedCustomer}
                >
                  Next: Add Products →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Products */}
          {step === 2 && (
            <div className="glass-card card-padding">
              <h3 style={{ marginBottom: 20 }}>📦 Add Products</h3>
              <div className="form-group">
                <label className="form-label">Search Product</label>
                <div className="relative">
                  <input
                    className="form-control"
                    value={productSearch}
                    onChange={e => { setProductSearch(e.target.value); setProductDropdown(true); }}
                    onFocus={() => setProductDropdown(true)}
                    placeholder="Type product name or SKU..."
                  />
                  {productDropdown && productResults.length > 0 && (
                    <div className="product-search-result">
                      {productResults.map(p => (
                        <div key={p.id} className="product-search-result-item" onClick={() => addProduct(p)}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                              {p.sku} • ₹{Number(p.unit_price).toFixed(2)}
                            </div>
                          </div>
                          <span className={`badge ${p.current_stock > p.min_stock_alert ? 'badge-active' : 'low-stock-badge'}`}>
                            {p.current_stock} in stock
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {lineItems.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    Line Items
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {lineItems.map(item => (
                      <div key={item.product_id} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            {item.sku} • ₹{item.unit_price.toFixed(2)}/unit
                            {item.current_stock !== undefined && (
                              <span style={{ color: item.current_stock < item.quantity ? 'var(--danger)' : 'var(--success)', marginLeft: 8 }}>
                                • {item.current_stock} in stock
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => updateQty(item.product_id, Math.max(1, item.quantity - 1))} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', minWidth: 32 }}>−</button>
                          <input
                            type="number" min="1"
                            value={item.quantity}
                            onChange={e => updateQty(item.product_id, Math.max(1, parseInt(e.target.value) || 1))}
                            style={{ width: 60, textAlign: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'white', padding: '4px 8px', fontFamily: 'inherit', fontSize: '0.875rem' }}
                          />
                          <button onClick={() => updateQty(item.product_id, item.quantity + 1)} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', minWidth: 32 }}>+</button>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--success)', minWidth: 90, textAlign: 'right', fontSize: '0.875rem' }}>
                          ₹{(item.quantity * item.unit_price).toFixed(2)}
                        </div>
                        <button onClick={() => removeItem(item.product_id)} className="btn btn-danger btn-sm" style={{ padding: '4px 10px' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)} disabled={lineItems.length === 0}>
                  Next: Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="glass-card card-padding">
              <h3 style={{ marginBottom: 20 }}>✅ Review & Save</h3>

              <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Customer</div>
                <div style={{ fontWeight: 700, color: 'white' }}>{selectedCustomer?.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{selectedCustomer?.business_name}</div>
              </div>

              <table style={{ width: '100%', marginBottom: 20 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Qty</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map(item => (
                    <tr key={item.product_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{item.sku}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>₹{item.unit_price.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>₹{(item.quantity * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Qty</div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>{totalQty} units</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Subtotal</div>
                  <div style={{ fontWeight: 900, color: 'var(--success)', fontSize: '1.4rem' }}>₹{subtotal.toFixed(2)}</div>
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleSubmit('draft')}
                  disabled={saving}
                >
                  {saving ? <><div className="spinner spinner-sm" /> Saving...</> : '💾 Save as Draft'}
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleSubmit('confirmed')}
                  disabled={saving}
                >
                  {saving ? <><div className="spinner spinner-sm" /> Confirming...</> : '✅ Confirm Challan & Deduct Stock'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="glass-card card-padding">
            <h4 style={{ marginBottom: 16, color: 'var(--text-secondary)' }}>📋 Summary</h4>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Customer</div>
              <div style={{ fontWeight: 600, color: selectedCustomer ? 'white' : 'var(--text-muted)', fontSize: '0.875rem' }}>
                {selectedCustomer ? selectedCustomer.name : '—'}
              </div>
            </div>

            <hr className="divider" />

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Products</div>
              {lineItems.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None selected</div>
              ) : lineItems.map(l => (
                <div key={l.product_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{l.product_name}</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>×{l.quantity}</span>
                </div>
              ))}
            </div>

            <hr className="divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Items</span>
              <span style={{ fontWeight: 700, color: 'white' }}>{lineItems.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Qty</span>
              <span style={{ fontWeight: 700, color: 'white' }}>{totalQty}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontWeight: 900, color: 'var(--success)', fontSize: '1.1rem' }}>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
