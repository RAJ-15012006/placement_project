import React from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Shield, User, LogOut, Cpu, Activity, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    sales: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    warehouse: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    accounts: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  };

  return (
    <header className="h-16 border-b border-white/10 glass-panel sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & Status Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">
              NEXUS <span className="gradient-text">ERP+CRM</span>
            </h1>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider">v2.4 ONLINE</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          SYSTEM HEALTHY
        </div>
      </div>

      {/* Quick Role Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md ${
              user ? roleColors[user.role] : 'bg-gray-800 text-gray-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">Role: {user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                Switch Active Role
              </div>
              {(['admin', 'sales', 'warehouse', 'accounts'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-white/10 transition-colors capitalize ${
                    user?.role === r ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300'
                  }`}
                >
                  <span>{r}</span>
                  {user?.role === r && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-gray-200">{user?.name}</span>
            <span className="text-[10px] text-gray-400">{user?.email}</span>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-white/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
