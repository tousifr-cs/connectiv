## 2025-05-15 - Broken Access Control and Mass Assignment in Creator Creation
**Vulnerability:** The `/api/creators` endpoint was unauthenticated and trusted the `firebaseUid` and `isVerified` status provided in the request body.
**Learning:** Drizzle-Zod's `createInsertSchema` includes all database columns by default, which can lead to mass assignment if not carefully filtered. Additionally, client-side data like UIDs should never be trusted when a verifiable identity token is available.
**Prevention:** Use separate Zod schemas for public API input and internal operations. Always verify identity tokens (e.g., Firebase ID tokens) on the server and source sensitive fields like UIDs directly from the verified token. Ensure error handlers return generic messages to avoid information leakage.

## 2025-05-16 - Inconsistent Authentication and Information Leakage in API Endpoints
**Vulnerability:** Several sensitive endpoints (e.g., `/api/upload`) were missing authentication checks. Other endpoints had redundant and inconsistent authentication logic. Error handlers leaked internal details through SDK-specific error messages.
**Learning:** Redundant authentication logic across multiple routes increases the attack surface and leads to inconsistencies. Trusting client-side logic for sensitive operations like file uploads without server-side verification is a major security risk.
**Prevention:** Centralize authentication logic in a reusable middleware (`verifyAuth`). Apply this middleware to all sensitive endpoints to ensure consistent protection. Standardize error responses to return generic messages, preventing information leakage about the server's internal state or used technologies.

## 2025-05-17 - Unauthenticated WebSocket Signaling for WebRTC
**Vulnerability:** The WebSocket signaling implementation for WebRTC video calls was completely unauthenticated and unauthorized. Anyone with a `roomId` could join and participate in signaling, and signaling messages could be spoofed across rooms.
**Learning:** WebSocket connections often bypass standard HTTP middleware. Authentication must be explicitly implemented within the WebSocket message handlers. Relying on client-provided IDs for authorization is insufficient; server-side verification against the database is required.
**Prevention:** Always require a verifiable token (like Firebase ID token) for sensitive WebSocket operations. Implement robust authorization checks on the server to ensure users only access resources they are permitted to. Validate that signaling messages originate from and target authorized participants within specific rooms to prevent cross-room interference.
