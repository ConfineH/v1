import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, giftIdea, oldPrice, newPrice, discount, person } = await request.json()

    if (!email || !giftIdea || !newPrice || !discount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const savings = oldPrice ? (oldPrice - newPrice).toFixed(2) : "0.00"
    const discountPercent = Math.round(discount)

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>¡Alerta de Precio! ${giftIdea.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 40px 20px; text-align: center; color: white; }
            .discount-badge { background-color: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 10px; display: inline-block; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .savings { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .content { padding: 40px 20px; }
            .product-card { border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; margin: 20px 0; }
            .product-image { width: 100%; height: 200px; object-fit: cover; }
            .product-details { padding: 20px; }
            .product-title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px; }
            .product-description { color: #666; line-height: 1.6; margin-bottom: 15px; }
            .price-comparison { background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin: 15px 0; }
            .price-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .price-row:last-child { margin-bottom: 0; }
            .old-price { text-decoration: line-through; color: #999; }
            .new-price { color: #dc3545; font-weight: bold; font-size: 18px; }
            .savings-highlight { color: #28a745; font-weight: bold; }
            .person-info { background-color: #e3f2fd; border-radius: 8px; padding: 15px; margin: 20px 0; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; margin: 10px 5px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .urgency-text { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="discount-badge">🔥 ${discountPercent}% DESCUENTO</div>
              <h1>¡Alerta de Precio!</h1>
              <div class="savings">Ahorras €${savings}</div>
            </div>
            
            <div class="content">
              <div class="product-card">
                <img src="${giftIdea.imageUrl || "/placeholder.svg"}" alt="${giftIdea.title}" class="product-image">
                <div class="product-details">
                  <div class="product-title">${giftIdea.title}</div>
                  <div class="product-description">${giftIdea.description}</div>
                  
                  <div class="price-comparison">
                    <div class="price-row">
                      <span>Precio anterior:</span>
                      <span class="old-price">€${oldPrice}</span>
                    </div>
                    <div class="price-row">
                      <span>Precio actual:</span>
                      <span class="new-price">€${newPrice}</span>
                    </div>
                    <div class="price-row">
                      <span>Tu ahorro:</span>
                      <span class="savings-highlight">€${savings} (${discountPercent}%)</span>
                    </div>
                  </div>
                  
                  ${
                    person
                      ? `
                    <div class="person-info">
                      <strong>🎁 Para: ${person.name}</strong>
                      <div style="color: #666; font-size: 14px; margin-top: 5px;">
                        ${person.relationship}
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
              
              <div class="urgency-text">
                <strong>⏰ ¡No esperes más!</strong> Los descuentos como este no duran mucho tiempo. 
                Es el momento perfecto para conseguir este regalo a un precio increíble.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                ${
                  giftIdea.link
                    ? `
                  <a href="${giftIdea.link}" class="cta-button">
                    Comprar Ahora
                  </a>
                `
                    : ""
                }
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/ideas" class="cta-button">
                  Ver Mis Ideas
                </a>
              </div>
              
              <p style="color: #666; text-align: center; line-height: 1.6;">
                Este descuento se detectó automáticamente. Te notificamos porque configuraste 
                alertas para descuentos del ${discountPercent}% o más.
              </p>
            </div>
            
            <div class="footer">
              <p>Memento - Tu asistente personal para regalos perfectos</p>
              <p style="margin-top: 10px; font-size: 12px; color: #999;">
                Recibes este email porque tienes activadas las alertas de precio en tu configuración.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: process.env.BACKUP_FROM_EMAIL || "noreply@memento.com",
      to: email,
      subject: `🔥 ¡${discountPercent}% descuento en ${giftIdea.title}! Ahorras €${savings}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending price alert:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
