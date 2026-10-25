import React, { useState, useEffect } from 'react';
import { payrollApi } from '../api/payrollApi';
import { reportApi } from '../api/reportApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  Calculator,
  Lock,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Printer,
  Shield,
  Building,
  RefreshCw
} from 'lucide-react';

export const PayrollRunView = () => {
  const { hasRole } = useAuth();
  const [periodCode, setPeriodCode] = useState('2026-10');
  const [payrollRun, setPayrollRun] = useState(null);
  const [runLines, setRunLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Payslip Modal State
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [payslipLoading, setPayslipLoading] = useState(false);

  useEffect(() => {
    loadPayrollData(periodCode);
  }, [periodCode]);

  const loadPayrollData = async (period) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await payrollApi.getRunByPeriod(period);
      setPayrollRun(res.data);
      if (res.data?.id) {
        const linesRes = await payrollApi.getRunLines(res.data.id);
        setRunLines(linesRes.data || []);
      } else {
        setRunLines([]);
      }
    } catch (err) {
      // Period not calculated yet
      setPayrollRun(null);
      setRunLines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePayroll = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await payrollApi.calculate(periodCode);
      setPayrollRun(res.data);
      setFeedback({ type: 'success', text: `Payroll calculated successfully for period ${periodCode}!` });
      if (res.data?.id) {
        const linesRes = await payrollApi.getRunLines(res.data.id);
        setRunLines(linesRes.data || []);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to calculate payroll.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLockPayroll = async () => {
    if (!payrollRun?.id) return;
    const confirmed = window.confirm(
      `CRITICAL IMMUTABILITY NOTICE:\nLocking payroll run for period ${periodCode} will permanently freeze all payroll lines, payslips, and statutory figures. Once locked, it can NEVER be recalculated or altered.\n\nDo you want to proceed?`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await payrollApi.lock(payrollRun.id);
      setPayrollRun(res.data);
      setFeedback({ type: 'success', text: `Payroll run #${res.data.id} is now LOCKED and strictly immutable.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to lock payroll.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBankBatch = async () => {
    if (!payrollRun?.id) return;
    try {
      const res = await payrollApi.generateBankBatch(payrollRun.id);
      setFeedback({ type: 'success', text: `Bank Transfer Batch '${res.data.name}' generated successfully!` });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to generate bank transfer batch.' });
    }
  };

  const handleViewPayslip = async (empId) => {
    setPayslipLoading(true);
    setIsPayslipOpen(true);
    try {
      const res = await reportApi.getEmployeePayslip(empId, periodCode);
      setSelectedPayslip(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPayslipLoading(false);
    }
  };

  const formatLKR = (amount) => {
    if (amount === undefined || amount === null) return 'LKR 0.00';
    return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isLocked = payrollRun?.status === 'LOCKED';

  return (
    <div className="page-body">
      {/* Top Engine Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>Payroll Execution & Audit Hub</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Statutory rule-driven computation engine with immutable historical locking & banking export
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Period:</span>
            <select
              value={periodCode}
              onChange={(e) => setPeriodCode(e.target.value)}
              className="mono font-semibold"
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="2026-10" style={{ background: '#1e293b' }}>2026-10 (Current)</option>
              <option value="2026-09" style={{ background: '#1e293b' }}>2026-09 (Previous)</option>
              <option value="2026-11" style={{ background: '#1e293b' }}>2026-11 (Next Period)</option>
            </select>
          </div>

          {(hasRole('SUPER_ADMIN') || hasRole('PAYROLL_OFFICER')) && (
            <button
              onClick={handleCalculatePayroll}
              className="btn btn-primary"
              disabled={loading || isLocked}
              title={isLocked ? 'This period is locked and strictly immutable.' : 'Execute Statutory Calculation'}
            >
              <Calculator size={18} />
              <span>{isLocked ? 'Run Locked' : 'Run Calculation'}</span>
            </button>
          )}

          {(hasRole('SUPER_ADMIN') || hasRole('PAYROLL_OFFICER')) && payrollRun && !isLocked && (
            <button
              onClick={handleLockPayroll}
              className="btn btn-danger"
              disabled={loading}
              title="Lock payroll to guarantee immutability"
            >
              <Lock size={18} />
              <span>Lock & Finalize Run</span>
            </button>
          )}

          {payrollRun && (
            <a
              href={reportApi.downloadBankTransferCsvUrl(payrollRun.id)}
              className="btn btn-secondary"
              target="_blank"
              rel="noreferrer"
            >
              <Download size={18} />
              <span>Download Bank CSV</span>
            </a>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.type === 'success' ? '#34d399' : '#f87171',
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Selected Run Overview Banner */}
      <div className="glass-card" style={{ marginBottom: '1.75rem', borderLeft: isLocked ? '4px solid #ef4444' : '4px solid #10b981' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Period Run: {periodCode}
              </span>
              <span className={`badge ${isLocked ? 'badge-rose' : 'badge-emerald'}`}>
                {isLocked ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                <span>{payrollRun?.status || 'NOT CALCULATED'}</span>
              </span>
              {isLocked && (
                <span className="badge badge-amber">Strictly Immutable</span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              {payrollRun?.id ? `Database Run Identifier: #RUN-${payrollRun.id} • Processed by ${payrollRun.createdBy || 'Engine'}` : 'No active calculation found for this month'}
            </p>
          </div>

          {payrollRun && (
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gross Earnings</div>
                <div className="mono font-semibold" style={{ fontSize: '1.15rem', color: '#fff' }}>{formatLKR(payrollRun.totalGross)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Bank Payout</div>
                <div className="mono font-semibold" style={{ fontSize: '1.15rem', color: '#34d399' }}>{formatLKR(payrollRun.totalNet)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Processed Staff</div>
                <div className="mono font-semibold" style={{ fontSize: '1.15rem', color: '#818cf8' }}>{payrollRun.employeeCount || runLines.length}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payroll Run Lines Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="card-header" style={{ padding: '1.25rem 1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div className="card-title">
              <FileSpreadsheet size={18} color="#6366f1" />
              <span>Employee Computation Breakdown</span>
            </div>
            <div className="card-subtitle">Detailed financial arithmetic in Sri Lankan Rupees (LKR NUMERIC 12,2)</div>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Emp #</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th className="text-right">Basic (LKR)</th>
                <th className="text-right">Gross (LKR)</th>
                <th className="text-right">EPF 8% (LKR)</th>
                <th className="text-right">APIT Tax (LKR)</th>
                <th className="text-right">Net Pay (LKR)</th>
                <th style={{ textAlign: 'center' }}>Payslip</th>
              </tr>
            </thead>
            <tbody>
              {runLines.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No calculated lines for period {periodCode}. Click "Run Calculation" to compute statutory payroll.
                  </td>
                </tr>
              ) : (
                runLines.map((line) => (
                  <tr key={line.id}>
                    <td className="mono font-semibold" style={{ color: '#818cf8' }}>{line.empNo}</td>
                    <td className="font-semibold text-main">{line.employeeName}</td>
                    <td><span className="badge badge-indigo">{line.department}</span></td>
                    <td>{line.designation}</td>
                    <td className="mono text-right">{formatLKR(line.basicSalary)}</td>
                    <td className="mono text-right font-semibold">{formatLKR(line.grossEarnings)}</td>
                    <td className="mono text-right font-semibold" style={{ color: '#fbbf24' }}>{formatLKR(line.employeeEpf)}</td>
                    <td className="mono text-right font-semibold" style={{ color: line.apitTax > 0 ? '#f87171' : 'var(--text-dim)' }}>
                      {formatLKR(line.apitTax)}
                    </td>
                    <td className="mono text-right font-semibold" style={{ color: '#34d399', fontSize: '0.95rem' }}>
                      {formatLKR(line.netPay)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewPayslip(line.empId)}
                        className="btn btn-secondary btn-sm"
                        title="View Official Payslip"
                      >
                        <FileText size={14} />
                        <span>Payslip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Sri Lankan Payslip Modal */}
      <Modal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        title="Official Sri Lankan Employee Payslip"
        subtitle={`Period: ${periodCode} • Lanka Precision Technologies (Pvt) Ltd`}
        maxWidth="750px"
      >
        {payslipLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            <p>Loading payslip details...</p>
          </div>
        ) : selectedPayslip ? (
          <div>
            {/* Printable Payslip Sheet */}
            <div className="payslip-sheet" style={{
              background: '#0f172a',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.75rem',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Lanka Precision Technologies (Pvt) Ltd</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corporate Head Office, Colombo 03, Sri Lanka</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EPF Reg No: EPF/COL/98765 • Company Reg: PV00234567</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge badge-emerald">CONFIDENTIAL PAYSLIP</div>
                  <div className="mono font-semibold" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>{selectedPayslip.payPeriod}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Issued: {selectedPayslip.issuedDate}</div>
                </div>
              </div>

              {/* Employee Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EMPLOYEE NAME & NUMBER</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedPayslip.employeeName} ({selectedPayslip.empNo})</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>NIC / TAX IDENTIFIER</div>
                  <div className="mono" style={{ fontWeight: 600, color: '#fff' }}>{selectedPayslip.nic}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>DEPARTMENT & DESIGNATION</div>
                  <div style={{ color: '#fff' }}>{selectedPayslip.department} — {selectedPayslip.designation}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>BANK REMITTANCE ACCOUNT</div>
                  <div className="mono" style={{ color: '#fff' }}>{selectedPayslip.bankName} • {selectedPayslip.accountNo}</div>
                </div>
              </div>

              {/* Dual Column: Earnings vs Deductions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Earnings Column */}
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#34d399', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '0.35rem' }}>
                    Earnings & Allowances
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedPayslip.earnings?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{item.componentName}</span>
                        <span className="mono font-semibold">{formatLKR(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 700 }}>
                    <span>Total Gross</span>
                    <span className="mono" style={{ color: '#34d399' }}>{formatLKR(selectedPayslip.grossEarnings)}</span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f87171', textTransform: 'uppercase', marginBottom: '0.75rem', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '0.35rem' }}>
                    Deductions & Statutory
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedPayslip.deductions?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{item.componentName}</span>
                        <span className="mono font-semibold" style={{ color: '#f87171' }}>{formatLKR(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 700 }}>
                    <span>Total Deductions</span>
                    <span className="mono" style={{ color: '#f87171' }}>{formatLKR(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NET REMITTANCE AMOUNT</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Direct Credit to Bank Account</div>
                </div>
                <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
                  {formatLKR(selectedPayslip.netPay)}
                </div>
              </div>

              {/* Employer Statutory Contributions Footer (Non-deductible from employee) */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Employer Statutory Contributions (Not Deducted From Pay)
                </div>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.825rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>EPF Employer (12%): </span>
                    <strong className="mono" style={{ color: '#818cf8' }}>{formatLKR(selectedPayslip.employerEpf)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>ETF Employer (3%): </span>
                    <strong className="mono" style={{ color: '#34d399' }}>{formatLKR(selectedPayslip.employerEtf)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer no-print" style={{ margin: '1.25rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={16} />
                <span>Print Official Payslip</span>
              </button>
              <button onClick={() => setIsPayslipOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
