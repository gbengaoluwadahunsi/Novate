"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import MobileSidebar from "@/components/dashboard/mobile-sidebar"
import { NotesProvider } from "@/contexts/notes-context"

export default function DashboardLayout({ children }) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <NotesProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar className="hidden lg:block" />
        <div className="flex-1">
          <div className="border-b">
            <div className="flex h-16 items-center px-4">
              <MobileSidebar />
              <div className="ml-auto flex items-center space-x-4"></div>
            </div>
          </div>
          <main>{children}</main>
        </div>
      </div>
    </NotesProvider>
  )
}
