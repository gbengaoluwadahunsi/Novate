"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import logo from "@/public/novateLogo-removebg-preview.png"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In a real app, you would send a password reset request to your API
    setIsSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-blue-500 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center ">
              <div className="relative  flex items-center justify-center">
                <Image
                  src={logo}
                  alt="Novate AI Logo"
                  className="h-20 w-20  rounded-full"
                 
                />
               
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Forgot password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
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
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Check your email</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  We've sent a password reset link to <span className="font-medium">{email}</span>
                </p>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-left">
                  <p className="mb-2">
                    <span className="font-medium">Didn't receive the email?</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Check your spam or junk folder</li>
                    <li>Make sure the email address is correct</li>
                    <li>
                      <button className="text-blue-500 hover:text-blue-700 hover:underline">
                        Click here to resend
                      </button>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              Remember your password?{" "}
              <Link href="/login" className="text-blue-500 hover:text-blue-700 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
