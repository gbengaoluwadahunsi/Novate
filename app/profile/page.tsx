"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the unified settings page
    router.replace("/dashboard/settings")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Redirecting to settings...</span>
      </div>
    </div>
  )
}
