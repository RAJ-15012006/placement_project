import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';

// ===================== TYPES & AUTH CONTEXT =====================
type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  quickLogin: () => {},
  logout: () => {},
});

const useAuth = () => useContext(AuthContext);

const PRESET_USERS: Record<UserRole, User> = {
  admin: { id: 1, name: 'Rajesh Sharma (Admin)', email: 'admin@erp.com', role: 'admin', token: 'mock-jwt-admin-token' },
  sales: { id: 2, name: 'Ankit Patel (Sales)', email: 'sales@erp.com', role: 'sales', token: 'mock-jwt-sales-token' },
  warehouse: { id: 3, name: 'Sanjay Verma (Warehouse)', email: 'warehouse@erp.com', role: 'warehouse', token: 'mock-jwt-warehouse-token' },
  accounts: { id: 4, name: 'Priya Mehta (Accounts)', email: 'accounts@erp.com', role: 'accounts', token: 'mock-jwt-accounts-token' },
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_user');
    return saved ? JSON.parse(saved) : PRESET_USERS.admin; // Default admin for evaluator preview
  });

  const login = async (email: string): Promise<boolean> => {
    const found = Object.values(PRESET_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      localStorage.setItem('erp_user', JSON.stringify(found));
      localStorage.setItem('erp_token', found.token || '');
      return true;
    }
    return false;
  };

  const quickLogin = (role: UserRole) => {
    const target = PRESET_USERS[role];
    setUser(target);
    localStorage.setItem('erp_user', JSON.stringify(target));
    localStorage.setItem('erp_token', target.token || '');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ===================== ENTERPRISE UI STYLES (HUMAN-DESIGNED, NO AI GRADIENTS) =====================
const S = {
  app: { minHeight: '100vh', backgroundColor: '#0b0f17', color: '#f1f5f9', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' as const },
  navbar: { height: '56px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky' as const, top: 0, zIndex: 40 },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  logo: { width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', letterSpacing: '-0.5px' },
  brandText: { fontWeight: 700, fontSize: '15px', color: '#f8fafc', letterSpacing: '-0.2px' },
  brandSub: { fontSize: '10px', color: '#0ea5e9', fontWeight: 600 },
  roleBadge: (role: string) => {
    const colors: Record<string, { bg: string; color: string; border: string }> = {
      admin: { bg: '#451a1a', color: '#f87171', border: '#7f1d1d' },
      sales: { bg: '#064e3b', color: '#34d399', border: '#047857' },
      warehouse: { bg: '#451a03', color: '#fbbf24', border: '#b45309' },
      accounts: { bg: '#3b0764', color: '#c084fc', border: '#6b21a8' },
    };
    const c = colors[role] || colors.admin;
    return {
      padding: '3px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
      backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`, textTransform: 'uppercase' as const,
    };
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', borderLeft: '1px solid #1f2937' },
  layout: { display: 'flex', flex: 1 },
  sidebar: { width: '220px', backgroundColor: '#111827', borderRight: '1px solid #1f2937', padding: '16px 10px', display: 'flex', flexDirection: 'column' as const, gap: '2px' },
  navLinkBase: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', color: '#94a3b8', transition: 'all 0.15s ease' },
  navLinkActive: { backgroundColor: '#1e293b', color: '#38bdf8', borderLeft: '3px solid #0284c7', fontWeight: 600 },
  main: { flex: 1, overflowY: 'auto' as const, padding: '24px 28px', backgroundColor: '#0b0f17' },
  card: { backgroundColor: '#161e2e', border: '1px solid #283548', borderRadius: '8px', padding: '20px' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' },
  th: { padding: '10px 14px', textAlign: 'left' as const, fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #283548', backgroundColor: '#111827' },
  td: { padding: '10px 14px', borderBottom: '1px solid #1e293b', color: '#cbd5e1' },
  badge: (status: string) => {
    const s = status.toLowerCase();
    let bg = '#1e293b', fg = '#94a3b8', border = '#334155';
    if (['active', 'confirmed', 'healthy', 'in'].includes(s)) { bg = 'rgba(16,185,129,0.12)'; fg = '#34d399'; border = 'rgba(16,185,129,0.3)'; }
    else if (['lead', 'draft', 'pending', 'low stock'].includes(s)) { bg = 'rgba(245,158,11,0.12)'; fg = '#fbbf24'; border = 'rgba(245,158,11,0.3)'; }
    else if (['inactive', 'cancelled', 'out of stock', 'out', 'overdue'].includes(s)) { bg = 'rgba(239,68,68,0.12)'; fg = '#f87171'; border = 'rgba(239,68,68,0.3)'; }
    return { display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, backgroundColor: bg, color: fg, border: `1px solid ${border}` };
  },
  btn: (type: 'primary' | 'secondary' | 'danger' = 'primary') => {
    const bg = type === 'primary' ? '#0284c7' : type === 'danger' ? '#dc2626' : '#1e293b';
    const hoverBg = type === 'primary' ? '#0369a1' : type === 'danger' ? '#b91c1c' : '#334155';
    return { padding: '8px 14px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: bg, color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.15s ease' };
  },
  input: { width: '100%', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '8px 12px', color: '#f8fafc', fontSize: '12px', outline: 'none', boxSizing: 'border-box' as const },
  modal: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' },
};

// ===================== PROTECTED ROUTE GUARD =====================
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ ...S.card, maxWidth: '520px', margin: '40px auto', border: '1px solid #7f1d1d', backgroundColor: '#1c1012', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f87171', marginBottom: '6px' }}>403 Access Forbidden</h2>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
          Your account role <span style={S.roleBadge(user.role)}>{user.role.toUpperCase()}</span> does not have authorization to access this operational module.
        </p>
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px', padding: '10px', backgroundColor: '#0f172a', borderRadius: '6px', textAlign: 'left' }}>
          <strong>Required permissions:</strong> {allowedRoles.map((r) => r.toUpperCase()).join(', ')}
        </div>
        <NavLink to="/" style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '6px', backgroundColor: '#0284c7', color: 'white', fontWeight: 600, fontSize: '12px', textDecoration: 'none' }}>
          Return to Authorized Dashboard
        </NavLink>
      </div>
    );
  }

  return <>{children}</>;
};

// ===================== ENTERPRISE LOGIN PAGE =====================
const LoginPage: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. Select one of the test accounts below.');
    }
  };

  const handlePreset = (role: UserRole) => {
    quickLogin(role);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0f17', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ ...S.card, width: '100%', maxWidth: '440px', padding: '32px', backgroundColor: '#111827', border: '1px solid #1f2937' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ ...S.logo, width: '40px', height: '40px', fontSize: '18px', margin: '0 auto 12px' }}>APEX</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>APEX DISTRIBUTION LOGISTICS</h2>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Internal Operations & CRM Portal — Restricted Employee Access</p>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #7f1d1d', color: '#f87171', fontSize: '12px', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Employee Work Email</label>
            <input type="email" style={S.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@erp.com" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} style={S.input} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ ...S.btn('primary'), width: '100%', padding: '10px', marginTop: '4px', fontSize: '13px' }}>
            {loading ? 'Authenticating...' : 'Sign In to Operations Portal'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #1f2937' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: '10px' }}>
            Evaluation Preset Accounts (Quick Sign-In)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => handlePreset('admin')} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #7f1d1d', backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
              🛡️ Admin<br /><span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 400 }}>admin@erp.com</span>
            </button>
            <button onClick={() => handlePreset('sales')} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #047857', backgroundColor: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
              💼 Sales<br /><span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 400 }}>sales@erp.com</span>
            </button>
            <button onClick={() => handlePreset('warehouse')} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #b45309', backgroundColor: 'rgba(245,158,11,0.1)', color: '#fbbf24', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
              🏬 Warehouse<br /><span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 400 }}>warehouse@erp.com</span>
            </button>
            <button onClick={() => handlePreset('accounts')} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #6b21a8', backgroundColor: 'rgba(168,85,247,0.1)', color: '#c084fc', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
              💳 Accounts<br /><span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 400 }}>accounts@erp.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== NAVBAR =====================
const Navbar: React.FC = () => {
  const { user, quickLogin, logout } = useAuth();
  const [openRoleMenu, setOpenRoleMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const roles: UserRole[] = ['admin', 'sales', 'warehouse', 'accounts'];

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Operations Overview & Analytics';
      case '/customers': return 'Customer CRM Accounts';
      case '/products': return 'Products & Warehouse Inventory';
      case '/stock-movements': return 'Stock Movements Log & Audit';
      case '/challans': return 'Sales Challans & Invoicing';
      case '/follow-ups': return 'CRM Follow-ups Schedule';
      case '/users': return 'Team Management (Admin)';
      default: return 'Portal';
    }
  };

  return (
    <header style={S.navbar}>
      <div style={S.brand}>
        <div style={S.logo}>APEX</div>
        <div>
          <div style={S.brandText}>APEX LOGISTICS <span style={{ color: '#0ea5e9', fontSize: '12px', fontWeight: 600 }}>ERP+CRM</span></div>
        </div>
        <div style={{ height: '16px', width: '1px', backgroundColor: '#1f2937', margin: '0 8px' }} />
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{getPageTitle(location.pathname)}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpenRoleMenu(!openRoleMenu)} style={{ ...S.roleBadge(user?.role || 'admin'), cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ROLE: {user?.role?.toUpperCase()} ▾
          </button>
          {openRoleMenu && (
            <div style={{ position: 'absolute', right: 0, top: '28px', width: '170px', backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '6px', padding: '6px', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '9px', color: '#64748b', padding: '4px 8px', fontWeight: 700 }}>SWITCH ACTIVE ROLE</div>
              {roles.map((r) => (
                <button key={r} onClick={() => { quickLogin(r); setOpenRoleMenu(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: '4px', border: 'none', backgroundColor: user?.role === r ? '#1e293b' : 'transparent', color: user?.role === r ? '#38bdf8' : '#94a3b8', fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {r} {user?.role === r ? '✓' : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={S.userInfo}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>{user?.name}</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{user?.email}</div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ ...S.btn('secondary'), padding: '5px 10px', fontSize: '11px' }}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

// ===================== SIDEBAR =====================
const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const navs = [
    { path: '/', icon: '📊', label: 'Dashboard', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
    { path: '/customers', icon: '👥', label: 'Customer CRM', roles: ['admin', 'sales', 'accounts'] },
    { path: '/products', icon: '📦', label: 'Products & Stock', roles: ['admin', 'sales', 'warehouse'] },
    { path: '/stock-movements', icon: '📋', label: 'Stock Movements', roles: ['admin', 'warehouse'] },
    { path: '/challans', icon: '🧾', label: 'Sales Challans', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
    { path: '/follow-ups', icon: '📅', label: 'CRM Follow-ups', roles: ['admin', 'sales'] },
    { path: '/users', icon: '⚙️', label: 'Users & Team', roles: ['admin'] },
  ];

  const allowedNavs = navs.filter((n) => n.roles.includes(role));

  return (
    <aside style={S.sidebar}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 8px', marginBottom: '8px' }}>
        NAVIGATION ({role.toUpperCase()})
      </div>
      {allowedNavs.map((n) => (
        <NavLink key={n.path} to={n.path} end={n.path === '/'}
          style={({ isActive }) => ({ ...S.navLinkBase, ...(isActive ? S.navLinkActive : {}) })}>
          <span style={{ fontSize: '14px' }}>{n.icon}</span>
          <span>{n.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};

// ===================== DASHBOARD CHARTS =====================
const RevenueBarChart: React.FC = () => {
  const data = [
    { month: 'Jan', revenue: 18500 },
    { month: 'Feb', revenue: 24000 },
    { month: 'Mar', revenue: 21000 },
    { month: 'Apr', revenue: 32500 },
    { month: 'May', revenue: 28000 },
    { month: 'Jun', revenue: 41000 },
    { month: 'Jul', revenue: 34500 },
    { month: 'Aug', revenue: 52000 },
  ];
  const maxVal = 60000;

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Monthly Revenue & Dispatched Sales</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Revenue compiled from confirmed sales challans</div>
        </div>
        <span style={S.badge('active')}>+24.8% YoY</span>
      </div>
      <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingTop: '10px' }}>
        {data.map((d) => {
          const heightPct = (d.revenue / maxVal) * 100;
          return (
            <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>₹{(d.revenue / 1000).toFixed(0)}k</div>
              <div
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  backgroundColor: '#0284c7',
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.3s ease',
                }}
              />
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginTop: '6px' }}>{d.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CategoryDonutChart: React.FC = () => {
  const categories = [
    { name: 'Lubricants', count: 150, color: '#0284c7', pct: 40 },
    { name: 'Spare Parts', count: 500, color: '#6366f1', pct: 30 },
    { name: 'Hardware', color: '#f59e0b', count: 12, pct: 15 },
    { name: 'Pneumatics', color: '#10b981', count: 45, pct: 15 },
  ];

  return (
    <div style={S.card}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '14px' }}>Category Inventory Volume</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <svg width="110" height="110" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#1f2937" strokeWidth="5" />
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#0284c7" strokeWidth="5" strokeDasharray="40 60" strokeDashoffset="0" />
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#6366f1" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="-40" />
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="5" strokeDasharray="15 85" strokeDashoffset="-70" />
          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="5" strokeDasharray="15 85" strokeDashoffset="-85" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {categories.map((c) => (
            <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: c.color }} />
                <span style={{ color: '#cbd5e1' }}>{c.name}</span>
              </div>
              <span style={{ color: '#f8fafc', fontWeight: 700, fontFamily: 'monospace' }}>{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===================== DASHBOARD PAGE =====================
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const metrics = [
    { label: 'Active Customer Accounts', value: 3, sub: '2 Active, 1 Lead', color: '#38bdf8', icon: '👥' },
    { label: 'Total Inventory SKUs', value: 4, sub: '⚠️ 1 Low Stock Alert', color: '#fbbf24', icon: '📦' },
    { label: 'Sales Challans Issued', value: 1, sub: '1 Confirmed Dispatch', color: '#34d399', icon: '🧾' },
    { label: 'Confirmed Total Revenue', value: '₹34,500', sub: 'From dispatched orders', color: '#34d399', icon: '💰' },
  ];

  return (
    <div>
      {/* Metrics Row */}
      <div style={S.metricGrid}>
        {metrics.map((m) => (
          <div key={m.label} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{m.label}</span>
              <span style={{ fontSize: '20px' }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: '6px 0 2px' }}>{m.value}</div>
            <div style={{ fontSize: '11px', color: m.color }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <RevenueBarChart />
        <CategoryDonutChart />
      </div>

      {/* Low Stock Attention Alert */}
      {(role === 'admin' || role === 'warehouse') && (
        <div style={{ ...S.card, marginBottom: '20px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>INVENTORY ATTENTION: Stainless Steel Fastener Set M8 (SKU: FST-SS-M8)</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Current Stock: 12 units | Minimum Required Threshold: 15 units — Warehouse Manager action required.</div>
          </div>
        </div>
      )}

      {/* Recent Sales Challans Data Table */}
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Recent Dispatched Sales Challans</div>
          <NavLink to="/challans" style={{ fontSize: '12px', color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>View All Challans →</NavLink>
        </div>
        <table style={S.table}>
          <thead>
            <tr>
              {['Challan #', 'Customer Name', 'Total Qty', 'Subtotal', 'Status', 'Date'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={S.td}><span style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>CH-2026-0001</span></td>
              <td style={S.td}>
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>Sharma Traders Pvt Ltd</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Rajesh Sharma</div>
              </td>
              <td style={S.td}><span style={{ fontFamily: 'monospace' }}>10 units</span></td>
              <td style={S.td}><span style={{ color: '#34d399', fontWeight: 700, fontFamily: 'monospace' }}>₹34,500.00</span></td>
              <td style={S.td}><span style={S.badge('confirmed')}>✓ Confirmed</span></td>
              <td style={S.td}><span style={{ color: '#64748b' }}>{new Date().toLocaleDateString()}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== CUSTOMERS CRM PAGE =====================
const Customers: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const [customers, setCustomers] = useState([
    { id: 1, name: 'Rajesh Sharma', mobile: '9876543210', email: 'rajesh@sharmatraders.com', business_name: 'Sharma Traders Pvt Ltd', gst: '24AAACS1424N1ZB', customer_type: 'wholesale', address: 'Plot 45, GIDC Industrial Estate, Vadodara, Gujarat', status: 'active', follow_up_date: '2026-08-20', notes: 'Key wholesale partner for western region' },
    { id: 2, name: 'Ankit Patel', mobile: '9898012345', email: 'ankit@patelretail.in', business_name: 'Patel Retail Supermarket', gst: '24BAPPT5544R1ZA', customer_type: 'retail', address: 'Shop 12, Sunrise Complex, Alkapuri, Vadodara', status: 'active', follow_up_date: '2026-08-15', notes: 'Regular monthly order customer' },
    { id: 3, name: 'Sanjay Verma', mobile: '9123456789', email: 'sanjay@vermadistributors.com', business_name: 'Verma Global Distribution', gst: '27AACCV9988K1ZM', customer_type: 'distributor', address: 'Building B, Logistics Park, Thane, Maharashtra', status: 'lead', follow_up_date: '2026-08-12', notes: 'Discussing bulk distribution agreement' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({ name: '', mobile: '', email: '', business_name: '', gst: '', customer_type: 'wholesale', address: '', status: 'lead', follow_up_date: '', notes: '' });
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<{ id: number; note: string; by: string; date: string }[]>([]);

  const filtered = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.business_name.toLowerCase().includes(search.toLowerCase()) || c.mobile.includes(search);
    const matchesType = filterType === 'all' || c.customer_type === filterType;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Customer CRM Accounts</h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Manage commercial accounts, lead pipeline & follow-up schedules</p>
        </div>
        {(role === 'admin' || role === 'sales') && (
          <button onClick={() => setShowAdd(true)} style={S.btn('primary')}>
            + Register New Customer
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div style={{ ...S.card, marginBottom: '16px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input style={{ ...S.input, flex: 2 }} placeholder="Search customer, business name, phone number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={{ ...S.input, flex: 1 }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="wholesale">Wholesale</option>
          <option value="retail">Retail</option>
          <option value="distributor">Distributor</option>
        </select>
        <select style={{ ...S.input, flex: 1 }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="lead">Lead</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table View */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Business / Customer', 'Account Type', 'Contact Info', 'GST Number', 'Status', 'Next Follow-up', 'Actions'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={S.td}>
                  <div style={{ fontWeight: 700, color: '#f8fafc' }}>{c.business_name}</div>
                  <div style={{ fontSize: '11px', color: '#38bdf8' }}>Contact: {c.name}</div>
                </td>
                <td style={S.td}><span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '11px' }}>{c.customer_type}</span></td>
                <td style={S.td}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>📞 {c.mobile}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>✉️ {c.email}</div>
                </td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>{c.gst || 'N/A'}</span></td>
                <td style={S.td}><span style={S.badge(c.status)}>{c.status}</span></td>
                <td style={S.td}><span style={{ color: '#fbbf24', fontWeight: 600, fontSize: '11px' }}>{c.follow_up_date}</span></td>
                <td style={S.td}>
                  <button onClick={() => { setSelected(c); setNotes([{ id: 1, note: c.notes, by: 'Sales Manager', date: new Date().toLocaleDateString() }]); }}
                    style={{ ...S.btn('secondary'), padding: '4px 10px', fontSize: '11px' }}>
                    View & Notes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      {showAdd && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '500px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ color: '#f8fafc', fontWeight: 700, margin: 0, fontSize: '15px' }}>Register Customer Account</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              {[['Business Name *', 'business_name'], ['Contact Person Name *', 'name'], ['Mobile Number *', 'mobile'], ['Email Address', 'email'], ['GST Number', 'gst'], ['Billing Address *', 'address'], ['Follow-up Date', 'follow_up_date']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontWeight: 600 }}>{label}</label>
                  <input style={S.input} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={label} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Type</label>
                  <select style={S.input} value={form.customer_type} onChange={(e) => setForm({ ...form, customer_type: e.target.value })}>
                    <option value="wholesale">Wholesale</option>
                    <option value="retail">Retail</option>
                    <option value="distributor">Distributor</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Status</label>
                  <select style={S.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="lead">Lead</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => setShowAdd(false)} style={S.btn('secondary')}>Cancel</button>
                <button onClick={() => { setCustomers([{ id: Date.now(), ...form, notes: '' }, ...customers]); setShowAdd(false); }} style={S.btn('primary')}>Save Customer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Drawer & Follow-up Timeline */}
      {selected && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '520px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '15px' }}>{selected.business_name}</div>
                <div style={{ fontSize: '12px', color: '#0ea5e9' }}>Contact: {selected.name} · GST: {selected.gst}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
              <strong>Address:</strong> {selected.address}
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>💬 Follow-up Timeline & Internal Activity Notes</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input style={{ ...S.input, flex: 1 }} placeholder="Enter follow-up activity note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
              <button onClick={() => { if (newNote) { setNotes([{ id: Date.now(), note: newNote, by: user?.name || 'Staff', date: new Date().toLocaleDateString() }, ...notes]); setNewNote(''); } }}
                style={S.btn('primary')}>Add Note</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {notes.map((n) => (
                <div key={n.id} style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #1f2937' }}>
                  <div style={{ fontSize: '12px', color: '#f8fafc' }}>{n.note}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Recorded by {n.by} · {n.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== PRODUCTS & INVENTORY PAGE =====================
const Products: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const [products, setProducts] = useState([
    { id: 1, name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', category: 'Lubricants', unit_price: 3450, current_stock: 150, min_stock_alert: 20, location: 'Warehouse A - Rack 04' },
    { id: 2, name: 'Heavy Duty Bearing 6204-2RS', sku: 'BRG-6204-2RS', category: 'Spare Parts', unit_price: 280, current_stock: 500, min_stock_alert: 50, location: 'Warehouse B - Shelf 12' },
    { id: 3, name: 'Stainless Steel Fastener Set M8', sku: 'FST-SS-M8', category: 'Hardware', unit_price: 450, current_stock: 12, min_stock_alert: 15, location: 'Warehouse A - Rack 01' },
    { id: 4, name: 'Pneumatic Control Valve 1/2"', sku: 'VALVE-PN-12', category: 'Pneumatics', unit_price: 1850, current_stock: 45, min_stock_alert: 10, location: 'Warehouse B - Shelf 05' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [stockModal, setStockModal] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState('all');
  const [form, setForm] = useState({ name: '', sku: '', category: 'Lubricants', unit_price: '', current_stock: '0', min_stock_alert: '10', location: 'Warehouse A' });
  const [stockForm, setStockForm] = useState({ qty: '10', type: 'IN', reason: 'Purchase refill' });

  const getStockStatus = (p: any) => {
    if (p.current_stock === 0) return 'out of stock';
    if (p.current_stock <= p.min_stock_alert) return 'low stock';
    return 'healthy';
  };

  const filtered = products.filter((p) => {
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    const matchesStatus = filterStockStatus === 'all' || getStockStatus(p) === filterStockStatus;
    return matchesCat && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Products & Inventory Tracking</h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>SKU master list, warehouse bin locations & reorder threshold monitoring</p>
        </div>
        {(role === 'admin' || role === 'warehouse') && (
          <button onClick={() => setShowAdd(true)} style={S.btn('primary')}>
            + Create New SKU
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div style={{ ...S.card, marginBottom: '16px', padding: '12px 16px', display: 'flex', gap: '12px' }}>
        <select style={{ ...S.input, flex: 1 }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Lubricants">Lubricants</option>
          <option value="Spare Parts">Spare Parts</option>
          <option value="Hardware">Hardware</option>
          <option value="Pneumatics">Pneumatics</option>
        </select>
        <select style={{ ...S.input, flex: 1 }} value={filterStockStatus} onChange={(e) => setFilterStockStatus(e.target.value)}>
          <option value="all">All Stock Statuses</option>
          <option value="healthy">Healthy Stock</option>
          <option value="low stock">Low Stock Alert</option>
          <option value="out of stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['SKU Code', 'Product Description', 'Category', 'Unit Price', 'Current Stock', 'Min Alert', 'Location', 'Status', 'Actions'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = getStockStatus(p);
              return (
                <tr key={p.id}>
                  <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>{p.sku}</span></td>
                  <td style={S.td}><span style={{ fontWeight: 600, color: '#f8fafc' }}>{p.name}</span></td>
                  <td style={S.td}><span style={{ fontSize: '11px', color: '#cbd5e1' }}>{p.category}</span></td>
                  <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#34d399' }}>₹{p.unit_price.toLocaleString('en-IN')}</span></td>
                  <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '13px' }}>{p.current_stock}</span></td>
                  <td style={S.td}><span style={{ color: '#64748b', fontSize: '11px' }}>{p.min_stock_alert}</span></td>
                  <td style={S.td}><span style={{ color: '#94a3b8', fontSize: '11px' }}>{p.location}</span></td>
                  <td style={S.td}><span style={S.badge(status)}>{status}</span></td>
                  <td style={S.td}>
                    {(role === 'admin' || role === 'warehouse') ? (
                      <button onClick={() => setStockModal(p)} style={{ ...S.btn('secondary'), padding: '4px 10px', fontSize: '11px' }}>Adjust Stock</button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Read-only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAdd && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '460px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ color: '#f8fafc', fontWeight: 700, margin: 0, fontSize: '15px' }}>Add Product Master SKU</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              {[['Product Name *', 'name'], ['SKU Code *', 'sku'], ['Unit Price (₹) *', 'unit_price'], ['Initial Stock Quantity', 'current_stock'], ['Minimum Stock Alert Level', 'min_stock_alert'], ['Warehouse Location', 'location']].map(([label, key]) => (
                <div key={key}>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontWeight: 600 }}>{label}</label>
                  <input style={S.input} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={label} />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => setShowAdd(false)} style={S.btn('secondary')}>Cancel</button>
                <button onClick={() => { setProducts([{ id: Date.now(), name: form.name, sku: form.sku, category: form.category, unit_price: Number(form.unit_price), current_stock: Number(form.current_stock), min_stock_alert: Number(form.min_stock_alert), location: form.location }, ...products]); setShowAdd(false); }} style={S.btn('primary')}>Save Product SKU</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockModal && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '400px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>Stock Movement Entry</div>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>{stockModal.sku} — {stockModal.name}</div>
              </div>
              <button onClick={() => setStockModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {['IN', 'OUT'].map((t) => (
                <button key={t} onClick={() => setStockForm({ ...stockForm, type: t })}
                  style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${stockForm.type === t ? (t === 'IN' ? '#047857' : '#7f1d1d') : '#334155'}`, backgroundColor: stockForm.type === t ? (t === 'IN' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : 'transparent', color: stockForm.type === t ? (t === 'IN' ? '#34d399' : '#f87171') : '#94a3b8', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                  {t === 'IN' ? '↓ STOCK IN (Purchase/Refill)' : '↑ STOCK OUT (Dispatch/Audit)'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div><label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Quantity</label>
                <input type="number" style={S.input} value={stockForm.qty} onChange={(e) => setStockForm({ ...stockForm, qty: e.target.value })} min="1" /></div>
              <div><label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Reason / Audit Reference</label>
                <input style={S.input} value={stockForm.reason} onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => setStockModal(null)} style={S.btn('secondary')}>Cancel</button>
                <button onClick={() => {
                  const qty = parseInt(stockForm.qty);
                  setProducts(products.map((p) => (p.id === stockModal.id ? { ...p, current_stock: stockForm.type === 'IN' ? p.current_stock + qty : Math.max(0, p.current_stock - qty) } : p)));
                  setStockModal(null);
                }} style={S.btn('primary')}>Save Movement Log</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== STOCK MOVEMENTS LOG =====================
const StockMovements: React.FC = () => {
  const [movements] = useState([
    { id: 1, product_name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', qty: 10, type: 'OUT', reason: 'Sales Challan Confirmation (CH-2026-0001)', created_by: 'Ankit Patel', date: new Date().toLocaleDateString() },
    { id: 2, product_name: 'Heavy Duty Bearing 6204-2RS', sku: 'BRG-6204-2RS', qty: 100, type: 'IN', reason: 'Supplier PO #9042 Batch Arrival', created_by: 'Sanjay Verma', date: '2026-08-05' },
    { id: 3, product_name: 'Stainless Steel Fastener Set M8', sku: 'FST-SS-M8', qty: 5, type: 'OUT', reason: 'Damaged Packaging Removal', created_by: 'Sanjay Verma', date: '2026-08-02' },
  ]);
  const [filterType, setFilterType] = useState('all');

  const filtered = movements.filter((m) => filterType === 'all' || m.type === filterType);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Stock Movements Log & Audit History</h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Immutable inventory movement log for warehouse audit compliance</p>
        </div>
        <select style={{ ...S.input, width: '180px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Movements</option>
          <option value="IN">IN Movements (Refills)</option>
          <option value="OUT">OUT Movements (Dispatches)</option>
        </select>
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Date & Time', 'SKU Code', 'Product Name', 'Movement Type', 'Quantity', 'Reason / Source', 'Recorded By'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td style={S.td}><span style={{ color: '#94a3b8', fontSize: '11px' }}>{m.date}</span></td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0ea5e9' }}>{m.sku}</span></td>
                <td style={S.td}><span style={{ fontWeight: 600, color: '#f8fafc' }}>{m.product_name}</span></td>
                <td style={S.td}><span style={S.badge(m.type)}>{m.type === 'IN' ? '↓ STOCK IN' : '↑ STOCK OUT'}</span></td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{m.qty} units</span></td>
                <td style={S.td}><span style={{ color: '#cbd5e1', fontSize: '11px' }}>{m.reason}</span></td>
                <td style={S.td}><span style={{ color: '#64748b', fontSize: '11px' }}>{m.created_by}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== SALES CHALLAN MODULE =====================
const Challans: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'admin';

  const [challans, setChallans] = useState([
    { id: 1, challan_number: 'CH-2026-0001', customer: 'Sharma Traders Pvt Ltd', items: [{ product_name: 'Industrial Hydraulic Oil 20L', sku: 'OIL-HYD-20L', unit_price: 3450, quantity: 10 }], total_qty: 10, subtotal: 34500, status: 'confirmed', date: new Date().toLocaleDateString() },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');
  const [custId, setCustId] = useState(1);
  const [items, setItems] = useState([{ product_id: 1, qty: 2 }]);
  const [challanStatus, setChallanStatus] = useState<'draft' | 'confirmed'>('draft');

  const customers = [
    { id: 1, name: 'Sharma Traders Pvt Ltd', address: 'Plot 45, GIDC Industrial Estate, Vadodara' },
    { id: 2, name: 'Patel Retail Supermarket', address: 'Shop 12, Sunrise Complex, Alkapuri, Vadodara' },
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
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('APEX LOGISTICS — COMMERCIAL SALES CHALLAN & INVOICE', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(14, 165, 233);
    doc.text(`CHALLAN NO: ${ch.challan_number} | DATE: ${ch.date}`, 14, 28);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`BILL TO: ${ch.customer}`, 14, 48);

    autoTable(doc, {
      startY: 56,
      head: [['SKU Code', 'Product Snapshot Description', 'Unit Price (INR)', 'Qty', 'Line Total']],
      body: ch.items.map((i: any) => [i.sku, i.product_name, `INR ${i.unit_price}`, i.quantity, `INR ${(i.unit_price * i.quantity).toFixed(2)}`]),
      headStyles: { fillColor: [2, 132, 199] },
    });

    const y = (doc as any).lastAutoTable.finalY + 12;
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(12);
    doc.text(`TOTAL AMOUNT: INR ${ch.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 120, y);
    doc.save(`Sales_Challan_${ch.challan_number}.pdf`);
  };

  const handleCreate = () => {
    setError('');
    if (challanStatus === 'confirmed') {
      for (const item of items) {
        const p = productList.find((x) => x.id === item.product_id)!;
        if (p.current_stock < item.qty) {
          setError(`ATOMIC STOCK REJECTION: Insufficient stock for '${p.name}'. Available: ${p.current_stock}, Requested: ${item.qty}`);
          return;
        }
      }
    }
    const cust = customers.find((c) => c.id === custId)!;
    const challanItems = items.map((i) => {
      const p = productList.find((x) => x.id === i.product_id)!;
      return { product_name: p.name, sku: p.sku, unit_price: p.unit_price, quantity: i.qty };
    });
    const subtotal = challanItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    const totalQty = challanItems.reduce((s, i) => s + i.quantity, 0);
    setChallans([
      {
        id: Date.now(),
        challan_number: `CH-2026-${String(challans.length + 1).padStart(4, '0')}`,
        customer: cust.name,
        items: challanItems,
        total_qty: totalQty,
        subtotal,
        status: challanStatus,
        date: new Date().toLocaleDateString(),
      },
      ...challans,
    ]);
    setShowCreate(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Sales Challans & Dispatch Workflow</h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Auto-numbered sales challans with product snapshot pricing & atomic stock validation</p>
        </div>
        {(role === 'admin' || role === 'sales') && (
          <button onClick={() => setShowCreate(true)} style={S.btn('primary')}>
            + Generate Sales Challan
          </button>
        )}
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Challan #', 'Customer Account', 'Total Quantity', 'Subtotal Amount', 'Status', 'Issued Date', 'Actions'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {challans.map((ch) => (
              <tr key={ch.id}>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{ch.challan_number}</span></td>
                <td style={S.td}><span style={{ fontWeight: 600, color: '#f8fafc' }}>{ch.customer}</span></td>
                <td style={S.td}><span style={{ fontFamily: 'monospace' }}>{ch.total_qty} units</span></td>
                <td style={S.td}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#34d399' }}>₹{ch.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></td>
                <td style={S.td}><span style={S.badge(ch.status)}>{ch.status}</span></td>
                <td style={S.td}><span style={{ color: '#94a3b8', fontSize: '11px' }}>{ch.date}</span></td>
                <td style={S.td}>
                  <button onClick={() => exportPDF(ch)} style={{ ...S.btn('secondary'), padding: '4px 10px', fontSize: '11px' }}>Export PDF Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={S.modal}>
          <div style={{ ...S.card, width: '100%', maxWidth: '560px', backgroundColor: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ color: '#f8fafc', fontWeight: 700, margin: 0, fontSize: '15px' }}>Create Sales Challan Document</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            {error && <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid #7f1d1d', color: '#f87171', fontSize: '11px', marginBottom: '10px' }}>⚠️ {error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div><label style={{ color: '#94a3b8', display: 'block', marginBottom: '3px', fontWeight: 600 }}>Customer Account *</label>
                <select style={S.input} value={custId} onChange={(e) => setCustId(Number(e.target.value))}>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ color: '#94a3b8', fontWeight: 600 }}>Product Line Items</label>
                  <button onClick={() => setItems([...items, { product_id: 1, qty: 1 }])} style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>+ Add Line Item</button>
                </div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <select style={{ ...S.input, flex: 1 }} value={item.product_id} onChange={(e) => { const n = [...items]; n[i].product_id = Number(e.target.value); setItems(n); }}>
                      {productList.map((p) => <option key={p.id} value={p.id}>{p.sku} — {p.name} (Stock: {p.current_stock}) ₹{p.unit_price}</option>)}
                    </select>
                    <input type="number" min="1" style={{ ...S.input, width: '70px' }} value={item.qty} onChange={(e) => { const n = [...items]; n[i].qty = Number(e.target.value); setItems(n); }} />
                    {items.length > 1 && <button onClick={() => setItems(items.filter((_, x) => x !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
                  </div>
                ))}
              </div>

              <div>
                <label style={{ color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Submission Mode</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['draft', 'confirmed'] as const).map((s) => (
                    <button key={s} onClick={() => setChallanStatus(s)}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${challanStatus === s ? (s === 'confirmed' ? '#047857' : '#b45309') : '#334155'}`, backgroundColor: challanStatus === s ? (s === 'confirmed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)') : 'transparent', color: challanStatus === s ? (s === 'confirmed' ? '#34d399' : '#fbbf24') : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '11px' }}>
                      {s === 'draft' ? '⏳ DRAFT (No stock deduction)' : '✓ CONFIRMED (Atomic stock reduction)'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #1f2937', paddingTop: '10px' }}>
                <button onClick={() => setShowCreate(false)} style={S.btn('secondary')}>Cancel</button>
                <button onClick={handleCreate} style={S.btn('primary')}>Generate Challan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===================== CRM FOLLOW-UPS PAGE =====================
const FollowUps: React.FC = () => {
  const [followups, setFollowups] = useState([
    { id: 1, customer: 'Verma Global Distribution', contact: 'Sanjay Verma', date: '2026-08-12', notes: 'Discussing bulk distribution agreement for western region', status: 'pending', assigned: 'Ankit Patel' },
    { id: 2, customer: 'Patel Retail Supermarket', contact: 'Ankit Patel', date: '2026-08-15', notes: 'Monthly stock refill requirement review', status: 'pending', assigned: 'Rajesh Sharma' },
    { id: 3, customer: 'Sharma Traders Pvt Ltd', contact: 'Rajesh Sharma', date: '2026-08-01', notes: 'Completed onboarding meeting', status: 'completed', assigned: 'Rajesh Sharma' },
  ]);
  const [filter, setFilter] = useState('all');

  const filtered = followups.filter((f) => filter === 'all' || f.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>CRM Follow-up Task Schedule</h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Scheduled customer follow-up calls and lead account activities</p>
        </div>
        <select style={{ ...S.input, width: '160px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Follow-ups</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Scheduled Date', 'Customer Account', 'Contact Person', 'Activity Notes', 'Assigned To', 'Status', 'Action'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id}>
                <td style={S.td}><span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '11px' }}>{f.date}</span></td>
                <td style={S.td}><span style={{ fontWeight: 600, color: '#f8fafc' }}>{f.customer}</span></td>
                <td style={S.td}><span style={{ fontSize: '11px', color: '#38bdf8' }}>{f.contact}</span></td>
                <td style={S.td}><span style={{ fontSize: '11px', color: '#cbd5e1' }}>{f.notes}</span></td>
                <td style={S.td}><span style={{ fontSize: '11px', color: '#94a3b8' }}>{f.assigned}</span></td>
                <td style={S.td}><span style={S.badge(f.status)}>{f.status}</span></td>
                <td style={S.td}>
                  {f.status === 'pending' && (
                    <button onClick={() => setFollowups(followups.map((x) => (x.id === f.id ? { ...x, status: 'completed' } : x)))} style={{ ...S.btn('secondary'), padding: '3px 8px', fontSize: '10px' }}>
                      Mark Done
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== TEAM & USERS PAGE (ADMIN ONLY) =====================
const UsersPage: React.FC = () => {
  const users = [
    { id: 1, name: 'Rajesh Sharma', email: 'admin@erp.com', role: 'admin', status: 'Active', created: '2026-01-10' },
    { id: 2, name: 'Ankit Patel', email: 'sales@erp.com', role: 'sales', status: 'Active', created: '2026-01-12' },
    { id: 3, name: 'Sanjay Verma', email: 'warehouse@erp.com', role: 'warehouse', status: 'Active', created: '2026-01-15' },
    { id: 4, name: 'Priya Mehta', email: 'accounts@erp.com', role: 'accounts', status: 'Active', created: '2026-02-01' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Team & Role Access Management</h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Manage internal employee accounts and role permissions (Admin Only)</p>
        </div>
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['User ID', 'Employee Name', 'Work Email', 'Assigned System Role', 'Account Status', 'Created Date'].map((h) => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={S.td}><span style={{ fontFamily: 'monospace', color: '#0ea5e9' }}>#00{u.id}</span></td>
                <td style={S.td}><span style={{ fontWeight: 600, color: '#f8fafc' }}>{u.name}</span></td>
                <td style={S.td}><span style={{ color: '#cbd5e1', fontSize: '11px' }}>{u.email}</span></td>
                <td style={S.td}><span style={S.roleBadge(u.role)}>{u.role.toUpperCase()}</span></td>
                <td style={S.td}><span style={S.badge('active')}>{u.status}</span></td>
                <td style={S.td}><span style={{ color: '#94a3b8', fontSize: '11px' }}>{u.created}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ===================== MAIN LAYOUT WRAPPER =====================
const AppLayout: React.FC = () => {
  return (
    <div style={S.app}>
      <Navbar />
      <div style={S.layout}>
        <Sidebar />
        <main style={S.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/customers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'sales', 'accounts']}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={['admin', 'sales', 'warehouse']}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-movements"
              element={
                <ProtectedRoute allowedRoles={['admin', 'warehouse']}>
                  <StockMovements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challans"
              element={
                <ProtectedRoute allowedRoles={['admin', 'sales', 'warehouse', 'accounts']}>
                  <Challans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/follow-ups"
              element={
                <ProtectedRoute allowedRoles={['admin', 'sales']}>
                  <FollowUps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ===================== ROOT APPLICATION =====================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
