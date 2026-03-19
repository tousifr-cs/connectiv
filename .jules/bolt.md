## 2025-05-15 - Optimized List Filtering Pattern
**Learning:** Invariant transformations like `.toLowerCase()` inside a `.filter()` loop cause redundant work for every item in the list. Moving these outside the loop improves O(n) performance.
**Action:** Always extract invariant logic (like search terms or category names) before starting a filter or map operation.

## 2025-05-15 - Debouncing Search to Reduce API Thrashing
**Learning:** Without debouncing, every keystroke in a search input triggers a new API request, leading to unnecessary server load and potential race conditions in the UI.
**Action:** Implement a `useDebounce` hook for all search inputs that trigger network requests or expensive local computations.
