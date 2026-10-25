import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<UserRole, { u: string; p: string; label: string }> = {
  ADMIN: { u: 'admin', p: 'Admin@123', label: 'Quản trị viên (Admin)' },
  DISPATCHER: { u: 'dieuhanh', p: 'Dieuhanh@123', label: 'Điều hành Đội xe' },
  DRIVER: { u: 'taixe', p: 'Taixe@123', label: 'Tài xế Vận tải' },
  MECHANIC: { u: 'kythuat', p: 'Kythuat@123', label: 'Kỹ thuật / Bảo dưỡng' },
  ACCOUNTANT: { u: 'ketoan', p: 'Ketoan@123', label: 'Kế toán Chi phí' },
  SUPERADMIN: { u: 'admin', p: 'Admin@123', label: 'Super Admin' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('user_data', JSON.stringify(res.data));
    } catch (err) {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login/', { username, password });
      const { access, refresh, user: loggedUser } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      const meRes = await api.get('/auth/me/');
      setUser(meRes.data);
      localStorage.setItem('user_data', JSON.stringify(meRes.data));
      return meRes.data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const switchRole = async (targetRole: UserRole) => {
    // SECURITY CHECK: Chỉ Quản trị viên (Admin) mới có quyền chuyển đổi môi trường sang vai trò khác để kiểm thử
    if (user?.role !== 'ADMIN') {
      throw new Error('Chỉ Quản trị viên (Admin) mới có quyền chuyển đổi môi trường vai trò.');
    }
    const cred = DEMO_CREDENTIALS[targetRole] || DEMO_CREDENTIALS.ADMIN;
    await login(cred.u, cred.p);
  };

  const refreshProfile = async () => {
    if (localStorage.getItem('access_token')) {
      const res = await api.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('user_data', JSON.stringify(res.data));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
