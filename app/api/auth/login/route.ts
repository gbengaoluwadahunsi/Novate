import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Connect to your backend authentication service
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://novatescribebackend.onrender.com"
    
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Authentication failed" },
        { status: response.status }
      )
    }

    // Return the response from your backend
    return NextResponse.json({
      success: true,
      token: data.token,
      user: data.user,
      message: "Login successful",
    })

  } catch (error) {
    logger.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
