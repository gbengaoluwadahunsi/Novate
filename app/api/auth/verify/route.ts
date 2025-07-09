import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
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

    // Connect to your backend token verification service
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://novatescribebackend.onrender.com"
    
    const response = await fetch(`${backendUrl}/api/auth/verify`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Token verification failed" },
        { status: response.status }
      )
    }

    // Return the user data from your backend
    return NextResponse.json({
      success: true,
      user: data.user,
      message: "Token verified successfully",
    })

  } catch (error) {
    logger.error("Token verification error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 