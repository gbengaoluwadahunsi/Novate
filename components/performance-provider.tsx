"use client"

import { createContext, useContext, ReactNode } from "react"

interface PerformanceContextType {
  startTiming: (key: string) => void
  endTiming: (key: string) => void
  measure: (name: string, fn: () => void) => void
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const startTiming = (key: string) => {
    if (typeof window !== "undefined") {
      performance.mark(`${key}-start`)
    }
  }

  const endTiming = (key: string) => {
    if (typeof window !== "undefined") {
      performance.mark(`${key}-end`)
      performance.measure(key, `${key}-start`, `${key}-end`)
    }
  }

  const measure = (name: string, fn: () => void) => {
    startTiming(name)
    fn()
    endTiming(name)
  }

  return (
    <PerformanceContext.Provider value={{ startTiming, endTiming, measure }}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error("usePerformance must be used within a PerformanceProvider")
  }
  return context
} 