## 2025-05-15 - Mass Assignment in Drizzle-Zod Schemas
**Vulnerability:** Default `createInsertSchema` from `drizzle-zod` includes all database columns, including sensitive flags like `isVerified`.
**Learning:** Public API schemas should be explicitly derived or restricted from internal/database schemas to prevent users from modifying restricted fields.
**Prevention:** Use `.omit()` or define separate public schemas for external inputs. Always verify that sensitive fields are not present in public-facing Zod schemas.
