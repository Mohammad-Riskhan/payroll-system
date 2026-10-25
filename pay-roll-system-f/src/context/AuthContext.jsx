import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getCurrentUser()
        .then((res) => {
          if (res.data) {
            const userData = { ...res.data, token };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    }
    throw new Error('Authentication failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (role) => {
    if (!user || !user.roles) return false;
    const target = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return user.roles.some((r) => r === target || r === role || r === 'ROLE_SUPER_ADMIN');
  };

  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN') ?? false;
  const isHrManager = hasRole('HR_MANAGER');
  const isPayrollOfficer = hasRole('PAYROLL_OFFICER');
  const isAccountant = hasRole('ACCOUNTANT');
  const isDeptManager = hasRole('DEPARTMENT_MANAGER');
  const isEmployee = hasRole('EMPLOYEE');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
        isSuperAdmin,
        isHrManager,
        isPayrollOfficer,
        isAccountant,
        isDeptManager,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
