# QuikFixx API Structure (MVP)

This document outlines the critical API endpoints required for the Minimum Viable Product (MVP), focusing on the "Happy Path" of booking a service.

**Base URL:** `https://api.quikfixx.com/v1`

## 1. Authentication (Common)

*   **`POST /auth/login`**
    *   **Body:** `{ phoneNumber, otp }`
    *   **Response:** `{ accessToken, refreshToken, user: { id, role, ... } }`
    *   **Note:** JWT based stateless authentication.

## 2. Customer Endpoints

*   **`POST /bookings`** (The "Dispatch Trigger")
    *   **Description:** Creates a new service request and triggers the Dispatch Engine.
    *   **Body:**
        ```json
        {
          "serviceType": "electrician",
          "location": { "lat": 12.9716, "lng": 77.5946 },
          "address": "123 MG Road, Bangalore",
          "notes": "Fuse box sparking"
        }
        ```
    *   **Response:** `201 Created` -> `{ orderId, status: "PENDING", estimatedPrice: 500 }`

*   **`GET /bookings/{id}`**
    *   **Description:** Polling endpoint for order status (complementary to Socket logic).
    *   **Response:** `{ id, status, providerId, providerLocation, eta }`

*   **`POST /bookings/{id}/cancel`**
    *   **Description:** Cancels the search or the active job.

## 3. Provider Endpoints

*   **`PATCH /providers/me/location`** (High Frequency)
    *   **Description:** Updates the provider's geospatial location.
    *   **Body:** `{ lat, lng, bearing, speed }`
    *   **Response:** `200 OK` (Minimal payload for latency)
    *   **Implementation Note:** This endpoint essentially calls `Redis.geoadd` and pushes to the active order's tracking channel if on a job.

*   **`POST /providers/me/availability`**
    *   **Description:** Toggles "Online/Offline" status.
    *   **Body:** `{ isOnline: true }`

*   **`POST /bookings/{id}/accept`** (The "Fastest Finger")
    *   **Description:** Provider attempts to accept a broadcasted job.
    *   **Body:** `{ }` (Authentication header identifies provider)
    *   **Response:**
        *   `200 OK`: "Job Assigned"
        *   `409 Conflict`: "Job already taken by another provider"

*   **`PATCH /bookings/{id}/status`**
    *   **Body:** `{ status: "ARRIVED" }` or `{ status: "COMPLETED" }`

## 4. WebSockets (Socket.io) Events

While HTTP handles the state changes, WebSockets handle the *live* component.

*   **Client -> Server:**
    *   `join_room`: `{ roomId: "order_123" }`
    
*   **Server -> Client (Customer):**
    *   `job_accepted`: `{ provider: { name, location, rating } }`
    *   `provider_location_update`: `{ lat, lng }` (Live map movement)

*   **Server -> Client (Provider):**
    *   `new_job_alert`: `{ lat, lng, pay, distance }` (The "Ring" screen)
