ALTER TABLE leave_requests ADD COLUMN tenant_id BIGINT;
ALTER TABLE leave_balances ADD COLUMN tenant_id BIGINT;

UPDATE leave_requests SET tenant_id = 1 WHERE tenant_id IS NULL;
UPDATE leave_balances SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE leave_requests ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE leave_balances ALTER COLUMN tenant_id SET NOT NULL;

CREATE INDEX idx_leave_requests_tenant_id ON leave_requests (tenant_id);
CREATE INDEX idx_leave_balances_tenant_id ON leave_balances (tenant_id);
CREATE INDEX idx_leave_requests_tenant_status ON leave_requests (tenant_id, status);
