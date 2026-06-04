CREATE TABLE salary_structures (
    id                   BIGSERIAL PRIMARY KEY,
    employee_id          BIGINT         NOT NULL UNIQUE,
    base_salary          NUMERIC(12, 2) NOT NULL,
    hra_percent          NUMERIC(5, 2)  NOT NULL DEFAULT 40.00,
    transport_allowance  NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    other_allowance      NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency             VARCHAR(8)     NOT NULL DEFAULT 'INR',
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_salary_positive CHECK (base_salary > 0)
);

CREATE TABLE payslips (
    id                   BIGSERIAL PRIMARY KEY,
    payslip_number       VARCHAR(32)    NOT NULL UNIQUE,
    employee_id          BIGINT         NOT NULL,
    employee_code        VARCHAR(32)      NOT NULL,
    employee_name        VARCHAR(255)     NOT NULL,
    pay_year             INT            NOT NULL,
    pay_month            INT            NOT NULL,
    working_days         INT            NOT NULL,
    unpaid_leave_days    INT            NOT NULL DEFAULT 0,
    base_salary          NUMERIC(12, 2) NOT NULL,
    hra_amount           NUMERIC(12, 2) NOT NULL,
    transport_allowance  NUMERIC(12, 2) NOT NULL,
    other_allowance      NUMERIC(12, 2) NOT NULL,
    gross_pay            NUMERIC(12, 2) NOT NULL,
    pf_deduction         NUMERIC(12, 2) NOT NULL,
    professional_tax     NUMERIC(12, 2) NOT NULL,
    income_tax           NUMERIC(12, 2) NOT NULL,
    leave_deduction      NUMERIC(12, 2) NOT NULL,
    total_deductions     NUMERIC(12, 2) NOT NULL,
    net_pay              NUMERIC(12, 2) NOT NULL,
    currency             VARCHAR(8)     NOT NULL DEFAULT 'INR',
    status               VARCHAR(32)    NOT NULL DEFAULT 'GENERATED',
    generated_by         VARCHAR(255),
    generated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pay_month CHECK (pay_month BETWEEN 1 AND 12),
    CONSTRAINT chk_pay_year CHECK (pay_year >= 2000),
    CONSTRAINT chk_unpaid_leave_nonneg CHECK (unpaid_leave_days >= 0),
    CONSTRAINT uq_payslip_employee_period UNIQUE (employee_id, pay_year, pay_month)
);

CREATE INDEX idx_payslips_employee_id ON payslips (employee_id);
CREATE INDEX idx_payslips_period ON payslips (pay_year, pay_month);
