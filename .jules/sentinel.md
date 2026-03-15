## 2025-05-15 - Mass Assignment Vulnerability in Creator Registration
**Vulnerability:** The public `POST /api/creators` endpoint accepted an object that was parsed directly with a Zod schema derived from the full database table, allowing users to self-verify their profiles by sending `isVerified: true` in the request body.
**Learning:** Using `createInsertSchema` from `drizzle-zod` without careful field omission can expose sensitive internal or administrative fields to public endpoints.
**Prevention:** Always maintain separate Zod schemas for public API input and internal database operations. Use `.omit()` or `.pick()` to explicitly define which fields are allowed in public requests, and always set sensitive defaults in the route handler.
