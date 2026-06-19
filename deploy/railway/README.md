# Deploy NexusHR Backend on Railway

Step-by-step guide to deploy all **9 Spring Boot microservices** on [Railway](https://railway.app) using the existing Docker build.

## Architecture on Railway

```
Internet
   │
   ▼
┌─────────────────┐     private network (.railway.internal)
│  api-gateway    │ ──► auth, employee, leave, payroll, …
│  (public URL)   │
└─────────────────┘
         │
    PostgreSQL (1 instance, 8 databases)
    Redis (auth sessions)
```

| Component | Railway service name | Public? |
|:----------|:---------------------|:--------|
| API Gateway | `api-gateway` | **Yes** — main backend URL |
| Auth | `auth-service` | No (private) |
| Employee | `employee-service` | No |
| Payroll | `payroll-service` | No |
| Attendance | `attendance-service` | No |
| Leave | `leave-service` | No |
| Performance | `performance-service` | No |
| AI Insights | `ai-insights-service` | No |
| Notification | `notification-service` | No |
| PostgreSQL | `postgres` | Plugin |
| Redis | `redis` | Plugin |

---

## Prerequisites

- [Railway account](https://railway.app) (Hobby plan recommended — 9 services use significant resources)
- [Railway CLI](https://docs.railway.com/guides/cli) (optional): `npm i -g @railway/cli`
- GitHub repo connected to Railway
- `psql` locally (for one-time database provisioning)

---

## Step 1 — Create Railway project

1. Go to [railway.app/new](https://railway.app/new)
2. **Deploy from GitHub repo** → select this repository
3. Name the project e.g. `nexushr-backend`

---

## Step 2 — Add PostgreSQL & Redis

1. In project canvas → **+ New** → **Database** → **PostgreSQL**
2. **+ New** → **Database** → **Redis**

Rename plugins to `postgres` and `redis` for clarity.

---

## Step 3 — Create all 8 databases

Railway gives one PostgreSQL instance. NexusHR uses **one database per microservice** on the same host.

From your machine (with Railway Postgres credentials):

```bash
# Copy DATABASE_PUBLIC_URL from Postgres service → Variables
export DATABASE_PUBLIC_URL="postgresql://postgres:xxx@xxx.railway.app:5432/railway"

chmod +x deploy/railway/provision-databases.sh
./deploy/railway/provision-databases.sh
```

Or in **Railway Postgres → Data → Query**:

```sql
-- paste contents of deploy/railway/init-databases.sql
```

---

## Step 4 — Shared project variables

In **Project Settings → Shared Variables**, add:

| Variable | Example | Notes |
|:---------|:--------|:------|
| `JWT_SECRET` | `your-64-char-random-secret` | **Required** — same across all services |
| `EMPLOYEE_INTERNAL_KEY` | `nexushr-prod-internal-key` | Service-to-service auth |
| `LEAVE_INTERNAL_KEY` | same as above | |
| `NOTIFICATION_INTERNAL_KEY` | same as above | |
| `AUTH_INTERNAL_KEY` | same as above | |
| `JPA_SHOW_SQL` | `false` | |
| `DEMO_SEED_ENABLED` | `true` | Seeds demo HR/admin accounts on auth startup |
| `NOTIFICATION_EMAIL_ENABLED` | `false` | Disable until SMTP configured |

Generate a secret:

```bash
openssl rand -base64 48
```

---

## Step 5 — Create each microservice

For **each** backend service, repeat:

1. **+ New** → **GitHub Repo** → same repository
2. Rename service (exact names matter for variable references below)
3. **Settings → Root Directory**: leave **empty** (repo root — needed for Maven monorepo)
4. **Settings → Config file path**: set to the matching file in `deploy/railway/services/`

| Service | Config file path | Build variable |
|:--------|:-----------------|:---------------|
| api-gateway | `deploy/railway/services/api-gateway.railway.json` | `SERVICE_MODULE=api-gateway` |
| auth-service | `deploy/railway/services/auth-service.railway.json` | `SERVICE_MODULE=auth-service` |
| employee-service | `deploy/railway/services/employee-service.railway.json` | `SERVICE_MODULE=employee-service` |
| payroll-service | `deploy/railway/services/payroll-service.railway.json` | `SERVICE_MODULE=payroll-service` |
| attendance-service | `deploy/railway/services/attendance-service.railway.json` | `SERVICE_MODULE=attendance-service` |
| leave-service | `deploy/railway/services/leave-service.railway.json` | `SERVICE_MODULE=leave-service` |
| performance-service | `deploy/railway/services/performance-service.railway.json` | `SERVICE_MODULE=performance-service` |
| ai-insights-service | `deploy/railway/services/ai-insights-service.railway.json` | `SERVICE_MODULE=ai-insights-service` |
| notification-service | `deploy/railway/services/notification-service.railway.json` | `SERVICE_MODULE=notification-service` |

5. **Settings → Build → Dockerfile path**: `Dockerfile` (repo root)
6. **Variables → Add `SERVICE_MODULE`** with the value from the table (required Docker build arg)
7. **Settings → Deploy → Custom Start Command**: leave **empty** (use Dockerfile `ENTRYPOINT`)
8. **Settings → Networking → Private networking**: enabled
8. For all services **except api-gateway**: disable **Public Networking** (recommended)

---

## Step 6 — Service environment variables

Use Railway reference syntax `${{ServiceName.VAR}}`. Replace `postgres` / `redis` with your plugin names if different.

### auth-service

```env
SERVICE_MODULE=auth-service
DB_URL=jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/nexus_auth_db?sslmode=require
DB_USERNAME=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
REDIS_HOST=${{redis.REDISHOST}}
REDIS_PORT=${{redis.REDISPORT}}
REDIS_PASSWORD=${{redis.REDISPASSWORD}}
APP_SERVICES_EMPLOYEE_URL=http://${{employee-service.RAILWAY_PRIVATE_DOMAIN}}:${{employee-service.PORT}}
```

### employee-service

```env
SERVICE_MODULE=employee-service
DB_URL=jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/nexus_employee_db?sslmode=require
DB_USERNAME=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
APP_SERVICES_AUTH_URL=http://${{auth-service.RAILWAY_PRIVATE_DOMAIN}}:${{auth-service.PORT}}
APP_SERVICES_LEAVE_URL=http://${{leave-service.RAILWAY_PRIVATE_DOMAIN}}:${{leave-service.PORT}}
APP_UPLOAD_DIR=/app/uploads
```

> **Optional:** Add a Railway **Volume** mounted at `/app/uploads` for persistent document storage.

### payroll-service

```env
SERVICE_MODULE=payroll-service
DB_URL=jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/nexus_payroll_db?sslmode=require
DB_USERNAME=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
APP_SERVICES_EMPLOYEE_URL=http://${{employee-service.RAILWAY_PRIVATE_DOMAIN}}:${{employee-service.PORT}}
APP_NOTIFICATIONS_URL=http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:${{notification-service.PORT}}
```

### attendance-service

```env
SERVICE_MODULE=attendance-service
DB_URL=jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/nexus_attendance_db?sslmode=require
DB_USERNAME=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
APP_SERVICES_EMPLOYEE_URL=http://${{employee-service.RAILWAY_PRIVATE_DOMAIN}}:${{employee-service.PORT}}
APP_NOTIFICATIONS_URL=http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:${{notification-service.PORT}}
```

### leave-service

```env
SERVICE_MODULE=leave-service
DB_URL=jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/nexus_leave_db?sslmode=require
DB_USERNAME=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
APP_SERVICES_EMPLOYEE_URL=http://${{employee-service.RAILWAY_PRIVATE_DOMAIN}}:${{employee-service.PORT}}
APP_NOTIFICATIONS_URL=http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:${{notification-service.PORT}}
```

### performance-service

```env
SERVICE_MODULE=performance-service
DB_URL=jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/nexus_performance_db?sslmode=require
DB_USERNAME=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
APP_NOTIFICATIONS_URL=http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:${{notification-service.PORT}}
```

### ai-insights-service

```env
SERVICE_MODULE=ai-insights-service
DB_URL=jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/nexus_ai_insights_db?sslmode=require
DB_USERNAME=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
APP_SERVICES_EMPLOYEE_URL=http://${{employee-service.RAILWAY_PRIVATE_DOMAIN}}:${{employee-service.PORT}}
APP_SERVICES_LEAVE_URL=http://${{leave-service.RAILWAY_PRIVATE_DOMAIN}}:${{leave-service.PORT}}
APP_SERVICES_ATTENDANCE_URL=http://${{attendance-service.RAILWAY_PRIVATE_DOMAIN}}:${{attendance-service.PORT}}
APP_SERVICES_PERFORMANCE_URL=http://${{performance-service.RAILWAY_PRIVATE_DOMAIN}}:${{performance-service.PORT}}
APP_NOTIFICATIONS_URL=http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:${{notification-service.PORT}}
```

### notification-service

```env
SERVICE_MODULE=notification-service
DB_URL=jdbc:postgresql://${{postgres.PGHOST}}:${{postgres.PGPORT}}/nexus_notification_db?sslmode=require
DB_USERNAME=${{postgres.PGUSER}}
DB_PASSWORD=${{postgres.PGPASSWORD}}
NOTIFICATION_EMAIL_ENABLED=false
APP_SERVICES_LEAVE_URL=http://${{leave-service.RAILWAY_PRIVATE_DOMAIN}}:${{leave-service.PORT}}
```

### api-gateway (public entry point)

```env
SERVICE_MODULE=api-gateway
AUTH_SERVICE_URL=http://${{auth-service.RAILWAY_PRIVATE_DOMAIN}}:${{auth-service.PORT}}
EMPLOYEE_SERVICE_URL=http://${{employee-service.RAILWAY_PRIVATE_DOMAIN}}:${{employee-service.PORT}}
PAYROLL_SERVICE_URL=http://${{payroll-service.RAILWAY_PRIVATE_DOMAIN}}:${{payroll-service.PORT}}
ATTENDANCE_SERVICE_URL=http://${{attendance-service.RAILWAY_PRIVATE_DOMAIN}}:${{attendance-service.PORT}}
LEAVE_SERVICE_URL=http://${{leave-service.RAILWAY_PRIVATE_DOMAIN}}:${{leave-service.PORT}}
PERFORMANCE_SERVICE_URL=http://${{performance-service.RAILWAY_PRIVATE_DOMAIN}}:${{performance-service.PORT}}
AI_INSIGHTS_SERVICE_URL=http://${{ai-insights-service.RAILWAY_PRIVATE_DOMAIN}}:${{ai-insights-service.PORT}}
NOTIFICATION_SERVICE_URL=http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:${{notification-service.PORT}}
CORS_ALLOWED_ORIGIN_PATTERNS=https://*.up.railway.app,https://*.vercel.app,http://localhost:*
```

---

## Step 7 — Deploy order

Deploy in this order to satisfy dependencies:

1. `postgres` + `redis` (plugins)
2. Run `provision-databases.sh`
3. `employee-service`
4. `auth-service`
5. `notification-service`
6. `leave-service`, `attendance-service`, `payroll-service`, `performance-service`
7. `ai-insights-service`
8. `api-gateway` (last)

Generate a **public domain** for `api-gateway` only:
**Settings → Networking → Generate Domain**

Your backend base URL:

```
https://api-gateway-production-xxxx.up.railway.app
```

---

## Step 8 — Verify deployment

```bash
# Gateway health
curl https://YOUR-GATEWAY.up.railway.app/actuator/health

# Auth health (via gateway)
curl https://YOUR-GATEWAY.up.railway.app/api/v1/auth/health

# Login
curl -X POST https://YOUR-GATEWAY.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@nexushr.com","password":"NexusHR@2026"}'
```

---

## Step 9 — Connect frontend

Deploy frontend separately (Vercel / Railway / Netlify) with:

```env
VITE_AUTH_API_URL=https://YOUR-GATEWAY.up.railway.app
VITE_EMPLOYEE_API_URL=https://YOUR-GATEWAY.up.railway.app
VITE_ATTENDANCE_API_URL=https://YOUR-GATEWAY.up.railway.app
VITE_LEAVE_API_URL=https://YOUR-GATEWAY.up.railway.app
VITE_PAYROLL_API_URL=https://YOUR-GATEWAY.up.railway.app
VITE_PERFORMANCE_API_URL=https://YOUR-GATEWAY.up.railway.app
VITE_NOTIFICATION_API_URL=https://YOUR-GATEWAY.up.railway.app
VITE_AI_INSIGHTS_API_URL=https://YOUR-GATEWAY.up.railway.app
```

Add your frontend URL to gateway `CORS_ALLOWED_ORIGIN_PATTERNS`.

---

## CLI quick deploy (single service)

```bash
railway login
railway link          # select project
railway up --service auth-service
```

Ensure `SERVICE_MODULE` is set on that service before deploying.

---

## Cost & limits

| Item | Estimate |
|:-----|:---------|
| 9 Java services | ~512 MB–1 GB RAM each when idle |
| PostgreSQL | 1 plugin |
| Redis | 1 plugin |
| **Recommended** | Railway **Hobby** ($5/mo) + usage |

Free tier trial credits may not cover all 9 services continuously — start with core 4 (`auth`, `employee`, `notification`, `api-gateway`) if needed.

---

## Troubleshooting

### `Error: Unable to access jarfile target/*jar`

**Root cause:** Railway used **Nixpacks** (Maven auto-detect) instead of **Docker**. Nixpacks start command is `java -jar target/*jar`, which fails because no JAR exists at runtime.

**Fix (do all three):**

1. **Remove custom start command**  
   Service → **Settings → Deploy → Custom Start Command** → **clear/delete** (must be empty)

2. **Force Docker builder**  
   Service → **Settings → Build** → Builder = **Dockerfile**  
   Dockerfile path = **`Dockerfile`** (repo root)

3. **Set build variable** on the service:
   ```env
   SERVICE_MODULE=auth-service
   ```
   (Use `api-gateway`, `employee-service`, etc. per service)

4. **Redeploy** — build logs should show `docker build`, not `nixpacks` / `mvn` at runtime.

This repo includes root `Dockerfile`, `railway.toml`, and `nixpacks.toml` to prevent Nixpacks from taking over.

| Issue | Fix |
|:------|:----|
| Build fails — wrong module | Set `SERVICE_MODULE` variable on the service |
| 403 on internal/onboard | Redeploy employee-service with latest security config |
| Flyway / DB error | Run `provision-databases.sh`; check `DB_URL` database name |
| CORS blocked | Add frontend URL to `CORS_ALLOWED_ORIGIN_PATTERNS` on gateway |
| Redis connection failed | Link Redis plugin vars to auth-service |
| Health check failing | Increase deploy timeout; first JVM start can take 2–3 min |
| Email errors | Set `NOTIFICATION_EMAIL_ENABLED=false` until SMTP is configured |

---

## Files in this folder

| File | Purpose |
|:-----|:--------|
| `init-databases.sql` | Idempotent CREATE DATABASE script |
| `provision-databases.sh` | Run DB bootstrap against Railway Postgres |
| `jdbc-urls.sh` | Helper to print JDBC URLs from PG* vars |
| `services/*.railway.json` | Per-service Railway config (health checks, watch paths) |

---

## Demo accounts (after deploy)

| Role | Email | Password |
|:-----|:------|:---------|
| Admin | admin@nexushr.com | NexusHR@2026 |
| HR | hr@nexushr.com | NexusHR@2026 |
| Manager | manager@nexushr.com | NexusHR@2026 |
| Employee | employee@nexushr.com | NexusHR@2026 |

Seeded when `DEMO_SEED_ENABLED=true` on auth-service.
