# ServiceIndex — High-Level Architecture

This document describes the high-level architecture of ServiceIndex: a vehicle service record tracker that helps users maintain and get reminders for maintenance (oil changes, tires, brakes, fluids, etc.).

For detailed requirements, assumptions, and alternatives see [documentation/HLD.md](documentation/HLD.md). For API contracts see [documentation/API.md](documentation/API.md).

---

## Architecture Overview

ServiceIndex is a **client–server application** with a local-first setup: a React frontend talks to a Node backend over HTTP; the backend uses SQLite for persistence. All three run on the user’s machine.

```
┌──────────────────────────────────────────────────────────────────┐
│                        User's machine                            │
│  ┌──────────────┐         HTTP          ┌──────────────────────┐ │
│  │   Frontend   │ ◄──────────────────►  │       Backend        │ │
│  │   (React)    │   localhost API       │  (Node / TypeScript) │ │
│  └──────────────┘                       │          │           │ │
│                                         │          ▼           │ │
│                                         │    ┌────────────┐    │ │
│                                         │    │  SQLite    │    │ │
│                                         │    │ (local DB) │    │ │
│                                         │    └────────────┘    │ │
│                                         └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Components

| Layer      | Role |
|-----------|------|
| **Frontend** | React SPA: auth, vehicle list, service records, alerts, and export (e.g. PDF/CSV). Calls backend over HTTP. |
| **Backend**  | Node (TypeScript) server: REST (or similar) API for CRUD and business logic (e.g. “services due soon”, alerts). |
| **Database** | SQLite: single file, no separate DB process. Persists users, vehicles, service types, records, and alerts. |

---

## Technology Stack

| Concern        | Choice | Notes |
|----------------|--------|--------|
| Backend runtime | Node.js | Single language with frontend tooling; good fit for local dev server. |
| Backend language | TypeScript | Typed API and DB models; aligns with React/TS frontend. |
| API layer | Node `http` (current) | **Planned:** adopt a framework (e.g. Express/Fastify) for routing and middleware. |
| ORM / DB access | **Planned:** Sequelize | **Current:** raw `sqlite3`. Sequelize for models, migrations, and SQLite dialect. |
| Database | SQLite | File-based, no setup; suitable for local and single-user. |
| Frontend | React | Component-based UI; **Planned** per README/HLD. |
| Auth / secrets | JWT + `SECRET_KEY` | Secret from `.env` (e.g. `openssl rand -hex 32`), read via `process.env`; not committed. JWT issued/validated with this secret. Frontend stores token in client session storage; 2h default expiry, 2-day expiry with "Remember me". |

---

## Data Model (Conceptual)

Core entities and relationships:

- **Users** — account and auth (e.g. login).
- **Vehicles** — owned by a user; optional link to **Makes** / **Models** (e.g. for display or VIN-derived data if added later).
- **Services** — supported service types (oil change, cabin filter, tires, brakes, fluids, spark plugs, battery, wipers, etc.).
- **Service Records** — individual service records per vehicle (what was done, when, optional metadata).
- **Alerts** — when a service is due or overdue; derived from intervals and last service date.

Details and table-level design are in [documentation/HLD.md](documentation/HLD.md).

---

## Request Flow

1. User interacts with the React UI (e.g. “Add service”, “Show vehicles”).
2. Frontend sends HTTP requests to the backend (e.g. `POST /vehicles/:id/services`, `GET /vehicles`).
3. Backend validates the request, applies business rules, and uses the ORM/DB layer to read/write SQLite.
4. Backend returns JSON; frontend updates the UI and/or triggers alerts/export.

Protected routes require a valid JWT in the request (e.g. `Authorization: Bearer <token>`); the token is generated on login and stored in client session storage (see [documentation/API.md](documentation/API.md) and [documentation/HLD.md](documentation/HLD.md)).

---

## Design Decisions

- **Local-first** — Backend and DB run on the same machine as the client; no cloud dependency for the initial product. Enables simple setup and data locality.
- **SQLite** — Single file, no separate server; easy backup (copy file) and portability. Fits single-user and low concurrency.
- **Sequelize (planned)** — ORM for consistent models, migrations, and SQLite support without writing raw SQL in application code.
- **React + Node/TypeScript** — Shared types and tooling; good ecosystem for a small team and future cloud deployment (see HLD for Lambda/RDS or DynamoDB options).

---

## Future Directions (Summary)

- **Cloud deployment** — e.g. API behind API Gateway + Lambda, auth via Cognito, DB on RDS or DynamoDB. See [documentation/HLD.md](documentation/HLD.md) for options and tradeoffs.
- **Export** — PDF/CSV (and other formats) for a vehicle’s service history, generated by backend or frontend.
- **Notifications** — Alerts when a service window is nearing or passed; implementation (in-app, email, etc.) TBD.

---

## Document Map

| Document | Purpose |
|----------|---------|
| **DESIGN.md** (this file) | High-level architecture, components, and tech stack. |
| [documentation/HLD.md](documentation/HLD.md) | Problem statement, requirements, assumptions, DB tables, alternatives, enhancements. |
| [documentation/API.md](documentation/API.md) | API contracts and endpoint specifications. |
| [README.md](README.md) | Project overview, service types, and local dev pointer (`documentation/DEV_SETUP.md`). |
