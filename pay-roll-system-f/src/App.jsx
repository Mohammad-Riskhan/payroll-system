import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { EmployeesView } from './views/EmployeesView';
import { PayrollRunView } from './views/PayrollRunView';
import { AttendanceLeaveView } from './views/AttendanceLeaveView';
import { LoansView } from './views/LoansView';
import { StatutoryRulesView } from './views/StatutoryRulesView';
import { ReportsPayslipsView } from './views/ReportsPayslipsView';
import { AuditLogsView } from './views/AuditLogsView';

// Protected Layout Component
const AppLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        color: 'var(--text-muted)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p>Verifying secure compliance session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar currentPeriod="2026-10" />
        <main>{children}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route path="/" element={<AppLayout><DashboardView /></AppLayout>} />
          <Route path="/employees" element={<AppLayout><EmployeesView /></AppLayout>} />
          <Route path="/payroll" element={<AppLayout><PayrollRunView /></AppLayout>} />
          <Route path="/attendance-leaves" element={<AppLayout><AttendanceLeaveView /></AppLayout>} />
          <Route path="/loans" element={<AppLayout><LoansView /></AppLayout>} />
          <Route path="/statutory-rules" element={<AppLayout><StatutoryRulesView /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><ReportsPayslipsView /></AppLayout>} />
          <Route path="/audit-logs" element={<AppLayout><AuditLogsView /></AppLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
