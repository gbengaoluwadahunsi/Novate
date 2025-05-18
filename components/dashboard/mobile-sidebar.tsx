"use client"

import Link from "next/link"
import { FileText, Home, Mic, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

// Simplified route structure with only core features
const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Transcribe",
    icon: Mic,
    href: "/dashboard/transcribe",
    color: "text-sky-500",
  },
  {
    label: "My Notes",
    icon: FileText,
    href: "/dashboard/notes",
    color: "text-sky-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
]

export default function MobileSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex h-full flex-col bg-white dark:bg-gray-950">
          <div className="p-6 flex items-center justify-between border-b">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 bg-sky-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-bold">Novate</span>
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-3">
            {routes.map((route) => (
              <div key={route.href} className="mb-1">
                <Link
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === route.href
                      ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  {route.icon && <route.icon className={cn("h-4 w-4", route.color)} />}
                  <span>{route.label}</span>
                </Link>
              </div>
            ))}
          </ScrollArea>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/doctor-profile-avatar.png" alt="Dr. Sarah Johnson" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <p className="text-sm font-medium">Dr. Sarah Johnson</p>
                <p className="text-xs text-muted-foreground">General Medicine</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
