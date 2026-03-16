## 2025-05-15 - Debounced Search and Memoized Filtering
**Learning:** In React applications with search-as-you-type functionality, every keystroke can trigger both a re-render and a network request. This is highly inefficient for both the client and the server.
**Action:** Always debounce search inputs that trigger API calls (300ms is a good default). Additionally, use `useMemo` for derived data like filtered lists to avoid redundant computations on unrelated state changes.
