ALTER TABLE workforce_report_schedules ADD COLUMN tenant_id BIGINT;

UPDATE workforce_report_schedules SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE workforce_report_schedules ALTER COLUMN tenant_id SET NOT NULL;

CREATE INDEX idx_workforce_report_schedules_tenant_next_run
    ON workforce_report_schedules (tenant_id, enabled, next_run_at);
CREATE INDEX idx_workforce_report_schedules_tenant_id ON workforce_report_schedules (tenant_id);
