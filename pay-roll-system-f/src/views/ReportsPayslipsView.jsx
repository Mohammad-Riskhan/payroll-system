import React, { useState, useEffect } from 'react';
import { reportApi } from '../api/reportApi';
import { payrollApi } from '../api/payrollApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Building,
  CheckCircle2,
  Calendar,
  FileText,
  CreditCard,
  Building2,
  RefreshCw
} from 'lucide-react';

export const ReportsPayslipsView = () => {
  const { user } = useAuth();
  const [periodCode, setPeriodCode] = useState('2026-10');
  const [activeTab, setActiveTab] = useState('epf-cform');
  const [epfReport, setEpfReport] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [payrollRun, setPayrollRun] = useState(null);
  const [loading, setLoading] = useState(false);

  // Payslip detail modal
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);

  useEffect(() => {
    loadReports(periodCode);
  }, [periodCode]);

  const loadReports = async (period) => {
    setLoading(true);
    try {
      const [epfRes, slipsRes, runRes] = await Promise.all([
        reportApi.getEPFCForm(period).catch(() => ({ data: null })),
        reportApi.getAllPayslips(period).catch(() => ({ data: [] })),
        payrollApi.getRunByPeriod(period).catch(() => ({ data: null })),
      ]);

      setEpfReport(epfRes.data);
      setPayslips(slipsRes.data || []);
      setPayrollRun(runRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatLKR = (amount) => {
    if (amount === undefined || amount === null) return 'LKR 0.00';
    return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const handleDownloadCsv = async () => {
    if (!payrollRun?.id) return;
    setDownloadingCsv(true);
    try {
      const response = await reportApi.downloadBankTransferCsv(payrollRun.id);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bank-transfer-run-${payrollRun.id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download CSV', err);
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }} className="no-print">
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>Statutory Reporting & Payslips</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Official EPF 'C' Form returns, staff payslips, and corporate bank transfer remittances
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Period:</span>
            <select
              value={periodCode}
              onChange={(e) => setPeriodCode(e.target.value)}
              className="mono font-semibold"
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="2026-10" style={{ background: '#1e293b' }}>2026-10</option>
              <option value="2026-09" style={{ background: '#1e293b' }}>2026-09</option>
            </select>
          </div>

          <button onClick={() => window.print()} className="btn btn-primary">
            <Printer size={16} />
            <span>Print Current Report</span>
          </button>

          {payrollRun?.id && (
            <button
              onClick={handleDownloadCsv}
              className="btn btn-secondary"
              disabled={downloadingCsv}
            >
              <Download size={16} />
              <span>{downloadingCsv ? 'Downloading...' : 'Download Bank CSV'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav no-print">
        <button
          onClick={() => setActiveTab('epf-cform')}
          className={`tab-btn ${activeTab === 'epf-cform' ? 'active' : ''}`}
        >
          <FileSpreadsheet size={16} />
          <span>Statutory EPF Form 'C' Return</span>
        </button>
        <button
          onClick={() => setActiveTab('payslips')}
          className={`tab-btn ${activeTab === 'payslips' ? 'active' : ''}`}
        >
          <FileText size={16} />
          <span>Monthly Payslip Register ({payslips.length})</span>
        </button>
      </div>

      {/* Tab 1: EPF Form C */}
      {activeTab === 'epf-cform' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              <p>Generating EPF Form C Report...</p>
            </div>
          ) : epfReport ? (
            <div className="glass-card" style={{ padding: '2rem' }}>
              {/* Official C-Form Sri Lankan Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.15)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Central Bank of Sri Lanka • Employees' Provident Fund Department
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                  FORM "C" (MONTHLY CONTRIBUTION RETURN)
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Under Section 10 of the Employees' Provident Fund Act No. 15 of 1958
                </div>
              </div>

              {/* Employer Particulars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EMPLOYER NAME</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{epfReport.companyName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EPF REGISTRATION NO.</div>
                  <div className="mono font-semibold" style={{ color: '#818cf8' }}>{epfReport.epfRegistrationNo}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>CONTRIBUTION MONTH / YEAR</div>
                  <div className="mono font-semibold" style={{ color: '#34d399' }}>{epfReport.periodCode}</div>
                </div>
              </div>

              {/* Member Schedule Table */}
              <div className="table-container" style={{ marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Line</th>
                      <th>Member #</th>
                      <th>Member Full Name</th>
                      <th>NIC No.</th>
                      <th className="text-right">Total Earnings (LKR)</th>
                      <th className="text-right">Member 8% (LKR)</th>
                      <th className="text-right">Employer 12% (LKR)</th>
                      <th className="text-right">Total 20% (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {epfReport.records?.map((rec, idx) => (
                      <tr key={idx}>
                        <td className="mono text-dim">{idx + 1}</td>
                        <td className="mono font-semibold" style={{ color: '#818cf8' }}>{rec.empNo}</td>
                        <td className="font-semibold text-main">{rec.employeeName}</td>
                        <td className="mono text-dim">{rec.nic}</td>
                        <td className="mono text-right">{formatLKR(rec.epfLiableEarnings)}</td>
                        <td className="mono text-right font-semibold" style={{ color: '#fbbf24' }}>{formatLKR(rec.employeeEpf8)}</td>
                        <td className="mono text-right font-semibold" style={{ color: '#818cf8' }}>{formatLKR(rec.employerEpf12)}</td>
                        <td className="mono text-right font-semibold" style={{ color: '#34d399' }}>{formatLKR(rec.totalEpf20)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(30, 41, 59, 0.9)', fontWeight: 700 }}>
                      <td colSpan="4" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Grand Totals ({epfReport.records?.length || 0} Members)
                      </td>
                      <td className="mono text-right font-semibold">{formatLKR(epfReport.totalGrossForEpf)}</td>
                      <td className="mono text-right font-semibold" style={{ color: '#fbbf24' }}>{formatLKR(epfReport.totalEmployeeContribution)}</td>
                      <td className="mono text-right font-semibold" style={{ color: '#818cf8' }}>{formatLKR(epfReport.totalEmployerContribution)}</td>
                      <td className="mono text-right font-semibold" style={{ color: '#34d399', fontSize: '1rem' }}>
                        {formatLKR(epfReport.grandTotalContribution)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Statutory Certification Block */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    I certify that the particulars furnished above are correct and that the total remittance of <strong>{formatLKR(epfReport.grandTotalContribution)}</strong> covers the correct statutory contributions for the period.
                  </p>
                  <div style={{ marginTop: '2.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Signature of Employer / Authorized Officer & Official Stamp
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {new Date().toLocaleDateString()}</div>
                  <div style={{ marginTop: '2.5rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Central Bank / Labour Department Acknowledgement
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No calculated payroll run found for period {periodCode}. Please compute payroll in the Payroll Execution Hub first.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Payslip Directory */}
      {activeTab === 'payslips' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Emp #</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Pay Period</th>
                  <th className="text-right">Gross (LKR)</th>
                  <th className="text-right">Deductions (LKR)</th>
                  <th className="text-right">Net Pay (LKR)</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payslips.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No payslips found for period {periodCode}.
                    </td>
                  </tr>
                ) : (
                  payslips.map((ps) => (
                    <tr key={ps.id}>
                      <td className="mono font-semibold" style={{ color: '#818cf8' }}>{ps.empNo}</td>
                      <td className="font-semibold text-main">{ps.employeeName}</td>
                      <td><span className="badge badge-indigo">{ps.department}</span></td>
                      <td>{ps.designation}</td>
                      <td className="mono">{ps.payPeriod}</td>
                      <td className="mono text-right">{formatLKR(ps.grossEarnings)}</td>
                      <td className="mono text-right" style={{ color: '#f87171' }}>{formatLKR(ps.totalDeductions)}</td>
                      <td className="mono text-right font-semibold" style={{ color: '#34d399' }}>{formatLKR(ps.netPay)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedPayslip(ps);
                            setIsPayslipOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <FileText size={14} />
                          <span>View / Print</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      <Modal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        title="Official Sri Lankan Employee Payslip"
        subtitle={`Period: ${periodCode} • Lanka Precision Technologies (Pvt) Ltd`}
        maxWidth="750px"
      >
        {selectedPayslip && (
          <div>
            <div className="payslip-sheet" style={{
              background: '#0f172a',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>Lanka Precision Technologies (Pvt) Ltd</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Colombo Corporate Office, Colombo 03</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EPF Reg: EPF/COL/98765 • Company Reg: PV00234567</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge badge-emerald">OFFICIAL PAYSLIP</div>
                  <div className="mono font-semibold" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>{selectedPayslip.payPeriod}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Issued: {selectedPayslip.issuedDate}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>EMPLOYEE NAME & NUMBER</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedPayslip.employeeName} ({selectedPayslip.empNo})</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>NIC NO.</div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#34d399', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
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

                <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f87171', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>NET REMITTANCE AMOUNT</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bank Credit Transferred</div>
                </div>
                <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
                  {formatLKR(selectedPayslip.netPay)}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Employer Statutory Contributions (Not Deducted From Salary)
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
        )}
      </Modal>
    </div>
  );
};
