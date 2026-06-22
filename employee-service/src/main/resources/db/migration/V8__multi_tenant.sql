ALTER TABLE departments ADD COLUMN tenant_id BIGINT;
ALTER TABLE employees ADD COLUMN tenant_id BIGINT;

UPDATE departments SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE employees SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE departments ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE employees ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_code_key;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_employee_code_key;

CREATE UNIQUE INDEX idx_departments_tenant_code ON departments (tenant_id, code);
CREATE UNIQUE INDEX idx_employees_tenant_email ON employees (tenant_id, email);
CREATE UNIQUE INDEX idx_employees_tenant_code ON employees (tenant_id, employee_code);
CREATE INDEX idx_employees_tenant_id ON employees (tenant_id);
CREATE INDEX idx_departments_tenant_id ON departments (tenant_id);
