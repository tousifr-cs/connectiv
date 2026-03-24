# Bolt's Performance Journal

## 2025-05-15 - [Optimize Search and List Performance]
**Learning:** Checking invariant conditions like 'All' category filter outside of the `filter` loop and pre-processing transformations like `toLowerCase()` can significantly reduce redundant operations during list filtering. Additionally, debouncing search inputs is critical for reducing both frontend re-renders and backend API pressure.
**Action:** Always extract invariant logic from loops and use `useDebounce` for all real-time search inputs.
