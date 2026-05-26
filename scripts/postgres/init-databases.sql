-- One database per microservice (recommended for production-style isolation).
-- Run: psql -U postgres -f init-databases.sql
CREATE DATABASE nexus_auth_db;
CREATE DATABASE nexus_employee_db;
CREATE DATABASE nexus_payroll_db;
