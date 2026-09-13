import { useEffect, useState } from "react"

/**
 * Returns `value` after it has stayed unchanged for `delay` ms.
 * Use for search inputs: bind the input to the live value, pass the
 * debounced value into API queries.
 */
export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      window.clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
