"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import logo from "@/public/novateLogo-removebg-preview.png"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { login, clearError } from "@/store/features/authSlice"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth)

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Clear any previous login errors when the component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Handle successful login and redirect
  useEffect(() => {
    if (isAuthenticated && user && mounted) {
      const redirectPath = typeof window !== 'undefined' ? localStorage.getItem('redirectAfterLogin') || '/dashboard' : '/dashboard'
      if (typeof window !== 'undefined') {
        localStorage.removeItem('redirectAfterLogin') // Clean up
      }
      
      // Show welcome toast
      toast({
        title: `Welcome back, ${user.name}!`,
        description: "You have successfully logged in.",
      })

      // Redirect to the appropriate page
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router, toast, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(login({ email, password })).unwrap()
      
      // Store email in localStorage if remember me is checked
      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('rememberedEmail', email)
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem('rememberedEmail')
      }
    } catch (err) {
      // Error is already handled by the auth slice
    }
  }

  // Load remembered email on mount
  useEffect(() => {
    if (!mounted) return
    
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail')
      if (rememberedEmail) {
        setEmail(rememberedEmail)
        setRememberMe(true)
      }
    }
  }, [mounted])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Image 
              src={logo} 
              alt="Novate AI Logo" 
              width={80} 
              height={80} 
              className="rounded-full" 
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-background pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-input bg-background"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <a href="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </a>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="text-primary hover:underline">
              Sign up
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
