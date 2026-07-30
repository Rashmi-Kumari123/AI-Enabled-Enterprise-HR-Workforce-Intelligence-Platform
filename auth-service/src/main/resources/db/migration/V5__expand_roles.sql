INSERT INTO roles (name, description) VALUES
    ('ROLE_SUPER_ADMIN', 'Tenant super administrator'),
    ('ROLE_PAYROLL',     'Payroll manager'),
    ('ROLE_IT_ADMIN',    'IT administrator'),
    ('ROLE_EXECUTIVE',   'CEO / executive read-only analytics')
ON CONFLICT (name) DO NOTHING;
