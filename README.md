# 🎬 Video Handling and Streaming (Video on Demand)

## 🚧 Work In Progress / Roadmap

This project is under active development. The core architecture and user/profile management are complete. Here is what's coming next:
* **[In Progress] React based UI**
* **[Planned] Spring Security:** Securing endpoints with JWT authentication and role-based access control (Admin vs User).
* **[Planned] Rating and Review System:** Designing and implementing the logic that allows users to rate movies (on a 1-5 scale) and leave comments under them.

A robust and scalable RESTful API built for a Video-On-Demand (VOD) platform. Designed with clean architecture principles, this project manages user accounts, multi-profile systems (similar to Netflix), and personal watchlists.

The entire application, including the database, is fully containerized using Docker, making it incredibly easy to set up and run in any environment.

## ✨ Key Features
* **User Management:** Secure user registration and account handling.
* **Multi-Profile System:** Each user account supports up to 5 distinct viewing profiles.
* **Smart Business Logic:** Built-in validation to prevent profile limit exploitation.
* **Personal Watchlists:** Independent watchlists for each profile, preventing duplicate entries.
* **TDD Approach:** Core business logic (Services) and API boundaries (Controllers) are thoroughly tested using JUnit 5 and Mockito.
* **Dockerized Environment:** Zero-config local setup with Docker Compose.

## 🛠️ Tech Stack
* **Language:** Java 25
* **Framework:** Spring Boot 4
* **Data Access:** Spring Data JPA / Hibernate
* **Database:** PostgreSQL
* **Testing:** JUnit 5, Mockito, Spring Boot Test, MockMvc
* **Containerization:** Docker & Docker Compose
* **Build Tool:** Gradle

## 🚀 Getting Started

Follow these steps to get a development environment running locally.

### Prerequisites
* Docker and Docker Compose installed on your machine.
* Git

### Installation & Running

1. **Clone the repository:**
   git clone https://github.com/pawelwielewickidev/vod-api.git
   cd vod-api

2. **Start the environment:**
   Use Docker Compose to spin up the PostgreSQL database and the Spring Boot application simultaneously.
   docker-compose up -d

3. **Verify it's running:**
   The API will be available at http://localhost:8080.

## 📡 API Endpoints Overview

Here are the main endpoints available in the API:

**Users**
* `POST /api/users` - Register a new user account.

**Profiles**
* `POST /api/users/{userId}/profiles` - Create a new profile under a specific user (Max 5).
* `GET /api/users/{userId}/profiles` - Retrieve all profiles for a specific user.

**Categories**
* `POST /api/categories` - Create a new movie category (e.g., Action, Sci-Fi).
* `GET /api/categories` - Retrieve a list of all available categories.

**Movies**
* `POST /api/movies` - Add a new movie to the catalog (requires a valid category ID).
* `GET /api/movies?categoryId={categoryId}` - Retrieve all available movies in selected category.
* `PATCH /api/movies/{movieId}/video` - Uploading a video file for an existing movie:
  * Request Type: `multipart/form-data`
  * Parameter: `file` (video file, e.g., `.mp4`)
  * Response: `204 No Content` upon successful save. Files are securely isolated in the `/media/` directory on the server.
* `GET /api/movies/{movieId}/stream` - On-the-fly video streaming:
  * Headers: Supports client requests with the `Range` header (e.g., `bytes=0-50000`).
  * Response: `206 Partial Content` with the requested file chunk.
* `GET /api/movies/{movieId}` - Fetching movie details.
* `PATCH /api/movies/{movieId}/poster` - Uploading a poster/thumbnail image for an existing movie:
  * Request Type: `multipart/form-data`
  * Parameter: `file` (image file, e.g., `.jpg`, `.png`)
  * Response: `204 No Content` upon successful save. Files are securely isolated in the `/media/posters/` directory.
* `GET /api/movies/{movieId}/poster` - Serving the poster image directly to the browser.
* `GET /api/movies/{movieId}` - Fetching movie details (dynamically includes `streamUrl` and `posterUrl` if files exist on the server).

**Watchlists**
* `POST /api/users/{userId}/profiles/{profileId}/watchlists/{movieId}` - Add a movie to a profile's watchlist.
* `GET /api/users/{userId}/profiles/{profileId}/watchlists` - Retrieve all movies in profile's watchlist.
* `DELETE /api/users/{userId}/profiles/{profileId}/watchlists/{movieId}` - Removing the movie from watchlist.

**Episodes**
* `GET /api/episodes/{id}/stream` - to handle byte-range streaming for video/mp4 files.
* `POST /api/episodes` - to facilitate adding new episodes to the database (e.g., via Postman).
---
*Created by Pawel Wielewicki - Feel free to contact me!*
