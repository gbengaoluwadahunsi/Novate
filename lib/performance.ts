// Performance monitoring and optimization utilities


// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start timing an operation
  startTiming(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      this.metrics.set(name, performance.now())
    }
  }

  // End timing and log the result
  endTiming(name: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = this.metrics.get(name)
      if (startTime) {
        const duration = performance.now() - startTime
    
        this.metrics.delete(name)
        return duration
      }
    }
    return 0
  }

  // Measure Core Web Vitals
  measureWebVitals(): void {
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
    
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          if (entry.processingStart) {
        
          }
        })
      }).observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let clsValue = 0
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value
          }
        })
    
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }
}

// Lazy loading utilities
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc)
}

// Hook for lazy loading on visibility
export const useIntersectionObserver = (callback: () => void, options?: IntersectionObserverInit) => {
  const ref = React.useRef<HTMLElement>(null)
  
  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback()
          observer.disconnect()
        }
      },
      { threshold: 0.1, ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [callback])

  return ref
}

// Hook for lazy loading images
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '')
  const [isLoaded, setIsLoaded] = React.useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const image = new window.Image()
          image.onload = () => {
            setImageSrc(src)
            setIsLoaded(true)
          }
          image.src = src
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(img)
    return () => observer.disconnect()
  }, [src])

  return { imageSrc, isLoaded, imgRef }
}

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

// Memory optimization utilities
export const memory = {
  // Cleanup function for component unmount
  cleanup: (cleanupFunctions: (() => void)[]) => {
    React.useEffect(() => {
      return () => {
        cleanupFunctions.forEach(fn => fn())
      }
    }, [])
  },

  // Memoize expensive calculations
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map()
    
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args)
      if (cache.has(key)) {
        return cache.get(key)
      }
      
      const result = fn(...args)
      cache.set(key, result)
      return result
    }) as T
  }
}

// Bundle size optimization
export const bundle = {
  // Dynamic import with error handling
  dynamicImport: async <T>(importFunc: () => Promise<T>): Promise<T | null> => {
    try {
      const module = await importFunc()
      return module
    } catch (error) {
  
      return null
    }
  },

  // Preload critical resources
  preload: (resources: string[]) => {
    if (typeof window !== 'undefined') {
      resources.forEach(resource => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource
        link.as = resource.endsWith('.js') ? 'script' : 
                   resource.endsWith('.css') ? 'style' : 'fetch'
        document.head.appendChild(link)
      })
    }
  }
}

// React imports for the lazy utilities
import React from 'react'

// Initialize performance monitoring
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    const monitor = PerformanceMonitor.getInstance()
    monitor.measureWebVitals()
    
    // Report to analytics (optional)
    window.addEventListener('beforeunload', () => {
      // Send performance data to analytics
  
    })
  }
} 