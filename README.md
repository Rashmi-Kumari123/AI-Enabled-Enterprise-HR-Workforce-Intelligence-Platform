# 🏢 NexusHR — AI-Enabled Enterprise HR & Workforce Intelligence Platform

<div align="center">

### *One Platform. Every Employee Journey. AI-Powered Decisions.*

[![Java](https://img.shields.io/badge/Java-21-ED8B00.svg?style=flat&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F.svg?style=flat&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AWS EKS](https://img.shields.io/badge/AWS-EKS-FF9900.svg?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/eks/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-HPA-326CE5.svg?style=flat&logo=kubernetes&logoColor=white)](https://kubernetes.io/)

**Zidio Development · June 2026**

</div>

---

**NexusHR** is a microservices HR platform — lifecycle, attendance, leave, payroll, performance, and AI workforce intelligence in one secure app for Admin, HR, Manager, and Employee roles.

---
### Who it is for

| Persona | Capabilities |
|:--------|:-------------|
| **HR teams** | Hire, onboard, offboard, announcements, payroll operations |
| **Managers** | Approve leave, review performance, monitor team health |
| **Employees** | Attendance, leave, payslips, profile, self-service workspace |
| **Admins** | Full tenant access, lifecycle, analytics, workforce command center |
| **Leadership** | Attrition risk, engagement scores, department analytics, exports |

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

### 👥 **Employee Lifecycle**
- HR/Admin **Add Employee** with login credentials
- Onboarding checklist (PROBATION → ACTIVE)
- Document upload, offboard & mandatory password change
- JWT + RBAC (Admin, HR, Manager, Employee)

### ⏰ **Time & Attendance**
- Clock in / clock out with daily records
- Manager and HR attendance visibility
- Real-time punch notifications

### ✈️ **Leave Management**
- Submit, approve, reject, cancel leave
- Leave balance tracking per type
- Manager approval workflow & status alerts

</td>
<td width="50%" valign="top">

### 💰 **Payroll**
- Salary structures & payslip generation
- Employee payslip view and download
- HR payroll operations console
- INR-ready compensation breakdown

### 📈 **Performance**
- Quarterly reviews & 360° feedback
- Manager review operations console
- Scorecards and trend analytics

### 🤖 **AI & Notifications**
- Attrition risk, engagement & skill gap insights
- Nexus AI assistant & PDF/Excel report export
- In-app bell, WebSocket push & HR broadcasts

</td>
</tr>
</table>

---

## 🚀 Getting Started (Docker)

Run the **full stack in one command** — all 9 backend services, API gateway, frontend, PostgreSQL, Redis, and MailHog.

**Prerequisites:** [Docker](https://docs.docker.com/get-docker/) & Docker Compose

### 1. Clone & configure

```bash
git clone https://github.com/Rashmi-Kumari123/AI-Enabled-Enterprise-HR-Workforce-Intelligence-Platform.git
cd AI-Enabled-Enterprise-HR-Workforce-Intelligence-Platform
cp .env.example .env
```

### 2. Stop anything already running

If you started services with `mvn` or `npm run dev`, stop them first (**Ctrl+C** in those terminals).

Clean up old containers:

```bash
docker compose down
```

### 3. Start everything

```bash
docker compose up -d --build
```

First run builds all images (~2–3 min). Later starts are faster:

```bash
docker compose up -d
```

### What starts

| # | Service | Port |
|:-:|---------|-----:|
| 1 | PostgreSQL | 5433 |
| 2 | Redis | 6380 |
| 3 | MailHog | 8025 |
| 4 | Auth | 8081 |
| 5 | Notification | 8089 |
| 6 | Employee | 8082 |
| 7 | Attendance | 8084 |
| 8 | Leave | 8085 |
| 9 | Payroll | 8083 |
| 10 | Performance | 8086 |
| 11 | AI Insights | 8088 |
| 12 | API Gateway | 8080 |
| 13 | Frontend | 5173 |

> Postgres/Redis use host ports **5433** and **6380** so they don't clash with a local PostgreSQL/Redis install.

### Open the app

| What | URL |
|:-----|:----|
| **NexusHR (login here)** | http://localhost:5173 |
| API health | http://localhost:8080/actuator/health |
| MailHog (test emails) | http://localhost:8025 |

> Opening `http://localhost:8080` in the browser shows a **404** — that is normal. The gateway is an API, not a web page. Use **port 5173** for the UI.

### Demo login

Company slug: **`nexushr`**. Password for all accounts: **`NexusHR@2026`**

| Role | Email |
|:-----|:------|
| Super Admin | `admin@nexushr.com` |
| HR Admin | `hr@nexushr.com` |
| Department Manager | `manager@nexushr.com` |
| Payroll Manager | `payroll@nexushr.com` |
| Employee | `employee@nexushr.com` |
| IT Admin | `it@nexushr.com` |
| CEO / Executive | `ceo@nexushr.com` |

### Multi-tenant

- **Login:** enter company slug on the sign-in form (defaults to `nexushr`).
- **Register company:** http://localhost:5173/register — creates an isolated org + Super Admin.
- **Join existing company:** http://localhost:5173/signup — HR, Manager, Payroll, or IT Admin self-registration within a slug.
- **Isolation:** shared database with `tenant_id` on every service; JWT carries `tenantId` and the gateway forwards `X-Tenant-Id`.

Register a second company (e.g. slug `zidio-demo`) to verify tenants cannot access each other's data.

### Stop

```bash
docker compose down
```

### Useful commands

```bash
docker compose ps              # container status
docker compose logs -f auth-service   # follow logs for one service
docker compose up -d --build   # rebuild after code changes
```

---

### Alternative: Local dev (Maven + npm)

For day-to-day coding with hot reload:

```bash
docker compose up -d postgres redis mailhog   # infra only (if ports free)
mvn clean install -DskipTests
# start each service: mvn -pl auth-service spring-boot:run  (etc.)
cd frontend && npm ci && npm run dev
```

---

### AWS / EKS deploy

```bash
./scripts/aws/deploy.sh all          # first-time: ECR + cluster + k8s
./scripts/aws/fix-backend-deploy.sh  # redeploy after code changes
```

Details: [`deploy/aws/README.md`](deploy/aws/README.md) · API: [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)

---

## Tech stack

Java 21 · Spring Boot 3.5 · Spring Cloud Gateway · PostgreSQL · Redis · React 19 · TypeScript · Vite · Tailwind · TanStack Query · Docker · AWS ECR/EKS · GitHub Actions

---
## Roadmap

### Phase 1 — Core HR platform (completed)
- [x] JWT auth with RBAC (Admin, HR, Manager, Employee)
- [x] Employee lifecycle — hire, onboard, offboard
- [x] Attendance, leave, payroll, performance modules
- [x] Real-time notifications (email + in-app + WebSocket)
- [x] Role-based React dashboards

### Phase 2 — AI and intelligence (completed)
- [x] Attrition risk scoring
- [x] Engagement analytics
- [x] Skill gap analysis
- [x] Nexus AI workforce assistant
- [x] PDF / Excel workforce report export

### Phase 3 — DevOps and production (completed)
- [x] Docker multi-stage builds
- [x] Docker Compose full stack
- [x] Kubernetes manifests + HPA
- [x] AWS ECR + EKS deployment
- [x] GitHub Actions CI/CD with auto-deploy on `main`
- [x] Prometheus + Grafana monitoring
- [x] OWASP ZAP security baseline

### Phase 4 — Multi-tenant SaaS (MVP)
- [x] Organization registration and tenant isolation (`tenant_id` on all services)
- [x] Tenant context propagation (gateway JWT → `X-Tenant-Id` + slug at login)
- [x] 7-role RBAC matrix (Super Admin, HR, Manager, Payroll, Employee, IT Admin, Executive)
- [x] Permission-driven navigation and role-specific dashboards
- [x] Company register, login slug, and hire-with-role flows

### Phase 5 — Future enhancements
- [ ] SSO / OAuth2 (Google, Microsoft)
- [ ] Mobile app (React Native)
- [ ] Recruitment and applicant tracking (ATS)
- [ ] Advanced LLM integration (OpenAI / Azure) as default
- [ ] Biometric attendance integration
- [ ] Custom domain per tenant (`company.com`)

---

## License

Academic project — **Zidio Development, June 2026**. Educational use.
