# AI Agent Operating Protocol

This document serves as the standard operating protocol for any AI Coding Agent or Assistant starting work on the DRISHYAM codebase. It ensures consistency, prevents architectural drift, and eliminates redundant work.

---

## 1. Session Initialization Workflow
Every time a new session starts, the AI agent must perform the following actions **before** modifying or creating files:
1. **Locate & Read the AI Knowledge System Files**:
   - Read the Master Plan: [MEMORY.md](file:///e:/Drishyam/project-ai/Memory.md)
   - Read the Live Status: [STATUS.md](file:///e:/Drishyam/project-ai/STATUS.md)
   - Read Architectural Log: [DECISIONS.md](file:///e:/Drishyam/project-ai/DECISIONS.md)
2. **Examine the Active Workspace**:
   - Check which dev servers are running.
   - Verify database migrations status (run standard Prisma status checks if necessary).
3. **Establish Current Scope**:
   - Determine what module is currently in progress or is the next recommended task from `STATUS.md`.

---

## 2. Preventing Hallucinations & Verifying Facts
- **Do Not Guess File Content**: Always inspect files using standard tools (`view_file` or `grep_search`) before making claims about what is implemented.
- **Do Not Assume Status**: If a file is empty or missing, mark its status as `Not Started`. Do not invent implementation details.
- **Check Server and Build Status**: Proactively run compilation/build tests (`npm run build`) to check for compiler errors rather than guessing.

---

## 3. Preserving Architecture & Avoiding Regressions
- **Tech Stack Compliance**: Adhere strictly to the decisions outlined in `DECISIONS.md` (e.g. Prisma + PostgreSQL, Custom JWT middleware, React Context + ProtectedRoute). Do not introduce alternative patterns (e.g. Redux, GraphQL) without explicit instruction.
- **Permission & Security Integrity**: Never disable role guards (`requireRole` in backend or `ProtectedRoute` in frontend) to patch short-term errors. Fix underlying role assignments instead.
- **API Paths Integrity**: Keep client API requests aligned with backend controller routes. Always check the corresponding router file (e.g. `server/src/routes/...`) before writing UI fetching logic.

---

## 4. Work Completion & Synchronization Protocol
When a development task or phase is completed, the acting AI agent **MUST** update the status files before ending the session:
1. **Update STATUS.md**:
   - Move completed tasks to the `Completed Modules` section.
   - Detail the current repository status (e.g., changes to frontend components, backend controllers, or database schemas).
   - Define the next actionable tasks for subsequent sessions.
2. **Update DECISIONS.md**:
   - If a new framework, package, database model constraint, or logic structure was introduced, document it as a decision including its *Decision*, *Reason*, and *Impact*.
3. **Commit System Files**:
   - Ensure `project-ai/STATUS.md` and `project-ai/DECISIONS.md` are added to the list of tracking files so the changes are saved for the next developer/agent.
