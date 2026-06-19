# Docker entry for NexusHR microservices (ECR / EKS / local).
# Build: docker build --build-arg SERVICE_MODULE=auth-service -t nexushr/auth-service .
# Or use: ./scripts/aws/push-images.sh (pushes to ECR)

FROM maven:3.9-eclipse-temurin-21-alpine AS build
ARG SERVICE_MODULE
WORKDIR /app

COPY pom.xml .
COPY nexusHR-common ./nexusHR-common
COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY employee-service ./employee-service
COPY attendance-service ./attendance-service
COPY leave-service ./leave-service
COPY payroll-service ./payroll-service
COPY performance-service ./performance-service
COPY ai-insights-service ./ai-insights-service
COPY notification-service ./notification-service

RUN if [ -z "${SERVICE_MODULE}" ]; then \
      echo "ERROR: SERVICE_MODULE build arg is required (e.g. auth-service, api-gateway)"; \
      exit 1; \
    fi \
    && mvn -q -pl "${SERVICE_MODULE}" -am package -DskipTests \
    && cp "${SERVICE_MODULE}"/target/*.jar /app/service.jar

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S nexushr && adduser -S nexushr -G nexushr
WORKDIR /app
COPY --from=build /app/service.jar /app/app.jar
RUN chown -R nexushr:nexushr /app
USER nexushr

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
