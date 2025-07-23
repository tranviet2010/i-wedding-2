/**
 * SSR-safe storage utilities
 * These functions safely handle localStorage and sessionStorage in both server and client environments
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Safe sessionStorage wrapper
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null
    try {
      return sessionStorage.getItem(key)
    } catch (error) {
      console.warn('SessionStorage getItem failed:', error)
      return null
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return
    try {
      sessionStorage.setItem(key, value)
    } catch (error) {
      console.warn('SessionStorage setItem failed:', error)
    }
  },
  
  removeItem: (key: string): void => {
    if (!isBrowser) return
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.warn('SessionStorage removeItem failed:', error)
    }
  }
}

// Safe localStorage wrapper
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('LocalStorage getItem failed:', error)
      return null
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('LocalStorage setItem failed:', error)
    }
  },
  
  removeItem: (key: string): void => {
    if (!isBrowser) return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('LocalStorage removeItem failed:', error)
    }
  }
}

// Utility to check if storage is available
export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  if (!isBrowser) return false
  
  try {
    const storage = window[type]
    const testKey = '__storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}
