-- Idempotent database bootstrap for a single PostgreSQL instance (Railway / shared host).
SELECT 'CREATE DATABASE nexus_auth_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexus_auth_db')\gexec
SELECT 'CREATE DATABASE nexus_employee_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexus_employee_db')\gexec
SELECT 'CREATE DATABASE nexus_payroll_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexus_payroll_db')\gexec
SELECT 'CREATE DATABASE nexus_attendance_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexus_attendance_db')\gexec
SELECT 'CREATE DATABASE nexus_leave_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexus_leave_db')\gexec
SELECT 'CREATE DATABASE nexus_performance_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexus_performance_db')\gexec
SELECT 'CREATE DATABASE nexus_ai_insights_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexus_ai_insights_db')\gexec
SELECT 'CREATE DATABASE nexus_notification_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexus_notification_db')\gexec
