'use client'

import { getStore } from '@/store/store'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import ErrorBoundary from '@/components/error-boundary'
import { useEffect, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { verifyToken, authCheckCompleted, loadTokenFromStorage } from '@/store/features/authSlice'

// Component to initialize authentication state on app startup
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // First load token from storage safely
    dispatch(loadTokenFromStorage())

    // Check if there's a stored token and verify it
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) {
          try {
            // Verify the token with the backend. The slice will handle the status.
            await dispatch(verifyToken()).unwrap()
          } catch (error) {
            // If token verification fails, the slice will set status to unauthenticated
            console.log('Token verification failed on startup:', error)
          }
        }
      }
      // Mark auth check as completed after verification attempt
      dispatch(authCheckCompleted())
    }

    initializeAuth()
  }, [dispatch, mounted])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const store = getStore()
  
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthInitializer>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthInitializer>
      </Provider>
    </ErrorBoundary>
  )
}
