import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, Layers, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['admin', 'sales', 'warehouse', 'accounts'],
    },
    {
      name: 'Customer CRM',
      path: '/customers',
      icon: Users,
      roles: ['admin', 'sales', 'accounts'],
    },
    {
      name: 'Product Inventory',
      path: '/products',
      icon: Package,
      roles: ['admin', 'sales', 'warehouse', 'accounts'],
    },
    {
      name: 'Sales Challans',
      path: '/challans',
      icon: FileText,
      roles: ['admin', 'sales', 'warehouse', 'accounts'],
    },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/10 flex flex-col justify-between py-6 px-4 shrink-0 hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 text-[11px] font-extrabold uppercase tracking-widest text-cyan-400">
          Core Operations
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const hasAccess = item.roles.includes(user?.role || '');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
                {!hasAccess && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-mono">
                    LIMITED
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Access Matrix Info Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Role Control</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Current Role <strong className="text-cyan-400 uppercase">{user?.role}</strong> has authorization for core module actions.
        </p>
      </div>
    </aside>
  );
};
