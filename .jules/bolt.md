## 2025-05-15 - Optimizing Search-Heavy Lists
**Learning:** In applications with real-time search, triggering API calls and re-filtering large lists on every keystroke causes significant UI lag and backend pressure.
**Action:** Always implement a multi-layered optimization strategy: 1) Debounce search inputs (300ms) to batch updates, 2) useMemo to avoid redundant array filtering, and 3) React.memo for list items to skip re-renders when parent state (like the search query) updates.
