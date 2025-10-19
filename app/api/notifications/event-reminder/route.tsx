import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, event, person, daysUntil, giftSuggestions = [] } = await request.json()

    if (!email || !event || !person) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine urgency and styling
    const isUrgent = daysUntil <= 3
    const isWeek = daysUntil <= 7
    const urgencyColor = isUrgent ? "#dc3545" : isWeek ? "#fd7e14" : "#8B5A87"
    const urgencyText = isUrgent ? "¡URGENTE!" : isWeek ? "¡Pronto!" : "Próximamente"

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recordatorio: ${event.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, ${urgencyColor} 0%, #D4A574 100%); padding: 40px 20px; text-align: center; color: white; }
            .urgency-badge { background-color: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; display: inline-block; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .countdown { font-size: 48px; font-weight: bold; margin: 20px 0; }
            .content { padding: 40px 20px; }
            .event-details { background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
            .detail-row:last-child { border-bottom: none; }
            .suggestions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
            .suggestion-card { border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; }
            .suggestion-image { width: 100%; height: 150px; object-fit: cover; }
            .suggestion-content { padding: 15px; }
            .suggestion-title { font-weight: bold; color: #333; margin-bottom: 8px; }
            .suggestion-price { color: #8B5A87; font-weight: bold; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8B5A87 0%, #D4A574 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 10px 5px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="urgency-badge">${urgencyText}</div>
              <h1>📅 Recordatorio de Evento</h1>
              <div class="countdown">${daysUntil === 0 ? "¡HOY!" : daysUntil === 1 ? "¡MAÑANA!" : `${daysUntil} días`}</div>
            </div>
            
            <div class="content">
              <div class="event-details">
                <h3 style="color: #8B5A87; margin-top: 0;">Detalles del evento</h3>
                <div class="detail-row">
                  <span>Evento:</span>
                  <strong>${event.title}</strong>
                </div>
                <div class="detail-row">
                  <span>Persona:</span>
                  <strong>${person.name}</strong>
                </div>
                <div class="detail-row">
                  <span>Relación:</span>
                  <strong>${person.relationship}</strong>
                </div>
                <div class="detail-row">
                  <span>Fecha:</span>
                  <strong>${new Date(event.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</strong>
                </div>
              </div>
              
              ${
                giftSuggestions.length > 0
                  ? `
                <h3 style="color: #8B5A87;">🎁 Sugerencias de regalos para ${person.name}</h3>
                <div class="suggestions-grid">
                  ${giftSuggestions
                    .slice(0, 4)
                    .map(
                      (suggestion) => `
                    <div class="suggestion-card">
                      <img src="${suggestion.imageUrl || "/placeholder.svg"}" alt="${suggestion.title}" class="suggestion-image">
                      <div class="suggestion-content">
                        <div class="suggestion-title">${suggestion.title}</div>
                        <div class="suggestion-price">€${suggestion.price}</div>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gift-suggestions" class="cta-button">
                  Ver Más Sugerencias
                </a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/ideas" class="cta-button">
                  Mis Ideas Guardadas
                </a>
              </div>
              
              <p style="color: #666; text-align: center; line-height: 1.6;">
                ${
                  isUrgent
                    ? "¡El evento es muy pronto! Es hora de conseguir ese regalo perfecto."
                    : isWeek
                      ? "Tienes una semana para encontrar el regalo ideal. ¡No lo dejes para último momento!"
                      : "Tienes tiempo suficiente para planear el regalo perfecto."
                }
              </p>
            </div>
            
            <div class="footer">
              <p>Memento - Tu asistente personal para regalos perfectos</p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.BACKUP_FROM_EMAIL || "noreply@memento.com",
      to: email,
      subject: `${urgencyText} ${event.title} - ${daysUntil === 0 ? "¡Es hoy!" : daysUntil === 1 ? "¡Es mañana!" : `En ${daysUntil} días`}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending event reminder:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
