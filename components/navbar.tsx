"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Logo } from "@/components/ui/logo"
import { Menu, X } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { clearAuth } from "@/store/features/authSlice"
import { useToast } from "@/hooks/use-toast"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    dispatch(clearAuth())
    toast({
      title: "Logout Successful",
      description: "You have been logged out successfully.",
    })
  }

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-white/80 shadow-md backdrop-blur-lg dark:bg-gray-900/80" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo 
              width={160} 
              height={160}
              className="rounded-full"
              alt="NovateScribe Logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Features", "How It Works"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-gray-700 dark:text-gray-200 hover:text-[#2563eb] dark:hover:text-[#2563eb] font-medium"
              >
                {item}
              </Link>
            ))}
            {/* Show Pricing only for authenticated users */}
            {isAuthenticated && (
              <Link
                href="/pricing"
                className="text-gray-700 dark:text-gray-200 hover:text-[#2563eb] dark:hover:text-[#2563eb] font-medium"
              >
                Pricing
              </Link>
            )}
            {/* Show Dashboard next to Pricing for authenticated users */}
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-gray-700 dark:text-gray-200 hover:text-[#2563eb] dark:hover:text-[#2563eb] font-medium"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading && !isAuthenticated && (
              <div className="h-8 w-36 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
            )}
            {isAuthenticated && (
              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-medium">
                Sign Out
              </Button>
            )}
            {!isAuthenticated && !isLoading && (
              <>
                <Button variant="ghost" className="font-medium hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 py-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg"
          >
            <nav className="flex flex-col space-y-2">
              {["Features", "How It Works"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              {/* Show Pricing only for authenticated users - Mobile */}
              {isAuthenticated && (
                <Link
                  href="/pricing"
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              )}
              {/* Show Dashboard next to Pricing for authenticated users - Mobile */}
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 gap-2 px-4">
                {isLoading && !isAuthenticated && (
                  <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
                )}
                {isAuthenticated && (
                  <Button onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white">
                    Sign Out
                  </Button>
                )}
                {!isAuthenticated && !isLoading && (
                  <>
                    <Button variant="outline" className="w-full hover:bg-gray-100 dark:hover:bg-gray-800" asChild>
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white" asChild>
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}
