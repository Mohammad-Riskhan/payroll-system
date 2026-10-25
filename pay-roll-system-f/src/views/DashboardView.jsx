import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { payrollApi } from '../api/payrollApi';
import { employeeApi } from '../api/employeeApi';
import { reportApi } from '../api/reportApi';
import { StatCard } from '../components/StatCard';
import {
  Users,
  Coins,
  Calculator,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  Scale,
  Percent,
  CheckCircle2,
  Building
} from 'lucide-react';

export const DashboardView = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [currentRun, setCurrentRun] = useState(null);
  const [epfSummary, setEpfSummary] = useState(null);
  const [allRuns, setAllRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  const activePeriod = '2026-10';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [empRes, runsRes] = await Promise.all([
        employeeApi.getAll().catch(() => ({ data: [] })),
        payrollApi.getAllRuns().catch(() => ({ data: [] })),
      ]);

      setEmployees(empRes.data || []);
      const runs = runsRes.data || [];
      setAllRuns(runs);

      const latest = runs.find(r => r.periodCode === activePeriod) || runs[0];
      setCurrentRun(latest);

      if (latest) {
        try {
          const epfRes = await reportApi.getEPFCForm(activePeriod);
          setEpfSummary(epfRes.data);
        } catch {
          // No calculated run yet
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const formatLKR = (amount) => {
    if (amount === undefined || amount === null) return 'LKR 0.00';
    return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="page-body">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-emerald">Audit-Ready Sri Lankan Payroll</span>
            <span className="badge badge-indigo">Single Company Deployment (100 Staff)</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>
            Welcome back, {user?.username}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Lanka Precision Technologies (Pvt) Ltd • Active Monthly Processing Period: <strong style={{ color: '#fff' }}>{activePeriod}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(hasRole('SUPER_ADMIN') || hasRole('PAYROLL_OFFICER')) && (
            <button
              onClick={() => navigate('/payroll')}
              className="btn btn-primary"
            >
              <Calculator size={18} />
              <span>Launch Payroll Hub</span>
            </button>
          )}
          <button
            onClick={() => navigate('/reports')}
            className="btn btn-secondary"
          >
            <FileSpreadsheet size={18} />
            <span>Statutory Reports</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Active Staff"
          value={employees.length.toString()}
          sub="100% On-roll enrolled"
          icon={Users}
          color="indigo"
        />

        <StatCard
          label={`Period Gross (${activePeriod})`}
          value={formatLKR(currentRun?.totalGross)}
          sub="Basic + Allowances + OT"
          icon={Coins}
          color="indigo"
        />

        <StatCard
          label={`Net Pay Liability (${activePeriod})`}
          value={formatLKR(currentRun?.totalNet)}
          sub="Direct Bank Payout"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          label="Total EPF (20% Combined)"
          value={formatLKR(epfSummary?.grandTotalContribution || (currentRun?.totalGross ? currentRun.totalGross * 0.20 : 0))}
          sub="8% Employee + 12% Employer"
          icon={Scale}
          color="amber"
        />
      </div>

      {/* Statutory Rules & Compliance Quick Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <ShieldCheck size={20} color="#10b981" />
                <span>Sri Lankan Statutory Compliance Status</span>
              </div>
              <div className="card-subtitle">Prevailing legislative rates active in engine</div>
            </div>
            <span className="badge badge-emerald">Active Rules</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>EPF Employee Liability</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Deducted from gross salary</div>
              </div>
              <div className="mono font-semibold text-main">8.00%</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>EPF Employer Contribution</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Employer-only statutory liability</div>
              </div>
              <div className="mono font-semibold" style={{ color: '#818cf8' }}>12.00%</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>ETF Employer Contribution</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Act No. 46 of 1980 (Employer only)</div>
              </div>
              <div className="mono font-semibold" style={{ color: '#34d399' }}>3.00%</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>APIT Monthly Personal Relief</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tax-exempt base relief</div>
              </div>
              <div className="mono font-semibold text-main">LKR 150,000.00</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.85rem' }}>Overtime Standard Formula</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>(Basic / 240 hrs) × 1.5 × OT Hours</div>
              </div>
              <div className="mono font-semibold text-main">1.50× Factor</div>
            </div>
          </div>
        </div>

        {/* Current Period Actions & Status */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Calculator size={20} color="#6366f1" />
                <span>Payroll Execution Hub ({activePeriod})</span>
              </div>
              <div className="card-subtitle">Monthly engine calculation & lock status</div>
            </div>
            <span className={`badge ${currentRun?.status === 'LOCKED' ? 'badge-rose' : 'badge-emerald'}`}>
              {currentRun?.status || 'PENDING'}
            </span>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calculation Run ID:</span>
              <span className="mono font-semibold text-main">{currentRun?.id ? `#RUN-${currentRun.id}` : 'Not Run Yet'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Employees Processed:</span>
              <span className="mono font-semibold text-main">{currentRun?.employeeCount || employees.length} Staff</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Immutability Lock:</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: currentRun?.status === 'LOCKED' ? '#f87171' : '#34d399' }}>
                {currentRun?.status === 'LOCKED' ? 'Immutable (Locked)' : 'Draft (Editable)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created By:</span>
              <span className="mono text-dim" style={{ fontSize: '0.85rem' }}>{currentRun?.createdBy || 'System'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
            <button
              onClick={() => navigate('/payroll')}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <span>View Payroll Lines & Finalize</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <span>Export Bank Transfer CSV & Payslips</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Payroll Runs Table */}
      <div className="glass-card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <FileSpreadsheet size={20} color="#6366f1" />
              <span>Historical Payroll Runs (Audit-Locked)</span>
            </div>
            <div className="card-subtitle">Strictly immutable historical records with Envers revision tracking</div>
          </div>
          <button onClick={() => navigate('/payroll')} className="btn btn-secondary btn-sm">
            <span>Manage All Runs</span>
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Period</th>
                <th>Status</th>
                <th>Employees</th>
                <th className="text-right">Total Gross (LKR)</th>
                <th className="text-right">Total Net (LKR)</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allRuns.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No payroll runs recorded yet. Click "Launch Payroll Hub" to calculate for {activePeriod}.
                  </td>
                </tr>
              ) : (
                allRuns.map((run) => (
                  <tr key={run.id}>
                    <td className="mono font-semibold">#RUN-{run.id}</td>
                    <td className="font-semibold text-main">{run.periodCode}</td>
                    <td>
                      <span className={`badge ${run.status === 'LOCKED' ? 'badge-rose' : 'badge-emerald'}`}>
                        {run.status === 'LOCKED' ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                        <span>{run.status}</span>
                      </span>
                    </td>
                    <td className="mono">{run.employeeCount || employees.length}</td>
                    <td className="mono text-right font-semibold">{formatLKR(run.totalGross)}</td>
                    <td className="mono text-right font-semibold" style={{ color: '#34d399' }}>{formatLKR(run.totalNet)}</td>
                    <td className="text-dim" style={{ fontSize: '0.8rem' }}>
                      {run.createdAt ? new Date(run.createdAt).toLocaleDateString() : 'Active'}
                    </td>
                    <td>
                      <button
                        onClick={() => navigate('/payroll')}
                        className="btn btn-secondary btn-sm"
                      >
                        Inspect Lines
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
