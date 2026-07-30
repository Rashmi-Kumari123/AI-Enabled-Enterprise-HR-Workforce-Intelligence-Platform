ALTER TABLE salary_structures ADD COLUMN tenant_id BIGINT;
ALTER TABLE payslips ADD COLUMN tenant_id BIGINT;

UPDATE salary_structures SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE payslips SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE salary_structures ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE payslips ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE salary_structures DROP CONSTRAINT IF EXISTS salary_structures_employee_id_key;
ALTER TABLE payslips DROP CONSTRAINT IF EXISTS payslips_payslip_number_key;

CREATE UNIQUE INDEX idx_salary_structures_tenant_employee ON salary_structures (tenant_id, employee_id);
CREATE UNIQUE INDEX idx_payslips_tenant_number ON payslips (tenant_id, payslip_number);
CREATE INDEX idx_payslips_tenant_id ON payslips (tenant_id);
CREATE INDEX idx_salary_structures_tenant_id ON salary_structures (tenant_id);
