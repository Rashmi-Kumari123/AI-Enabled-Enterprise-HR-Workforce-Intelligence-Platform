ALTER TABLE attendance_records ADD COLUMN tenant_id BIGINT;

UPDATE attendance_records SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE attendance_records ALTER COLUMN tenant_id SET NOT NULL;

CREATE INDEX idx_attendance_records_tenant_id ON attendance_records (tenant_id);
CREATE INDEX idx_attendance_records_tenant_employee ON attendance_records (tenant_id, employee_id);
