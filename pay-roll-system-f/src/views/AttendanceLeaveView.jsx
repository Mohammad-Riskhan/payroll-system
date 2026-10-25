import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../api/attendanceApi';
import { leaveApi } from '../api/leaveApi';
import { employeeApi } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  CalendarCheck2,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Calendar
} from 'lucide-react';

export const AttendanceLeaveView = () => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance');
  const [payPeriod, setPayPeriod] = useState('2026-10');
  const [employees, setEmployees] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [overtimeList, setOvertimeList] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // Record Attendance Modal
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    empId: '',
    workedDays: '22.00',
    noPayDays: '0.00',
  });

  // Record Overtime Modal
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [otForm, setOtForm] = useState({
    empId: '',
    otHours: '10.00',
  });

  // Apply Leave Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    empId: '',
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAllData();
  }, [payPeriod]);

  const loadAllData = async () => {
    try {
      const [empRes, attRes, otRes, lReqRes, lTypeRes] = await Promise.all([
        employeeApi.getAll(),
        attendanceApi.getPeriodAttendance(payPeriod).catch(() => ({ data: [] })),
        attendanceApi.getPeriodOvertime(payPeriod).catch(() => ({ data: [] })),
        leaveApi.getAllRequests().catch(() => ({ data: [] })),
        leaveApi.getTypes().catch(() => ({ data: [] })),
      ]);
      setEmployees(empRes.data || []);
      setAttendanceList(attRes.data || []);
      setOvertimeList(otRes.data || []);
      setLeaveRequests(lReqRes.data || []);
      setLeaveTypes(lTypeRes.data || []);

      if (empRes.data?.length > 0) {
        setAttendanceForm(prev => ({ ...prev, empId: empRes.data[0].id }));
        setOtForm(prev => ({ ...prev, empId: empRes.data[0].id }));
        setLeaveForm(prev => ({ ...prev, empId: empRes.data[0].id }));
      }
      if (lTypeRes.data?.length > 0) {
        setLeaveForm(prev => ({ ...prev, leaveTypeId: lTypeRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    try {
      await attendanceApi.recordAttendance({
        empId: Number(attendanceForm.empId),
        payPeriod,
        workedDays: Number(attendanceForm.workedDays),
        noPayDays: Number(attendanceForm.noPayDays),
      });
      setFeedback({ type: 'success', text: 'Attendance recorded successfully!' });
      setIsAttendanceModalOpen(false);
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to record attendance.' });
    }
  };

  const handleRecordOvertime = async (e) => {
    e.preventDefault();
    try {
      await attendanceApi.recordOvertime({
        empId: Number(otForm.empId),
        payPeriod,
        otHours: Number(otForm.otHours),
      });
      setFeedback({ type: 'success', text: 'Overtime hours logged successfully!' });
      setIsOtModalOpen(false);
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to log overtime.' });
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await leaveApi.apply({
        empId: Number(leaveForm.empId),
        leaveTypeId: Number(leaveForm.leaveTypeId),
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
      });
      setFeedback({ type: 'success', text: 'Leave request submitted!' });
      setIsLeaveModalOpen(false);
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to apply for leave.' });
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      await leaveApi.updateStatus(id, status);
      setFeedback({ type: 'success', text: `Leave request marked as ${status}.` });
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to update leave status.' });
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
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>Attendance, Overtime & Leaves</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Workforce presence records, statutory OT arithmetic (1.5x formula), and leave approval workflow
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Period:</span>
            <select
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value)}
              className="mono font-semibold"
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="2026-10" style={{ background: '#1e293b' }}>2026-10</option>
              <option value="2026-09" style={{ background: '#1e293b' }}>2026-09</option>
            </select>
          </div>

          {activeTab === 'attendance' && (
            <button onClick={() => setIsAttendanceModalOpen(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Record Worked/No-Pay</span>
            </button>
          )}

          {activeTab === 'overtime' && (
            <button onClick={() => setIsOtModalOpen(true)} className="btn btn-primary">
              <Clock size={16} />
              <span>Log OT Hours</span>
            </button>
          )}

          {activeTab === 'leaves' && (
            <button onClick={() => setIsLeaveModalOpen(true)} className="btn btn-primary">
              <Calendar size={16} />
              <span>Apply for Leave</span>
            </button>
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
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
        >
          <CalendarCheck2 size={16} />
          <span>Worked & No-Pay Days ({attendanceList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('overtime')}
          className={`tab-btn ${activeTab === 'overtime' ? 'active' : ''}`}
        >
          <Clock size={16} />
          <span>Statutory Overtime Log ({overtimeList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
        >
          <Calendar size={16} />
          <span>Leave Requests & Balances ({leaveRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: Attendance Table */}
      {activeTab === 'attendance' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Emp #</th>
                  <th>Employee Name</th>
                  <th>Pay Period</th>
                  <th className="text-right">Worked Days</th>
                  <th className="text-right">No-Pay Days (Deductions)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No attendance logged for {payPeriod}. Click "Record Worked/No-Pay" to add attendance.
                    </td>
                  </tr>
                ) : (
                  attendanceList.map((att) => (
                    <tr key={att.id}>
                      <td className="mono font-semibold" style={{ color: '#818cf8' }}>{att.empNo}</td>
                      <td className="font-semibold text-main">{att.employeeName}</td>
                      <td className="mono">{att.payPeriod}</td>
                      <td className="mono text-right font-semibold" style={{ color: '#34d399' }}>{att.workedDays} Days</td>
                      <td className="mono text-right font-semibold" style={{ color: att.noPayDays > 0 ? '#f87171' : 'var(--text-dim)' }}>
                        {att.noPayDays} Days
                      </td>
                      <td>
                        <span className={`badge ${att.noPayDays > 0 ? 'badge-amber' : 'badge-emerald'}`}>
                          {att.noPayDays > 0 ? 'Deduction Applicable' : 'Full Attendance'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Overtime Table */}
      {activeTab === 'overtime' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Emp #</th>
                  <th>Employee Name</th>
                  <th>Pay Period</th>
                  <th className="text-right">OT Hours</th>
                  <th className="text-right">Computed OT Pay (LKR)</th>
                  <th>Statutory Formula</th>
                </tr>
              </thead>
              <tbody>
                {overtimeList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No overtime logged for {payPeriod}. Click "Log OT Hours" to record overtime.
                    </td>
                  </tr>
                ) : (
                  overtimeList.map((ot) => (
                    <tr key={ot.id}>
                      <td className="mono font-semibold" style={{ color: '#818cf8' }}>{ot.empNo}</td>
                      <td className="font-semibold text-main">{ot.employeeName}</td>
                      <td className="mono">{ot.payPeriod}</td>
                      <td className="mono text-right font-semibold" style={{ color: '#818cf8' }}>{ot.otHours} hrs</td>
                      <td className="mono text-right font-semibold" style={{ color: '#34d399' }}>
                        {formatLKR(ot.otAmount)}
                      </td>
                      <td className="mono text-dim" style={{ fontSize: '0.75rem' }}>
                        (Basic / 240) × 1.5 × {ot.otHours} hrs
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Leave Requests Table */}
      {activeTab === 'leaves' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Employee Name</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No leave applications submitted. Click "Apply for Leave" to create a request.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="mono">#LV-{req.id}</td>
                      <td className="font-semibold text-main">{req.employeeName} ({req.empNo})</td>
                      <td><span className="badge badge-indigo">{req.leaveTypeName}</span></td>
                      <td className="mono text-dim">{req.startDate}</td>
                      <td className="mono text-dim">{req.endDate}</td>
                      <td>
                        <span className={`badge ${
                          req.status === 'APPROVED' ? 'badge-emerald' : req.status === 'REJECTED' ? 'badge-rose' : 'badge-amber'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {(hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER') || hasRole('DEPARTMENT_MANAGER')) && req.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleUpdateLeaveStatus(req.id, 'APPROVED')}
                              className="btn btn-emerald btn-sm"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateLeaveStatus(req.id, 'REJECTED')}
                              className="btn btn-danger btn-sm"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title="Record Monthly Attendance"
        subtitle={`Period: ${payPeriod} • Standard monthly working days: 22`}
      >
        <form onSubmit={handleRecordAttendance}>
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select
              className="form-control"
              value={attendanceForm.empId}
              onChange={(e) => setAttendanceForm({ ...attendanceForm, empId: e.target.value })}
              required
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.empNo} - {e.firstName} {e.lastName}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Worked Days</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="31"
                className="form-control mono font-semibold"
                value={attendanceForm.workedDays}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, workedDays: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">No-Pay Days (Unpaid)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="31"
                className="form-control mono font-semibold"
                value={attendanceForm.noPayDays}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, noPayDays: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Attendance
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Overtime Modal */}
      <Modal
        isOpen={isOtModalOpen}
        onClose={() => setIsOtModalOpen(false)}
        title="Log Overtime Hours (1.5x Multiplier)"
        subtitle={`Period: ${payPeriod} • Standard divisor: 240 hours`}
      >
        <form onSubmit={handleRecordOvertime}>
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select
              className="form-control"
              value={otForm.empId}
              onChange={(e) => setOtForm({ ...otForm, empId: e.target.value })}
              required
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.empNo} - {e.firstName} {e.lastName} (Basic: {formatLKR(e.basicSalary)})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">OT Hours Worked</label>
            <input
              type="number"
              step="0.5"
              min="0"
              className="form-control mono font-semibold"
              value={otForm.otHours}
              onChange={(e) => setOtForm({ ...otForm, otHours: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" onClick={() => setIsOtModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Overtime
            </button>
          </div>
        </form>
      </Modal>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Apply for Employee Leave"
        subtitle="Annual, Casual, Medical or Maternity Leave"
      >
        <form onSubmit={handleApplyLeave}>
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select
              className="form-control"
              value={leaveForm.empId}
              onChange={(e) => setLeaveForm({ ...leaveForm, empId: e.target.value })}
              required
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.empNo} - {e.firstName} {e.lastName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Leave Type</label>
            <select
              className="form-control"
              value={leaveForm.leaveTypeId}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveTypeId: e.target.value })}
              required
            >
              {leaveTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name} (Max {t.maxDaysPerYear} days/yr)</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Leave Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
