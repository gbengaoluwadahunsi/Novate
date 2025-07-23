"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import MobileSidebar from "@/components/dashboard/mobile-sidebar"
import { NotesProvider } from "@/contexts/notes-context"
import ProtectedRoute from "@/components/auth/protected-route"
import { ModeToggle } from "@/components/mode-toggle"

import { PropsWithChildren } from "react"

export default function DashboardLayout({ children }: PropsWithChildren<{}>) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <ProtectedRoute>
      <NotesProvider>
        <div className="flex bg-gray-50 dark:bg-gray-900">
          <Sidebar className="hidden lg:block w-64 flex-shrink-0" />
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="flex h-16 items-center px-4 sm:px-6">
                <MobileSidebar />
                <div className="ml-auto flex items-center space-x-3 sm:space-x-4">
                  <ModeToggle />
                </div>
              </div>
            </div>
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </NotesProvider>
    </ProtectedRoute>
  )
}
