## 2025-05-15 - Broken Access Control and Mass Assignment in Creator Creation
**Vulnerability:** The `/api/creators` endpoint was unauthenticated and trusted the `firebaseUid` and `isVerified` status provided in the request body.
**Learning:** Drizzle-Zod's `createInsertSchema` includes all database columns by default, which can lead to mass assignment if not carefully filtered. Additionally, client-side data like UIDs should never be trusted when a verifiable identity token is available.
**Prevention:** Use separate Zod schemas for public API input and internal operations. Always verify identity tokens (e.g., Firebase ID tokens) on the server and source sensitive fields like UIDs directly from the verified token. Ensure error handlers return generic messages to avoid information leakage.

## 2025-05-20 - Unauthenticated File Upload and Auth Middleware Standardization
**Vulnerability:** The `/api/upload` endpoint was unauthenticated, allowing any user to upload files to the server. Redundant authentication logic across multiple routes led to inconsistent error handling.
**Learning:** Centralizing authentication into an Express middleware ensures consistent security enforcement and simplifies route logic. Authentication should be required for all endpoints that perform write operations or access user-specific data.
**Prevention:** Implement a robust `verifyAuth` middleware and apply it to all sensitive endpoints. Standardize the frontend to always include authentication tokens (e.g., Bearer tokens) for these requests.
