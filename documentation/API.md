# Service Index API Design

This document defines the initial CRUD API surface for the ServiceIndex backend.  
It focuses on endpoints needed by the frontend to manage **Users**, **Vehicles**, **Service Records**, and **Alerts**.

The following HTTP status codes are used consistently across endpoints:

- **200 OK**: Standard success for read/update/delete operations.
- **201 Created**: Resource successfully created.
- **400 Bad Request**: Invalid or missing request body/query/path parameters.
- **401 Unauthorized**: Authentication failure or user attempting to operate on resources that do not belong to them.
- **404 Not Found**: Resource does not exist (for the given user / identifier).
- **500 Internal Server Error**: Unexpected server-side error.

All responses are JSON unless otherwise specified.

---

## Authentication & Authorization (Overview)

- **Authentication**: JWT-based. The backend issues a signed token on successful login; the frontend sends it on each request (e.g. `Authorization: Bearer <token>`). The token is stored in **client session storage** (session-based by default). Token expiry: **2 hours** normally; **2 days** when the user opts in via a "Remember me" acknowledgement. The signing secret is a single value generated with `openssl rand -hex 32`, stored in a `.env` file under `SECRET_KEY`, read at runtime via `process.env`, and not committed to git.
- **Authorization**: For resources that belong to a user (vehicles, service records, alerts), the backend validates the JWT and ensures the **authenticated user** matches the resource’s owner. If the token is missing, invalid, or expired, or the resource does not belong to the user, return **401 Unauthorized**.

For the examples below, assume the backend derives the current `userId` from the validated JWT payload rather than from the request body.

---

## Users

### Create User

- **Method**: `POST /users`
- **Description**: Create a new user account.
- **Request Body (example)**:

```json
{
  "email": "user@example.com",
  "password": "plaintext-or-hashed-depending-on-impl",
  "name": "Jane Doe"
}
```

- **Responses**:
  - **201 Created**
    - Body: created user (excluding sensitive fields as appropriate)
  - **400 Bad Request**
    - Missing required fields, invalid email format, weak password, etc.
  - **500 Internal Server Error**
    - Database or unexpected error during creation.

### Get Current User

- **Method**: `GET /users/:userId`
- **Description**: Fetch the profile of the authenticated user.
- **Responses**:
  - **200 OK**
    - Body: user profile for the authenticated user.
  - **401 Unauthorized**
    - No valid authentication / token.
  - **500 Internal Server Error**
    - Unexpected failure fetching user data.

---

## Vehicles

> Makes, Models, and Service Items will be populated via database migrations and are not created directly via this API.

### Create Vehicle

- **Method**: `POST /vehicles`
- **Description**: Create a vehicle belonging to the authenticated user.
- **Request Body (example)**:

```json
{
  "nickname": "Family SUV",
  "year": 2020,
  "makeId": "toyota-id",
  "modelId": "rav4-id",
  "vin": "optional-vin-if-stored"
}
```

- **Responses**:
  - **201 Created**
    - Body: created vehicle, including its `id` and association to the authenticated user.
  - **400 Bad Request**
    - Missing required fields, invalid year, invalid make/model id, etc.
  - **401 Unauthorized**
    - Auth failure or attempt to set ownership inconsistently with authenticated user.
  - **500 Internal Server Error**
    - Unexpected DB or server error.

### List Vehicles

- **Method**: `GET /users/:userId/vehicles`
- **Description**: List all vehicles belonging to the authenticated user. (Nested under the user resource so this does not collide with `GET /vehicles/:vehicleId` for a single vehicle.)
- **Responses**:
  - **200 OK**
    - Body: array of vehicles for the authenticated user (empty array if none).
  - **401 Unauthorized**
    - No valid authentication / token.
  - **500 Internal Server Error**
    - Unexpected server failure.

### Get Vehicle by ID

- **Method**: `GET /vehicles/:vehicleId`
- **Description**: Fetch a single vehicle by id for the authenticated user.
- **Responses**:
  - **200 OK**
    - Body: vehicle data.
  - **401 Unauthorized**
    - Auth failure or vehicle does not belong to the authenticated user.
  - **404 Not Found**
    - No vehicle with the given `vehicleId` for this user.
  - **500 Internal Server Error**
    - Unexpected server error.

### Update Vehicle

- **Method**: `PUT /vehicles/:vehicleId`
- **Description**: Update attributes of a vehicle (e.g. nickname, year, associated model).
- **Request Body**: Partial or full vehicle payload (implementation-specific).
- **Responses**:
  - **200 OK**
    - Body: updated vehicle.
  - **400 Bad Request**
    - Invalid fields or payload.
  - **401 Unauthorized**
    - Vehicle does not belong to the authenticated user.
  - **404 Not Found**
    - Vehicle `vehicleId` not found for this user.
  - **500 Internal Server Error**
    - Unexpected error updating the resource.

### Delete Vehicle

- **Method**: `DELETE /vehicles/:vehicleId`
- **Description**: Delete a vehicle and cascade delete its service records and alerts.
- **Responses**:
  - **200 OK**
    - Body: No body returned.
  - **401 Unauthorized**
    - Vehicle does not belong to the authenticated user.
  - **404 Not Found**
    - Vehicle `vehicleId` not found for this user.
  - **500 Internal Server Error**
    - Unexpected error deleting the resource.

---

## Service Records

Service records are always scoped to a vehicle that belongs to the authenticated user.

### Create Service Record

- **Method**: `POST /vehicles/:vehicleId/services`
- **Description**: Create a service record for a specific vehicle.
- **Request Body (example)**:

