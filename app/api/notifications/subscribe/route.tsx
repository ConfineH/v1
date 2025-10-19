import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, settings } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Generate unsubscribe token
    const unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Create welcome email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>¡Bienvenido a Memento!</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #8B5A87 0%, #D4A574 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 40px 20px; }
            .welcome-text { font-size: 18px; color: #333; margin-bottom: 30px; line-height: 1.6; }
            .settings-box { background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .settings-title { font-size: 16px; font-weight: bold; color: #8B5A87; margin-bottom: 15px; }
            .setting-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
            .setting-item:last-child { border-bottom: none; }
            .setting-label { color: #666; }
            .setting-value { color: #333; font-weight: 500; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8B5A87 0%, #D4A574 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .unsubscribe { color: #999; font-size: 12px; margin-top: 20px; }
            .unsubscribe a { color: #8B5A87; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a Memento! 🎁</h1>
            </div>
            
            <div class="content">
              <p class="welcome-text">
                ¡Hola! Nos alegra que te hayas unido a Memento. A partir de ahora recibirás notificaciones personalizadas para que nunca olvides los momentos especiales de tus seres queridos.
              </p>
              
              <div class="settings-box">
                <div class="settings-title">Tu configuración de notificaciones:</div>
                
                <div class="setting-item">
                  <span class="setting-label">Recordatorios de eventos</span>
                  <span class="setting-value">${settings.eventReminders?.enabled ? "✅ Activado" : "❌ Desactivado"}</span>
                </div>
                
                ${
                  settings.eventReminders?.enabled
                    ? `
                  <div class="setting-item">
                    <span class="setting-label">Recordatorio personalizado</span>
                    <span class="setting-value">${settings.eventReminders.customDays} días antes</span>
                  </div>
                  
                  <div class="setting-item">
                    <span class="setting-label">Una semana antes</span>
                    <span class="setting-value">${settings.eventReminders.weekBefore ? "✅" : "❌"}</span>
                  </div>
                  
                  <div class="setting-item">
                    <span class="setting-label">Un día antes</span>
                    <span class="setting-value">${settings.eventReminders.dayBefore ? "✅" : "❌"}</span>
                  </div>
                `
                    : ""
                }
                
                <div class="setting-item">
                  <span class="setting-label">Resumen mensual</span>
                  <span class="setting-value">${settings.monthlyDigest?.enabled ? `✅ Día ${settings.monthlyDigest.dayOfMonth}` : "❌ Desactivado"}</span>
                </div>
                
                <div class="setting-item">
                  <span class="setting-label">Alertas de precio</span>
                  <span class="setting-value">${settings.priceAlerts?.enabled ? `✅ ${settings.priceAlerts.threshold}% descuento` : "❌ Desactivado"}</span>
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                Puedes cambiar estas configuraciones en cualquier momento desde tu dashboard. ¡Esperamos ayudarte a crear momentos inolvidables!
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" class="cta-button">
                  Ir a Memento
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>Gracias por usar Memento - Tu asistente personal para regalos perfectos</p>
              <div class="unsubscribe">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/unsubscribe?token=${unsubscribeToken}">
                  Cancelar suscripción
                </a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    // Send welcome email
    await resend.emails.send({
      from: process.env.BACKUP_FROM_EMAIL || "noreply@memento.com",
      to: email,
      subject: "¡Bienvenido a Memento! 🎁",
      html: emailHtml,
    })

    return NextResponse.json({
      success: true,
      message: "Suscripción exitosa",
      unsubscribeToken,
    })
  } catch (error) {
    console.error("Error subscribing to notifications:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
