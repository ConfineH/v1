import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, stats, upcomingEvents, recentIdeas, monthName } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Resumen Mensual de Memento - ${monthName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #8B5A87 0%, #D4A574 100%); padding: 40px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 20px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
            .stat-card { background-color: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center; }
            .stat-number { font-size: 32px; font-weight: bold; color: #8B5A87; margin-bottom: 5px; }
            .stat-label { color: #666; font-size: 14px; }
            .section { margin: 30px 0; }
            .section-title { color: #8B5A87; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
            .event-item { background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
            .event-title { font-weight: bold; color: #333; }
            .event-person { color: #666; font-size: 14px; }
            .event-date { color: #8B5A87; font-weight: bold; }
            .idea-item { display: flex; align-items: center; background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
            .idea-image { width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
            .idea-details { flex: 1; }
            .idea-title { font-weight: bold; color: #333; margin-bottom: 5px; }
            .idea-person { color: #666; font-size: 14px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8B5A87 0%, #D4A574 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 10px 5px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .highlight { background: linear-gradient(135deg, #8B5A87 0%, #D4A574 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Resumen de ${monthName}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Tu actividad en Memento este mes</p>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; color: #333; line-height: 1.6; text-align: center;">
                ¡Hola! Aquí tienes un resumen de tu actividad en Memento durante ${monthName}. 
                <span class="highlight">¡Sigue así creando momentos especiales!</span>
              </p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${stats.totalPeople || 0}</div>
                  <div class="stat-label">Personas registradas</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.totalIdeas || 0}</div>
                  <div class="stat-label">Ideas guardadas</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.purchasedIdeas || 0}</div>
                  <div class="stat-label">Regalos comprados</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${stats.upcomingEvents || 0}</div>
                  <div class="stat-label">Eventos próximos</div>
                </div>
              </div>
              
              ${
                upcomingEvents && upcomingEvents.length > 0
                  ? `
                <div class="section">
                  <div class="section-title">🗓️ Eventos próximos</div>
                  ${upcomingEvents
                    .slice(0, 5)
                    .map(
                      (event) => `
                    <div class="event-item">
                      <div>
                        <div class="event-title">${event.title}</div>
                        <div class="event-person">${event.person}</div>
                      </div>
                      <div class="event-date">
                        ${event.daysUntil === 0 ? "¡Hoy!" : event.daysUntil === 1 ? "¡Mañana!" : `${event.daysUntil} días`}
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
              
              ${
                recentIdeas && recentIdeas.length > 0
                  ? `
                <div class="section">
                  <div class="section-title">💡 Ideas recientes</div>
                  ${recentIdeas
                    .slice(0, 5)
                    .map(
                      (idea) => `
                    <div class="idea-item">
                      <img src="${idea.imageUrl || "/placeholder.svg"}" alt="${idea.title}" class="idea-image">
                      <div class="idea-details">
                        <div class="idea-title">${idea.title}</div>
                        <div class="idea-person">${idea.personName || "Sin asignar"}</div>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="cta-button">
                  Ir a Memento
                </a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gift-suggestions" class="cta-button">
                  Buscar Regalos
                </a>
              </div>
              
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                <h3 style="color: #8B5A87; margin-top: 0;">💡 Consejo del mes</h3>
                <p style="color: #666; line-height: 1.6; margin-bottom: 0;">
                  ${
                    stats.upcomingEvents > 0
                      ? "Tienes eventos próximos. ¡Es un buen momento para explorar nuevas ideas de regalos!"
                      : stats.totalIdeas === 0
                        ? "¡Empieza a guardar ideas de regalos para estar siempre preparado!"
                        : "¡Excelente trabajo manteniendo tu lista de regalos actualizada!"
                  }
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p>Gracias por usar Memento - Tu asistente personal para regalos perfectos</p>
              <p style="margin-top: 10px; font-size: 12px; color: #999;">
                Recibes este email porque tienes activado el resumen mensual en tu configuración.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.BACKUP_FROM_EMAIL || "noreply@memento.com",
      to: email,
      subject: `📊 Tu resumen de ${monthName} en Memento`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending monthly digest:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
