/**
 * useDebounce — delays updating the returned value until `delay` ms
 * have elapsed without the input value changing.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(inputValue, 400);
 *
 * @param {*}      value  The value to debounce (any type)
 * @param {number} delay  Milliseconds to wait before updating (default: 400)
 * @returns {*}   The debounced value — lags behind `value` by up to `delay` ms
 */
import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Cancel the pending update if value changes before the delay expires.
    // This is what makes it a debounce rather than a throttle.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
