"use client"

import Link from "next/link"
import Image from "next/image"
import { FileText, Home, Mic, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { clearAuth } from "@/store/features/authSlice"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useToast } from "@/hooks/use-toast"
import logo from "@/public/novateLogo-removebg-preview2.png"

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
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const handleLogout = () => {
    dispatch(clearAuth())
    setOpen(false)
    toast({
      title: "Logout Successful",
      description: "You have been logged out successfully.",
    })
  }

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
          <div className="p-4 flex items-center border-b">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center">
              <Image 
                src={logo} 
                alt="Novate AI Logo" 
                width={120} 
                height={120} 
                className="rounded-full"
              />
            </Link>
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
            {/* User Profile */}
            <div className="flex items-center gap-3">
                              <Link href="/dashboard/settings" onClick={() => setOpen(false)}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={"/doctor-profile-avatar.png"} alt={user?.name || "User"} />
                  <AvatarFallback>
                    {user?.name ? user.name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.role || "Medical Professional"}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                <ModeToggle />
              </div>
              
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
