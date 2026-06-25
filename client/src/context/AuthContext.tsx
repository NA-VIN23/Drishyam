import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import api, { setAuthToken } from '../api/axios';
import { ROLE_LABELS, type RoleKey } from '../data/roles';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, roleKey: RoleKey) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapUser = (backendUser: any): User => ({
    name: backendUser.name,
    email: backendUser.email,
    roleKey: backendUser.role?.key ?? 'TECHNICIAN',
    roleLabel: backendUser.role?.name ?? ROLE_LABELS[backendUser.role?.key as RoleKey] ?? 'Technician',
  });

  useEffect(() => {
    const bootstrapSession = async () => {
      const token = localStorage.getItem('drishyam_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      setAuthToken(token);

      try {
        const response = await api.get('/auth/me');
        const currentUser = response.data?.data;

        if (currentUser) {
          setUser(mapUser(currentUser));
        }
      } catch {
        localStorage.removeItem('drishyam_token');
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: backendUser } = response.data?.data ?? {};

      if (!token || !backendUser) {
        return false;
      }

      setAuthToken(token);

      setUser(mapUser(backendUser));
      return true;
    } catch {
      setAuthToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const register = async (name: string, email: string, password: string, roleKey: RoleKey): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role: roleKey });
      const { token, user: backendUser } = response.data?.data ?? {};

      if (!token || !backendUser) {
        return false;
      }

      setAuthToken(token);
      setUser(mapUser(backendUser));
      return true;
    } catch {
      setAuthToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
