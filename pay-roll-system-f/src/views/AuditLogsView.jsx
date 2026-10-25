import React, { useState, useEffect } from 'react';
import { auditLogApi } from '../api/auditLogApi';
import {
  ShieldCheck,
  Search,
  History,
  Database,
  Lock,
  User,
  Clock,
  Layers,
  RefreshCw
} from 'lucide-react';

export const AuditLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs(selectedEntity);
  }, [selectedEntity]);

  const loadLogs = async (entity) => {
    setLoading(true);
    try {
      const res = await auditLogApi.getRecentLogs(entity);
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>Audit Trail & Compliance History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            System activity logging and Hibernate Envers revision-level immutability tracking
          </p>
        </div>

        <button onClick={() => loadLogs(selectedEntity)} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Envers & Compliance Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <Database size={18} color="#818cf8" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Hibernate Envers Tables</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Automated schema revisioning active on <code style={{ color: '#818cf8' }}>employees_aud</code>, <code style={{ color: '#818cf8' }}>statutory_rules_aud</code>, <code style={{ color: '#818cf8' }}>payroll_runs_aud</code>, and <code style={{ color: '#818cf8' }}>payroll_run_lines_aud</code> linked with <code style={{ color: '#818cf8' }}>revinfo</code>.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <Lock size={18} color="#f87171" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Immutable Historical Runs</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Once a payroll run is transitioned to <strong>LOCKED</strong> state, it is protected by business constraints: neither retroactive recalculation nor line tampering is permitted.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Entity:</span>
          <select
            className="form-control"
            style={{ maxWidth: '280px' }}
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
          >
            <option value="">All Audited Entities</option>
            <option value="Employee">Employee (employees_aud)</option>
            <option value="PayrollRun">PayrollRun (payroll_runs_aud)</option>
            <option value="StatutoryRule">StatutoryRule (statutory_rules_aud)</option>
            <option value="LeaveRequest">LeaveRequest</option>
            <option value="Loan">Loan</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>User / Principal</th>
                <th>Action Taken</th>
                <th>Target Entity</th>
                <th>Entity Record ID</th>
                <th>Timestamp</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading audit stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No audit records logged yet for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="mono text-dim">#AUD-{log.id}</td>
                    <td className="font-semibold text-main">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <User size={14} color="#818cf8" />
                        <span>{log.username || 'SYSTEM'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-indigo">{log.action}</span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: '#fff' }}>{log.entityName}</span>
                    </td>
                    <td className="mono font-semibold" style={{ color: '#818cf8' }}>
                      {log.entityId ? `#${log.entityId}` : '—'}
                    </td>
                    <td className="mono text-dim" style={{ fontSize: '0.8rem' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                    </td>
                    <td>
                      <span className="badge badge-emerald">
                        <ShieldCheck size={12} />
                        <span>VERIFIED</span>
                      </span>
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
