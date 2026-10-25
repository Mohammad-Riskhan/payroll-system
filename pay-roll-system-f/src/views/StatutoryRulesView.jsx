import React, { useState, useEffect } from 'react';
import { statutoryRuleApi } from '../api/statutoryRuleApi';
import { organizationApi } from '../api/organizationApi';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import {
  Scale,
  Edit2,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Calendar,
  Layers,
  Info,
  Briefcase
} from 'lucide-react';

export const StatutoryRulesView = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('statutory');
  const [rules, setRules] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Statutory Rule Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    ruleType: '',
    rateOrSlabValue: '',
    effectiveFrom: '2024-01-01',
    effectiveTo: '',
  });

  // Salary Structure Modal
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureFormData, setStructureFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [rulesRes, structRes] = await Promise.all([
        statutoryRuleApi.getAll().catch(() => ({ data: [] })),
        organizationApi.getSalaryStructures().catch(() => ({ data: [] })),
      ]);
      setRules(rulesRes.data || []);
      setSalaryStructures(structRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      ruleType: rule.ruleType,
      rateOrSlabValue: rule.rateOrSlabValue,
      effectiveFrom: rule.effectiveFrom || '2024-01-01',
      effectiveTo: rule.effectiveTo || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormData({
      ruleType: 'CUSTOM_STATUTORY_RULE',
      rateOrSlabValue: '10.00',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ruleType: formData.ruleType,
        rateOrSlabValue: Number(formData.rateOrSlabValue),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
      };

      if (editingRule) {
        await statutoryRuleApi.update(editingRule.id, payload);
        setFeedback({ type: 'success', text: `Rule ${formData.ruleType} updated in database!` });
      } else {
        await statutoryRuleApi.create(payload);
        setFeedback({ type: 'success', text: `New rule ${formData.ruleType} created in strategy table!` });
      }
      setIsModalOpen(false);
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save statutory rule.' });
    }
  };

  const handleSaveStructure = async (e) => {
    e.preventDefault();
    try {
      await organizationApi.createSalaryStructure({
        name: structureFormData.name,
        description: structureFormData.description,
      });
      setFeedback({ type: 'success', text: `Salary Structure '${structureFormData.name}' created successfully!` });
      setIsStructureModalOpen(false);
      setStructureFormData({ name: '', description: '' });
      loadAllData();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to create salary structure.' });
    }
  };

  const getRuleDescription = (type) => {
    switch (type) {
      case 'EPF_EMPLOYEE_RATE':
        return 'Employees Provident Fund employee contribution deducted from EPF-liable earnings';
      case 'EPF_EMPLOYER_RATE':
        return 'Employees Provident Fund employer-only mandatory statutory contribution';
      case 'ETF_EMPLOYER_RATE':
        return 'Employees Trust Fund Act No. 46 of 1980 employer non-deductible contribution';
      case 'APIT_MONTHLY_RELIEF':
        return 'Inland Revenue Department (IRD) personal statutory monthly income relief allowance';
      case 'APIT_SLAB_SIZE':
        return 'Sri Lanka progressive APIT income tax slab bracket size (LKR 500,000 / 12)';
      case 'APIT_RATE_SLAB_1':
        return 'Tax rate for 1st taxable bracket (150,000 to 191,666.67)';
      case 'APIT_RATE_SLAB_2':
        return 'Tax rate for 2nd taxable bracket (191,666.67 to 233,333.33)';
      case 'APIT_RATE_SLAB_3':
        return 'Tax rate for 3rd taxable bracket (233,333.33 to 275,000.00)';
      case 'APIT_RATE_SLAB_4':
        return 'Tax rate for 4th taxable bracket (275,000.00 to 316,666.67)';
      case 'APIT_RATE_SLAB_5':
        return 'Tax rate for 5th taxable bracket (316,666.67 to 358,333.33)';
      case 'APIT_RATE_MAX':
        return 'Maximum progressive tax bracket rate (above LKR 358,333.33 taxable per month)';
      case 'OT_MONTHLY_STANDARD_HOURS':
        return 'Sri Lanka standard monthly divisor for calculating standard hourly wage';
      case 'OT_RATE_MULTIPLIER':
        return 'Overtime standard multiplier (1.5x of standard hourly wage)';
      default:
        return 'Custom database-driven statutory rule';
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 700 }}>Statutory Rules & Compensation Configurator</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Decoupled Strategy Pattern: EPF, ETF, APIT, Overtime rules and Organizational Salary Structure templates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTab === 'statutory' && (hasRole('SUPER_ADMIN') || hasRole('PAYROLL_OFFICER')) && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={18} />
              <span>Add Statutory Rule</span>
            </button>
          )}

          {activeTab === 'structures' && (hasRole('SUPER_ADMIN') || hasRole('HR_MANAGER')) && (
            <button onClick={() => setIsStructureModalOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>New Salary Structure</span>
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
      <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('statutory')}
          className={`tab-btn ${activeTab === 'statutory' ? 'active' : ''}`}
        >
          <Scale size={16} />
          <span>Statutory Rules (EPF, ETF, APIT, OT)</span>
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`tab-btn ${activeTab === 'structures' ? 'active' : ''}`}
        >
          <Briefcase size={16} />
          <span>Salary Structures ({salaryStructures.length} Templates)</span>
        </button>
      </div>

      {activeTab === 'statutory' && (
        <>
          {/* Strategy Info Card */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <FileCode2 size={24} style={{ color: '#818cf8', flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Decoupled Strategy Pattern in Action</h4>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                The payroll engine evaluates statutory liabilities using <code style={{ color: '#818cf8' }}>DatabaseDrivenSriLankanStatutoryStrategy</code>.
                When gazetted government changes take effect, update the rates below or specify new effective dates without needing any application recompilation or redeployment.
              </p>
            </div>
          </div>

          {/* Statutory Rules Table */}
          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rule Identifier</th>
                    <th>Statutory Description</th>
                    <th className="text-right">Rate / Slab Value</th>
                    <th>Effective Period</th>
                    <th>Audit Status</th>
                    {(hasRole('SUPER_ADMIN') || hasRole('PAYROLL_OFFICER')) && (
                      <th style={{ textAlign: 'center' }}>Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Loading statutory rule registry...
                      </td>
                    </tr>
                  ) : rules.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No statutory rules defined.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => (
                      <tr key={rule.id}>
                        <td>
                          <div className="mono font-semibold" style={{ color: '#818cf8' }}>{rule.ruleType}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px' }}>
                          {getRuleDescription(rule.ruleType)}
                        </td>
                        <td className="mono font-semibold text-right" style={{ color: '#34d399', fontSize: '1rem' }}>
                          {rule.ruleType.includes('RATE')
                            ? `${Number(rule.rateOrSlabValue).toFixed(2)} %`
                            : Number(rule.rateOrSlabValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={13} style={{ color: 'var(--text-dim)' }} />
                            <span>{rule.effectiveFrom}</span>
                            <span style={{ color: 'var(--text-dim)' }}>→</span>
                            <span style={{ color: rule.effectiveTo ? 'inherit' : '#34d399' }}>
                              {rule.effectiveTo || 'Present'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-emerald">ACTIVE STRATEGY</span>
                        </td>
                        {(hasRole('SUPER_ADMIN') || hasRole('PAYROLL_OFFICER')) && (
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleOpenEdit(rule)}
                              className="btn btn-secondary btn-sm"
                              title="Edit Statutory Rule"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'structures' && (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Structure ID</th>
                  <th>Structure Name / Band</th>
                  <th>Description</th>
                  <th>Creation Status</th>
                </tr>
              </thead>
              <tbody>
                {salaryStructures.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No salary structure templates found. Click "New Salary Structure" to create job grade templates.
                    </td>
                  </tr>
                ) : (
                  salaryStructures.map((struct) => (
                    <tr key={struct.id}>
                      <td className="mono text-dim">#STR-{struct.id}</td>
                      <td className="font-semibold text-main">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Briefcase size={15} color="#818cf8" />
                          <span>{struct.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {struct.description || 'Standard compensation package grade'}
                      </td>
                      <td>
                        <span className="badge badge-indigo">CONFIGURED</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRule ? `Update Statutory Rule: ${formData.ruleType}` : 'Create Statutory Rule'}
        subtitle="Modifications will be immediately reflected across payroll calculation strategies"
        maxWidth="550px"
      >
        <form onSubmit={handleSaveRule}>
          <div className="form-group">
            <label className="form-label">Rule Identifier Key</label>
            <input
              type="text"
              className="form-control mono"
              required
              disabled={!!editingRule}
              value={formData.ruleType}
              onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
              placeholder="e.g. EPF_EMPLOYEE_RATE"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rate / Slab Numerical Value</label>
            <input
              type="number"
              step="0.01"
              className="form-control mono"
              required
              value={formData.rateOrSlabValue}
              onChange={(e) => setFormData({ ...formData, rateOrSlabValue: e.target.value })}
              placeholder="e.g. 8.00"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Effective From</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Effective To (Optional)</label>
              <input
                type="date"
                className="form-control"
                value={formData.effectiveTo}
                onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Strategy Rule
            </button>
          </div>
        </form>
      </Modal>

      {/* New Salary Structure Modal */}
      <Modal
        isOpen={isStructureModalOpen}
        onClose={() => setIsStructureModalOpen(false)}
        title="Create Salary Structure Template"
        subtitle="Define an organizational job grade structure (e.g. Executive Grade, Senior Engineering Grade)"
        maxWidth="500px"
      >
        <form onSubmit={handleSaveStructure}>
          <div className="form-group">
            <label className="form-label">Structure Name</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Executive Grade Band 1"
              value={structureFormData.name}
              onChange={(e) => setStructureFormData({ ...structureFormData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Executive pay structure comprising base salary, BRA, and transport allowance"
              value={structureFormData.description}
              onChange={(e) => setStructureFormData({ ...structureFormData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsStructureModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Structure
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
