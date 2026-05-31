CREATE TABLE departments (
    id          BIGSERIAL PRIMARY KEY,
    code        VARCHAR(64)  NOT NULL UNIQUE,
    name        VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE employees (
    id                 BIGSERIAL PRIMARY KEY,
    user_id            BIGINT       NOT NULL UNIQUE,
    employee_code      VARCHAR(32)  NOT NULL UNIQUE,
    first_name         VARCHAR(128) NOT NULL,
    last_name          VARCHAR(128) NOT NULL,
    email              VARCHAR(255) NOT NULL UNIQUE,
    phone              VARCHAR(32),
    department_id      BIGINT REFERENCES departments (id),
    hire_date          DATE         NOT NULL,
    employment_status  VARCHAR(32)  NOT NULL DEFAULT 'ACTIVE',
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employees_email ON employees (email);
CREATE INDEX idx_employees_department_id ON employees (department_id);
