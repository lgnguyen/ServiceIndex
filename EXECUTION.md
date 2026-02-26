# ServiceIndex Backend — Execution Plan

This document is an outlined set of tasks for an agentic AI to read and execute on the **backend server** only. Execute steps in order; later steps depend on earlier ones. **Check off each sub-step** (`[ ]` → `[x]`) only after it has been implemented, verified to work, and meets acceptable quality. **Add unit tests at the end of each step** (before Verify) so coverage and testing stay current as you go; user will manually test after each stage as well. Reference [documentation/API.md](documentation/API.md) for endpoint contracts and [documentation/ERD.mmd](documentation/ERD.mmd) for entity shapes.

---

## Step 1: Basic Express server on port 8000

**Goal:** Replace or wrap the current Node HTTP server with Express and have it listen on port 8000.

- [x] Add **Express** as a dependency.
- [x] Create an Express app that listens on **port 8000** (or `process.env.PORT` if set, default 8000).
- [x] Mount a simple health or root route (e.g. `GET /` or `GET /health`) that returns 200 so the server is demonstrably running.
- [x] Keep startup and graceful shutdown (e.g. SIGINT/SIGTERM) so the process exits cleanly.
- [x] Ensure the app entry point (e.g. `src/index.ts` or `src/app.ts`) runs this server.
- [x] Add unit tests for this step (e.g. server starts, health/root route returns 200); keep coverage in mind.
- [x] **Verify:** `curl http://localhost:8000` (or the health route) returns 200. (verified by Lance)

---

## Step 2: Environment config class (Config)

**Goal:** Centralize environment reading; load the JWT secret for use in auth.

- [x] Create a **Config** class (e.g. under `src/config/` or `src/lib/`) that reads from `process.env`.
- [x] Read **SECRET_KEY** into this class (used later for JWT sign/verify). If missing in development, fail fast or throw a clear error when auth is used.
- [x] Optionally read **PORT**, **NODE_ENV**, and database path/URL if used.
- [x] Expose getters or readonly properties (e.g. `getSecretKey()`, `getPort()`) so the rest of the app does not touch `process.env` directly.
- [x] Ensure `.env` is in `.gitignore` and is not committed. Add a `.env.example` with `SECRET_KEY=` (and optionally `PORT=`) and a short comment that the secret can be generated with `openssl rand -hex 32`.
- [x] Add unit tests for this step (e.g. Config reads SECRET_KEY and getPort; behavior when SECRET_KEY is missing); keep coverage in mind.
- [x ] **Verify:** Config class exists, reads `SECRET_KEY` from the environment, and can be instantiated or accessed without reading env elsewhere.

---

## Step 3: Barebone API routes, handlers, validators, and central router

**Goal:** Surface all API routes from [documentation/API.md](documentation/API.md) with Express, using one handler per endpoint and a validator per handler, plus a single central routing file.

### Central routing file

- [ ] Create one router module (e.g. `src/routes/index.ts` or `src/router.ts`) that imports Express router(s) or app and all handlers (or handler registrations).
- [ ] Register every route listed in API.md (users, vehicles, service records, alerts) and map each to the corresponding handler; no business logic in the router—only route → handler wiring.

### Handlers

- [ ] Implement one handler function (or class method) per API endpoint. Handlers accept `req` and `res` (and optionally `next`).
- [ ] Handlers delegate input validation to the validator; if validation fails, respond with 400 (or 401 for auth failures) and do not call business logic.
- [ ] Handlers call business logic (to be implemented in later steps) or return placeholder responses (e.g. 501 or minimal JSON) until those steps are done.
- [ ] Handlers set correct HTTP status codes per API.md (200, 201, 400, 401, 404, 500) and return JSON.

### Base validator

- [ ] Create a **base validator** class/module that checks the request has a valid body when required (e.g. JSON, non-empty where needed).
- [ ] Base validator performs **authentication** checks: extract and validate JWT (e.g. from `Authorization: Bearer <token>`), and attach the authenticated user id (or user entity) to the request so handlers can use it.
- [ ] Base validator provides a common way to return validation errors (e.g. 400 for bad input, 401 for missing/invalid/expired token).

### Per-route validators

- [ ] Create a validator per handler that extends or composes the base validator and adds endpoint-specific checks (required fields for create user, create vehicle, create service record, create alert; path params like `vehicleId`, `serviceRecordId`, `alertId` present and well-formed).

