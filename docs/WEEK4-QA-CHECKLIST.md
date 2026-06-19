# Week 4 — Final QA Checklist (Day 28)

Use this before Zidio submission.

## Functional smoke test

- [ ] Login as `hr@nexushr.com` / `NexusHR@2026`
- [ ] Login as `employee@nexushr.com` / `NexusHR@2026`
- [ ] Profile page shows correct user (no mismatched employee)
- [ ] Submit leave → manager notification → approve/reject
- [ ] Clock in / clock out → employee notification
- [ ] HR Announcements broadcast (HR role)
- [ ] AI Insights / Analytics dashboards load
- [ ] Export PDF/Excel from Analytics reports
- [ ] Notification bell receives in-app alerts

## Docker

- [ ] `docker compose up -d` — postgres + redis healthy
- [ ] `docker compose --profile app up -d --build` — all services start
- [ ] Frontend at http://localhost:5173 loads
- [ ] Gateway health: http://localhost:8080/actuator/health

## CI/CD

- [ ] `mvn verify` passes locally
- [ ] `cd frontend && npm run build` passes
- [ ] GitHub Actions CI green on main branch

## Monitoring

- [ ] Prometheus scrapes gateway metrics (`/actuator/prometheus`)
- [ ] Grafana dashboard "NexusHR Platform Overview" loads

## Security

- [ ] No secrets in git (`application.properties` with real passwords excluded)
- [ ] OWASP ZAP baseline run — review `reports/zap/zap-baseline-report.html`
- [ ] JWT required on protected APIs
- [ ] RBAC enforced (employee cannot access HR-only routes)

## Documentation deliverables

- [ ] README.md complete with setup steps
- [ ] PDF report (architecture, features F-01–F-07, stack, reflection)
- [ ] Demo video recorded (login → leave workflow → AI insights → export)
- [ ] Live demo URL accessible over HTTPS

## Demo video script (3–5 min)

1. Intro — problem statement (manual HR, no insights)
2. Login as HR — dashboard overview
3. Employee submits leave → manager approves → notification bell
4. AI workforce intelligence — attrition / engagement
5. Analytics export PDF
6. Architecture slide — microservices + Docker/K8s
