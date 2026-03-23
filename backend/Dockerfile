
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app


COPY gradlew .
COPY gradle gradle
COPY settings.gradle .


COPY backend/build.gradle backend/
COPY backend/src backend/src


RUN chmod +x gradlew
RUN ./gradlew :backend:build -x test


FROM eclipse-temurin:25-jre
WORKDIR /app
EXPOSE 8080


COPY --from=build /app/backend/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]