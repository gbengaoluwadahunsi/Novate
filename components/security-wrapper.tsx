'use client'

import { useEffect } from 'react'
import { disableDebugging } from '@/lib/security'

export function SecurityWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply security measures in production
    disableDebugging()
  }, [])

  return <>{children}</>
} 