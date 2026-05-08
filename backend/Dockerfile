# ETAP 1: Budowanie (Z wykorzystaniem cache'owania zależności)
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Kopiujemy najpierw TYLKO pliki konfiguracyjne Gradle'a
COPY backend/gradlew .
COPY backend/gradle gradle
COPY backend/settings.gradle .
COPY backend/build.gradle .

RUN chmod +x gradlew
# Pobieramy zależności. Jeśli nie zmienisz build.gradle, Docker użyje cache'u z tego kroku!
RUN ./gradlew dependencies --no-daemon

# Dopiero teraz kopiujemy kod źródłowy i budujemy
COPY backend/src src
RUN ./gradlew build -x test --no-daemon

# ETAP 2: Uruchamianie (Lekki i bezpieczny obraz)
FROM eclipse-temurin:25-jre
WORKDIR /app
EXPOSE 8080

# DOBRA PRAKTYKA: Tworzymy użytkownika non-root ze względów bezpieczeństwa w chmurze
RUN useradd -m springuser
USER springuser

# Kopiujemy gotowego JAR-a (upewnij się, że nazwa pliku pasuje do Twojej konfiguracji Gradle)
COPY --from=build /app/build/libs/*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]