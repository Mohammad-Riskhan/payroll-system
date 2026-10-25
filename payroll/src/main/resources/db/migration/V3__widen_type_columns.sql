-- Flyway Migration V3: Widen type column for payslip_items and pay_components
ALTER TABLE payslip_items MODIFY COLUMN type VARCHAR(50) NOT NULL;
ALTER TABLE pay_components MODIFY COLUMN type VARCHAR(50) NOT NULL;
