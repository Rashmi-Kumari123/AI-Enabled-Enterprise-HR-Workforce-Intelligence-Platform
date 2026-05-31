INSERT INTO departments (code, name, description, created_at, updated_at) VALUES
    ('IT',  'Information Technology', 'Software and infrastructure teams', NOW(), NOW()),
    ('HR',  'Human Resources',        'People operations and talent',        NOW(), NOW()),
    ('FIN', 'Finance',                'Payroll and accounting',              NOW(), NOW()),
    ('OPS', 'Operations',             'Business operations',                 NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
