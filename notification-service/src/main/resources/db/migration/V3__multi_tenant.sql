ALTER TABLE notifications ADD COLUMN tenant_id BIGINT;

UPDATE notifications SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE notifications ALTER COLUMN tenant_id SET NOT NULL;

CREATE INDEX idx_notifications_tenant_recipient_created
    ON notifications (tenant_id, recipient_email, created_at DESC);
CREATE INDEX idx_notifications_tenant_id ON notifications (tenant_id);
