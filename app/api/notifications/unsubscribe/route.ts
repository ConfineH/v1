import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const email = searchParams.get("email")

  if (!token && !email) {
    return NextResponse.redirect(new URL("/unsubscribe?error=missing-params", request.url))
  }

  // In a real app, you would validate the token against your database
  // For now, we'll just redirect to the unsubscribe page with success
  return NextResponse.redirect(
    new URL(`/unsubscribe?success=true&email=${email || ""}&token=${token || ""}`, request.url),
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Validate the token
    // 2. Update the user's subscription status in your database
    // 3. Send a confirmation email

    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: "Te has desuscrito correctamente de las notificaciones de Memento.",
    })
  } catch (error) {
    console.error("Error unsubscribing:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
