## 2025-05-15 - Mass Assignment in Creator Creation
**Vulnerability:** A Mass Assignment vulnerability was identified in the creator profile creation flow. The Zod schema used for API validation included the `isVerified` field, allowing any user to verify their own account by sending `"isVerified": true` in their POST request.
**Learning:** Drizzle-Zod's `createInsertSchema` includes all database columns by default. If sensitive fields like `isVerified`, `role`, or `isAdmin` exist in the table, they must be explicitly omitted from the public-facing Zod schemas.
**Prevention:** Use a dual-schema pattern: one `internalInsertSchema` that includes all necessary fields for system operations, and a restricted `publicInsertSchema` (omitting sensitive fields) for user-facing API routes and forms.
