"use client"

import Link from "next/link"
import NextImage from "next/image"
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
import { Logo } from "@/components/ui/logo"

// Simplified route structure with only core features
const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "NovateGPT",
    icon: null,
    href: "/dashboard/novategpt",
    color: "text-sky-500",
    isLogo: true,
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
        <Button variant="ghost" size="icon" className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80 sm:w-72">
        <div className="flex h-full flex-col bg-white dark:bg-gray-950">
          <div className="p-4 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
            <Link href="/" onClick={() => setOpen(false)} className="flex items-center">
              <Logo 
                width={100} 
                height={100} 
                className="rounded-full"
                alt="NovateScribe Logo"
              />
            </Link>
          </div>
          
          <ScrollArea className="flex-1 py-4">
            <nav className="px-4 space-y-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 min-h-[44px]",
                    pathname === route.href
                      ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                  )}
                >
                  {route.isLogo ? (
                    <div className="flex-shrink-0">
                      <NextImage 
                        src="/NovateGPT.png" 
                        alt="NovateGPT" 
                        width={24} 
                        height={24} 
                        className="rounded-sm"
                      />
                    </div>
                  ) : route.icon && (
                    <div className="flex-shrink-0">
                      <route.icon className={cn("h-5 w-5", 
                        pathname === route.href ? "text-sky-600 dark:text-sky-400" : route.color
                      )} />
                    </div>
                  )}
                  <span className="flex-1">{route.label}</span>
                  {pathname === route.href && (
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  )}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <Link href="/dashboard/settings" onClick={() => setOpen(false)}>
                <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-700">
                  <AvatarImage src={"/doctor-profile-avatar.png"} alt={user?.name || "User"} />
                  <AvatarFallback className="text-sm font-medium bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                    {user?.name ? user.name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role || "Medical Professional"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <ModeToggle />
              </div>
              
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-3 h-auto rounded-lg font-medium"
              >
                <LogOut className="h-4 w-4 mr-3 flex-shrink-0" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
