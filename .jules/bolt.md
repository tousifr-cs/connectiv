# Bolt's Performance Journal

## 2025-05-15 - [Optimize Search and List Performance]
**Learning:** Checking invariant conditions like 'All' category filter outside of the `filter` loop and pre-processing transformations like `toLowerCase()` can significantly reduce redundant operations during list filtering. Additionally, debouncing search inputs is critical for reducing both frontend re-renders and backend API pressure.
**Action:** Always extract invariant logic from loops and use `useDebounce` for all real-time search inputs.

## 2025-05-16 - [O(1) WebSocket Client Cleanup]
**Learning:** For WebSocket signaling servers, maintaining a reverse mapping of client connections to the resources they are associated with (e.g., rooms) allows for O(1) cleanup. The original implementation iterated through all active rooms O(Rooms) on every disconnection, which becomes a major bottleneck as the application scales.
**Action:** Use Map-based reverse indexing to optimize resource cleanup for persistent connections.

## 2025-05-17 - [Drizzle .where() Overwrite & SQL Aggregation]
**Learning:** In Drizzle ORM, consecutive `.where()` calls overwrite each other. To combine filters, they must be gathered and passed to `and()`. Additionally, fetching entire record sets for simple statistics like earnings is a major bottleneck; using SQL `sum()`, `count()`, and `groupBy()` moves the computation to the database and reduces network/memory overhead from O(N) to O(1). Note: `sum()` returns a string in Drizzle/Postgres to prevent precision loss.
**Action:** Always combine filters using `and()` for complex queries and prioritize SQL-level aggregation for statistical calculations.
