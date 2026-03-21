## 2026-03-21 - Fix Mass Assignment in Creator Creation
**Vulnerability:** Mass Assignment allowed users to set the `isVerified` field during creator profile creation.
**Learning:** Drizzle-Zod's `createInsertSchema` includes all database columns by default, including security-sensitive ones like `isVerified`.
**Prevention:** Use separate Zod schemas for public API input and internal operations. Explicitly omit sensitive fields from public-facing schemas.
