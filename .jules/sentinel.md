## 2025-05-14 - Mass Assignment in Creator Profiles
**Vulnerability:** The `isVerified` field in the `creators` table was exposed in the public `insertCreatorSchema`, allowing any user to set themselves as a "verified" creator during profile creation.
**Learning:** Using a single Drizzle-Zod generated schema for both public API input and internal database operations can lead to mass assignment if sensitive fields aren't explicitly omitted.
**Prevention:** Always maintain separate Zod schemas for public API inputs (DTOs) and internal database models. Use `omit` to remove administrative or system-controlled fields from public-facing schemas.

## 2025-05-14 - Unvalidated WebSocket Messages
**Vulnerability:** The WebSocket signaling server used `JSON.parse` and manual presence checks without rigorous structure validation, potentially leading to crashes or logic errors if malformed data was sent.
**Learning:** WebSocket handlers often lack the automatic validation middleware typically used in REST APIs (like Express-Zod-Validator), making them a common entry point for unvalidated input.
**Prevention:** Use Zod's `discriminatedUnion` to validate incoming WebSocket message types and their respective payloads at the entry point of the connection's `message` event.