```json
{
  "serviceItemId": "oil-change-id",
  "performedAt": "2025-02-01",
  "odometer": 45000,
  "notes": "Used synthetic oil"
}
```

- **Responses**:
  - **201 Created**
    - Body: created service record.
  - **400 Bad Request**
    - Missing or invalid fields (e.g. bad date format, negative odometer).
  - **401 Unauthorized**
    - Vehicle does not belong to the authenticated user.
  - **404 Not Found**
    - Vehicle not found for this user, or the `serviceItemId` does not exist.
  - **500 Internal Server Error**
    - Unexpected server error.

### List Service Records for a Vehicle

- **Method**: `GET /vehicles/:vehicleId/services`
- **Description**: List all service records for a given vehicle belonging to the user. There shouldn't be more than 100's service records, but API will be paginated to cover the possibility.
- **Query (optional)**: `limit` (default 50, max 100), `offset` (default 0). Invalid values return **400**.
- **Responses**:
  - **200 OK**
    - Body: array of service records for the vehicle.
  - **401 Unauthorized**
    - Vehicle does not belong to the authenticated user.
  - **404 Not Found**
    - Vehicle not found for this user.
  - **500 Internal Server Error**
    - Unexpected error.

### Get Service Record by ID

- **Method**: `GET /vehicles/:vehicleId/services/:serviceRecordId`
- **Description**: Fetch a single service record for a vehicle.
- **Responses**:
  - **200 OK**
    - Body: service record.
  - **401 Unauthorized**
    - Vehicle or record does not belong to the authenticated user.
  - **404 Not Found**
    - Service record not found for this vehicle/user.
  - **500 Internal Server Error**
    - Unexpected error.

### Update Service Record

- **Method**: `PUT /vehicles/:vehicleId/services/:serviceRecordId`
- **Description**: Update an existing service record (e.g. correcting mileage or notes).
- **Request Body**: Partial or full service record payload.
- **Responses**:
  - **200 OK**
    - Body: updated service record.
  - **400 Bad Request**
    - Invalid data.
  - **401 Unauthorized**
    - Vehicle or record does not belong to the authenticated user.
  - **404 Not Found**
    - Record not found for this vehicle/user.
  - **500 Internal Server Error**
    - Unexpected failure.

### Delete Service Record

- **Method**: `DELETE /vehicles/:vehicleId/services/:serviceRecordId`
- **Description**: Delete a specific service record.
- **Responses**:
  - **200 OK**
    - Body: optional confirmation or deleted record.
  - **401 Unauthorized**
    - Vehicle or record does not belong to the authenticated user.
  - **404 Not Found**
    - Record not found for this vehicle/user.
  - **500 Internal Server Error**
    - Unexpected error.

---

## Alerts

Alerts indicate upcoming or overdue services for a user’s vehicles.

### Create Alert

- **Method**: `POST /alerts`
- **Description**: Create an alert for a specific vehicle/service combination (or allow backend to compute based on last service and interval). This API is surfaced to allow users to create their own alerts as needed.
- **Request Body (example)**:

```json
{
  "vehicleId": "vehicle-id",
  "serviceItemId": "oil-change-id",
  "dueDate": "2025-08-01",
  "status": "PENDING"
}
```

- **Responses**:
  - **201 Created**
    - Body: created alert.
  - **400 Bad Request**
    - Missing or invalid fields.
  - **401 Unauthorized**
    - Vehicle does not belong to the authenticated user.
  - **404 Not Found**
    - Vehicle or `serviceItemId` not found.
  - **500 Internal Server Error**
    - Unexpected server error.

### List Alerts

- **Method**: `GET /alerts`
- **Description**: List all alerts for the authenticated user (optionally filter by status, vehicle, etc.). API will be paginated to cover large volume of alerts per user.
- **Responses**:
  - **200 OK**
    - Body: array of alerts for the user.
  - **401 Unauthorized**
    - No valid authentication.
  - **500 Internal Server Error**
    - Unexpected error.

### Get Alert by ID

- **Method**: `GET /alerts/:alertId`
- **Description**: Fetch a single alert by id.
- **Responses**:
  - **200 OK**
    - Body: alert.
  - **401 Unauthorized**
    - Alert does not belong to the authenticated user.
  - **404 Not Found**
    - Alert not found for this user.
  - **500 Internal Server Error**
    - Unexpected error.

### Update Alert

- **Method**: `PUT /alerts/:alertId`
- **Description**: Update an alert (e.g. mark as dismissed, change due date). Allows user to acknowledge an alert.
- **Request Body**: Partial or full alert payload.
- **Responses**:
  - **200 OK**
    - Body: updated alert.
  - **400 Bad Request**
    - Invalid data.
  - **401 Unauthorized**
    - Alert does not belong to the authenticated user.
  - **404 Not Found**
    - Alert not found for this user.
  - **500 Internal Server Error**
    - Unexpected error.

### Delete Alert

- **Method**: `DELETE /alerts/:alertId`
- **Description**: Delete an alert (e.g. user no longer wants to see it). Potentially not needed, we may want to persist alerts after being acknowledged.
- **Responses**:
  - **200 OK**
    - Body: optional confirmation or deleted alert.
  - **401 Unauthorized**
    - Alert does not belong to the authenticated user.
  - **404 Not Found**
    - Alert not found for this user.
  - **500 Internal Server Error**
    - Unexpected error.

---

## Error Response Shape (Example)

To keep error handling consistent on the frontend, errors can follow a standard structure such as:

```json
{
  "error": {
    "code": 400,
    "type": "BadRequest",
    "message": "Validation failed for field 'email'",
    "details": {
      "field": "email"
    }
  }
}
```

The exact shape can evolve, but status codes should always follow the mappings defined at the top of this document.