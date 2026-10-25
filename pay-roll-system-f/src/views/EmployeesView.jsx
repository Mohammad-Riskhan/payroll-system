import React, { useState, useEffect } from 'react';
import { employeeApi } from '../api/employeeApi';
import { organizationApi } from '../api/organizationApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  Users,
  UserPlus,
  Search,
  Building,
  Briefcase,
  DollarSign,
  CreditCard,
  Edit2,
  Trash2,
  Sliders,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const EmployeesView = () => {
  const { hasRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [payComponents, setPayComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);

  // Add / Edit Employee Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    empNo: '',
    firstName: '',
    lastName: '',
    nic: '',
    joinedDate: new Date().toISOString().split('T')[0],
    departmentId: '',
    designationId: '',
    basicSalary: '',
    bankName: 'Commercial Bank of Ceylon',
    branchName: 'Colombo Corporate',
    accountNo: '',
  });

  // Salary Components Modal State
  const [selectedEmpForComponents, setSelectedEmpForComponents] = useState(null);
  const [empComponents, setEmpComponents] = useState([]);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [newComponentData, setNewComponentData] = useState({
    componentId: '',
    amount: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
  });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, desigRes, compRes] = await Promise.all([
        employeeApi.getAll(),
        organizationApi.getDepartments(),
        organizationApi.getDesignations(),
        organizationApi.getPayComponents(),
      ]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setDesignations(desigRes.data || []);
      setPayComponents(compRes.data || []);
      if (deptRes.data?.length > 0) {
        setFormData(prev => ({ ...prev, departmentId: deptRes.data[0].id }));
      }
      if (desigRes.data?.length > 0) {
        setFormData(prev => ({ ...prev, designationId: desigRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load employee data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingEmp(null);
    setFormData({
      empNo: `EMP00${employees.length + 1}`,
      firstName: '',
      lastName: '',
      nic: '',
      joinedDate: new Date().toISOString().split('T')[0],
      departmentId: departments[0]?.id || '',
      designationId: designations[0]?.id || '',
      basicSalary: '150000.00',
      bankName: 'Commercial Bank of Ceylon',
      branchName: 'Colombo Corporate',
      accountNo: '800' + Math.floor(1000000 + Math.random() * 9000000),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmp(emp);
    const bank = emp.bankDetail || {};
    setFormData({
      empNo: emp.empNo,
      firstName: emp.firstName,
      lastName: emp.lastName,
      nic: emp.nic,
      joinedDate: emp.joinedDate,
      departmentId: emp.departmentId || departments.find(d => d.name === (emp.departmentName || emp.department))?.id || departments[0]?.id,
      designationId: emp.designationId || designations.find(d => d.title === (emp.designationTitle || emp.designation))?.id || designations[0]?.id,
      basicSalary: emp.basicSalary,
      bankName: bank.bankName || emp.bankName || 'Commercial Bank of Ceylon',
      branchName: bank.branchName || emp.branchName || 'Colombo Corporate',
      accountNo: bank.accountNo || emp.accountNo || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        empNo: formData.empNo,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nic: formData.nic,
        joinedDate: formData.joinedDate,
        departmentId: Number(formData.departmentId),
        designationId: Number(formData.designationId),
        basicSalary: Number(formData.basicSalary),
        bankName: formData.bankName,
        branchName: formData.branchName,
        accountNo: formData.accountNo,
        bankDetails: {
          bankName: formData.bankName,
          branchName: formData.branchName,
          accountNo: formData.accountNo,
        },
      };

      if (editingEmp) {
        await employeeApi.update(editingEmp.id, payload);
        setFeedback({ type: 'success', text: `Employee ${formData.empNo} updated successfully!` });
      } else {
        await employeeApi.create(payload);
        setFeedback({ type: 'success', text: `Employee ${formData.empNo} enrolled successfully!` });
      }
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to save employee.' });
    }
  };

  const handleDeleteEmployee = async (id, empNo) => {
    if (!window.confirm(`Are you sure you want to delete employee ${empNo}? This action is audited.`)) return;
    try {
      await employeeApi.delete(id);
      setFeedback({ type: 'success', text: `Employee ${empNo} removed from directory.` });
      fetchInitialData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to delete employee.' });
    }
  };

  // Salary components management
  const handleOpenComponentsModal = async (emp) => {
    setSelectedEmpForComponents(emp);
    try {
      const res = await employeeApi.getSalaryComponents(emp.id);
      setEmpComponents(res.data || []);
      setNewComponentData({
        componentId: payComponents[0]?.id || '',
        amount: '10000.00',
        effectiveFrom: new Date().toISOString().split('T')[0],
      });
      setIsComponentModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComponent = async (e) => {
    e.preventDefault();
    try {
      await employeeApi.addSalaryComponent(selectedEmpForComponents.id, {
        componentId: Number(newComponentData.componentId),
        amount: Number(newComponentData.amount),
        effectiveFrom: newComponentData.effectiveFrom,
      });
      const res = await employeeApi.getSalaryComponents(selectedEmpForComponents.id);
      setEmpComponents(res.data || []);
      setFeedback({ type: 'success', text: 'Salary component assigned successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to assign salary component.' });
    }
  };

  const handleRemoveComponent = async (componentId) => {
    try {
      await employeeApi.removeSalaryComponent(componentId);
      const res = await employeeApi.getSalaryComponents(selectedEmpForComponents.id);
      setEmpComponents(res.data || []);
      setFeedback({ type: 'success', text: 'Salary component removed.' });
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to remove component.' });
    }
  };

  const formatLKR = (amount) => {
    if (!amount) return 'LKR 0.00';
    return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept ? ((emp.departmentName || emp.department) === selectedDept) : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="page-body">
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>Employee Master Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Enrolled workforce compensation structures, statutory liability flags, and bank details
          </p>
        </div>

        {(hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER')) && (
          <button onClick={handleOpenAddModal} className="btn btn-primary">
            <UserPlus size={18} />
            <span>Enroll New Employee</span>
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

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Employee #, Name, or NIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ minWidth: '200px' }}>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Emp #</th>
                <th>Employee Name</th>
                <th>NIC (National Identity)</th>
                <th>Department</th>
                <th>Designation</th>
                <th className="text-right">Basic Salary</th>
                <th>Bank & Account</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No matching employees found in registry.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="mono font-semibold" style={{ color: '#818cf8' }}>{emp.empNo}</td>
                    <td className="font-semibold text-main">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="mono text-dim">{emp.nic}</td>
                    <td>
                      <span className="badge badge-indigo">{emp.departmentName || emp.department}</span>
                    </td>
                    <td>{emp.designationTitle || emp.designation}</td>
                    <td className="mono font-semibold text-right" style={{ color: '#34d399' }}>
                      {formatLKR(emp.basicSalary)}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {emp.bankDetail?.bankName || emp.bankName || 'Commercial Bank of Ceylon'}
                      </div>
                      <div className="mono text-dim" style={{ fontSize: '0.75rem' }}>
                        {emp.bankDetail?.accountNo || emp.accountNo || 'N/A'}
                      </div>
                    </td>
                    <td className="text-dim" style={{ fontSize: '0.8rem' }}>{emp.joinedDate}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenComponentsModal(emp)}
                          className="btn-icon"
                          title="Salary Allowances & Deductions"
                          style={{ color: '#818cf8' }}
                        >
                          <Sliders size={15} />
                        </button>
                        {(hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER')) && (
                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="btn-icon"
                            title="Edit Employee"
                          >
                            <Edit2 size={15} />
                          </button>
                        )}
                        {hasRole('SUPER_ADMIN') && (
                          <button
                            onClick={() => handleDeleteEmployee(emp.id, emp.empNo)}
                            className="btn-icon"
                            title="Delete Employee"
                            style={{ color: '#f87171' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? `Edit Employee ${formData.empNo}` : 'Enroll New Employee'}
        subtitle="Specify personal NIC, department, designation, and basic statutory salary"
        maxWidth="680px"
      >
        <form onSubmit={handleSaveEmployee}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Employee Number</label>
              <input
                type="text"
                className="form-control mono"
                required
                value={formData.empNo}
                onChange={(e) => setFormData({ ...formData, empNo: e.target.value })}
                disabled={!!editingEmp}
              />
            </div>
            <div className="form-group">
              <label className="form-label">National Identity Card (NIC)</label>
              <input
                type="text"
                className="form-control mono"
                required
                placeholder="e.g. 199412345678"
                value={formData.nic}
                onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <select
                className="form-control"
                value={formData.designationId}
                onChange={(e) => setFormData({ ...formData, designationId: e.target.value })}
                required
              >
                {designations.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Basic Salary (LKR - NUMERIC 12,2)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control mono font-semibold"
                required
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Joined Date</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.joinedDate}
                onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={16} color="#10b981" />
              <span>Remittance Bank Details</span>
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Branch Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number</label>
                <input
                  type="text"
                  className="form-control mono"
                  value={formData.accountNo}
                  onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEmp ? 'Save Changes' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Salary Components & Allowances Modal */}
      <Modal
        isOpen={isComponentModalOpen}
        onClose={() => setIsComponentModalOpen(false)}
        title={`Salary Components: ${selectedEmpForComponents?.firstName} ${selectedEmpForComponents?.lastName} (${selectedEmpForComponents?.empNo})`}
        subtitle="Manage Budgetary Relief Allowance (BRA), transport, fixed allowances, and recurring deductions"
        maxWidth="720px"
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Recurring Components
          </h4>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Type</th>
                  <th>EPF Liable?</th>
                  <th>Taxable?</th>
                  <th className="text-right">Amount (LKR)</th>
                  <th style={{ textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {empComponents.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      No extra salary components assigned. Employee receives pure basic salary.
                    </td>
                  </tr>
                ) : (
                  empComponents.map((sc) => (
                    <tr key={sc.id}>
                      <td className="font-semibold text-main">{sc.componentName}</td>
                      <td>
                        <span className={`badge ${sc.componentType === 'EARNING' ? 'badge-emerald' : 'badge-rose'}`}>
                          {sc.componentType}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${sc.isEpfLiable ? 'badge-emerald' : 'badge-amber'}`}>
                          {sc.isEpfLiable ? 'YES (EPF 8%/12%)' : 'NO'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${sc.isTaxable ? 'badge-indigo' : 'badge-amber'}`}>
                          {sc.isTaxable ? 'YES (APIT)' : 'NO'}
                        </span>
                      </td>
                      <td className="mono font-semibold text-right" style={{ color: sc.componentType === 'EARNING' ? '#34d399' : '#f87171' }}>
                        {formatLKR(sc.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleRemoveComponent(sc.id)}
                          className="btn-icon"
                          style={{ color: '#f87171' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form to add a new component */}
        {(hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER')) && (
          <form onSubmit={handleAddComponent} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} color="#818cf8" />
              <span>Assign New Component</span>
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pay Component</label>
                <select
                  className="form-control"
                  value={newComponentData.componentId}
                  onChange={(e) => setNewComponentData({ ...newComponentData, componentId: e.target.value })}
                  required
                >
                  {payComponents.filter(c => c.code !== 'BASIC').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type} {c.isEpfLiable ? '• EPF' : ''})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Amount (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control mono font-semibold"
                  value={newComponentData.amount}
                  onChange={(e) => setNewComponentData({ ...newComponentData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Effective From</label>
                <input
                  type="date"
                  className="form-control"
                  value={newComponentData.effectiveFrom}
                  onChange={(e) => setNewComponentData({ ...newComponentData, effectiveFrom: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} />
                <span>Add Component</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
