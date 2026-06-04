-- Demo employees for manager/employee dashboards (local dev).
INSERT INTO employees (
    user_id, employee_code, first_name, last_name, email, phone,
    department_id, hire_date, employment_status, created_at, updated_at
)
SELECT 101, 'EMP001', 'Rashmi', 'Kumari', 'rashu2377@gmail.com', '+91-9000000001',
       d.id, '2024-01-15', 'ACTIVE', NOW(), NOW()
FROM departments d WHERE d.code = 'IT'
ON CONFLICT (email) DO NOTHING;

INSERT INTO employees (
    user_id, employee_code, first_name, last_name, email, phone,
    department_id, hire_date, employment_status, created_at, updated_at
)
SELECT 102, 'EMP002', 'Amit', 'Sharma', 'employee.perf@nexushr.com', '+91-9000000002',
       d.id, '2023-06-01', 'ACTIVE', NOW(), NOW()
FROM departments d WHERE d.code = 'HR'
ON CONFLICT (email) DO NOTHING;

INSERT INTO employees (
    user_id, employee_code, first_name, last_name, email, phone,
    department_id, hire_date, employment_status, created_at, updated_at
)
SELECT 103, 'EMP003', 'Priya', 'Nair', 'hr.payroll@nexushr.com', '+91-9000000003',
       d.id, '2022-03-10', 'ACTIVE', NOW(), NOW()
FROM departments d WHERE d.code = 'FIN'
ON CONFLICT (email) DO NOTHING;
