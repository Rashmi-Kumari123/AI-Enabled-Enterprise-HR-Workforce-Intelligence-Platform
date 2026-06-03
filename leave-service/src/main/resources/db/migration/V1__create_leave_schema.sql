CREATE TABLE leave_requests (
    id              BIGSERIAL PRIMARY KEY,
    employee_id     BIGINT       NOT NULL,
    leave_type      VARCHAR(32)  NOT NULL,
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    reason          VARCHAR(1024) NOT NULL,
    status          VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    reviewed_by     VARCHAR(255),
    review_comment  VARCHAR(512),
    submitted_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_employee_id ON leave_requests (employee_id);
CREATE INDEX idx_leave_status ON leave_requests (status);
