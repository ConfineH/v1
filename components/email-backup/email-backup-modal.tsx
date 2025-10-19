"use client"

import { useState } from "react"
import { Mail, Shield, Download, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { storage } from "@/lib/storage"

interface EmailBackupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EmailBackupModal({ isOpen, onClose }: EmailBackupModalProps) {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "sending" | "sent">("email")
  const [error, setError] = useState<string | null>(null)

  const handleBackup = async () => {
    setError(null)
    if (!email.trim()) {
      setError("Por favor, escribe un correo válido.")
      return
    }

    setStep("sending")

    try {
      // 1) Obtener todos los datos locales
      const data = storage.load()

      // 2) "Encriptación" simple para MVP (nota: en producción usar cifrado real)
      const encryptedData = btoa(JSON.stringify(data))
      const token = Math.random().toString(36).substring(2, 15)

      // 3) Llamar al backend para enviar el email
      const res = await fetch("/api/backup/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, encryptedData, token }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        const msg =
          payload?.error || "No se pudo enviar el email. Revisa tu configuración de email o intenta de nuevo más tarde."
        setError(msg)
        setStep("email")
        return
      }

      // 4) Guardar último correo
      const updatedData = storage.load()
      updatedData.settings.lastBackupEmail = email
      storage.save(updatedData)

      setStep("sent")
    } catch (e) {
      setError("Ocurrió un error inesperado al enviar el respaldo.")
      setStep("email")
    }
  }

  const downloadBackup = () => {
    const data = storage.load()

    // Create a backup object with metadata
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: data,
    }

    const dataStr = JSON.stringify(backupData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `memento-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display text-purple flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Respaldar Datos</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-purple/60 hover:text-purple">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "email" && (
            <>
              <div className="text-center">
                <Mail className="h-12 w-12 text-dusty mx-auto mb-4" />
                <p className="text-purple/70">
                  Te enviaremos un respaldo de tus datos por email para que puedas recuperarlos en otro dispositivo.
                </p>
              </div>

              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
              />

              {error && (
                <div className="flex items-start space-x-2 text-red-600 text-sm bg-red-50 border border-red-100 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-3">
                <Button onClick={handleBackup} className="flex-1 bg-dusty hover:bg-dusty/90 text-white rounded-xl">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por Email
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadBackup}
                  className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
                  title="Descargar archivo JSON"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-purple/60">
                  <strong>Email:</strong> Recibirás un archivo .txt con tus datos encriptados
                </p>
                <p className="text-xs text-purple/60">
                  <strong>Descarga:</strong> Archivo .json para restaurar manualmente
                </p>
                <p className="text-xs text-purple/50 mt-2">
                  Si el correo no llega, revisa SPAM o configura RESEND_API_KEY y BACKUP_FROM_EMAIL en tu proyecto.
                </p>
              </div>
            </>
          )}

          {step === "sending" && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-dusty border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-purple">Enviando respaldo...</p>
            </div>
          )}

          {step === "sent" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-display font-bold text-purple mb-2">¡Respaldo Enviado!</h3>
              <p className="text-purple/70 mb-4">
                Revisa tu email para el respaldo. Recibirás un archivo .txt con tus datos y un token de seguridad.
              </p>
              <Button onClick={onClose} className="bg-dusty hover:bg-dusty/90 text-white rounded-xl">
                Entendido
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
