# Project Status

## Overall Progress
The platform has established its core database foundation, user authentication, and core operations modules (Aircraft, Crew, Policies, and Flight Logs). We are currently in the process of transitioning to advanced operations and maintenance modules (such as Snags and Work Orders) before analytics and AI features.

---

## Current Development Phase
- **Phase**: Operations & Maintenance Foundation (MVP Phase)
- **Current Focus**: Connecting the operations dashboard, completing basic crew certifications/shift templates, and preparing for Snag & Maintenance Work Order UI integration.

---

## Module Status

### Completed Modules
1. **Authentication & RBAC**:
   - Backend Express routes `/api/auth/register`, `/api/auth/login`, and `/api/auth/me`.
   - JWT authorization, validation, and role middlewares (`requireAuth`, `requireRole`).
   - Frontend session check, `AuthContext` status, and page-level route wrapping (`ProtectedRoute`).
2. **Aircraft Management**:
   - Full CRUD backend `/api/aircraft`.
   - React UI page for fleet registration (Add, edit, delete, status tracking).
3. **Crew Management (Basic CRUD)**:
   - Full CRUD backend `/api/crew`.
   - React UI roster list and detail modals.
4. **Policy Management**:
   - Backend routes `/api/policies` for regulatory metadata storage.
   - React UI page for policy list and metadata uploads.
5. **Flight Logs Module**:
   - Transaction-based backend CRUD `/api/flight-logs` (verifies crew, logs hours, and automatically increments total aircraft hours).
   - React UI page for flight log entries, engine metrics, fuel consumption, and crew assignments.

### Modules In Progress
- **Dashboard Integration**: Dashboard currently reads from local mock data file (`client/src/data/mockData.ts`). Needs integration with backend APIs to retrieve live counts.

### Pending Modules
1. **Crew Shift Planning & Certifications**:
   - Currently, only basic crew details and availability statuses are handled.
   - Missing shift models (`crew_shifts`) and certification tracking models (`crew_certifications`) in `schema.prisma`.
2. **Snag Management (Client UI)**:
   - Backend routes `/api/snags` are implemented.
   - Needs React UI page for logging snags, assigning severity, and tracking resolution status.
3. **Maintenance Management (Client UI)**:
   - Backend routes `/api/maintenance-records` are implemented.
   - Needs React UI page for work orders, task checklists, and assignment execution.
4. **Reporting Engine**: CSV/PDF exports.
5. **Analytics Dashboard**: Fleet health indicators and trends via Recharts.
6. **AI Assistant & Predictive Maintenance**: Advanced features (Gemini indexing, Pandas, Scikit Learn) to be developed in later phases.

---

## Current Technical Architecture

### Frontend Status
- **Stack**: React (v19), TypeScript, Vite, Tailwind CSS + Custom CSS class patterns, Lucide icons, Axios.
- **Routing**: React Router DOM (v7) in `AppRoutes.tsx`.
- **Server Communication**: Base URL proxy configured in `vite.config.ts` redirecting `/api` to `http://localhost:5000`.

### Backend Status
- **Stack**: Node.js, Express, TypeScript, tsx watch runner.
- **Port**: 5000
- **Database Access**: Prisma Client using PostgreSQL.

### Database Status
- **Engine**: PostgreSQL (Supabase)
- **Prisma Connection**: PG Pool via `@prisma/adapter-pg` inside `server/src/config/db.ts`.
- **Schema**: Fully synced.

---

## Next Recommended Tasks
1. **Snag Management UI**: Create `client/src/pages/Snags.tsx` and map it in `AppRoutes.tsx` under `/snags` to connect with backend `/api/snags` routes.
2. **Maintenance UI**: Create `client/src/pages/Maintenance.tsx` to handle work orders.
3. **Live Dashboard stats**: Implement a summary/stats aggregator route in the backend and pull live metrics to display on the dashboard card components.

---

## Constraints (Do NOT Modify)
- **Auth Middleware**: Custom token verification logic in `server/src/middleware/auth.ts` must remain consistent to preserve existing routing session continuity.
- **Database Auto-Sync**: Do not push schema changes manually to Supabase without using Prisma CLI to avoid desynchronization.
- **Tech Stack Guidelines**: Do not introduce additional complex state management libraries (e.g., Redux) unless explicitly requested; standard React Context and custom hooks should be used.
