## 2024-03-14 - Debounced Search Optimization
**Learning:** Frequent API calls during typing can overwhelm the backend and cause a sluggish frontend experience due to rapid state updates and network congestion.
**Action:** Implement and use a `useDebounce` hook for all search inputs that trigger network requests or expensive computations.
