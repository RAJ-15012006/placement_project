import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Filter, Phone, Mail, Building2, Calendar, FileText, X, Check, Clock, Edit2, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([
    {
      id: 1,
      name: 'Rajesh Sharma',
      mobile: '9876543210',
      email: 'rajesh@sharmatraders.com',
      business_name: 'Sharma Traders Pvt Ltd',
      gst: '24AAACS1424N1ZB',
      customer_type: 'wholesale',
      address: 'Plot 45, GIDC Industrial Estate, Vadodara, Gujarat',
      status: 'active',
      follow_up_date: '2026-08-20',
      notes: 'Key wholesale partner for western region',
    },
    {
      id: 2,
      name: 'Ankit Patel',
      mobile: '9898012345',
      email: 'ankit@patelretail.in',
      business_name: 'Patel Retail Supermarket',
      gst: '24BAPPT5544R1ZA',
      customer_type: 'retail',
      address: 'Shop 12, Sunrise Complex, Alkapuri, Vadodara',
      status: 'active',
      follow_up_date: '2026-08-15',
      notes: 'Regular monthly order customer',
    },
    {
      id: 3,
      name: 'Sanjay Verma',
      mobile: '9123456789',
      email: 'sanjay@vermadistributors.com',
      business_name: 'Verma Global Distribution',
      gst: '27AACCV9988K1ZM',
      customer_type: 'distributor',
      address: 'Building B, Logistics Park, Thane, Maharashtra',
      status: 'lead',
      follow_up_date: '2026-08-12',
      notes: 'Discussing bulk distribution agreement',
    },
  ]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  const [notesList, setNotesList] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    business_name: '',
    gst: '',
    customer_type: 'wholesale',
    address: '',
    status: 'lead',
    follow_up_date: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers`, {
        params: { search, status: statusFilter, customer_type: typeFilter },
      });
      if (res.data.customers) setCustomers(res.data.customers);
    } catch (err) {
      console.warn('Using local customers fallback');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/customers`, formData);
      if (res.data.customer) {
        setCustomers([res.data.customer, ...customers]);
      }
    } catch (err) {
      const newCust = { id: Date.now(), ...formData };
      setCustomers([newCust, ...customers]);
    }
    setShowAddModal(false);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      business_name: '',
      gst: '',
      customer_type: 'wholesale',
      address: '',
      status: 'lead',
      follow_up_date: '',
      notes: '',
    });
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpNote.trim()) return;

    const newNoteObj = {
      id: Date.now(),
      note: followUpNote,
      created_by_name: user?.name || 'Sales Officer',
      created_at: new Date().toISOString(),
    };

    try {
      await axios.post(`${API_URL}/customers/${selectedCustomer.id}/followup`, { note: followUpNote });
    } catch (err) {}

    setNotesList([newNoteObj, ...notesList]);
    setFollowUpNote('');
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">Active</span>;
      case 'lead':
        return <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase">Lead</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 text-[10px] font-bold uppercase">Inactive</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Customer CRM Management
          </h2>
          <p className="text-xs text-gray-400 mt-1">Track wholesale accounts, lead statuses, & follow-up activities.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, business, mobile, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Types</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="distributor">Distributor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-white text-sm">{c.business_name}</h3>
                  <p className="text-xs text-cyan-400 font-semibold">{c.name}</p>
                </div>
                {statusBadge(c.status)}
              </div>

              <div className="space-y-1 text-xs text-gray-300 pt-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>{c.mobile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="truncate">{c.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="capitalize font-semibold text-gray-400">Type: {c.customer_type}</span>
                </div>
                {c.gst && (
                  <div className="text-[11px] font-mono text-gray-400">
                    GST: <span className="text-gray-200">{c.gst}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Follow-up: {c.follow_up_date || 'None'}</span>
              </div>

              <button
                onClick={() => {
                  setSelectedCustomer(c);
                  setNotesList([
                    { id: 1, note: c.notes || 'Initial inquiry received', created_by_name: 'Sales Manager', created_at: new Date().toISOString() }
                  ]);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
              >
                View & Notes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Customer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create Customer Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Ramesh Patel"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Apex Hardware Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="contact@business.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Customer Type</label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({ ...formData, customer_type: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="distributor">Distributor</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1 font-semibold">Follow-Up Date</label>
                  <input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">GST Number (Optional)</label>
                <input
                  type="text"
                  value={formData.gst}
                  onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="24AAACS1424N1ZB"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Address *</label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Full office or warehouse address..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/25"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer/Modal: Customer Detail & Follow-up Notes Timeline */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-xl w-full space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-white">{selectedCustomer.business_name}</h3>
                <p className="text-xs text-cyan-400 font-semibold">{selectedCustomer.name}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-500 font-semibold">Contact Mobile</span>
                <p className="text-white font-bold">{selectedCustomer.mobile}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 font-semibold">Email</span>
                <p className="text-white font-bold">{selectedCustomer.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 font-semibold">GST Number</span>
                <p className="text-white font-mono">{selectedCustomer.gst || 'Not Provided'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 font-semibold">Address</span>
                <p className="text-gray-300">{selectedCustomer.address}</p>
              </div>
            </div>

            {/* Follow-up Notes Activity Log */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Follow-up Notes & Activity Log
              </h4>

              <form onSubmit={handleAddFollowUp} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new follow-up note..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold text-xs hover:bg-cyan-600 transition-all"
                >
                  Add Note
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {notesList.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <p className="text-xs text-gray-200">{n.note}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>Logged by: {n.created_by_name}</span>
                      <span>{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
