"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { FileText, Home, Mic, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import logo from "@/public/novateLogo-removebg-preview.png"


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

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col h-screen border-r bg-white dark:bg-gray-950", className)}>
      <div className="p-6 border-b">
        <Link href="/">
          <div className="flex items-center gap-1">
            <Image src={logo} alt="Novate AI Logo" className="h-12 w-12  rounded-full" width={48} height={48} />
            <span className="font-bold text-[#2563eb]">Novate AI</span>
          </div>
        </Link>
      </div>
      <ScrollArea className="flex-1 p-3">
        {routes.map((route) => (
          <div key={route.href} className="mb-1">
            <Link
              href={route.href}
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
  )
}
