-- Sri Lankan Payroll & HR Compliance System
-- Flyway Migration V2: Seed Data

-- Insert System Roles
INSERT INTO roles (name, description, created_by) VALUES
('ROLE_SUPER_ADMIN', 'Super Administrator with full system control', 'SYSTEM'),
('ROLE_HR_MANAGER', 'Human Resources Manager with employee & leave management', 'SYSTEM'),
('ROLE_PAYROLL_OFFICER', 'Payroll Officer responsible for payroll runs & calculations', 'SYSTEM'),
('ROLE_ACCOUNTANT', 'Accountant responsible for bank transfers & financial audits', 'SYSTEM'),
('ROLE_DEPARTMENT_MANAGER', 'Department Manager for attendance and leave approvals', 'SYSTEM'),
('ROLE_EMPLOYEE', 'Employee self-service for payslips & leave requests', 'SYSTEM');

-- Default Demo Users (Password for all: Admin@123)
-- BCrypt for 'Admin@123': $2a$10$AyLQcYo03V.uipXxYnCi5OugCgg.0oojFiAARoJKqqLvBAuL4.WV.
INSERT INTO users (username, password_hash, email, is_active, created_by) VALUES
('admin', '$2a$10$AyLQcYo03V.uipXxYnCi5OugCgg.0oojFiAARoJKqqLvBAuL4.WV.', 'admin@lankaprecision.lk', TRUE, 'SYSTEM'),
('hrmanager', '$2a$10$AyLQcYo03V.uipXxYnCi5OugCgg.0oojFiAARoJKqqLvBAuL4.WV.', 'hr@lankaprecision.lk', TRUE, 'SYSTEM'),
('payrollofficer', '$2a$10$AyLQcYo03V.uipXxYnCi5OugCgg.0oojFiAARoJKqqLvBAuL4.WV.', 'payroll@lankaprecision.lk', TRUE, 'SYSTEM'),
('accountant', '$2a$10$AyLQcYo03V.uipXxYnCi5OugCgg.0oojFiAARoJKqqLvBAuL4.WV.', 'accountant@lankaprecision.lk', TRUE, 'SYSTEM'),
('deptmanager', '$2a$10$AyLQcYo03V.uipXxYnCi5OugCgg.0oojFiAARoJKqqLvBAuL4.WV.', 'deptmanager@lankaprecision.lk', TRUE, 'SYSTEM'),
('employee', '$2a$10$AyLQcYo03V.uipXxYnCi5OugCgg.0oojFiAARoJKqqLvBAuL4.WV.', 'employee@lankaprecision.lk', TRUE, 'SYSTEM');

-- Map users to their respective roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'admin' AND r.name = 'ROLE_SUPER_ADMIN';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'hrmanager' AND r.name = 'ROLE_HR_MANAGER';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'payrollofficer' AND r.name = 'ROLE_PAYROLL_OFFICER';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'accountant' AND r.name = 'ROLE_ACCOUNTANT';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'deptmanager' AND r.name = 'ROLE_DEPARTMENT_MANAGER';
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'employee' AND r.name = 'ROLE_EMPLOYEE';

-- Organization Data
INSERT INTO company (name, registration_no, epf_registration_no, created_by) VALUES
('Lanka Precision Technologies (Pvt) Ltd', 'PV00234567', 'EPF/COL/98765', 'SYSTEM');

INSERT INTO branches (company_id, name, code, created_by) VALUES
(1, 'Colombo Corporate Head Office', 'COL-HQ', 'SYSTEM'),
(1, 'Kandy Development Center', 'KDY-01', 'SYSTEM');

INSERT INTO departments (branch_id, name, created_by) VALUES
(1, 'Executive Management', 'SYSTEM'),
(1, 'Engineering & Tech', 'SYSTEM'),
(1, 'Human Resources & Compliance', 'SYSTEM'),
(1, 'Finance & Accounting', 'SYSTEM'),
(2, 'Software Operations', 'SYSTEM');

INSERT INTO designations (title, created_by) VALUES
('Managing Director', 'SYSTEM'),
('Chief Technology Officer', 'SYSTEM'),
('Lead Software Architect', 'SYSTEM'),
('Senior Full-Stack Engineer', 'SYSTEM'),
('Software Engineer', 'SYSTEM'),
('Head of HR', 'SYSTEM'),
('Senior Payroll Specialist', 'SYSTEM'),
('Senior Financial Accountant', 'SYSTEM');

-- Pay Components
INSERT INTO pay_components (code, name, type, is_taxable, is_epf_liable, created_by) VALUES
('BASIC', 'Basic Salary', 'EARNING', TRUE, TRUE, 'SYSTEM'),
('BRA', 'Budgetary Relief Allowance', 'EARNING', TRUE, TRUE, 'SYSTEM'),
('FIXED_ALLOWANCE', 'Fixed Monthly Allowance', 'EARNING', TRUE, FALSE, 'SYSTEM'),
('TRANSPORT_ALLOWANCE', 'Transport & Fuel Allowance', 'EARNING', TRUE, FALSE, 'SYSTEM'),
('ATTENDANCE_INCENTIVE', 'Attendance Incentive', 'EARNING', TRUE, FALSE, 'SYSTEM'),
('OVERTIME', 'Overtime Earnings (1.5x)', 'EARNING', TRUE, FALSE, 'SYSTEM'),
('NO_PAY', 'No Pay / Unpaid Days Deduction', 'DEDUCTION', FALSE, TRUE, 'SYSTEM'),
('SALARY_ADVANCE', 'Salary Advance Recovery', 'DEDUCTION', FALSE, FALSE, 'SYSTEM'),
('LOAN_INSTALLMENT', 'Staff Loan Installment Deduction', 'DEDUCTION', FALSE, FALSE, 'SYSTEM'),
('EPF_EMPLOYEE', 'Employee EPF (8%)', 'STATUTORY_DEDUCTION', FALSE, FALSE, 'SYSTEM'),
('APIT_TAX', 'Advance Personal Income Tax (APIT)', 'STATUTORY_DEDUCTION', FALSE, FALSE, 'SYSTEM');

