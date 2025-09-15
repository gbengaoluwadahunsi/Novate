"use client"

import Link from "next/link"
import NextImage from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Home, Mic, Settings, LogOut, Activity, Stethoscope, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { clearAuth } from "@/store/features/authSlice"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/ui/logo"
import { logger } from "@/lib/logger"

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAppSelector((state) => state?.auth || {})



  const handleLogout = () => {
    dispatch(clearAuth())
        toast({
          title: "Logout Successful",
          description: "You have been logged out successfully",
        })
    router.push("/")
  }

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
      label: "Subscription",
      icon: Crown,
      href: "/dashboard/subscription",
      color: "text-amber-500",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      color: "text-gray-500",
    },
  ].map(route => ({
    ...route,
    active: pathname === route.href
  }))

  return (
    <div className={cn("flex flex-col min-h-screen border-r bg-white dark:bg-gray-950 sticky top-0", className)}>
      <div className="p-6 border-b">
        <Link href="/">
          <div className="flex items-center gap-1">
            <Logo width={160} height={160} className="rounded-full" alt="NovateScribe Logo" />
          </div>
        </Link>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        {routes.map((route) => (
          <div key={route.href} className="mb-1">
            <Link
              href={route.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                route.active
                  ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              {route.isLogo ? (
              <NextImage 
                src="/NovateGPT.png" 
                alt="NovateGPT" 
                width={20} 
                height={20} 
                className="rounded-sm"
              />
            ) : route.icon && <route.icon className={cn("h-4 w-4", route.color)} />}
              <span>{route.label}</span>
            </Link>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/dashboard/settings">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/doctor-profile-avatar.png" alt={user?.name || "User"} />
              <AvatarFallback>
                {user?.name 
                  ? user.name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase() 
                  : user?.firstName && user?.lastName 
                    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                    : user?.firstName 
                      ? user.firstName[0].toUpperCase() 
                      : 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || "Loading...")}
            </p>
            <p className="text-xs text-muted-foreground">{user?.role || "DOCTOR"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
