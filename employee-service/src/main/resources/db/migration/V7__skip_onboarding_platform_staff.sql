-- Platform operators (Admin, HR, Manager) are not new hires — mark existing profiles active.
UPDATE employees
SET employment_status = 'ACTIVE',
    onboarding_completed = true,
    updated_at = NOW()
WHERE onboarding_completed = false
  AND (
    LOWER(email) LIKE '%admin%@%'
    OR LOWER(email) LIKE '%hr%@%'
    OR LOWER(email) LIKE '%manager%@%'
    OR LOWER(email) IN ('admin@nexushr.com', 'hr@nexushr.com', 'manager@nexushr.com')
  );

UPDATE onboarding_tasks t
SET completed = true,
    completed_at = NOW()
FROM employees e
WHERE t.employee_id = e.id
  AND e.onboarding_completed = true
  AND t.completed = false
  AND (
    LOWER(e.email) LIKE '%admin%@%'
    OR LOWER(e.email) LIKE '%hr%@%'
    OR LOWER(e.email) LIKE '%manager%@%'
    OR LOWER(e.email) IN ('admin@nexushr.com', 'hr@nexushr.com', 'manager@nexushr.com')
  );
