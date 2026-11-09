import { useState, useEffect } from 'react'

/**
 * Custom Hook to debounce any rapidly changing value
 * @param value The value to debounce (e.g. search query input)
 * @param delay Milliseconds to delay updating the returned value
 */
export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce

