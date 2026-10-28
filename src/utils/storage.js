export const STORAGE_KEYS = {
  members: 'messmate_members',
  meals: 'messmate_meals',
  expenses: 'messmate_expenses',
  deposits: 'messmate_deposits',
  settings: 'messmate_settings',
}

export function readStorage(key, fallback) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch (error) {
    console.warn(`[MessMate] Failed to read "${key}" from localStorage:`, error)
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`[MessMate] Failed to write "${key}" to localStorage:`, error)
    return false
  }
}

export function removeStorage(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false
    window.localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`[MessMate] Failed to remove "${key}" from localStorage:`, error)
    return false
  }
}

