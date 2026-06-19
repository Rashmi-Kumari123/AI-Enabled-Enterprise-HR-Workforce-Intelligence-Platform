# NexusHR API Documentation

Complete API reference for the AI-Enabled Enterprise HR & Workforce Intelligence Platform.

**Base URL (API Gateway)**: `http://localhost:8080`  
**API Version**: v1  
**Auth**: JWT Bearer token (except public auth endpoints)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Employees](#employees)
4. [Attendance](#attendance)
5. [Leave](#leave)
6. [Payroll](#payroll)
7. [Performance](#performance)
8. [Notifications](#notifications)
9. [AI Insights & Reports](#ai-insights--reports)
10. [Error Handling](#error-handling)
11. [Role-Based Access](#role-based-access)
12. [Service Ports](#service-ports)

---

## Authentication

Protected endpoints require:

```
Authorization: Bearer <access_token>
```

### Sign Up

Create account + auto-provision employee profile.

**Endpoint**: `POST /api/v1/auth/signup`

**Request**:
```json
{
  "email": "employee@nexushr.com",
  "password": "NexusHR@2026",
  "firstName": "Ananya",
  "lastName": "Kumar"
}
```

**Response** (201):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresInSeconds": 86400,
  "email": "employee@nexushr.com",
  "roles": ["ROLE_EMPLOYEE"]
}
```

**Errors**: `409` email already registered · `400` validation failed

---

### Login

**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "email": "hr@nexushr.com",
  "password": "NexusHR@2026"
}
```

**Response** (200): Same shape as signup.

**Demo accounts** (password `NexusHR@2026`):

| Role | Email |
|------|-------|
| Admin | admin@nexushr.com |
| HR | hr@nexushr.com |
| Manager | manager@nexushr.com |
| Employee | employee@nexushr.com |

---

### Refresh Token

**Endpoint**: `POST /api/v1/auth/refresh`

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200): New access + refresh tokens.

---

### Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200):
```json
{
  "message": "Logged out successfully"
}
```

---

### Health

**Endpoint**: `GET /api/v1/auth/health`

**Response** (200):
```json
{
  "status": "UP",
  "service": "auth-service"
}
```

---

### Hire Employee (HR / Admin)

Creates auth login + employee profile + onboarding checklist in one step. Used by the **Add employee** form on `/dashboard/lifecycle`.

**Endpoint**: `POST /api/v1/auth/hire`  
**Role**: `HR`, `ADMIN`

**Request**:
```json
{
  "firstName": "Rashmi",
  "lastName": "Kumar",
  "email": "rashmi@nexushr.com",
  "temporaryPassword": "NexusHR@2026",
  "phone": "+91-9876543210",
  "departmentId": 1,
  "hireDate": "2026-06-10"
}
```

**Response** (201):
```json
{
  "userId": 12,
  "employeeId": 8,
  "employeeCode": "EMP-000012",
  "email": "rashmi@nexushr.com",
  "firstName": "Rashmi",
  "lastName": "Kumar",
  "message": "Employee hired successfully. Share login credentials securely."
}
```

**Errors**: `403` wrong role · `409` email already registered · `502` employee profile creation failed · `400` validation failed

---

## Users

### Get Current User

**Endpoint**: `GET /api/v1/users/me`  
**Auth**: Required

**Response** (200):
```json
{
  "id": 1,
  "email": "hr@nexushr.com",
  "roles": ["ROLE_HR"],
  "enabled": true
}
```

---

### List All Users

**Endpoint**: `GET /api/v1/users`  
**Role**: `ADMIN`

---

### HR Dashboard Stub

**Endpoint**: `GET /api/v1/users/hr/dashboard`  
**Role**: `HR`, `ADMIN`

---

## Employees

### Get My Profile

**Endpoint**: `GET /api/v1/employees/me`  
**Role**: All authenticated

**Response** (200):
```json
{
  "id": 4,
  "userId": 4,
  "employeeCode": "EMP-00004",
  "firstName": "Ananya",
  "lastName": "Kumar",
  "email": "employee@nexushr.com",
  "phone": "+91-9876543210",
  "departmentId": 1,
  "departmentName": "Information Technology",
  "hireDate": "2026-03-10",
  "employmentStatus": "PROBATION",
  "onboardingCompleted": false
}
```

**Errors**: `404` no employee linked to login

---

### Activate / Provision My Profile

For accounts without an employee record (self-service onboarding).

**Endpoint**: `POST /api/v1/employees/me/provision`  
**Role**: All authenticated

**Request**:
```json
{
  "firstName": "Rashmi",
  "lastName": "Kumar"
}
```

**Response** (201): Employee profile (same shape as GET `/me`).

---

### Update My Phone

**Endpoint**: `PATCH /api/v1/employees/me`

**Request**:
```json
{
  "phone": "+91-9876543210"
}
```

---

### List Employees

**Endpoint**: `GET /api/v1/employees`  
**Role**: `HR`, `ADMIN`, `MANAGER`

---

### Get Employee by ID

**Endpoint**: `GET /api/v1/employees/{id}`

---

### Create Employee (HR / Admin — low-level API)

**Endpoint**: `POST /api/v1/employees`  
**Role**: `HR`, `ADMIN` only (Manager & Employee → `403`)

Creates an employee record in employee-service. The auth account must **already exist** — you need a valid `userId` from auth-service.

> **Recommended UI flow:** Use **Lifecycle → Add employee** (`POST /auth/hire`), which creates both auth user and employee profile. Use this endpoint only for advanced/manual integration.

**Request**:
```json
{
  "userId": 5,
  "employeeCode": "EMP-2026-001",
  "firstName": "Rashmi",
  "lastName": "Kumar",
  "email": "rashmi@nexushr.com",
  "phone": "+91-9876543210",
  "departmentId": 1,
  "hireDate": "2026-05-01",
  "employmentStatus": "ACTIVE"
}
```

**Response** (201): Employee profile object.

**Errors**: `403` wrong role · `409` duplicate email/code/userId · `400` validation failed

**Typical HR flows in NexusHR**:

| Flow | How |
|------|-----|
| HR hires new employee | Lifecycle UI → `POST /auth/hire` |
| New hire self-registers | `POST /auth/signup` → employee auto-created |
| Existing login, no profile | `POST /employees/me/provision` (employee) or login auto-repair |
| Manual API entry | `POST /employees` (HR/Admin + Postman) |
| Onboarding tasks | Lifecycle page — complete checklist, offboard |
---

### Onboarding Pipeline

**Endpoint**: `GET /api/v1/employees/onboarding/pipeline`  
**Role**: `HR`, `ADMIN`

---

### Employee Onboarding Status

**Endpoint**: `GET /api/v1/employees/{id}/onboarding`

---

### Offboard Employee

**Endpoint**: `POST /api/v1/employees/{id}/offboard`  
**Role**: `HR`, `ADMIN`

---

### Upload Document

**Endpoint**: `POST /api/v1/employees/{id}/documents`  
**Content-Type**: `multipart/form-data`

**Form fields**:
- `file` — PDF, JPG, PNG (max 10 MB)
- `documentType` — `IDENTITY`, `TAX`, `GENERAL` (optional)

---

### List Documents

**Endpoint**: `GET /api/v1/employees/{id}/documents`

---

### List Departments

**Endpoint**: `GET /api/v1/departments`

---

## Attendance

### Clock In

**Endpoint**: `POST /api/v1/attendance/clock-in`  
**Role**: `EMPLOYEE`, `HR`, `ADMIN`, `MANAGER`

**Request**:
```json
{
  "employeeId": 4,
  "notes": "Office"
}
```

**Response** (200):
```json
{
  "id": 12,
  "employeeId": 4,
  "workDate": "2026-03-19",
  "clockIn": "2026-03-19T09:15:00Z",
  "clockOut": null,
  "status": "CLOCKED_IN",
  "notes": "Office"
}
```

Triggers in-app + email notification to employee.

---

### Clock Out

**Endpoint**: `POST /api/v1/attendance/clock-out`

**Request**: Same as clock-in.

---

### Today's Attendance

**Endpoint**: `GET /api/v1/attendance/employee/{employeeId}/today`

---

### Attendance History

**Endpoint**: `GET /api/v1/attendance/employee/{employeeId}`

---

## Leave

### Submit Leave Request

**Endpoint**: `POST /api/v1/leaves`  
**Role**: `EMPLOYEE`, `HR`, `ADMIN`, `MANAGER`

**Request**:
```json
{
  "employeeId": 4,
  "leaveType": "ANNUAL",
  "startDate": "2026-04-01",
  "endDate": "2026-04-03",
  "reason": "Family event"
}
```

**Leave types**: `ANNUAL`, `SICK`, `CASUAL`, `UNPAID`

**Response** (201):
```json
{
  "id": 7,
  "employeeId": 4,
  "leaveType": "ANNUAL",
  "startDate": "2026-04-01",
  "endDate": "2026-04-03",
  "status": "PENDING",
  "reason": "Family event"
}
```

Notifies managers + employee on submit.

---

### List Pending (Manager/HR)

**Endpoint**: `GET /api/v1/leaves/pending`  
**Role**: `HR`, `ADMIN`, `MANAGER`

---

### Approve Leave

**Endpoint**: `POST /api/v1/leaves/{id}/approve`  
**Role**: `HR`, `ADMIN`, `MANAGER`

**Request** (optional):
```json
{
  "comment": "Approved — team coverage confirmed"
}
```

---

### Reject Leave

**Endpoint**: `POST /api/v1/leaves/{id}/reject`

---

### Cancel Leave

**Endpoint**: `POST /api/v1/leaves/{id}/cancel`  
**Role**: Employee (own request) or HR

---

### Leave Balances

**Endpoint**: `GET /api/v1/leaves/employee/{employeeId}/balances`

---

### Employee Leave History

**Endpoint**: `GET /api/v1/leaves/employee/{employeeId}`

---

## Payroll

### Upsert Salary Structure

**Endpoint**: `PUT /api/v1/payroll/salary-structures`  
**Role**: `HR`, `ADMIN`

---

### Generate Payslip

**Endpoint**: `POST /api/v1/payroll/payslips/generate`  
**Role**: `HR`, `ADMIN`

**Request**:
```json
{
  "employeeId": 4,
  "payPeriodStart": "2026-03-01",
  "payPeriodEnd": "2026-03-31"
}
```

---

### Get Payslip

**Endpoint**: `GET /api/v1/payroll/payslips/{id}`

---

### Download Payslip PDF

**Endpoint**: `GET /api/v1/payroll/payslips/{id}/download`

---

### Mark Payslip Paid

**Endpoint**: `POST /api/v1/payroll/payslips/{id}/mark-paid`  
**Role**: `HR`, `ADMIN`

---

## Performance

### Create Review

**Endpoint**: `POST /api/v1/performance/reviews`  
**Role**: `HR`, `ADMIN`, `MANAGER`

---

### Submit Review

**Endpoint**: `POST /api/v1/performance/reviews/{id}/submit`

---

### Employee Scorecard

**Endpoint**: `GET /api/v1/performance/reviews/employee/{employeeId}/scorecard`

---

### Pending Feedback (360°)

**Endpoint**: `GET /api/v1/performance/feedback/pending/me`

---

## Notifications

Delivery channels: **in-app** (WebSocket) + **email** (MailHog in dev).

### My Notifications

**Endpoint**: `GET /api/v1/notifications/me`

**Response** (200):
```json
[
  {
    "id": 15,
    "title": "Leave approved",
    "message": "Your leave request was approved.",
    "type": "LEAVE_APPROVED",
    "read": false,
    "createdAt": "2026-03-19T10:00:00Z",
    "deliveries": [
      { "channel": "IN_APP", "status": "SENT" },
      { "channel": "EMAIL", "status": "SENT" }
    ]
  }
]
```

---

### Unread Count

**Endpoint**: `GET /api/v1/notifications/me/unread-count`

---

### Mark Read

**Endpoint**: `POST /api/v1/notifications/{id}/read`

---

### Mark All Read

**Endpoint**: `POST /api/v1/notifications/me/read-all`

---

### HR Announcement / Dispatch

**Endpoint**: `POST /api/v1/notifications/dispatch`  
**Role**: `HR`, `ADMIN`, `MANAGER`

**Request**:
```json
{
  "audience": "MANAGERS",
  "title": "Policy update",
  "message": "New WFH guidelines effective Monday.",
  "type": "SYSTEM"
}
```

For a single employee:
```json
{
  "audience": "USER",
  "recipientEmail": "employee@nexushr.com",
  "title": "Reminder",
  "message": "Complete onboarding documents.",
  "type": "SYSTEM"
}
```

---

### Delivery Stats

**Endpoint**: `GET /api/v1/notifications/delivery-stats`  
**Role**: `HR`, `ADMIN`

---

### WebSocket (real-time)

**URL**: `ws://localhost:8089/ws-notifications`  
Connect with `Authorization: Bearer <token>` header.  
Subscribe: `/user/queue/notifications` · Managers also get `/topic/managers/notifications`

---

## AI Insights & Reports

**Role**: `HR`, `ADMIN`, `MANAGER` (analytics: `HR`, `ADMIN` only)

### Team Attrition Insights

**Endpoint**: `GET /api/v1/ai/attrition/team`

---

### Employee Attrition Prediction

**Endpoint**: `GET /api/v1/ai/attrition/employee/{employeeId}`

---

### Team Engagement

**Endpoint**: `GET /api/v1/ai/engagement/team`

---

### Skill Gap Analysis (Team)

**Endpoint**: `GET /api/v1/ai/skills/gaps/team`

---

### Workforce Analytics

**Endpoint**: `GET /api/v1/ai/analytics/workforce`  
**Role**: `HR`, `ADMIN`

---

### Export Reports

| Format | Endpoint |
|--------|----------|
| PDF | `GET /api/v1/ai/reports/export/pdf` |
| Excel | `GET /api/v1/ai/reports/export/excel` |
| CSV | `GET /api/v1/ai/reports/export/csv` |

**Role**: `HR`, `ADMIN`

---

### Schedule Report

**Endpoint**: `POST /api/v1/ai/reports/schedules`

**Request**:
```json
{
  "recipientEmail": "hr@nexushr.com",
  "frequency": "WEEKLY",
  "format": "PDF"
}
```

**Frequency**: `DAILY`, `WEEKLY`, `MONTHLY` · **Format**: `PDF`, `EXCEL`, `CSV`

---

## Error Handling

### Format

```json
{
  "message": "No employee profile linked to this account",
  "status": 404,
  "timestamp": "2026-03-19T10:00:00Z"
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Invalid input |
| 401 | Missing / invalid token |
| 403 | Insufficient role |
| 404 | Not found |
| 409 | Conflict (duplicate email, already clocked in) |
| 500 | Server error |

---

## Role-Based Access

| Role | Key permissions |
|------|-----------------|
| **EMPLOYEE** | Own profile, attendance, leave, payslip, performance feedback |
| **MANAGER** | Team leave approval, performance reviews, AI team insights, announcements |
| **HR** | Full employee lifecycle, payroll, reports, analytics, announcements |
| **ADMIN** | All HR permissions + user list |

Roles are assigned at signup (email pattern) or via demo seed. JWT carries `roles` claim as `ROLE_*`.

---

## Service Ports

Use **API Gateway** (`8080`) in frontend/production. Direct service ports for local dev:

| Service | Port | Swagger |
|---------|------|---------|
| API Gateway | 8080 | — |
| Auth | 8081 | `/swagger-ui.html` |
| Employee | 8082 | `/swagger-ui.html` |
| Payroll | 8083 | `/swagger-ui.html` |
| Attendance | 8084 | `/swagger-ui.html` |
| Leave | 8085 | `/swagger-ui.html` |
| Performance | 8086 | `/swagger-ui.html` |
| AI Insights | 8088 | `/swagger-ui.html` |
| Notification | 8089 | `/swagger-ui.html` |

**Gateway actuator**: `GET /actuator/health` · `GET /actuator/prometheus`

---

## Best Practices

1. Always send `Authorization: Bearer <token>` on protected routes.
2. Use gateway URL (`8080`) from the React app — not individual service ports.
3. Refresh token before `expiresInSeconds` (default 24 h).
4. Check leave balance before submit; check availability before clock-in (no duplicate clock-in same day).
5. Upload documents as PDF/images under 10 MB.
6. For live demo, start Postgres + Redis + MailHog via `docker compose up -d`.

---

## Support

- Project README: [`../README.md`](../README.md)
- QA checklist: [`WEEK4-QA-CHECKLIST.md`](WEEK4-QA-CHECKLIST.md)
- Per-service Swagger UI when service is running locally
