# Multi-stage build: Vite React app → nginx static server
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

ARG VITE_AUTH_API_URL=http://localhost:8080
ARG VITE_EMPLOYEE_API_URL=http://localhost:8080
ARG VITE_ATTENDANCE_API_URL=http://localhost:8080
ARG VITE_LEAVE_API_URL=http://localhost:8080
ARG VITE_PAYROLL_API_URL=http://localhost:8080
ARG VITE_PERFORMANCE_API_URL=http://localhost:8080
ARG VITE_NOTIFICATION_API_URL=http://localhost:8080
ARG VITE_AI_INSIGHTS_API_URL=http://localhost:8080

ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL \
    VITE_EMPLOYEE_API_URL=$VITE_EMPLOYEE_API_URL \
    VITE_ATTENDANCE_API_URL=$VITE_ATTENDANCE_API_URL \
    VITE_LEAVE_API_URL=$VITE_LEAVE_API_URL \
    VITE_PAYROLL_API_URL=$VITE_PAYROLL_API_URL \
    VITE_PERFORMANCE_API_URL=$VITE_PERFORMANCE_API_URL \
    VITE_NOTIFICATION_API_URL=$VITE_NOTIFICATION_API_URL \
    VITE_AI_INSIGHTS_API_URL=$VITE_AI_INSIGHTS_API_URL

RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
