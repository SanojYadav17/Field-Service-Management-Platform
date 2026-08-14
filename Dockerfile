# ==========================================
# STAGE 1: Build React Frontend Asset Bundle
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Build Spring Boot Production JAR
# ==========================================
FROM maven:3.9.6-eclipse-temurin-25-alpine AS backend-builder
WORKDIR /app

COPY pom.xml ./
COPY mvnw ./
COPY .mvn .mvn/
COPY src src/

# Copy React frontend dist into Spring Boot static resources folder
COPY --from=frontend-builder /app/frontend/dist src/main/resources/static/

RUN ./mvnw package -DskipTests

# ==========================================
# STAGE 3: Production Runtime Container
# ==========================================
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Environment defaults for Neon DB & Port
ENV PORT=8080
ENV SPRING_DATASOURCE_URL="jdbc:postgresql://ep-mute-recipe-ax52n483-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
ENV SPRING_DATASOURCE_USERNAME="neondb_owner"
ENV SPRING_DATASOURCE_PASSWORD="npg_zNm4d6neYoub"

# Copy repackaged standalone executable JAR
COPY --from=backend-builder /app/target/DeliveryService-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
