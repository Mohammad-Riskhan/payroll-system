import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Calendar, Shield, UserCircle, RefreshCw } from 'lucide-react';

export const Navbar = ({ currentPeriod = '2026-10' }) => {
  const { user, login } = useAuth();
  const [switching, setSwitching] = useState(false);

  const demoAccounts = [
    { label: 'Super Admin', username: 'admin', role: 'SUPER_ADMIN' },
    { label: 'HR Manager', username: 'hrmanager', role: 'HR_MANAGER' },
    { label: 'Payroll Officer', username: 'payrollofficer', role: 'PAYROLL_OFFICER' },
    { label: 'Accountant', username: 'accountant', role: 'ACCOUNTANT' },
    { label: 'Dept Manager', username: 'deptmanager', role: 'DEPARTMENT_MANAGER' },
    { label: 'Employee', username: 'employee', role: 'EMPLOYEE' },
  ];

  const handleQuickSwitch = async (e) => {
    const username = e.target.value;
    if (!username || username === user?.username) return;
    setSwitching(true);
    try {
      await login(username, 'Admin@123');
    } catch (err) {
      console.error('Role switch failed', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="top-navbar no-print">
      <div className="nav-breadcrumbs">
        <Building2 size={18} className="text-muted" />
        <span className="font-semibold text-main">Lanka Precision Technologies (Pvt) Ltd</span>
        <span className="text-dim">•</span>
        <span className="text-dim text-xs">EPF Reg: EPF/COL/98765</span>
      </div>

      <div className="nav-actions">
        <div className="period-pill">
          <Calendar size={14} />
          <span>Pay Period: {currentPeriod}</span>
        </div>

        {/* Quick Demo Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Shield size={14} color="#818cf8" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role Switch:</span>
          <select
            value={user?.username || 'admin'}
            onChange={handleQuickSwitch}
            disabled={switching}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {demoAccounts.map(acc => (
              <option key={acc.username} value={acc.username} style={{ background: '#1e293b', color: '#fff' }}>
                {acc.label} ({acc.role})
              </option>
            ))}
          </select>
          {switching && <RefreshCw size={12} className="animate-spin" />}
        </div>
      </div>
    </header>
  );
};
