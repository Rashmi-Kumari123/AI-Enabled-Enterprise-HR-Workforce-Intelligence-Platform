-- Legacy V3 seeds used fixed user_ids and emails that don't match auth demo accounts.
DELETE FROM employee_documents
WHERE employee_id IN (SELECT id FROM employees WHERE employee_code IN ('EMP001', 'EMP002', 'EMP003'));

DELETE FROM onboarding_tasks
WHERE employee_id IN (SELECT id FROM employees WHERE employee_code IN ('EMP001', 'EMP002', 'EMP003'));

DELETE FROM employees WHERE employee_code IN ('EMP001', 'EMP002', 'EMP003');
