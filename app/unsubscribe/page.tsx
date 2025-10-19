"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Mail, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isUnsubscribed, setIsUnsubscribed] = useState(false)

  useEffect(() => {
    const urlEmail = searchParams.get("email")
    const urlToken = searchParams.get("token")
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (urlEmail) {
      setEmail(urlEmail)
    }

    if (success === "true") {
      setMessage({ type: "success", text: "Te has desuscrito correctamente de las notificaciones." })
      setIsUnsubscribed(true)
    }

    if (error === "missing-params") {
      setMessage({
        type: "error",
        text: "Enlace de desuscripción inválido. Por favor, introduce tu email manualmente.",
      })
    }

    // Auto-unsubscribe if we have both email and token from URL
    if (urlEmail && urlToken && success !== "true") {
      handleUnsubscribe(urlEmail, urlToken)
    }
  }, [searchParams])

  const handleUnsubscribe = async (emailToUse?: string, token?: string) => {
    const targetEmail = emailToUse || email

    if (!targetEmail) {
      setMessage({ type: "error", text: "Por favor, introduce tu dirección de email." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, token }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: data.message })
        setIsUnsubscribed(true)
      } else {
        setMessage({ type: "error", text: data.error || "Error al procesar la desuscripción." })
      }
    } catch (error) {
      console.error("Error unsubscribing:", error)
      setMessage({ type: "error", text: "Error de conexión. Por favor, inténtalo de nuevo." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple/5 to-dusty/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white rounded-2xl shadow-lg border-dusty/20">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-dusty" />
            </div>
            <CardTitle className="text-2xl font-display font-bold text-purple">
              {isUnsubscribed ? "Desuscripción Completada" : "Cancelar Suscripción"}
            </CardTitle>
            <p className="text-purple/70 mt-2">
              {isUnsubscribed
                ? "Ya no recibirás notificaciones de Memento"
                : "Cancela tu suscripción a las notificaciones por email"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <div
                className={`p-4 rounded-xl border-l-4 ${
                  message.type === "success"
                    ? "bg-green-50 border-l-green-500 text-green-800"
                    : "bg-red-50 border-l-red-500 text-red-800"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {message.type === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <p className="font-medium">{message.text}</p>
                </div>
              </div>
            )}

            {!isUnsubscribed && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple font-medium">
                    Dirección de Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                    disabled={loading}
                  />
                  <p className="text-sm text-purple/60">
                    Introduce el email del que quieres cancelar las notificaciones
                  </p>
                </div>

                <Button
                  onClick={() => handleUnsubscribe()}
                  disabled={loading || !email}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl py-3"
                >
                  {loading ? "Procesando..." : "Cancelar Suscripción"}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-purple/60 mb-3">
                    ¿Cambiaste de opinión? Puedes volver a suscribirte en cualquier momento desde tu dashboard.
                  </p>
                </div>
              </>
            )}

            {isUnsubscribed && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-purple/70">
                  Lamentamos verte partir. Si cambias de opinión, siempre puedes volver a activar las notificaciones
                  desde tu dashboard en Memento.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-dusty/20">
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="w-full border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Memento
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-purple/60 text-sm">
            ¿Necesitas ayuda? Contacta con nosotros en{" "}
            <a href="mailto:support@memento.com" className="text-dusty hover:underline">
              support@memento.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
