## 2025-05-15 - [Mass Assignment Prevention via Schema Separation]
**Vulnerability:** Mass Assignment on the creator creation endpoint allowed users to set the `isVerified` status of their profiles.
**Learning:** Over-exposing Drizzle-inferred schemas directly to the public API without explicitly omitting internal fields can lead to unauthorized state changes.
**Prevention:** Maintain separate schemas for public API input and internal database operations. Use Zod's `.omit()` or `.pick()` to strictly define public-facing contracts.
