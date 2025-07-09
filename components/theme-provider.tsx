"use client"

import * as React from "react"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import type { ThemeProviderProps as NextThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: NextThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <NextThemeProvider {...props}>
      <div suppressHydrationWarning>{children}</div>
    </NextThemeProvider>
  )
}
