"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector } from "@/store/hooks"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  const { isAuthenticated, isLoading, user, authCheckCompleted } = useAppSelector((state) => state.auth)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Store the current path for redirect after login
    if (!isAuthenticated && !isLoading && authCheckCompleted && mounted) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', pathname)
      }
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, authCheckCompleted, router, pathname, mounted])

  useEffect(() => {
    // Check role-based access
    if (isAuthenticated && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/dashboard") // Redirect to dashboard if user doesn't have required role
    }
  }, [isAuthenticated, user, allowedRoles, router])

  // Show a loading spinner while authentication verification is in progress or not mounted
  if (isLoading || !authCheckCompleted || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If authenticated and has required role (or no role required), render the children
  if (isAuthenticated && (!allowedRoles || (user && allowedRoles.includes(user.role)))) {
    return <>{children}</>
  }

  // Otherwise, render nothing to prevent flicker during redirect
  return null
} 