### Route coverage (from API.md)

- [ ] **Users:** `POST /users`, `GET /users/:userId`
- [ ] **Vehicles:** `POST /vehicles`, `GET /vehicles/:userId`, `GET /vehicles/:vehicleId`, `PUT /vehicles/:vehicleId`, `DELETE /vehicles/:vehicleId`
- [ ] **Service records:** `POST /vehicles/:vehicleId/services`, `GET /vehicles/:vehicleId/services`, `GET /vehicles/:vehicleId/services/:serviceRecordId`, `PUT /vehicles/:vehicleId/services/:serviceRecordId`, `DELETE /vehicles/:vehicleId/services/:serviceRecordId`
- [ ] **Alerts:** `POST /alerts`, `GET /alerts`, `GET /alerts/:alertId`, `PUT /alerts/:alertId`, `DELETE /alerts/:alertId`
- [ ] Add unit tests for this step (e.g. route registration, base validator body/JWT checks, per-route validators; placeholder handler responses); keep coverage in mind.
- [ ] **Verify:** All routes are registered and each returns a deterministic status/body (or placeholder). Invalid body or missing auth yields 400/401 via the validators; structure allows swapping in real business logic later.

---

## Step 4: Sequelize ORM and injectable repositories

**Goal:** Introduce Sequelize under a `database` subdirectory with models, a base repository, and one repository per entity; repositories must be injectable.

- [ ] Put all ORM-related code under a subdirectory named **database** (e.g. `src/database/`).
- [ ] Configure Sequelize to use SQLite (file path from config or env). Define **models** for: User, Vehicle, ServiceRecord, ServiceItem, Make, Model, Alert. Align model attributes with [documentation/ERD.mmd](documentation/ERD.mmd).
- [ ] Create a **base/parent repository class** that holds shared behavior (e.g. generic findById, delete, or common error handling). Concrete repositories extend this base.
- [ ] Implement **UserRepository** (extends base; encapsulates User CRUD).
- [ ] Implement **VehicleRepository** (extends base; encapsulates Vehicle CRUD).
- [ ] Implement **ServiceRecordRepository** (extends base; encapsulates ServiceRecord CRUD).
- [ ] Implement **ServiceItemRepository** (extends base; encapsulates ServiceItem lookups).
- [ ] Implement **MakeRepository** (extends base; encapsulates Make lookups).
- [ ] Implement **ModelRepository** (extends base; encapsulates Model lookups).
- [ ] Implement **AlertRepository** (extends base; encapsulates Alert CRUD).
- [ ] Design repositories so any consumer receives them via **constructor injection** (no internal instantiation). Verify at least one consumer (e.g. test or script) can receive injected repositories.
- [ ] Add unit tests for this step (e.g. Sequelize connects; each repository’s main methods—create, findById, list, update, delete—with test DB or mocks; injectability); keep coverage in mind.
- [ ] **Verify:** Sequelize connects to SQLite; all models exist; base repository is used by concrete repos; all seven repository classes exist and are injectable.

---

## Step 5: Migrations for Make, Model, and Service Item

**Goal:** Use Sequelize migrations to create the full schema (all tables) and populate **Make**, **Model**, and **Service Item** as reference data. No API creates these; they are reference data. This step runs **before** DI and business logic so that vehicle, service record, and alert APIs can validate makeId/modelId/serviceItemId.

- [ ] Add Sequelize CLI (or migration runner) if not already present. Ensure migrations live under the database area (e.g. `src/database/migrations/` or project root `migrations/` per Sequelize convention).
- [ ] Create initial migration(s) that create **all tables** (User, Vehicle, ServiceRecord, Alert, Make, Model, Service Item) per [documentation/ERD.mmd](documentation/ERD.mmd) so that the app can persist data from Step 7 onward.
- [ ] Create migration(s) that create **Make** table (id, makeName, metadata, etc. per ERD) if not in initial schema.
- [ ] Create migration(s) that create **Model** table (id, modelName, makeId or equivalent, metadata, etc. per ERD) if not in initial schema.
- [ ] Create migration(s) that create **Service Item** table (id, itemType, recommendedInterval, etc. per ERD). Add foreign keys and indexes as needed.
- [ ] Add seed/reference data (in a migration or separate seed): populate **Make**, **Model**, and **Service Item** with a minimal set (e.g. a few makes, a few models, and service types from README: oil change, cabin air filter, tire rotation/balance/alignment, tire life, brakes, fluids, spark plugs, coil packs, clutch, battery, wipers). Document that more migrations or seeds can be run later for updates.
- [ ] Add unit tests for this step (e.g. migrations run successfully; schema and seed data are applied; optional: assert reference rows exist); keep coverage in mind.
- [ ] **Verify:** Running migrations creates/updates the schema and populates Make, Model, and Service Item. Vehicle and service record creation can resolve makeId, modelId, and serviceItemId against these tables.

