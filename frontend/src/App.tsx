import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';

// ===================== TYPES =====================
type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';
interface User { id: number; name: string; email: string; role: UserRole; }
interface AuthCtx { user: User | null; logout: () => void; switchRole: (r: UserRole) => void; }

const AuthContext = React.createContext<AuthCtx>({ user: null, logout: () => {}, switchRole: () => {} });
const useAuth = () => React.useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User>({
    id: 1, name: 'System Admin', email: 'admin@erp.com', role: 'admin'
  });

  const roleMap: Record<UserRole, User> = {
    admin: { id: 1, name: 'System Admin', email: 'admin@erp.com', role: 'admin' },
    sales: { id: 2, name: 'Sales Officer', email: 'sales@erp.com', role: 'sales' },
    warehouse: { id: 3, name: 'Warehouse Manager', email: 'warehouse@erp.com', role: 'warehouse' },
    accounts: { id: 4, name: 'Accounts Executive', email: 'accounts@erp.com', role: 'accounts' },
  };

  return (
    <AuthContext.Provider value={{ user, logout: () => {}, switchRole: (r) => setUser(roleMap[r]) }}>
      {children}
    </AuthContext.Provider>
  );
};

// ===================== STYLES =====================
const S = {
  app: { minHeight: '100vh', backgroundColor: '#090d16', color: '#f3f4f6', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' as const },
  navbar: { height: '64px', backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky' as const, top: 0, zIndex: 40 },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#06b6d4,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  brandText: { fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px', color: 'white' },
  brandSub: { fontSize: '10px', color: '#22d3ee', fontFamily: 'monospace' },
  roleBadge: (role: string) => ({
    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid',
    backgroundColor: role === 'admin' ? 'rgba(239,68,68,0.15)' : role === 'sales' ? 'rgba(16,185,129,0.15)' : role === 'warehouse' ? 'rgba(245,158,11,0.15)' : 'rgba(168,85,247,0.15)',
    color: role === 'admin' ? '#f87171' : role === 'sales' ? '#34d399' : role === 'warehouse' ? '#fbbf24' : '#c084fc',
    borderColor: role === 'admin' ? 'rgba(239,68,68,0.4)' : role === 'sales' ? 'rgba(16,185,129,0.4)' : role === 'warehouse' ? 'rgba(245,158,11,0.4)' : 'rgba(168,85,247,0.4)',
    cursor: 'pointer',
  }),
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' },
  layout: { display: 'flex', flex: 1 },
  sidebar: { width: '220px', backgroundColor: 'rgba(15,23,42,0.7)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '24px 12px', display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  navLinkBase: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', color: '#94a3b8', transition: 'all 0.2s' },
  navLinkActive: { backgroundColor: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' },
  main: { flex: 1, overflowY: 'auto' as const, padding: '32px' },
  card: { backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' },
  th: { padding: '12px 16px', textAlign: 'left' as const, fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(15,23,42,0.5)' },
  td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1' },
  badge: (color: string) => ({ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, backgroundColor: `${color}20`, color: color, border: `1px solid ${color}60` }),
  btn: (color: string) => ({ padding: '8px 16px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg,${color})`, color: 'white', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }),
  input: { width: '100%', backgroundColor: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 12px', color: 'white', fontSize: '12px', outline: 'none', boxSizing: 'border-box' as const },
  modal: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(9,13,22,0.85)', backdropFilter: 'blur(8px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
};

// ===================== NAVBAR =====================
const Navbar: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [open, setOpen] = React.useState(false);
  const roles: UserRole[] = ['admin', 'sales', 'warehouse', 'accounts'];
  return (
    <header style={S.navbar}>
      <div style={S.brand}>
        <div style={S.logo}>⚡</div>
        <div>
          <div style={S.brandText}>NEXUS <span style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ERP+CRM</span></div>
          <div style={S.brandSub}>v2.4 ONLINE ● SYSTEM HEALTHY</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpen(!open)} style={{ ...(S.roleBadge(user?.role || 'admin')), display: 'flex', alignItems: 'center', gap: '6px' }}>
            🛡 ROLE: {user?.role?.toUpperCase()} ▾
          </button>
          {open && (
            <div style={{ position: 'absolute', right: 0, top: '36px', width: '180px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '8px', zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '10px', color: '#64748b', padding: '4px 8px', fontWeight: 700, marginBottom: '4px' }}>SWITCH ROLE</div>
              {roles.map(r => (
                <button key={r} onClick={() => { switchRole(r); setOpen(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: user?.role === r ? 'rgba(6,182,212,0.15)' : 'transparent', color: user?.role === r ? '#22d3ee' : '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {r} {user?.role === r ? '●' : ''}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={S.userInfo}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>{user?.name}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

// ===================== SIDEBAR =====================
const Sidebar: React.FC = () => {
  const navs = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/customers', icon: '👥', label: 'Customer CRM' },
    { path: '/products', icon: '📦', label: 'Product Inventory' },
    { path: '/challans', icon: '🧾', label: 'Sales Challans' },
  ];
  return (
    <aside style={S.sidebar}>
      <div style={{ fontSize: '10px', fontWeight: 800, color: '#22d3ee', letterSpacing: '0.12em', padding: '0 4px', marginBottom: '8px' }}>CORE OPERATIONS</div>
      {navs.map(n => (
        <NavLink key={n.path} to={n.path} end={n.path === '/'}
          style={({ isActive }) => ({ ...S.navLinkBase, ...(isActive ? S.navLinkActive : {}) })}>
          <span style={{ fontSize: '16px' }}>{n.icon}</span>
          <span>{n.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

// ===================== DASHBOARD =====================
const Dashboard: React.FC = () => {
  const metrics = [
    { label: 'Total Customers', value: 3, sub: '2 Active, 1 Lead', color: '#22d3ee', icon: '👥' },
    { label: 'Product Inventory', value: 4, sub: '⚠ 1 Below Min Stock', color: '#818cf8', icon: '📦' },
    { label: 'Sales Challans', value: 1, sub: '1 Confirmed', color: '#34d399', icon: '🧾' },
    { label: 'Revenue (Confirmed)', value: '₹34,500', sub: 'From 10 units dispatched', color: '#f59e0b', icon: '💰' },
  ];
  return (
    <div>
      {/* Hero Banner */}
      <div style={{ ...S.card, marginBottom: '24px', background: 'linear-gradient(135deg,rgba(6,182,212,0.15),rgba(99,102,241,0.15),rgba(168,85,247,0.1))', border: '1px solid rgba(6,182,212,0.3)', position: 'relative', overflow: 'hidden', minHeight: '160px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: 'radial-gradient(ellipse at 70% 50%,rgba(6,182,212,0.15),transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee', fontSize: '10px', fontWeight: 700, marginBottom: '12px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22d3ee', animation: 'none' }}>●</span>
            REAL-TIME ENTERPRISE ENGINE
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'white', marginBottom: '8px', lineHeight: 1.2 }}>
            Next-Gen Operations Portal<br />
            <span style={{ background: 'linear-gradient(135deg,#38bdf8,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ERP + CRM System</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '500px' }}>Automated CRM follow-ups, real-time inventory movement & atomic sales challan processing with PDF export.</p>
        </div>
      </div>

      {/* Metrics */}
      <div style={S.metricGrid}>
        {metrics.map(m => (
          <div key={m.label} style={{ ...S.card, transition: 'transform 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
              <span style={{ fontSize: '22px' }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', margin: '8px 0 4px' }}>{m.value}</div>
            <div style={{ fontSize: '11px', color: m.color }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      <div style={{ ...S.card, marginBottom: '24px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>⚠️</span>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f87171' }}>LOW STOCK ALERT: Stainless Steel Fastener Set M8 (SKU: FST-SS-M8)</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Current Stock: 12 units | Minimum Required: 15 units — Reorder immediately!</div>
        </div>
      </div>

      {/* Recent Challans Table */}
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'white' }}>🧾 Recent Sales Challans</div>
          <NavLink to="/challans" style={{ fontSize: '12px', color: '#22d3ee', textDecoration: 'none', fontWeight: 600 }}>View All →</NavLink>
        </div>
        <table style={S.table}>
          <thead><tr>
            {['Challan #', 'Customer', 'Total Qty', 'Subtotal', 'Status', 'Date'].map(h => <th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            <tr>
              <td style={S.td}><span style={{ color: '#22d3ee', fontWeight: 700, fontFamily: 'monospace' }}>CH-2026-0001</span></td>
              <td style={S.td}><div style={{ fontWeight: 600, color: 'white' }}>Sharma Traders Pvt Ltd</div><div style={{ fontSize: '11px', color: '#64748b' }}>Rajesh Sharma</div></td>
              <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>10 units</span></td>
              <td style={S.td}><span style={{ color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>₹34,500.00</span></td>
              <td style={S.td}><span style={S.badge('#34d399')}>✓ Confirmed</span></td>
              <td style={S.td}><span style={{ color: '#64748b' }}>{new Date().toLocaleDateString()}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== CUSTOMERS =====================
const Customers: React.FC = () => {
  const [customers, setCustomers] = React.useState([
    { id: 1, name: 'Rajesh Sharma', mobile: '9876543210', email: 'rajesh@sharmatraders.com', business_name: 'Sharma Traders Pvt Ltd', gst: '24AAACS1424N1ZB', customer_type: 'wholesale', address: 'Plot 45, GIDC Estate, Vadodara', status: 'active', follow_up_date: '2026-08-20', notes: 'Key wholesale partner for western region' },
    { id: 2, name: 'Ankit Patel', mobile: '9898012345', email: 'ankit@patelretail.in', business_name: 'Patel Retail Supermarket', gst: '24BAPPT5544R1ZA', customer_type: 'retail', address: 'Shop 12, Sunrise Complex, Alkapuri', status: 'active', follow_up_date: '2026-08-15', notes: 'Regular monthly order customer' },
    { id: 3, name: 'Sanjay Verma', mobile: '9123456789', email: 'sanjay@vermadistributors.com', business_name: 'Verma Global Distribution', gst: '27AACCV9988K1ZM', customer_type: 'distributor', address: 'Building B, Logistics Park, Thane', status: 'lead', follow_up_date: '2026-08-12', notes: 'Discussing bulk distribution agreement' },
  ]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [selected, setSelected] = React.useState<any>(null);
  const [search, setSearch] = React.useState('');
  const [form, setForm] = React.useState({ name: '', mobile: '', email: '', business_name: '', gst: '', customer_type: 'wholesale', address: '', status: 'lead', follow_up_date: '', notes: '' });
  const [newNote, setNewNote] = React.useState('');
  const [notes, setNotes] = React.useState<{id:number,note:string,by:string,date:string}[]>([]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.business_name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  const statusColor = (s: string) => s === 'active' ? '#34d399' : s === 'lead' ? '#22d3ee' : '#94a3b8';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>👥 Customer CRM Management</h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Track wholesale accounts, lead statuses & follow-up activities.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#06b6d4,#6366f1)', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>+ Add Customer</button>
      </div>

      <div style={{ ...S.card, marginBottom: '16px' }}>
        <input style={S.input} placeholder="Search by name, business, mobile..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.map(c => (
          <div key={c.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'white', fontSize: '14px' }}>{c.business_name}</div>
                <div style={{ fontSize: '12px', color: '#22d3ee', fontWeight: 600 }}>{c.name}</div>
              </div>
              <span style={S.badge(statusColor(c.status))}>{c.status}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>📞 {c.mobile}</div>
              <div>✉ {c.email}</div>
              <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '11px' }}>GST: {c.gst}</div>
              <div>🏷 Type: <strong style={{ color: '#f3f4f6', textTransform: 'capitalize' }}>{c.customer_type}</strong></div>
              <div>📅 Follow-up: <strong style={{ color: '#f59e0b' }}>{c.follow_up_date}</strong></div>
            </div>
            <button onClick={() => { setSelected(c); setNotes([{ id: 1, note: c.notes, by: 'Sales Manager', date: new Date().toLocaleDateString() }]); }}
              style={{ padding: '8px', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)', backgroundColor: 'rgba(6,182,212,0.1)', color: '#22d3ee', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              View Details & Notes
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ color: 'white', fontWeight: 800 }}>Create Customer Profile</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              {[['Contact Name *', 'name'], ['Business Name *', 'business_name'], ['Mobile *', 'mobile'], ['Email', 'email'], ['GST Number', 'gst'], ['Address *', 'address']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>{label}</label>
                  <input style={S.input} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={label.replace(' *', '')} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Type</label>
                  <select style={{ ...S.input }} value={form.customer_type} onChange={e => setForm({ ...form, customer_type: e.target.value })}>
                    <option value="retail">Retail</option><option value="wholesale">Wholesale</option><option value="distributor">Distributor</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Status</label>
                  <select style={{ ...S.input }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="lead">Lead</option><option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setShowAdd(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Cancel</button>
                <button onClick={() => { setCustomers([{ id: Date.now(), ...form, notes: '' }, ...customers]); setShowAdd(false); }}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#06b6d4,#6366f1)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Save Customer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail & Notes Modal */}
      {selected && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <div><div style={{ fontWeight: 800, color: 'white' }}>{selected.business_name}</div><div style={{ fontSize: '12px', color: '#22d3ee' }}>{selected.name}</div></div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <h4 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>💬 Follow-up Notes Timeline</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Add a follow-up note..." value={newNote} onChange={e => setNewNote(e.target.value)} />
              <button onClick={() => { if (newNote) { setNotes([{ id: Date.now(), note: newNote, by: 'Sales Officer', date: new Date().toLocaleDateString() }, ...notes]); setNewNote(''); } }}
                style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#22d3ee', color: '#0f172a', fontWeight: 700, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Add</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {notes.map(n => (
                <div key={n.id} style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#f3f4f6' }}>{n.note}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>{n.by} · {n.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== PRODUCTS =====================
const Products: React.FC = () => {
  const [products, setProducts] = React.useState([
    { id: 1, name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', category: 'Lubricants', unit_price: 3450, current_stock: 150, min_stock_alert: 20, location: 'Warehouse A - Rack 04' },
    { id: 2, name: 'Heavy Duty Bearing 6204-2RS', sku: 'BRG-6204-2RS', category: 'Spare Parts', unit_price: 280, current_stock: 500, min_stock_alert: 50, location: 'Warehouse B - Shelf 12' },
    { id: 3, name: 'Stainless Steel Fastener Set M8', sku: 'FST-SS-M8', category: 'Hardware', unit_price: 450, current_stock: 12, min_stock_alert: 15, location: 'Warehouse A - Rack 01' },
    { id: 4, name: 'Pneumatic Control Valve 1/2"', sku: 'VALVE-PN-12', category: 'Pneumatics', unit_price: 1850, current_stock: 45, min_stock_alert: 10, location: 'Warehouse B - Shelf 05' },
  ]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [stockModal, setStockModal] = React.useState<any>(null);
  const [form, setForm] = React.useState({ name: '', sku: '', category: '', unit_price: '', current_stock: '0', min_stock_alert: '10', location: '' });
  const [stockForm, setStockForm] = React.useState({ qty: '10', type: 'IN', reason: 'Purchase refill' });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>📦 Product & Inventory Management</h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Track SKUs, stock levels, min-stock alerts & IN/OUT audit logs.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#818cf8,#a855f7)', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>+ Add Product</button>
      </div>

      <div style={{ ...S.card, overflowX: 'auto' }}>
        <table style={S.table}>
          <thead><tr>
            {['SKU Code', 'Product Name', 'Category', 'Unit Price', 'Current Stock', 'Location', 'Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {products.map(p => {
              const isLow = p.current_stock <= p.min_stock_alert;
              return (
                <tr key={p.id} style={{ transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#22d3ee' }}>{p.sku}</span></td>
                  <td style={S.td}><span style={{ fontWeight: 600, color: 'white' }}>{p.name}</span></td>
                  <td style={S.td}><span style={S.badge('#818cf8')}>{p.category}</span></td>
                  <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#34d399' }}>₹{p.unit_price.toLocaleString('en-IN')}</span></td>
                  <td style={S.td}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '14px', color: isLow ? '#f87171' : 'white' }}>{p.current_stock}</span>
                    {isLow && <span style={{ ...S.badge('#f87171'), marginLeft: '6px', fontSize: '9px' }}>⚠ LOW (min:{p.min_stock_alert})</span>}
                  </td>
                  <td style={S.td}><span style={{ color: '#64748b' }}>{p.location}</span></td>
                  <td style={S.td}>
                    <button onClick={() => setStockModal(p)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(129,140,248,0.4)', backgroundColor: 'rgba(129,140,248,0.1)', color: '#818cf8', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Adjust Stock</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      {stockModal && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div><div style={{ fontWeight: 800, color: 'white' }}>Adjust Stock Level</div><div style={{ fontSize: '11px', color: '#22d3ee', fontFamily: 'monospace' }}>{stockModal.sku} — {stockModal.name}</div></div>
              <button onClick={() => setStockModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {['IN', 'OUT'].map(t => (
                <button key={t} onClick={() => setStockForm({ ...stockForm, type: t })}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${stockForm.type === t ? (t === 'IN' ? '#34d399' : '#f87171') : 'rgba(255,255,255,0.1)'}`, backgroundColor: stockForm.type === t ? (t === 'IN' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)') : 'transparent', color: stockForm.type === t ? (t === 'IN' ? '#34d399' : '#f87171') : '#94a3b8', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                  {t === 'IN' ? '↓ STOCK IN' : '↑ STOCK OUT'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div><label style={{ color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Quantity</label>
                <input type="number" style={S.input} value={stockForm.qty} onChange={e => setStockForm({ ...stockForm, qty: e.target.value })} min="1" /></div>
              <div><label style={{ color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Reason</label>
                <input style={S.input} value={stockForm.reason} onChange={e => setStockForm({ ...stockForm, reason: e.target.value })} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setStockModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Cancel</button>
                <button onClick={() => {
                  const qty = parseInt(stockForm.qty);
                  setProducts(products.map(p => p.id === stockModal.id ? { ...p, current_stock: stockForm.type === 'IN' ? p.current_stock + qty : Math.max(0, p.current_stock - qty) } : p));
                  setStockModal(null);
                }} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#818cf8,#a855f7)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Save Movement</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== CHALLANS =====================
const Challans: React.FC = () => {
  const [challans, setChallans] = React.useState([
    { id: 1, challan_number: 'CH-2026-0001', customer: 'Sharma Traders Pvt Ltd', items: [{ product_name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', unit_price: 3450, quantity: 10 }], total_qty: 10, subtotal: 34500, status: 'confirmed', date: new Date().toLocaleDateString() },
  ]);
  const [showCreate, setShowCreate] = React.useState(false);
  const [error, setError] = React.useState('');
  const [custId, setCustId] = React.useState(1);
  const [items, setItems] = React.useState([{ product_id: 1, qty: 2 }]);
  const [challanStatus, setChallanStatus] = React.useState<'draft'|'confirmed'>('draft');

  const customers = [
    { id: 1, name: 'Sharma Traders Pvt Ltd', address: 'Plot 45, GIDC Estate, Vadodara' },
    { id: 2, name: 'Patel Retail Supermarket', address: 'Shop 12, Sunrise Complex, Alkapuri' },
  ];
  const productList = [
    { id: 1, name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', unit_price: 3450, current_stock: 150 },
    { id: 2, name: 'Heavy Duty Bearing 6204-2RS', sku: 'BRG-6204-2RS', unit_price: 280, current_stock: 500 },
    { id: 3, name: 'Stainless Steel Fastener Set M8', sku: 'FST-SS-M8', unit_price: 450, current_stock: 12 },
    { id: 4, name: 'Pneumatic Control Valve 1/2"', sku: 'VALVE-PN-12', unit_price: 1850, current_stock: 45 },
  ];

  const exportPDF = async (ch: any) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('NEXUS ERP — SALES CHALLAN & INVOICE', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(56, 189, 248);
    doc.text(`CHALLAN: ${ch.challan_number}`, 14, 32);
    doc.text(`DATE: ${ch.date}`, 160, 32);
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.text(`BILL TO: ${ch.customer}`, 14, 52);
    autoTable(doc, {
      startY: 62,
      head: [['SKU', 'Product', 'Unit Price', 'Qty', 'Total']],
      body: ch.items.map((i: any) => [i.sku, i.product_name, `INR ${i.unit_price}`, i.quantity, `INR ${(i.unit_price * i.quantity).toFixed(2)}`]),
      headStyles: { fillColor: [2, 132, 199] },
    });
    const y = (doc as any).lastAutoTable.finalY + 14;
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(13);
    doc.text(`TOTAL: INR ${ch.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 130, y);
    doc.save(`Sales_Challan_${ch.challan_number}.pdf`);
  };

  const handleCreate = () => {
    setError('');
    if (challanStatus === 'confirmed') {
      for (const item of items) {
        const p = productList.find(x => x.id === item.product_id)!;
        if (p.current_stock < item.qty) {
          setError(`Insufficient stock for '${p.name}': Available ${p.current_stock}, Requested ${item.qty}`);
          return;
        }
      }
    }
    const cust = customers.find(c => c.id === custId)!;
    const challanItems = items.map(i => {
      const p = productList.find(x => x.id === i.product_id)!;
      return { product_name: p.name, sku: p.sku, unit_price: p.unit_price, quantity: i.qty };
    });
    const subtotal = challanItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const totalQty = challanItems.reduce((s, i) => s + i.quantity, 0);
    setChallans([{ id: Date.now(), challan_number: `CH-2026-${String(challans.length + 1).padStart(4,'0')}`, customer: cust.name, items: challanItems, total_qty: totalQty, subtotal, status: challanStatus, date: new Date().toLocaleDateString() }, ...challans]);
    setShowCreate(false);
  };

  const statusColor = (s: string) => s === 'confirmed' ? '#34d399' : s === 'draft' ? '#f59e0b' : '#f87171';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>🧾 Sales Challan Operations</h2>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Auto-numbered challans, atomic stock control, and PDF invoice export.</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: 'white', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>+ Create Challan</button>
      </div>

      <div style={{ ...S.card, overflowX: 'auto' }}>
        <table style={S.table}>
          <thead><tr>
            {['Challan #', 'Customer', 'Total Qty', 'Subtotal', 'Status', 'Date', 'PDF Export'].map(h => <th key={h} style={S.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {challans.map(ch => (
              <tr key={ch.id}>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#22d3ee' }}>{ch.challan_number}</span></td>
                <td style={S.td}><span style={{ fontWeight: 600, color: 'white' }}>{ch.customer}</span></td>
                <td style={S.td}><span style={{ fontFamily: 'monospace' }}>{ch.total_qty} units</span></td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#34d399' }}>₹{ch.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></td>
                <td style={S.td}><span style={S.badge(statusColor(ch.status))}>{ch.status === 'confirmed' ? '✓ Confirmed' : ch.status === 'draft' ? '⏳ Draft' : '✕ Cancelled'}</span></td>
                <td style={S.td}>{ch.date}</td>
                <td style={S.td}>
                  <button onClick={() => exportPDF(ch)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(52,211,153,0.4)', backgroundColor: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>⬇ Export PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ color: 'white', fontWeight: 800 }}>Create Sales Challan</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {error && <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: '12px', marginBottom: '12px' }}>⚠ {error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div><label style={{ color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Select Customer</label>
                <select style={S.input} value={custId} onChange={e => setCustId(Number(e.target.value))}>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ color: '#64748b', fontWeight: 600 }}>Line Items</label>
                  <button onClick={() => setItems([...items, { product_id: 1, qty: 1 }])} style={{ background: 'none', border: 'none', color: '#22d3ee', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add Row</button>
                </div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select style={{ ...S.input, flex: 1 }} value={item.product_id} onChange={e => { const n = [...items]; n[i].product_id = Number(e.target.value); setItems(n); }}>
                      {productList.map(p => <option key={p.id} value={p.id}>{p.sku} — {p.name} (Stock: {p.current_stock}) ₹{p.unit_price}</option>)}
                    </select>
                    <input type="number" min="1" style={{ ...S.input, width: '80px' }} value={item.qty} onChange={e => { const n = [...items]; n[i].qty = Number(e.target.value); setItems(n); }} />
                    {items.length > 1 && <button onClick={() => setItems(items.filter((_, x) => x !== i))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '18px' }}>✕</button>}
                  </div>
                ))}
              </div>

              <div>
                <label style={{ color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Submission Status</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['draft', 'confirmed'] as const).map(s => (
                    <button key={s} onClick={() => setChallanStatus(s)}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${challanStatus === s ? (s === 'confirmed' ? '#34d399' : '#f59e0b') : 'rgba(255,255,255,0.1)'}`, backgroundColor: challanStatus === s ? (s === 'confirmed' ? 'rgba(52,211,153,0.15)' : 'rgba(245,158,11,0.15)') : 'transparent', color: challanStatus === s ? (s === 'confirmed' ? '#34d399' : '#f59e0b') : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}>
                      {s === 'draft' ? '⏳ Save as DRAFT (No stock deduction)' : '✓ Save as CONFIRMED (Deduct stock now)'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleCreate} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Generate Challan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== APP =====================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={S.app}>
          <Navbar />
          <div style={S.layout}>
            <Sidebar />
            <main style={S.main}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/products" element={<Products />} />
                <Route path="/challans" element={<Challans />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
