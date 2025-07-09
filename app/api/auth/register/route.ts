import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role, specialization, registrationNo, hospital, languages, organizationId, avatar } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { success: false, message: "Email, password, name, and role are required" },
        { status: 400 }
      )
    }

    // Connect to your backend registration service
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://novatescribebackend.onrender.com"
    
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        name,
        role,
        specialization,
        registrationNo,
        hospital,
        languages,
        organizationId,
        avatar,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Registration failed" },
        { status: response.status }
      )
    }

    // Return the response from your backend
    return NextResponse.json({
      success: true,
      token: data.token,
      user: data.user,
      message: "Registration successful",
    })

  } catch (error) {
    logger.error("Registration error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
} 