# 🎬 VOD Platform API (Netflix Clone Backend)

## 🚧 Work In Progress / Roadmap

This project is under active development. The core architecture and user/profile management are complete. Here is what's coming next:

* **[In Progress] Personal Watchlists:** Allowing profiles to add, view, and remove movies from their individual watchlists.
* **[Planned] Global Exception Handling:** Implementing `@ControllerAdvice` for cleaner, standardized API error responses.
* **[Planned] Data Validation:** Adding strict validation rules (`@Valid`, `@NotBlank`) for incoming JSON payloads.
* **[Planned] Spring Security:** Securing endpoints with JWT authentication and role-based access control (Admin vs User).

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
* `GET /api/movies` - Retrieve all available movies in the database.
* `GET /api/movies?categoryId={categoryId}` - Retrieve all available movies in selected category.

**Watchlists**
* `POST /api/users/{userId}/profiles/{profileId}/movies/{movieId}` - (Work in progress) Add a movie to a profile's watchlist.

---
*Created by Pawel Wielewicki - Feel free to contact me!*