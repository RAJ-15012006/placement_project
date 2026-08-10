import React, { useEffect, useState } from 'react';
import { Package, Plus, Search, AlertTriangle, ArrowUpRight, ArrowDownLeft, History, X, Check, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([
    {
      id: 1,
      name: 'Industrial Hydraulic Oil 20L',
      sku: 'OIL-HYD-20L',
      category: 'Lubricants',
      unit_price: 3450.0,
      current_stock: 150,
      min_stock_alert: 20,
      location: 'Warehouse A - Rack 04',
    },
    {
      id: 2,
      name: 'Heavy Duty Bearing 6204-2RS',
      sku: 'BRG-6204-2RS',
      category: 'Spare Parts',
      unit_price: 280.0,
      current_stock: 500,
      min_stock_alert: 50,
      location: 'Warehouse B - Shelf 12',
    },
    {
      id: 3,
      name: 'Stainless Steel Fastener Set M8',
      sku: 'FST-SS-M8',
      category: 'Hardware',
      unit_price: 450.0,
      current_stock: 12,
      min_stock_alert: 15,
      location: 'Warehouse A - Rack 01',
    },
    {
      id: 4,
      name: 'Pneumatic Control Valve 1/2"',
      sku: 'VALVE-PN-12',
      category: 'Pneumatics',
      unit_price: 1850.0,
      current_stock: 45,
      min_stock_alert: 10,
      location: 'Warehouse B - Shelf 05',
    },
  ]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [movementLogs, setMovementLogs] = useState<any[]>([]);

  // Product Form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Hardware',
    unit_price: '',
    current_stock: '',
    min_stock_alert: '10',
    location: '',
  });

  // Stock Adjustment Form
  const [stockForm, setStockForm] = useState({
    quantity: '10',
    movement_type: 'IN',
    reason: 'Stock purchase refill',
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`, {
        params: { search, category: categoryFilter, low_stock: lowStockFilter },
      });
      if (res.data.products) setProducts(res.data.products);
    } catch (err) {
      console.warn('Using local product fallback');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, lowStockFilter]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProd = {
      id: Date.now(),
      name: formData.name,
      sku: formData.sku.toUpperCase(),
      category: formData.category,
      unit_price: parseFloat(formData.unit_price) || 0,
      current_stock: parseInt(formData.current_stock) || 0,
      min_stock_alert: parseInt(formData.min_stock_alert) || 10,
      location: formData.location,
    };

    try {
      const res = await axios.post(`${API_URL}/products`, formData);
      if (res.data.product) setProducts([res.data.product, ...products]);
    } catch (err) {
      setProducts([newProd, ...products]);
    }

    setShowAddModal(false);
    setFormData({
      name: '',
      sku: '',
      category: 'Hardware',
      unit_price: '',
      current_stock: '',
      min_stock_alert: '10',
      location: '',
    });
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = parseInt(stockForm.quantity);
    const newStock =
      stockForm.movement_type === 'IN'
        ? selectedProduct.current_stock + qty
        : selectedProduct.current_stock - qty;

    if (newStock < 0) {
      alert('Error: Stock cannot go below zero!');
      return;
    }

    try {
      await axios.post(`${API_URL}/products/${selectedProduct.id}/stock`, stockForm);
    } catch (err) {}

    setProducts(
      products.map((p) => (p.id === selectedProduct.id ? { ...p, current_stock: newStock } : p))
    );
    setShowStockModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Product & Inventory Management
          </h2>
          <p className="text-xs text-gray-400 mt-1">Track stock levels, minimum alerts, warehouse locations & IN/OUT movement audit logs.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search products by SKU code, name, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="Lubricants">Lubricants</option>
            <option value="Spare Parts">Spare Parts</option>
            <option value="Hardware">Hardware</option>
            <option value="Pneumatics">Pneumatics</option>
          </select>

          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              lowStockFilter
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-900/80 text-gray-400 border-white/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alert Only</span>
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/80 text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">SKU / Code</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Unit Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Warehouse Location</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => {
                const isLow = p.current_stock <= p.min_stock_alert;
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{p.sku}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 text-gray-300 text-[10px] font-semibold border border-white/5">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ₹{parseFloat(p.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-extrabold text-sm ${isLow ? 'text-rose-400' : 'text-white'}`}>
                          {p.current_stock} units
                        </span>
                        {isLow && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-bold">
                            <AlertTriangle className="w-3 h-3" /> LOW (Min: {p.min_stock_alert})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{p.location}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setShowStockModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold transition-all"
                      >
                        Adjust Stock
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setMovementLogs([
                            { id: 1, movement_type: 'IN', quantity: 150, reason: 'Initial Inventory Stocking', created_by_name: 'Warehouse Manager', created_at: new Date().toISOString() },
                          ]);
                          setShowLogsModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 transition-all"
                      >
                        <History className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Product */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New Product to Inventory</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. OIL-HYD-20L"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Industrial Hydraulic Oil 20L"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Min Stock Alert</label>
                  <input
                    type="number"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Initial Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Warehouse Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Warehouse A - Shelf 04"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/25"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock (IN or OUT) */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Adjust Stock Level</h3>
                <p className="text-xs text-cyan-400 font-mono">{selectedProduct.sku} - {selectedProduct.name}</p>
              </div>
              <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Movement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockForm({ ...stockForm, movement_type: 'IN' })}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      stockForm.movement_type === 'IN'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 text-gray-400 border-white/10'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" /> STOCK IN (Purchase/Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockForm({ ...stockForm, movement_type: 'OUT' })}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      stockForm.movement_type === 'OUT'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-slate-900 text-gray-400 border-white/10'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> STOCK OUT (Dispatch/Remove)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Quantity Changed *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Reason for Movement *</label>
                <input
                  type="text"
                  required
                  value={stockForm.reason}
                  onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Shipment received / Damaged item write-off"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25"
                >
                  Save Stock Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Movement Log Audit Trail */}
      {showLogsModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Stock Audit Trail Log</h3>
                <p className="text-xs text-cyan-400 font-mono">{selectedProduct.sku} - {selectedProduct.name}</p>
              </div>
              <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {movementLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className={log.movement_type === 'IN' ? 'text-emerald-400' : 'text-rose-400'}>
                        {log.movement_type === 'IN' ? '+ ' : '- '}{log.quantity} units
                      </span>
                      <span className="text-gray-400 font-normal">({log.reason})</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">Logged by: {log.created_by_name}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{new Date(log.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
