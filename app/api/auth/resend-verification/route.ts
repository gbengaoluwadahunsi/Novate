import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Connect to your backend resend verification service
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://novatescribebackend.onrender.com"
    
    const response = await fetch(`${backendUrl}/auth/resend-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to resend verification email" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Verification email resent successfully",
    })

  } catch (error) {
    logger.error("Resend verification error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 