import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // In a real application, you would validate credentials here
    // For demo purposes, we'll just return a success response

    return NextResponse.json({
      success: true,
      redirectUrl: "/dashboard", // Changed from '/dashboard/ai-assistant' to '/dashboard'
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 })
  }
}
