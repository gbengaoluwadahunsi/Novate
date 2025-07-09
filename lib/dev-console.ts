// Development console utilities
// This file contains utilities for development debugging

export const devLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEV] ${message}`, data)
  }
}

export const devError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[DEV ERROR] ${message}`, error)
  }
}

export const devWarn = (message: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[DEV WARN] ${message}`, data)
  }
}

export const devGroup = (label: string, fn: () => void) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`[DEV] ${label}`)
    fn()
    console.groupEnd()
  }
} 