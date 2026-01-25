# QuikFixx High-Level Architecture Strategy & Real-Time Logic

## 1. High-Level Architecture Strategy: Delivering the "10-Minute" Promise

To achieve a 10-20 minute service delivery time, the architecture must minimize latency in three key areas: **Provider Discovery**, **Dispatching**, and **Travel Time**.

### 1.1 The Dispatch Engine
The core is an event-driven **Dispatch Engine** that operates on a "Hyper-Local" basis.
*   **Geospatial Sharding:** The world is divided into geohashes or H3 cells. Active providers are indexed in **Redis** (using `GEOADD`) for O(1) retrieval speed, separate from the persistent PostgreSQL `providers` table.
*   **State Management:**
    *   **PostgreSQL (PostGIS):** "Source of Truth" for user profiles, order history, and logging.
    *   **Redis:** "Hot State" for driver locations (TTL 60s), online status, and active session locks.
*   **The "Broadcast" Mechanism:**
    *   Instead of a sequential round-robin (which takes too long), we use a **Batched Broadcast** approach.
    *   When a request comes in, the engine immediately identifies the *k* nearest providers (e.g., top 10 within 3km).
    *   The request is pushed to these providers simultaneously via **WebSockets**.
    *   **Concurrency Control:** Uses Redis distributed locks (Redlock) to ensure a job is assigned to only *one* provider (the first to accept), handling race conditions gracefully.

### 1.2 Tech Stack Rationale
*   **NestJS (Node.js):** selected for its modular architecture and excellent support for WebSockets (Socket.io) and Microservices patterns.
*   **PostgreSQL + PostGIS:** Industry standard for geospatial interactions (`ST_DWithin`, `ST_Distance`).
*   **Redis:** Essential for high-frequency location updates (1 update every 5-10 seconds per driver) which would overwhelm a traditional DB.

---

## 3. Real-Time Logic: The Matching Algorithm

### Logic Flow

**Scenario:** Customer requests an Electrician at `[CustLat, CustLng]`.

**Algorithm Steps:**
1.  **Ingestion:** API Gateway receives `POST /book-service`. Validates specific service type (e.g., `electrician`).
2.  **Sector Query (Redis):**
    *   The `MatchingService` queries Redis `GEORADIUS` for key `providers:electrician`.
    *   *Constraint:* Radius = 3km. Count = 20.
3.  **Filtration (In-Memory):**
    *   Filter results by `status == 'available'`.
    *   (Optional) Call OSRM/Google Routes API to calculate actual driving ETA if straight-line distance is insufficient, though straight-line is usually fast enough for initial broadcast.
4.  **Prioritization:**
    *   Sort candidates by `Distance`.
5.  **Broadcast (Socket.io):**
    *   Send `NEW_JOB_ALERT` event to the `provider_{id}` socket rooms of the top candidates.
    *   Payload: `{ orderId, serviceType, distance, estimatedEarnings }`.
6.  **Acceptance (Race Condition Handling):**
    *   First provider to hit `POST /accept-job` triggers a Lua script in Redis.
    *   **Lua Script:** Checks if `order_status` is still `PENDING`. If yes, sets to `ACCEPTED` and assigns `provider_id`. Returns `SUCCESS`.
    *   If `order_status` was already `ACCEPTED`, return `JOB_TAKEN` error to the slow provider.

### Pseudocode (Matching Service)

```typescript
function findAndDispatch(order) {
    const { lat, lng, serviceTag } = order;
    const RADIUS_KM = 3;

    // 1. Fast geospatial lookup in Redis
    // Key format: "providers:{serviceTag}" (e.g., providers:electrician)
    // Returns list of [providerId, distance]
    const candidates = redis.geoRadius(
        `providers:${serviceTag}`,
        lng, lat,
        RADIUS_KM, 'km',
        'WITHDIST', 'ASC'
    );

    if (candidates.isEmpty()) {
        return expandSearchRadius(order); // Fallback logic
    }

    // 2. Filter for online status (using MGET for speed)
    const providerIds = candidates.map(c => c.member);
    const statuses = redis.mget(providerIds.map(id => `provider:${id}:status`));

    const validProviders = candidates.filter((_, idx) => statuses[idx] === 'ONLINE');

    // 3. Broadcast Job
    validProviders.forEach(provider => {
        socketServer.to(`room_provider_${provider.id}`).emit('JOB_OFFER', {
            orderId: order.id,
            location: { lat, lng },
            expiry: '30s' // Offer valid for 30s
        });
    });

    // 4. Set TTL for the order in Redis to handle "No Acceptance" timeout
    redis.set(`order:${order.id}:pending`, 'true', 'EX', 30);
}
```
