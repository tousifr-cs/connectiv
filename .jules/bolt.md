## 2025-05-15 - [Search Debouncing]
**Learning:** The `Creators` page was triggering a full API fetch on every keystroke. In a data-driven application, this leads to significant server load and potential UI lag due to rapid re-renders of large lists.
**Action:** Always implement debouncing for search inputs that trigger network requests. A 300ms delay is usually a good balance between responsiveness and efficiency.
