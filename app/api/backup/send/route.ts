import { NextResponse } from "next/server"
import { Resend } from "resend"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: Request) {
  try {
    const { email, encryptedData, token } = (await req.json()) as {
      email: string
      encryptedData: string
      token: string
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Correo inválido." }, { status: 400 })
    }
    if (!encryptedData || !token) {
      return NextResponse.json({ error: "Faltan datos de respaldo." }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.BACKUP_FROM_EMAIL

    if (!apiKey || !fromEmail) {
      return NextResponse.json(
        {
          error:
            "El envío de email no está configurado. Añade RESEND_API_KEY y BACKUP_FROM_EMAIL en las variables de entorno.",
        },
        { status: 501 },
      )
    }

    const resend = new Resend(apiKey)

    const subject = "Memento - Respaldo de datos"
    const html = `
      <div>
        <p>Hola,</p>
        <p>Adjuntamos tu respaldo de Memento. Guarda este correo y el siguiente token en un lugar seguro.</p>
        <p><strong>Token de seguridad:</strong> ${token}</p>
        <p>Cómo usarlo: abre Memento y utiliza la opción de restaurar respaldo (en desarrollo para el MVP).</p>
        <p>— Equipo Memento</p>
      </div>
    `

    // Adjuntamos el contenido cifrado como texto
    const attachments = [
      {
        filename: `memento-backup-${new Date().toISOString().split("T")[0]}.txt`,
        content: Buffer.from(encryptedData, "utf8"),
      },
    ] as any

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html,
      attachments,
    })

    if (error) {
      return NextResponse.json({ error: "No se pudo enviar el email de respaldo." }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Error inesperado enviando el respaldo." }, { status: 500 })
  }
}
