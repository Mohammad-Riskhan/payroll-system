import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Shield, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginView = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (userVal) => {
    setUsername(userVal);
    setPassword('Admin@123');
  };

  const rolePresets = [
    { label: 'Super Admin', user: 'admin', desc: 'Full Engine, System & Auditing Control' },
    { label: 'HR Manager', user: 'hrmanager', desc: 'Employees, Allowances & Leave Approvals' },
    { label: 'Payroll Officer', user: 'payrollofficer', desc: 'Calculation Engine & C-Form Generation' },
    { label: 'Accountant', user: 'accountant', desc: 'Bank Transfer Batches & Financial Audits' },
    { label: 'Dept Manager', user: 'deptmanager', desc: 'Attendance & Department Approvals' },
    { label: 'Employee', user: 'employee', desc: 'Self-Service Payslips & Leave Requests' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
    }}>
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, #10b981 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px var(--primary-glow)',
          }}>
            <Building2 size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>LankaPay Precision</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Sri Lankan Enterprise Payroll & Compliance System
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '9999px',
            color: '#34d399',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginTop: '0.75rem',
          }}>
            <CheckCircle2 size={13} />
            <span>EPF (8%/12%) • ETF (3%) • APIT IRD Compliant</span>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', height: '46px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Compliance Portal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <Shield size={14} color="#818cf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              One-Click Role Test Switcher
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {rolePresets.map((r) => (
              <button
                key={r.user}
                type="button"
                onClick={() => handleQuickFill(r.user)}
                style={{
                  background: username === r.user ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: username === r.user ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.5rem 0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: username === r.user ? '#818cf8' : '#e2e8f0' }}>
                  {r.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
