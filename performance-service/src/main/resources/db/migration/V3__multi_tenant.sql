ALTER TABLE performance_reviews ADD COLUMN tenant_id BIGINT;

UPDATE performance_reviews SET tenant_id = 1 WHERE tenant_id IS NULL;

ALTER TABLE performance_reviews ALTER COLUMN tenant_id SET NOT NULL;

ALTER TABLE performance_reviews DROP CONSTRAINT IF EXISTS uq_review_employee_period;
CREATE UNIQUE INDEX idx_performance_reviews_tenant_period
    ON performance_reviews (tenant_id, employee_id, review_year, review_quarter);
CREATE INDEX idx_performance_reviews_tenant_id ON performance_reviews (tenant_id);
