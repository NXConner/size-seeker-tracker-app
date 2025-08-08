import { useEffect, useState, useCallback } from 'react'
import { secureStorage } from '@/utils/secureStorage'

export function useSecureStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const stored = await secureStorage.getItem<T>(key)
      if (stored !== null) setValue(stored)
      setError(null)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [key])

  useEffect(() => {
    refresh()
  }, [refresh])

  const set = useCallback(async (next: T) => {
    setValue(next)
    try {
      await secureStorage.setItem(key, next)
    } catch (e) {
      setError(e as Error)
    }
  }, [key])

  return { value, setValue: set, loading, error, refresh }
}