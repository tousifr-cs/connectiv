## 2025-05-14 - [Drizzle ORM Filter Overwriting]
**Learning:** In Drizzle ORM, successive `.where()` calls on a query object do not append conditions; they overwrite the previous one. This can lead to silent logic bugs where filters (e.g., search + category) are not applied simultaneously.
**Action:** Always use `and()` or `or()` logical operators to combine multiple conditions into a single `.where()` call, or collect conditions in an array and use `and(...conditions)`.

## 2025-05-14 - [Search Input Performance]
**Learning:** The application's search inputs triggered an API call on every keystroke, which is inefficient for both the client and the backend database.
**Action:** Use the `useDebounce` hook (added to `client/src/hooks/use-debounce.ts`) for all search or filter inputs that trigger network requests.