---

## Step 6: Dependency injection (Config and ORM)

**Goal:** Use a DI approach so that Config and the ORM/repositories are injected into handlers or services rather than imported as globals. **Requires:** Config (Step 2), repositories (Step 4), and handlers/routes (Step 3) to exist so they can be wired.

- [ ] Introduce a **container** or **factory** (class-based or function-based) that instantiates **Config** once.
- [ ] Container instantiates or obtains the **Sequelize** connection and all **repository** classes (User, Vehicle, ServiceRecord, ServiceItem, Make, Model, Alert), passing shared dependencies (e.g. sequelize instance) where needed.
- [ ] Container provides a way to obtain **handlers** (or **services**) that receive these repositories and Config via constructor injection.
- [ ] Wire the Express app so that when a route is hit, the handler (or service) used is the one from the container, not a new ad-hoc instance that creates its own dependencies.
- [ ] Handlers (or a thin service layer) receive at least **Config** and the **repositories** they need; validators may receive Config (for JWT verification) and optionally repositories.
- [ ] Add unit tests for this step (e.g. container resolves Config and repos; handlers receive injected deps; app starts and routes respond); keep coverage in mind.
- [ ] **Verify:** No handler or service directly instantiates Config or repositories; they are supplied by the container/factory. App starts and routes respond (even with placeholder logic).

---

## Step 7: User API business logic and validation

**Goal:** Implement the behavior and validation required for user-related endpoints per API.md.

- [ ] **POST /users:** Validate body (email format, password presence/strength, name if required). Return 400 on failure.
- [ ] **POST /users:** Hash password (e.g. bcrypt) before storing; do not store plaintext. Persist user via UserRepository; return 201 with created user (exclude password hash from response). On duplicate email return 400 or 409. Return 500 on unexpected errors.
- [ ] **GET /users/:userId:** Require valid JWT; extract user id from token. Return 401 if missing or invalid. Ensure requested `userId` matches JWT subject; if not, return 401. Load user by id via UserRepository; if not found return 404. Return 200 with user profile (no sensitive fields). Return 500 on unexpected errors.
- [ ] Ensure validators for these routes enforce auth and body/param rules; handlers delegate to this business logic.
- [ ] Add unit tests for this step (e.g. create user returns 201 and excludes password; get user requires JWT and enforces ownership; 400/401/404/500 cases); keep coverage in mind.
- [ ] **Verify:** Create user and get current user behave per API.md (status codes and response shape). Passwords are hashed; JWT required for get current user; ownership enforced.

---

## Step 8: Vehicle API business logic and validation

**Goal:** Implement the behavior and validation required for vehicle endpoints per API.md.

- [ ] **POST /vehicles:** Validate body (nickname, year, makeId, modelId, etc.). Ensure make/model ids exist. Associate vehicle with authenticated user id from JWT. Persist via VehicleRepository; return 201. 400 on validation failure, 401 if not authenticated, 500 on error.
- [ ] **GET /vehicles/:userId:** Require JWT; ensure `userId` in path matches authenticated user. List vehicles for that user; return 200 with array. 401/500 per API.md.
- [ ] **GET /vehicles/:vehicleId:** Require JWT. Load vehicle by id; ensure it belongs to authenticated user. Return 200 with vehicle, 401 if not owner, 404 if not found, 500 on error.
- [ ] **PUT /vehicles/:vehicleId:** Require JWT; validate body. Load vehicle; ensure ownership. Update and return 200 with updated vehicle. 400/401/404/500 per API.md.
- [ ] **DELETE /vehicles/:vehicleId:** Require JWT. Load vehicle; ensure ownership. Delete vehicle (cascade to service records and alerts per API.md). Return 200 with no body (or optional confirmation). 401/404/500 per API.md.
- [ ] Add unit tests for this step (e.g. vehicle CRUD and list; ownership and makeId/modelId validation; 400/401/404/500 cases); keep coverage in mind.
- [ ] **Verify:** All vehicle endpoints behave per API.md; ownership and existence checks enforce 401/404 correctly.

