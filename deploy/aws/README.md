# Deploy NexusHR on AWS (CLI)

Production deployment using **Amazon ECR** (container images), **Amazon EKS** (Kubernetes), **RDS PostgreSQL**, **ElastiCache Redis**, and **S3** (employee documents).

## Architecture

```
Internet → ALB Ingress → frontend + api-gateway (EKS)
                              ↓
                    Microservices (EKS pods)
                              ↓
              RDS PostgreSQL + ElastiCache Redis + S3 (IRSA)
```

---

## Security — read first

**Never commit AWS access keys to git.** If keys were exposed in chat, email, or a screenshot:

1. IAM → Users → Security credentials → **Deactivate** the exposed access key
2. Create a **new** access key
3. Run `aws configure` locally (keys stay in `~/.aws/credentials` only)

For production, prefer an **IAM user or role** with least privilege (ECR, EKS, RDS) instead of root credentials.

---

## Prerequisites

| Tool | Install |
|:-----|:--------|
| AWS CLI v2 | [Install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| Docker | For building images |
| kubectl | [Install guide](https://kubernetes.io/docs/tasks/tools/) |
| eksctl | [Install guide](https://eksctl.io/installation/) |
| psql | For RDS database provisioning |

---

## Step 1 — Configure AWS CLI

Run once on your machine:

```bash
aws configure
# AWS Access Key ID:     <your key>
# AWS Secret Access Key: <your secret>
# Default region:        ap-south-1
# Default output:        json
```

Verify:

```bash
aws sts get-caller-identity
```

Optional environment overrides:

```bash
export AWS_REGION=ap-south-1
export EKS_CLUSTER_NAME=nexushr-prod
export IMAGE_TAG=latest
```

See [`env.example`](env.example) for all variables.

---

## Step 2 — RDS PostgreSQL

1. AWS Console → **RDS** → Create database → PostgreSQL 16
2. Note the endpoint, master username, and password
3. Create all service databases:

```bash
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@your-rds.xxxxx.ap-south-1.rds.amazonaws.com:5432/postgres?sslmode=require"
chmod +x scripts/postgres/provision-databases.sh
./scripts/postgres/provision-databases.sh
```

Update `k8s/configmap.yaml` and per-service `DB_URL` in `k8s/deployments.yaml` with your RDS endpoint.

---

## Step 3 — ElastiCache Redis (auth sessions)

Create a Redis cluster in the same VPC as EKS. Set in `k8s/configmap.yaml`:

```yaml
REDIS_HOST: your-redis.xxxxx.cache.amazonaws.com
REDIS_PORT: "6379"
```

Add `REDIS_PASSWORD` to `k8s/secrets.yaml` if auth is enabled.

---

## Step 4 — S3 for employee documents

```bash
aws s3 mb s3://nexushr-documents-prod --region ap-south-1
aws s3api put-bucket-encryption --bucket nexushr-documents-prod \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
```

Configure IRSA for `employee-service` — see [`s3-bucket-policy.example.json`](s3-bucket-policy.example.json).

Set in `k8s/configmap.yaml`:

```yaml
APP_STORAGE_PROVIDER: s3
AWS_S3_BUCKET: nexushr-documents-prod
AWS_REGION: ap-south-1
```

---

## Step 5 — Kubernetes secrets

```bash
cp k8s/secrets.example.yaml k8s/secrets.yaml
# Edit: DB_PASSWORD, JWT in configmap, internal keys, etc.
```

**Never commit `k8s/secrets.yaml`.**

---

## Step 6 — Deploy with CLI scripts

All scripts live in [`scripts/aws/`](../scripts/aws/).

```bash
chmod +x scripts/aws/*.sh

# 1) Create ECR repositories (one per microservice)
./scripts/aws/deploy.sh ecr

# 2) Build Docker images and push to ECR
./scripts/aws/deploy.sh push

# 3) Create EKS cluster (first time only — ~15–20 min, uses credits)
./scripts/aws/deploy.sh cluster

# 4) Apply Kubernetes manifests and point deployments at ECR images
./scripts/aws/deploy.sh k8s
```

Or run steps 1, 2, and 4 if the cluster already exists:

```bash
./scripts/aws/deploy.sh all
```

### What each step does

| Command | Action |
|:--------|:-------|
| `ecr` | Creates `nexushr-auth-service`, `nexushr-api-gateway`, … repos in ECR |
| `push` | Builds with `docker/Dockerfile.spring-service`, pushes to ECR |
| `cluster` | Creates EKS cluster via `eksctl` (t3.medium × 2 nodes) |
| `k8s` | `kubectl apply` + updates images to ECR URIs |

---

## Step 7 — Verify

```bash
kubectl get pods -n nexushr
kubectl get svc -n nexushr

# Gateway health (after LoadBalancer is ready)
curl http://<EXTERNAL-IP>:8080/actuator/health
curl http://<EXTERNAL-IP>:8080/api/v1/auth/health
```

Install **AWS Load Balancer Controller** for HTTPS Ingress — see `k8s/ingress.yaml`.

---

## Step 8 — Frontend

Rebuild frontend with your gateway URL before `push`:

```bash
export VITE_AUTH_API_URL=https://your-alb-domain.example.com
export VITE_EMPLOYEE_API_URL=$VITE_AUTH_API_URL
# ... same for all VITE_* vars
./scripts/aws/deploy.sh push
```

Or deploy frontend to **S3 + CloudFront** / **Amplify** separately.

---

## GitHub Actions CD

Set repository secrets:

| Secret / Variable | Purpose |
|-------------------|---------|
| `AWS_ACCESS_KEY_ID` | Deploy IAM user |
| `AWS_SECRET_ACCESS_KEY` | Deploy IAM user |
| `AWS_REGION` | e.g. `ap-south-1` |
| `EKS_CLUSTER_NAME` | e.g. `nexushr-prod` |

Tag `v1.0.0` → pushes images to GHCR. Run **CD workflow manually** to apply `k8s/` to EKS.

---

## Cost tips (AWS free tier / student credits)

| Resource | Estimate |
|:---------|:---------|
| EKS control plane | ~$73/month |
| 2× t3.medium nodes | ~$60/month |
| RDS db.t3.micro | ~$15/month (free tier eligible 12 mo) |
| ECR storage | Low for demo images |

**Save credits:** stop EKS node group when not demoing, use single RDS instance with multiple DBs, delete cluster with `eksctl delete cluster --name nexushr-prod`.

---

## Troubleshooting

| Issue | Fix |
|:------|:----|
| `Unable to locate credentials` | Run `aws configure` |
| `cluster not found` | Run `./scripts/aws/deploy.sh cluster` first |
| `secrets.yaml not found` | `cp k8s/secrets.example.yaml k8s/secrets.yaml` |
| Image pull errors | Ensure ECR login + `push` completed; check node IAM role for ECR read |
| Pods CrashLoopBackOff | Check RDS security group allows EKS nodes; verify `DB_URL` |

---

## File reference

| Path | Purpose |
|:-----|:--------|
| `scripts/aws/deploy.sh` | Main entry point |
| `scripts/aws/setup-ecr.sh` | Create ECR repos |
| `scripts/aws/push-images.sh` | Build & push to ECR |
| `scripts/aws/create-cluster.sh` | EKS cluster via eksctl |
| `scripts/aws/deploy-k8s.sh` | kubectl apply + ECR image update |
| `scripts/postgres/provision-databases.sh` | RDS database bootstrap |
| `k8s/*.yaml` | Kubernetes manifests |
| `s3-bucket-policy.example.json` | S3 bucket policy template |
