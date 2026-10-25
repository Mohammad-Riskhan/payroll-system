import React, { useState, useEffect } from 'react';
import { loanApi } from '../api/loanApi';
import { employeeApi } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  Coins,
  Plus,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  User,
  Calendar
} from 'lucide-react';

export const LoansView = () => {
  const { hasRole } = useAuth();
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // New Loan Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loanForm, setLoanForm] = useState({
    empId: '',
    loanAmount: '120000.00',
    installmentAmount: '10000.00',
    totalInstallments: '12',
    remainingInstallments: '12',
  });

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const [loanRes, empRes] = await Promise.all([
        loanApi.getAll(),
        employeeApi.getAll(),
      ]);
      setLoans(loanRes.data || []);
      setEmployees(empRes.data || []);
      if (empRes.data?.length > 0) {
        setLoanForm(prev => ({ ...prev, empId: empRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    try {
      await loanApi.create({
        empId: Number(loanForm.empId),
        loanAmount: Number(loanForm.loanAmount),
        installmentAmount: Number(loanForm.installmentAmount),
        totalInstallments: Number(loanForm.totalInstallments),
        remainingInstallments: Number(loanForm.remainingInstallments),
      });
      setFeedback({ type: 'success', text: 'Staff loan approved and active in payroll!' });
      setIsModalOpen(false);
      loadLoans();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to create loan.' });
    }
  };

  const formatLKR = (amount) => {
    if (!amount) return 'LKR 0.00';
    return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>Staff Loan & Recovery Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Company advances, monthly salary deductions, and repayment amortization tracking
          </p>
        </div>

        {(hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER') || hasRole('ACCOUNTANT')) && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Issue Staff Loan</span>
          </button>
        )}
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
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Loans Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan Ref</th>
                <th>Employee Name</th>
                <th>Emp #</th>
                <th className="text-right">Total Principal (LKR)</th>
                <th className="text-right">Monthly Installment (LKR)</th>
                <th className="text-right">Installments Left</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No active staff loans recorded. Click "Issue Staff Loan" to approve a loan.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="mono font-semibold" style={{ color: '#818cf8' }}>#LN-{loan.id}</td>
                    <td className="font-semibold text-main">{loan.employeeName}</td>
                    <td className="mono text-dim">{loan.empNo}</td>
                    <td className="mono text-right font-semibold">{formatLKR(loan.loanAmount)}</td>
                    <td className="mono text-right font-semibold" style={{ color: '#f87171' }}>
                      {formatLKR(loan.installmentAmount)}
                    </td>
                    <td className="mono text-right">
                      {loan.remainingInstallments} / {loan.totalInstallments} Months
                    </td>
                    <td>
                      <span className={`badge ${loan.status === 'ACTIVE' ? 'badge-emerald' : 'badge-indigo'}`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Loan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Staff Loan"
        subtitle="Loan deduction will be automatically recovered during monthly payroll calculation"
      >
        <form onSubmit={handleCreateLoan}>
          <div className="form-group">
            <label className="form-label">Beneficiary Employee</label>
            <select
              className="form-control"
              value={loanForm.empId}
              onChange={(e) => setLoanForm({ ...loanForm, empId: e.target.value })}
              required
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.empNo} - {e.firstName} {e.lastName} (Basic: {formatLKR(e.basicSalary)})</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Loan Amount (LKR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control mono font-semibold"
                value={loanForm.loanAmount}
                onChange={(e) => {
                  const amt = Number(e.target.value);
                  const inst = Number(loanForm.totalInstallments) || 12;
                  setLoanForm({
                    ...loanForm,
                    loanAmount: e.target.value,
                    installmentAmount: (amt / inst).toFixed(2),
                  });
                }}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Installments (Months)</label>
              <input
                type="number"
                min="1"
                max="60"
                className="form-control mono"
                value={loanForm.totalInstallments}
                onChange={(e) => {
                  const inst = Number(e.target.value);
                  const amt = Number(loanForm.loanAmount) || 0;
                  setLoanForm({
                    ...loanForm,
                    totalInstallments: e.target.value,
                    remainingInstallments: e.target.value,
                    installmentAmount: inst > 0 ? (amt / inst).toFixed(2) : '0.00',
                  });
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Deducted Installment (LKR)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control mono font-semibold"
              value={loanForm.installmentAmount}
              onChange={(e) => setLoanForm({ ...loanForm, installmentAmount: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Approve Loan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
