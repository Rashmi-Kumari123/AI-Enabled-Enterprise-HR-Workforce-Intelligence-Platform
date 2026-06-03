CREATE TABLE attendance_records (
    id            BIGSERIAL PRIMARY KEY,
    employee_id   BIGINT       NOT NULL,
    work_date     DATE         NOT NULL,
    clock_in      TIMESTAMPTZ  NOT NULL,
    clock_out     TIMESTAMPTZ,
    status        VARCHAR(32)  NOT NULL,
    notes         VARCHAR(512),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attendance_employee_work_date UNIQUE (employee_id, work_date)
);

CREATE INDEX idx_attendance_employee_id ON attendance_records (employee_id);
CREATE INDEX idx_attendance_work_date ON attendance_records (work_date);
