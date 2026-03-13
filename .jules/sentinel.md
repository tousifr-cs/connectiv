## 2025-05-14 - Mass Assignment vulnerability in Creator creation
**Vulnerability:** Mass Assignment
**Learning:** The `insertCreatorSchema` was directly derived from the Drizzle schema and included the `isVerified` field, which was then used in the public POST `/api/creators` route. This allowed any user to set their `isVerified` status to `true` during creation.
**Prevention:** Always separate public API schemas from internal database schemas. Use Zod's `.omit()` or `.pick()` to explicitly define which fields are allowed in public requests.
