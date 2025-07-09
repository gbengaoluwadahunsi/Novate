import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Connect to your backend logout service
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://novatescribebackend.onrender.com"
    
    const response = await fetch(`${backendUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Logout failed" },
        { status: response.status }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Logout successful",
    })

  } catch (error) {
    logger.error("Logout error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 