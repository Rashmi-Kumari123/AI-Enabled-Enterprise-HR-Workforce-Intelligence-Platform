CREATE TABLE workforce_report_schedules (
    id BIGSERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    created_by_email VARCHAR(255) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    report_format VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    next_run_at TIMESTAMP NOT NULL,
    last_run_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_workforce_report_schedules_next_run
    ON workforce_report_schedules (enabled, next_run_at);
