import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, role: Role) => void;
  logout: () => void;
  impersonate: (role: Role) => void;
  stopImpersonation: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Mock User
const INITIAL_ADMIN: User = {
  id: 'ADM-001',
  name: 'Sarah Connor',
  email: 'admin@system.com',
  role: 'SUPER_ADMIN',
  avatar: 'https://picsum.photos/200',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(INITIAL_ADMIN);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const login = (email: string, role: Role) => {
    // Simulating login
    setUser({
      id: 'USR-' + Math.floor(Math.random() * 1000),
      name: email.split('@')[0],
      email,
      role,
      avatar: `https://picsum.photos/200?random=${Math.random()}`
    });
  };

  const logout = () => {
    setUser(null);
    setOriginalUser(null);
  };

  const impersonate = (role: Role) => {
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') return;
    setOriginalUser(user);
    setUser({
      ...user,
      id: 'IMP-' + Math.random(),
      role: role,
      name: `Impersonated ${role}`,
    });
  };

  const stopImpersonation = () => {
    if (originalUser) {
      setUser(originalUser);
      setOriginalUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, impersonate, stopImpersonation, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
