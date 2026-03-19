## 2025-05-14 - Mass Assignment Protection with Drizzle-Zod
**Vulnerability:** Mass Assignment (Overposting) allows users to set sensitive database fields (like `isVerified`) by including them in the API request body.
**Learning:** `createInsertSchema` from `drizzle-zod` includes all table columns by default. If this schema is used directly for API validation, any column in the database can be modified by the client.
**Prevention:** Always create a separate public-facing Zod schema that explicitly omits sensitive fields using `.omit()`. Use an internal schema for database operations and a restricted schema for public API endpoints.
