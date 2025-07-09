"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import { getUserProfile } from "@/store/features/userSlice"
import { getUser } from "@/store/features/authSlice"

export default function DebugAuth() {
  const [isVisible, setIsVisible] = useState(false)
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  const user = useAppSelector((state) => state.user)

  useEffect(() => {
    // Show debug panel in development
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true)
    }
  }, [])

  const handleRefreshAuth = () => {
    dispatch(getUser())
  }

  const handleRefreshProfile = () => {
    dispatch(getUserProfile())
  }

  if (!isVisible) return null

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto bg-yellow-50 border-yellow-200 z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🔧 Debug Panel
          <Badge variant="outline" className="text-xs">
            DEV
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <h4 className="font-semibold mb-1">Auth State:</h4>
          <div className="space-y-1">
            <div>Authenticated: {auth.isAuthenticated ? "✅" : "❌"}</div>
            <div>Loading: {auth.isLoading ? "⏳" : "✅"}</div>
            <div>Token: {auth.token ? "✅" : "❌"}</div>
            <div>User: {auth.user ? "✅" : "❌"}</div>
            {auth.error && <div className="text-red-600">Error: {auth.error}</div>}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-1">User Profile:</h4>
          <div className="space-y-1">
            <div>Loading: {user.isLoading ? "⏳" : "✅"}</div>
            <div>Organization: {user.currentOrganization ? "✅" : "❌"}</div>
            <div>Statistics: {user.userStatistics ? "✅" : "❌"}</div>
            {user.error && <div className="text-red-600">Error: {user.error}</div>}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button size="sm" onClick={handleRefreshAuth} className="w-full">
            Refresh Auth
          </Button>
          <Button size="sm" onClick={handleRefreshProfile} className="w-full">
            Refresh Profile
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVisible(false)}
            className="w-full"
          >
            Hide Panel
          </Button>
        </div>

        {auth.user && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <h5 className="font-semibold mb-1">User Data:</h5>
            <pre className="whitespace-pre-wrap overflow-auto">
              {JSON.stringify(auth.user, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 