import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('keystone_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(u => setUser(u))
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.login(email, password);
    localStorage.setItem('keystone_token', res.token);
    setToken(res.token);
    setUser({
      id: res.userId,
      email: res.email,
      fullName: res.fullName,
      role: res.role,
      active: true,
    });
    return res;
  };

  const logout = () => {
    localStorage.removeItem('keystone_token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
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
