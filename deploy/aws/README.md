# AWS EKS + S3 deployment guide (NexusHR Week 4)

This guide covers production deployment on **Amazon EKS** with **S3** for employee documents and **RDS PostgreSQL** for databases.

## Architecture (production)

```
Internet → ALB Ingress → frontend (nginx) + api-gateway
                              ↓
                    Microservices (EKS pods)
                              ↓
              RDS PostgreSQL (per-service DBs) + ElastiCache Redis
                              ↓
              S3 bucket (employee documents) via IRSA
```

## Prerequisites

- AWS CLI v2, `kubectl`, `eksctl` or Terraform
- Domain + ACM certificate (HTTPS)
- GitHub Container Registry images (tag with `v*.*.*` to trigger CD workflow)

## 1. EKS cluster

```bash
eksctl create cluster \
  --name nexushr-prod \
  --region ap-south-1 \
  --version 1.31 \
  --nodegroup-name standard \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 6 \
  --managed
```

Install **AWS Load Balancer Controller** for Ingress (`k8s/ingress.yaml`).

Enable **metrics-server** (required for HPA):

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## 2. RDS PostgreSQL

Create one RDS instance (or Aurora) and run `scripts/postgres/init-databases.sql` to create:

- `nexus_auth_db`, `nexus_employee_db`, `nexus_payroll_db`, `nexus_attendance_db`
- `nexus_leave_db`, `nexus_performance_db`, `nexus_ai_insights_db`, `nexus_notification_db`

Update `k8s/configmap.yaml` / secrets with RDS endpoint:

```yaml
DB_URL: jdbc:postgresql://nexushr.xxxxx.ap-south-1.rds.amazonaws.com:5432/nexus_auth_db?sslmode=require
```

## 3. S3 for employee documents

```bash
aws s3 mb s3://nexushr-documents-prod --region ap-south-1
aws s3api put-bucket-encryption --bucket nexushr-documents-prod \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

**Bucket policy** (`deploy/aws/s3-bucket-policy.example.json`):

- Deny non-TLS traffic
- Allow only the employee-service IAM role (IRSA)

### IRSA (IAM Roles for Service Accounts)

1. Create IAM policy allowing `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` on `arn:aws:s3:::nexushr-documents-prod/*`
2. Attach to EKS service account `employee-service` in namespace `nexushr`
3. Set env on employee-service deployment:

```yaml
APP_STORAGE_PROVIDER: s3
AWS_S3_BUCKET: nexushr-documents-prod
AWS_REGION: ap-south-1
```

> Local/dev uses filesystem storage (`APP_UPLOAD_DIR=/app/uploads`). S3 wiring is configured at deploy time; swap the storage backend via env without code changes in a future sprint.

## 4. Deploy to EKS

```bash
# Build & push (or use GitHub Actions CD on tag v1.0.0)
./scripts/build-docker.sh
# Tag & push to ECR/GHCR...

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
cp k8s/secrets.example.yaml k8s/secrets.yaml   # fill production values
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

## 5. GitHub Actions secrets (CD workflow)

| Secret / Variable | Purpose |
|-------------------|---------|
| `AWS_ACCESS_KEY_ID` | Deploy role |
| `AWS_SECRET_ACCESS_KEY` | Deploy role |
| `AWS_REGION` | e.g. `ap-south-1` |
| `EKS_CLUSTER_NAME` | e.g. `nexushr-prod` |

Trigger manual deploy: **Actions → CD → Run workflow**

## 6. Monitoring on EKS

- Prometheus + Grafana: use `docker compose --profile monitoring` locally, or install **kube-prometheus-stack** Helm chart in cluster
- Scrape `api-gateway` `/actuator/prometheus` via ServiceMonitor

## 7. Cost tips (student / demo)

- Use **one** RDS instance + multiple databases (as in local dev)
- Single-node EKS or **Railway/Render** for live demo URL if EKS is too heavy
- Stop cluster outside demo hours
