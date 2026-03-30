## 2025-05-15 - Broken Access Control and Mass Assignment in Creator Creation
**Vulnerability:** The `/api/creators` endpoint was unauthenticated and trusted the `firebaseUid` and `isVerified` status provided in the request body.
**Learning:** Drizzle-Zod's `createInsertSchema` includes all database columns by default, which can lead to mass assignment if not carefully filtered. Additionally, client-side data like UIDs should never be trusted when a verifiable identity token is available.
**Prevention:** Use separate Zod schemas for public API input and internal operations. Always verify identity tokens (e.g., Firebase ID tokens) on the server and source sensitive fields like UIDs directly from the verified token. Ensure error handlers return generic messages to avoid information leakage.

## 2025-05-16 - Inconsistent Authentication and Information Leakage in API Endpoints
**Vulnerability:** Several sensitive endpoints (e.g., `/api/upload`) were missing authentication checks. Other endpoints had redundant and inconsistent authentication logic. Error handlers leaked internal details through SDK-specific error messages.
**Learning:** Redundant authentication logic across multiple routes increases the attack surface and leads to inconsistencies. Trusting client-side logic for sensitive operations like file uploads without server-side verification is a major security risk.
**Prevention:** Centralize authentication logic in a reusable middleware (`verifyAuth`). Apply this middleware to all sensitive endpoints to ensure consistent protection. Standardize error responses to return generic messages, preventing information leakage about the server's internal state or used technologies.

## 2025-05-17 - Unauthenticated and Unauthorized WebSocket Signaling
**Vulnerability:** The WebSocket signaling server allowed any client to join any room and send signaling messages (offers, answers, ICE candidates) without authentication or authorization.
**Learning:** WebSocket connections often bypass standard HTTP middleware for individual messages. Security must be implemented explicitly within the message handlers. Zod's discriminated unions provide a robust way to validate complex, multi-type message structures.
**Prevention:** Require an authentication token (e.g., Firebase ID token) in the initial "joinRoom" message. Validate this token and verify the user's authorization for the specific room against the database. Track authorized room memberships on the server to prevent spoofing in subsequent signaling messages.