---

## Step 9: Service record API business logic and validation

**Goal:** Implement the behavior and validation required for service record endpoints per API.md.

- [ ] **POST /vehicles/:vehicleId/services:** Validate body (serviceItemId, performedAt, odometer, notes, etc.). Require JWT; ensure vehicle exists and belongs to authenticated user; ensure serviceItemId exists. Create service record linked to vehicle; return 201. 400/401/404/500 per API.md.
- [ ] **GET /vehicles/:vehicleId/services:** Require JWT; ensure vehicle exists and belongs to user. List service records for that vehicle (paginated per API.md if specified). Return 200 with array. 401/404/500 per API.md.
- [ ] **GET /vehicles/:vehicleId/services/:serviceRecordId:** Require JWT; ensure vehicle ownership and record exists for that vehicle. Return 200 with record. 401/404/500 per API.md.
- [ ] **PUT /vehicles/:vehicleId/services/:serviceRecordId:** Require JWT; validate body. Ensure vehicle ownership and record exists. Update record; return 200 with updated record. 400/401/404/500 per API.md.
- [ ] **DELETE /vehicles/:vehicleId/services/:serviceRecordId:** Require JWT; ensure vehicle ownership and record exists. Delete record; return 200. 401/404/500 per API.md.
- [ ] Add unit tests for this step (e.g. service record CRUD and list; vehicle ownership and serviceItemId validation; 400/401/404/500 cases); keep coverage in mind.
- [ ] **Verify:** All service record endpoints behave per API.md; vehicle ownership and record existence are enforced.

---

## Step 10: Alert API business logic and validation

**Goal:** Implement the behavior and validation required for alert endpoints per API.md.

- [ ] **POST /alerts:** Validate body (vehicleId, serviceItemId, dueDate, status, etc.). Require JWT; ensure vehicle exists and belongs to authenticated user; ensure serviceItemId exists. Create alert for user; return 201. 400/401/404/500 per API.md.
- [ ] **GET /alerts:** Require JWT. List alerts for authenticated user (paginated per API.md if specified). Return 200 with array. 401/500 per API.md.
- [ ] **GET /alerts/:alertId:** Require JWT; load alert; ensure it belongs to authenticated user. Return 200 with alert, 401/404/500 per API.md.
- [ ] **PUT /alerts/:alertId:** Require JWT; validate body. Load alert; ensure ownership. Update (e.g. acknowledge, due date); return 200 with updated alert. 400/401/404/500 per API.md.
- [ ] **DELETE /alerts/:alertId:** Require JWT; ensure alert belongs to user. Delete alert; return 200. 401/404/500 per API.md.
- [ ] Add unit tests for this step (e.g. alert CRUD and list; ownership and vehicleId/serviceItemId validation; 400/401/404/500 cases); keep coverage in mind.
- [ ] **Verify:** All alert endpoints behave per API.md; ownership and existence checks enforced.

---

## Reference quick links

| Doc | Purpose |
|-----|--------|
| [documentation/API.md](documentation/API.md) | HTTP methods, paths, request/response shapes, status codes (200, 201, 400, 401, 404, 500). |
| [documentation/ERD.mmd](documentation/ERD.mmd) | Entity relationship and field names for User, Vehicle, ServiceRecord, ServiceItem, Make, Model, Alert. |
| [documentation/HLD.md](documentation/HLD.md) | High-level design, auth (JWT, SECRET_KEY, session storage, 2h/2-day expiry). |
| [DESIGN.md](DESIGN.md) or [documentation/DESIGN.md](documentation/DESIGN.md) | High-level architecture and tech stack. |

---

*End of execution plan. Order: 1 → 2 → 3 → 4 → 5 (migrations) → 6 (DI) → 7 (user) → 8 (vehicle) → 9 (service record) → 10 (alert). Add unit tests at the end of each step before Verify; check off each sub-step only after it is implemented, verified, and meets acceptable quality.*