-- Statutory Rules
INSERT INTO statutory_rules (rule_type, rate_or_slab_value, effective_from, created_by) VALUES
('EPF_EMPLOYEE_RATE', 8.00, '2024-01-01', 'SYSTEM'),
('EPF_EMPLOYER_RATE', 12.00, '2024-01-01', 'SYSTEM'),
('ETF_EMPLOYER_RATE', 3.00, '2024-01-01', 'SYSTEM'),
('APIT_MONTHLY_RELIEF', 150000.00, '2024-01-01', 'SYSTEM'),
('APIT_SLAB_SIZE', 41666.67, '2024-01-01', 'SYSTEM'),
('APIT_RATE_SLAB_1', 6.00, '2024-01-01', 'SYSTEM'),
('APIT_RATE_SLAB_2', 12.00, '2024-01-01', 'SYSTEM'),
('APIT_RATE_SLAB_3', 18.00, '2024-01-01', 'SYSTEM'),
('APIT_RATE_SLAB_4', 24.00, '2024-01-01', 'SYSTEM'),
('APIT_RATE_SLAB_5', 30.00, '2024-01-01', 'SYSTEM'),
('APIT_RATE_MAX', 36.00, '2024-01-01', 'SYSTEM'),
('OT_MONTHLY_STANDARD_HOURS', 240.00, '2024-01-01', 'SYSTEM'),
('OT_RATE_MULTIPLIER', 1.50, '2024-01-01', 'SYSTEM');

-- Leave Types
INSERT INTO leave_types (name, max_days_per_year, created_by) VALUES
('Annual Leave', 14, 'SYSTEM'),
('Casual Leave', 7, 'SYSTEM'),
('Medical Leave', 14, 'SYSTEM'),
('Maternity Leave', 84, 'SYSTEM');

-- Initial Demo Employees
INSERT INTO employees (emp_no, first_name, last_name, nic, joined_date, department_id, designation_id, basic_salary, created_by) VALUES
('EMP001', 'Kasun', 'Perera', '199012345678', '2022-01-15', 2, 3, 350000.00, 'SYSTEM'),
('EMP002', 'Dilani', 'Silva', '199223456789', '2022-06-01', 3, 7, 180000.00, 'SYSTEM'),
('EMP003', 'Rohan', 'Fernando', '199534567890', '2023-03-10', 4, 8, 220000.00, 'SYSTEM'),
('EMP004', 'Nimal', 'Jayawardena', '198845678901', '2021-11-01', 5, 5, 120000.00, 'SYSTEM');

-- Bank Details
INSERT INTO employee_bank_details (emp_id, bank_name, branch_name, account_no, created_by) VALUES
(1, 'Commercial Bank of Ceylon', 'Kollupitiya', '8001234567', 'SYSTEM'),
(2, 'Sampath Bank PLC', 'Bambalapitiya', '1002345678', 'SYSTEM'),
(3, 'Bank of Ceylon', 'City Office', '0034567890', 'SYSTEM'),
(4, 'Hatton National Bank', 'Kandy Metro', '2004567891', 'SYSTEM');

-- Employee Fixed Allowances
INSERT INTO employee_salary_components (emp_id, component_id, amount, effective_from, created_by) VALUES
(1, 2, 10000.00, '2022-01-15', 'SYSTEM'), -- BRA
(1, 4, 25000.00, '2022-01-15', 'SYSTEM'), -- Transport
(2, 2, 10000.00, '2022-06-01', 'SYSTEM'),
(2, 3, 15000.00, '2022-06-01', 'SYSTEM'),
(3, 2, 10000.00, '2023-03-10', 'SYSTEM'),
(4, 2, 10000.00, '2021-11-01', 'SYSTEM'),
(4, 5, 8000.00, '2021-11-01', 'SYSTEM');  -- Attendance incentive

-- Sample Payroll Period (Current active period: e.g. 2026-10)
INSERT INTO payroll_periods (period_code, start_date, end_date, status, created_by) VALUES
('2026-10', '2026-10-01', '2026-10-31', 'OPEN', 'SYSTEM'),
('2026-09', '2026-09-01', '2026-09-30', 'PROCESSED', 'SYSTEM');

-- Sample Attendance & Overtime for 2026-10
INSERT INTO attendance (emp_id, pay_period, worked_days, no_pay_days, created_by) VALUES
(1, '2026-10', 22.00, 0.00, 'SYSTEM'),
(2, '2026-10', 22.00, 0.00, 'SYSTEM'),
(3, '2026-10', 21.00, 1.00, 'SYSTEM'),
(4, '2026-10', 22.00, 0.00, 'SYSTEM');

INSERT INTO overtime (emp_id, pay_period, ot_hours, ot_amount, created_by) VALUES
(4, '2026-10', 16.00, 12000.00, 'SYSTEM'); -- (120000 / 240) * 1.5 * 16 = 12000.00
