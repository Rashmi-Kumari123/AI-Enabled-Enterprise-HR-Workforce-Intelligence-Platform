#!/usr/bin/env bash
# Generate JDBC URLs for Railway when PG* variables are available from the Postgres plugin.
# Example:
#   source <(./deploy/railway/jdbc-urls.sh)
#   echo "$DB_URL_AUTH"

set -euo pipefail

ssl="${PGSSLMODE:-require}"
host="${PGHOST:?Set PGHOST}"
port="${PGPORT:?Set PGPORT}"

jdbc_base="jdbc:postgresql://${host}:${port}"

export DB_URL_AUTH="${DB_URL_AUTH:-${jdbc_base}/nexus_auth_db?sslmode=${ssl}}"
export DB_URL_EMPLOYEE="${DB_URL_EMPLOYEE:-${jdbc_base}/nexus_employee_db?sslmode=${ssl}}"
export DB_URL_PAYROLL="${DB_URL_PAYROLL:-${jdbc_base}/nexus_payroll_db?sslmode=${ssl}}"
export DB_URL_ATTENDANCE="${DB_URL_ATTENDANCE:-${jdbc_base}/nexus_attendance_db?sslmode=${ssl}}"
export DB_URL_LEAVE="${DB_URL_LEAVE:-${jdbc_base}/nexus_leave_db?sslmode=${ssl}}"
export DB_URL_PERFORMANCE="${DB_URL_PERFORMANCE:-${jdbc_base}/nexus_performance_db?sslmode=${ssl}}"
export DB_URL_AI="${DB_URL_AI:-${jdbc_base}/nexus_ai_insights_db?sslmode=${ssl}}"
export DB_URL_NOTIFICATION="${DB_URL_NOTIFICATION:-${jdbc_base}/nexus_notification_db?sslmode=${ssl}}"

cat <<EOF
DB_URL_AUTH=$DB_URL_AUTH
DB_URL_EMPLOYEE=$DB_URL_EMPLOYEE
DB_URL_PAYROLL=$DB_URL_PAYROLL
DB_URL_ATTENDANCE=$DB_URL_ATTENDANCE
DB_URL_LEAVE=$DB_URL_LEAVE
DB_URL_PERFORMANCE=$DB_URL_PERFORMANCE
DB_URL_AI=$DB_URL_AI
DB_URL_NOTIFICATION=$DB_URL_NOTIFICATION
EOF
