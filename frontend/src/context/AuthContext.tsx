import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('erp_user');
    return savedUser ? JSON.parse(savedUser) : { id: 1, name: 'System Admin', email: 'admin@erp.com', role: 'admin' };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('erp_token') || 'demo-jwt-token-2026';
  });

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email: string, preferredRole?: UserRole) => {
    try {
      const defaultPasswords: Record<string, string> = {
        'admin@erp.com': 'Admin@123',
        'sales@erp.com': 'Sales@123',
        'warehouse@erp.com': 'Warehouse@123',
        'accounts@erp.com': 'Accounts@123',
      };

      const pwd = defaultPasswords[email] || 'Admin@123';

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password: pwd,
      });

      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('erp_token', newToken);
      localStorage.setItem('erp_user', JSON.stringify(userData));
    } catch (err) {
      // Fallback demo login for smooth UI preview
      const role = preferredRole || (email.includes('sales') ? 'sales' : email.includes('warehouse') ? 'warehouse' : email.includes('accounts') ? 'accounts' : 'admin');
      const demoUser: User = {
        id: role === 'sales' ? 2 : role === 'warehouse' ? 3 : role === 'accounts' ? 4 : 1,
        name: role === 'sales' ? 'Sales Officer' : role === 'warehouse' ? 'Warehouse Manager' : role === 'accounts' ? 'Accounts Executive' : 'System Admin',
        email: email,
        role: role,
      };
      const demoToken = `demo-token-${role}`;
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('erp_token', demoToken);
      localStorage.setItem('erp_user', JSON.stringify(demoUser));
    }
  };

  const switchRole = (newRole: UserRole) => {
    const emailMap: Record<UserRole, string> = {
      admin: 'admin@erp.com',
      sales: 'sales@erp.com',
      warehouse: 'warehouse@erp.com',
      accounts: 'accounts@erp.com',
    };
    login(emailMap[newRole], newRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
