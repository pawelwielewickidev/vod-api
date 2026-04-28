FROM eclipse-temurin:25-jdk AS build
WORKDIR /app


COPY backend/gradlew .
COPY backend/gradle gradle
COPY backend/settings.gradle .
COPY backend/build.gradle .
COPY backend/src src


RUN chmod +x gradlew
RUN ./gradlew build -x test

FROM eclipse-temurin:25-jre
WORKDIR /app
EXPOSE 8080


COPY --from=build /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]