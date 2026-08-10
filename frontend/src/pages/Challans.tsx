import React, { useEffect, useState } from 'react';
import { FileText, Plus, Search, CheckCircle2, Clock, XCircle, Download, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Challans: React.FC = () => {
  const { user } = useAuth();
  const [challans, setChallans] = useState<any[]>([
    {
      id: 1,
      challan_number: 'CH-2026-0001',
      customer_id: 1,
      customer_name: 'Sharma Traders Pvt Ltd',
      total_qty: 10,
      subtotal: 34500.0,
      status: 'confirmed',
      created_at: new Date().toISOString(),
      items: [
        { product_id: 1, product_name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', unit_price: 3450.0, quantity: 10 },
      ],
    },
  ]);

  const [customers, setCustomers] = useState<any[]>([
    { id: 1, name: 'Rajesh Sharma', business_name: 'Sharma Traders Pvt Ltd', address: 'Plot 45, GIDC Estate, Vadodara' },
    { id: 2, name: 'Ankit Patel', business_name: 'Patel Retail Supermarket', address: 'Shop 12, Sunrise Complex, Alkapuri' },
  ]);

  const [products, setProducts] = useState<any[]>([
    { id: 1, name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', unit_price: 3450.0, current_stock: 150 },
    { id: 2, name: 'Heavy Duty Bearing 6204-2RS', sku: 'BRG-6204-2RS', unit_price: 280.0, current_stock: 500 },
    { id: 3, name: 'Stainless Steel Fastener Set M8', sku: 'FST-SS-M8', unit_price: 450.0, current_stock: 12 },
    { id: 4, name: 'Pneumatic Control Valve 1/2"', sku: 'VALVE-PN-12', unit_price: 1850.0, current_stock: 45 },
  ]);

  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);
  const [challanItems, setChallanItems] = useState<{ product_id: number; quantity: number }[]>([
    { product_id: 1, quantity: 2 },
  ]);
  const [creationStatus, setCreationStatus] = useState<'draft' | 'confirmed'>('draft');

  const fetchChallans = async () => {
    try {
      const res = await axios.get(`${API_URL}/challans`, { params: { status: statusFilter } });
      if (res.data.challans) setChallans(res.data.challans);
    } catch (err) {
      console.warn('Using local challans fallback');
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [statusFilter]);

  const addItemRow = () => {
    setChallanItems([...challanItems, { product_id: products[0]?.id || 1, quantity: 1 }]);
  };

  const removeItemRow = (index: number) => {
    if (challanItems.length > 1) {
      setChallanItems(challanItems.filter((_, i) => i !== index));
    }
  };

  const updateItemRow = (index: number, field: 'product_id' | 'quantity', val: number) => {
    const updated = [...challanItems];
    updated[index][field] = val;
    setChallanItems(updated);
  };

  // Create Challan Handler
  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side Stock Verification if saving as Confirmed
    if (creationStatus === 'confirmed') {
      const insufficient: string[] = [];
      challanItems.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod && prod.current_stock < item.quantity) {
          insufficient.push(`Product '${prod.name}' requested ${item.quantity}, but only ${prod.current_stock} available.`);
        }
      });

      if (insufficient.length > 0) {
        setErrorMessage(insufficient.join(' '));
        return;
      }
    }

    const nextNum = `CH-2026-000${challans.length + 1}`;
    const cust = customers.find((c) => c.id === selectedCustomerId);

    let totalQty = 0;
    let subtotal = 0;
    const itemsSnapshot = challanItems.map((item) => {
      const prod = products.find((p) => p.id === item.product_id)!;
      const qty = item.quantity;
      const price = prod.unit_price;
      totalQty += qty;
      subtotal += qty * price;
      return {
        product_id: prod.id,
        product_name: prod.name,
        sku: prod.sku,
        unit_price: price,
        quantity: qty,
      };
    });

    const newChallan = {
      id: Date.now(),
      challan_number: nextNum,
      customer_id: selectedCustomerId,
      customer_name: cust?.business_name || 'Customer Account',
      total_qty: totalQty,
      subtotal: subtotal,
      status: creationStatus,
      created_at: new Date().toISOString(),
      items: itemsSnapshot,
    };

    try {
      await axios.post(`${API_URL}/challans`, {
        customer_id: selectedCustomerId,
        items: challanItems,
        status: creationStatus,
      });
    } catch (err: any) {
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
        return;
      }
    }

    // Deduct stock if confirmed locally
    if (creationStatus === 'confirmed') {
      setProducts(
        products.map((p) => {
          const itemMatch = challanItems.find((i) => i.product_id === p.id);
          if (itemMatch) {
            return { ...p, current_stock: p.current_stock - itemMatch.quantity };
          }
          return p;
        })
      );
    }

    setChallans([newChallan, ...challans]);
    setShowCreateModal(false);
  };

  // PDF Export Handler
  const generatePDFInvoice = (challan: any) => {
    const doc = new jsPDF();

    // Header Branding
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('NEXUS ERP - SALES CHALLAN & INVOICE', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248);
    doc.text(`CHALLAN NO: ${challan.challan_number}`, 14, 32);
    doc.text(`DATE: ${new Date(challan.created_at).toLocaleDateString()}`, 150, 32);

    // Customer Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text('BILL TO:', 14, 52);
    doc.setFontSize(10);
    doc.text(challan.customer_name || 'Customer Account', 14, 58);
    doc.text(`Status: ${challan.status.toUpperCase()}`, 150, 58);

    // Table Data
    const tableRows = (challan.items || []).map((item: any) => [
      item.sku,
      item.product_name,
      `INR ${parseFloat(item.unit_price).toFixed(2)}`,
      item.quantity,
      `INR ${(item.quantity * item.unit_price).toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 68,
      head: [['SKU Code', 'Product Description', 'Unit Price', 'Quantity', 'Total Amount']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text(`TOTAL AMOUNT: INR ${parseFloat(challan.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 120, finalY + 15);

    doc.save(`Sales_Challan_${challan.challan_number}.pdf`);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmed</span>;
      case 'draft':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Draft</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Sales Challan Operations
          </h2>
          <p className="text-xs text-gray-400 mt-1">Generate auto-numbered sales challans, deduct stock atomically on confirmation, and export PDF invoices.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Sales Challan
        </button>
      </div>

      {/* Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-semibold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Challans</option>
            <option value="draft">Draft Only</option>
            <option value="confirmed">Confirmed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Challans Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/80 text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Challan #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total Qty</th>
                <th className="py-3.5 px-4">Subtotal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">PDF Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {challans.map((ch) => (
                <tr key={ch.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{ch.challan_number}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{ch.customer_name}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold">{ch.total_qty} Units</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ₹{parseFloat(ch.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">{statusBadge(ch.status)}</td>
                  <td className="py-3.5 px-4 text-gray-400">{new Date(ch.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => generatePDFInvoice(ch)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Sales Challan */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-2xl w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Create Sales Challan Flow</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateChallan} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Select Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.business_name} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 font-semibold">Challan Line Items (Products & Stock)</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product Row
                  </button>
                </div>

                {challanItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItemRow(index, 'product_id', Number(e.target.value))}
                      className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name} (Stock: {p.current_stock}) - ₹{p.unit_price}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemRow(index, 'quantity', Number(e.target.value))}
                      className="w-24 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                      placeholder="Qty"
                    />

                    {challanItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="p-2 text-gray-500 hover:text-rose-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Save Status Toggle */}
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Challan Submission Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreationStatus('draft')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      creationStatus === 'draft'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-900 text-gray-400 border-white/10'
                    }`}
                  >
                    Save as DRAFT (No Stock Reduction)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreationStatus('confirmed')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      creationStatus === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 text-gray-400 border-white/10'
                    }`}
                  >
                    Save as CONFIRMED (Deduct Stock Instantly)
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25"
                >
                  Generate Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
