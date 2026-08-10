import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challans as challansApi } from '../../services/api';
import { Challan } from '../../types';
import { useToast } from '../../context/ToastContext';

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

export default function ChallanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const fetchChallan = async () => {
    if (!id) return;
    try {
      const res = await challansApi.getById(id);
      setChallan(res.data.challan || res.data);
    } catch {
      showToast('Failed to load challan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChallan(); }, [id]);

  const handleConfirm = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await challansApi.confirm(id);
      showToast('Challan confirmed! Stock deducted ✅', 'success');
      fetchChallan();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to confirm', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id || !confirm('Cancel this challan?')) return;
    setActionLoading(true);
    try {
      await challansApi.cancel(id);
      showToast('Challan cancelled', 'warning');
      fetchChallan();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to cancel', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
      <div className="spinner" /> <p>Loading challan...</p>
    </div>
  );

  if (!challan) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p>Challan not found</p>
      <button className="btn btn-ghost mt-16" onClick={() => navigate('/challans')}>← Back</button>
    </div>
  );

  const subtotal = (challan.items || []).reduce((s: number, i: any) => s + i.quantity * i.unit_price, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/challans')}>← Back</button>
        <h2 style={{ flex: 1, color: 'var(--secondary)' }}>{challan.challan_number}</h2>
        <StatusBadge status={challan.status} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={handlePrint}>🖨️ Print</button>
          {challan.status === 'draft' && (
            <>
              <button className="btn btn-success" onClick={handleConfirm} disabled={actionLoading}>
                {actionLoading ? <><div className="spinner spinner-sm" /> Processing...</> : '✅ Confirm & Deduct Stock'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={actionLoading}>Cancel</button>
            </>
          )}
          {challan.status === 'confirmed' && (
            <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={actionLoading}>
              Cancel & Restore Stock
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>
        {/* Main Challan Content */}
        <div>
          {/* Challan Info */}
          <div className="glass-card card-padding" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Challan Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Challan Number</div>
                <div className="detail-value" style={{ color: 'var(--secondary)', fontFamily: 'monospace', fontSize: '1rem' }}>{challan.challan_number}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value"><StatusBadge status={challan.status} /></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Customer</div>
                <div className="detail-value">{challan.customer_name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Business</div>
                <div className="detail-value">{challan.customer_business || '—'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Created By</div>
                <div className="detail-value">{challan.created_by_name || `User #${challan.created_by}`}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Created Date</div>
                <div className="detail-value">
                  {new Date(challan.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3>📦 Challan Items</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(challan.items || []).map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div className="td-main">{item.product_name}</div>
                    </td>
                    <td><code style={{ color: 'var(--secondary)', fontSize: '0.8rem', background: 'rgba(0,212,255,0.08)', padding: '2px 8px', borderRadius: 4 }}>{item.sku}</code></td>
                    <td style={{ color: 'rgba(255,255,255,0.7)' }}>₹{Number(item.unit_price).toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'white' }}>{item.quantity}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(item.quantity * Number(item.unit_price)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 32 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Total Qty</div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>{challan.total_qty}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Subtotal</div>
                <div style={{ fontWeight: 900, color: 'var(--success)', fontSize: '1.5rem' }}>₹{subtotal.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Sidebar */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="glass-card card-padding" style={{
            background: challan.status === 'confirmed' ? 'rgba(0,255,136,0.05)'
              : challan.status === 'cancelled' ? 'rgba(255,77,109,0.05)'
              : 'rgba(255,170,0,0.05)',
            borderColor: challan.status === 'confirmed' ? 'rgba(0,255,136,0.2)'
              : challan.status === 'cancelled' ? 'rgba(255,77,109,0.2)'
              : 'rgba(255,170,0,0.2)',
          }}>
            <h4 style={{ marginBottom: 16 }}>📊 Challan Status</h4>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                {challan.status === 'confirmed' ? '✅' : challan.status === 'cancelled' ? '❌' : '📋'}
              </div>
              <StatusBadge status={challan.status} />
              <p style={{ marginTop: 12, fontSize: '0.82rem' }}>
                {challan.status === 'confirmed' && 'Stock has been deducted for this challan.'}
                {challan.status === 'draft' && 'This challan is pending confirmation. Confirm to deduct stock.'}
                {challan.status === 'cancelled' && 'This challan has been cancelled.'}
              </p>
            </div>
            <hr className="divider" />
            <div style={{ fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Items</span>
                <span style={{ fontWeight: 600 }}>{(challan.items || []).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Qty</span>
                <span style={{ fontWeight: 600 }}>{challan.total_qty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
