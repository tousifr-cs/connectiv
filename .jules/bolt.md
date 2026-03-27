# Bolt's Performance Journal

## 2025-05-15 - [Optimize Search and List Performance]
**Learning:** Checking invariant conditions like 'All' category filter outside of the `filter` loop and pre-processing transformations like `toLowerCase()` can significantly reduce redundant operations during list filtering. Additionally, debouncing search inputs is critical for reducing both frontend re-renders and backend API pressure.
**Action:** Always extract invariant logic from loops and use `useDebounce` for all real-time search inputs.

## 2025-05-16 - [O(1) WebSocket Client Cleanup]
**Learning:** For WebSocket signaling servers, maintaining a reverse mapping of client connections to the resources they are associated with (e.g., rooms) allows for O(1) cleanup. The original implementation iterated through all active rooms O(Rooms) on every disconnection, which becomes a major bottleneck as the application scales.
**Action:** Use Map-based reverse indexing to optimize resource cleanup for persistent connections.
