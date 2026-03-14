## 2025-05-22 - [Mass Assignment and Query Overwriting]
**Vulnerability:** Potential Mass Assignment in creator creation (isVerified could be set by client) and filter overwriting in Drizzle queries.
**Learning:** Drizzle `.where()` calls overwrite previous ones unless combined with `and()` or `or()`. Using separate Zod schemas for public vs internal operations is an effective pattern to prevent mass assignment.
**Prevention:** Always combine multiple query filters using `and()`. Use the `.omit()` pattern in Zod to create restricted public schemas from comprehensive internal ones.
