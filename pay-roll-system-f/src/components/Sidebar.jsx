import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calculator,
  CalendarCheck2,
  Coins,
  Scale,
  FileSpreadsheet,
  ShieldCheck,
  LogOut,
  Building2
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      to: '/employees',
      label: 'Employee Directory',
      icon: Users,
      allowed: hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER') || hasRole('PAYROLL_OFFICER') || hasRole('ACCOUNTANT') || hasRole('DEPARTMENT_MANAGER'),
    },
    {
      to: '/payroll',
      label: 'Payroll Execution Hub',
      icon: Calculator,
      allowed: hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER') || hasRole('PAYROLL_OFFICER') || hasRole('ACCOUNTANT'),
    },
    {
      to: '/attendance-leaves',
      label: 'Attendance & Leaves',
      icon: CalendarCheck2,
      allowed: true,
    },
    {
      to: '/loans',
      label: 'Staff Loans',
      icon: Coins,
      allowed: true,
    },
    {
      to: '/statutory-rules',
      label: 'Statutory Rules Strategy',
      icon: Scale,
      allowed: hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER') || hasRole('PAYROLL_OFFICER') || hasRole('ACCOUNTANT'),
    },
    {
      to: '/reports',
      label: 'Payslips & Statutory C-Form',
      icon: FileSpreadsheet,
      allowed: true,
    },
    {
      to: '/audit-logs',
      label: 'Audit Trail & Compliance',
      icon: ShieldCheck,
      allowed: hasRole('SUPER_ADMIN') || hasRole('ACCOUNTANT') || hasRole('HR_MANAGER'),
    },
  ];

  const primaryRole = user?.roles?.[0]?.replace('ROLE_', '') || 'USER';

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-header">
        <div className="logo-badge">
          <Building2 size={24} />
        </div>
        <div className="brand-info">
          <h2>LankaPay</h2>
          <p>Precision Payroll LK</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-category">Core Operations</div>
        {navItems.filter(item => item.allowed).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user?.username?.substring(0, 2).toUpperCase() || 'LK'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">{primaryRole}</div>
          </div>
          <button
            onClick={logout}
            className="btn-icon"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
