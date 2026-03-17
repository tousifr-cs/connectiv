## 2025-05-22 - Search Debouncing and Filter Memoization
**Learning:** In a search-heavy interface, updating state on every keystroke triggers expensive operations: redundant API calls and re-filtering of data. Debouncing the search term and memoizing the filter logic drastically reduces both network and CPU overhead.
**Action:** Always debounce search inputs that trigger API calls and memoize derived data like filtered lists to keep the UI responsive during rapid input.
