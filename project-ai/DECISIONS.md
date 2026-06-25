# Architectural & Technical Decisions

## 1. Core Technology Stack
- **Decision**: Frontend built on React (v19), TypeScript, and Vite. Backend built on Node.js, Express, and TypeScript.
- **Reason**: High performance, modern development cycle (Hot Module Replacement via Vite), and consistent language features (TypeScript) across both the client and server.
- **Impact**: Strong typing guarantees, easier sharing of schemas/types, and quick frontend compile times.

---

## 2. Database Choice & ORM Integration
- **Decision**: PostgreSQL database hosted on Supabase, accessed via Prisma ORM using `@prisma/adapter-pg`.
- **Reason**: PostgreSQL provides structured relational data management matching aviation regulations. Prisma ensures type-safe queries and simplified schema sync. Supabase provides a highly reliable, cloud-hosted relational database.
- **Impact**: All database operations are strongly-typed, schema changes are tracked in source control, and connection pools are managed efficiently.

---

## 3. Styling Paradigm
- **Decision**: Vanilla CSS + Tailwind CSS integration.
- **Reason**: Combining custom Vanilla CSS parameters (like dark/light theme variables in `index.css`) with Tailwind CSS utility classes allows maximum aesthetic design flexibility while preserving rapid development.
- **Impact**: premium styling variables (`--accent-cyan`, `--bg-card`, etc.) are centralized in `client/src/index.css` and applied across React components.

---

## 4. Authentication & Role-Based Access Control (RBAC)
- **Decision**: Custom JSON Web Token (JWT) signing on Express backend, coupled with custom router guards on the React client.
- **Reason**: Avoids complex external identity providers during the MVP phase while keeping the system lightweight, secure, and fully customized to the user roles (`ADMIN`, `MANAGER`, `ENGINEER`, `TECHNICIAN`, `OPERATIONS`).
- **Impact**: Requests contain a `Bearer` token in authorization headers. Client routes are guarded using a wrapper component (`ProtectedRoute`) verifying the user's `roleKey`.

---

## 5. Development API Proxying
- **Decision**: Vite dev server configured to proxy all `/api` traffic to `http://localhost:5000` during local development.
- **Reason**: Prevents Cross-Origin Resource Sharing (CORS) complications during development and avoids hardcoding the backend URL.
- **Impact**: The Axios client can query absolute routes relative to the host domain (e.g. `/api/aircraft`), making deployment configurations cleaner.
