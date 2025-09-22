# --- Stage 1: Build the application ---
FROM maven:3.8-openjdk-17 AS builder

# Set the working directory
WORKDIR /app

# Copy pom.xml and download dependencies first to leverage Docker cache
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src

# Package the application, skipping tests for faster builds
RUN mvn package -DskipTests

# --- Stage 2: Create the final, lightweight image ---
FROM eclipse-temurin:17-jre-focal

WORKDIR /app

# Copy the executable JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
