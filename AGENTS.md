# AGENTS.md - AI Coding Assistant Guidelines

## Architecture Overview
This is a monolithic VOD (Video-on-Demand) platform with a Spring Boot backend (Java 25, JPA/Hibernate, PostgreSQL) and React frontend (Vite, Tailwind CSS). Services are containerized via Docker Compose. Data flows from REST API endpoints to database, with file uploads stored in `/media` subdirectories (videos in root, posters in `/posters`, backgrounds in `/background`).

## Key Components
- **Backend**: `com.pawel.vod_api` package with layered architecture (Controller → Service → Repository → Model). Entities: User (1:N Profiles), Profile (1:N Watchlists), Movie (belongs to Category, has Episodes), Watchlist (junction for Profile-Movie).
- **Frontend**: Simple SPA with routes for home (hero + grid) and movie details. Components in `/src/components`.
- **Media Handling**: File uploads via multipart/form-data, stored with UUID prefixes (e.g., `UUID_filename.mp4`). Streaming uses Spring's Resource with byte-range support for video/mp4.

## Developer Workflows
- **Run Full Stack**: `docker-compose up -d` (starts DB, backend on :8080, frontend on :5173 with hot reload).
- **Backend Build/Test**: `./gradlew build` or `./gradlew test` (JUnit 5, Mockito for services/controllers).
- **Frontend Dev**: `npm run dev` (Vite server with HMR).
- **Debug API**: Use Postman for endpoints like `POST /api/movies` (JSON body) or `PATCH /api/movies/{id}/video` (multipart file).

## Project Conventions
- **Entities**: Use Lombok `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`. Table names plural (e.g., `@Table(name = "users")`).
- **DTOs**: Separate request (e.g., `MovieDto`) and response (e.g., `MovieResponseDto`) DTOs. Map entities to DTOs in services (e.g., `MovieService.mapToDto`).
- **File Paths**: Store absolute paths in DB (e.g., `media/posters/UUID_file.jpg`). Create dirs if missing (e.g., `Files.createDirectories(Path.of("media", "posters"))`).
- **Error Handling**: Custom `ResourceNotFoundException` with Polish messages. Controllers return `ResponseEntity` with appropriate status.
- **Streaming**: Controllers produce `video/mp4` or `image/jpeg`, services return `FileSystemResource`. Episodes use computed `streamUrl` (e.g., `/api/episodes/{id}/stream`).
- **Validation**: Use `@Valid` in controllers, but business logic in services (e.g., max 5 profiles per user in `ProfileService`).
- **Frontend**: Tailwind classes for styling (e.g., `bg-neutral-950`). Fetch API data in components (e.g., `MovieGrid` fetches `/api/movies`).

## Integration Points
- **Database**: PostgreSQL with `ddl-auto=update`. Volumes persist data.
- **File System**: Shared `/media` volume between backend container and host.
- **Cross-Service**: Frontend proxies API calls to backend (configured in Vite? Check `vite.config.js`).

Reference: `backend/src/main/java/com/pawel/vod_api/service/MovieService.java` for upload/streaming patterns; `frontend/src/App.jsx` for routing.</content>
<parameter name="filePath">/Users/robertgrzech/Documents/Paweł/JavaDev/portfolio VOD app/AGENTS.md
