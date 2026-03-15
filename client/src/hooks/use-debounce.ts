import { useEffect, useState } from "react";

/**
 * ⚡ Bolt Optimization: useDebounce hook
 * Delays updating a value until a specified timeout has passed.
 * Prevents expensive operations (like API calls) from triggering on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
