"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, FileText, Key, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { storage } from "@/lib/storage"

interface RestoreBackupModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RestoreBackupModal({ isOpen, onClose }: RestoreBackupModalProps) {
  const [activeTab, setActiveTab] = useState("file")
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean
    message: string
    stats?: { people: number; events: number; ideas: number }
  } | null>(null)

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Token restore state
  const [token, setToken] = useState("")
  const [encryptedData, setEncryptedData] = useState("")

  const resetState = () => {
    setSelectedFile(null)
    setToken("")
    setEncryptedData("")
    setRestoreResult(null)
    setIsRestoring(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (
      file &&
      (file.type === "application/json" ||
        file.type === "text/plain" ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".txt"))
    ) {
      setSelectedFile(file)
      setRestoreResult(null)
    } else {
      alert("Por favor selecciona un archivo JSON o TXT válido")
    }
  }

  const parseBackupData = (content: string) => {
    try {
      // First try to parse as JSON directly
      return JSON.parse(content)
    } catch (e) {
      // If that fails, try to decode as base64 (encrypted data from email)
      try {
        const decoded = atob(content.trim())
        return JSON.parse(decoded)
      } catch (e2) {
        throw new Error("El archivo no contiene datos válidos de Memento")
      }
    }
  }

  const validateBackupData = (data: any) => {
    // Check if it's the new format with version and timestamp
    if (data.version && data.timestamp && data.data) {
      return data.data
    }

    // Check if it's the old format (direct storage data)
    if (data.people && Array.isArray(data.people)) {
      return data
    }

    throw new Error("Formato de respaldo no reconocido")
  }

  const restoreFromFile = async () => {
    if (!selectedFile) return

    setIsRestoring(true)
    setRestoreResult(null)

    try {
      const fileContent = await selectedFile.text()
      const rawData = parseBackupData(fileContent)
      const backupData = validateBackupData(rawData)

      // Restore data
      storage.save(backupData)

      // Calculate stats
      const stats = {
        people: backupData.people?.length || 0,
        events: backupData.events?.length || 0,
        ideas: backupData.giftIdeas?.length || 0,
      }

      setRestoreResult({
        success: true,
        message: "¡Datos restaurados exitosamente!",
        stats,
      })

      // Dispatch event to refresh other components
      window.dispatchEvent(new Event("storage"))
      document.dispatchEvent(new CustomEvent("memento:data-updated"))

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error("Error restoring from file:", error)
      setRestoreResult({
        success: false,
        message: error instanceof Error ? error.message : "Error al restaurar el archivo",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const restoreFromToken = async () => {
    if (!token.trim() || !encryptedData.trim()) {
      alert("Por favor completa tanto el token como los datos encriptados")
      return
    }

    setIsRestoring(true)
    setRestoreResult(null)

    try {
      // Try to decode the encrypted data directly (base64)
      const decoded = atob(encryptedData.trim())
      const rawData = JSON.parse(decoded)
      const backupData = validateBackupData(rawData)

      // Restore data
      storage.save(backupData)

      // Calculate stats
      const stats = {
        people: backupData.people?.length || 0,
        events: backupData.events?.length || 0,
        ideas: backupData.giftIdeas?.length || 0,
      }

      setRestoreResult({
        success: true,
        message: "¡Datos restaurados exitosamente desde email!",
        stats,
      })

      // Dispatch event to refresh other components
      window.dispatchEvent(new Event("storage"))
      document.dispatchEvent(new CustomEvent("memento:data-updated"))

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose()
      }, 2000)
    } catch (error) {
      console.error("Error restoring from token:", error)
      setRestoreResult({
        success: false,
        message:
          "Error al decodificar los datos. Verifica que hayas copiado correctamente el contenido del archivo adjunto.",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b border-dusty/10 pb-4">
          <div>
            <CardTitle className="text-xl font-display text-purple flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Restaurar Datos</span>
            </CardTitle>
            <p className="text-sm text-purple/60 mt-1">Restaura tu información desde un archivo o email</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-purple/60 hover:text-purple">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="file" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Desde Archivo</span>
              </TabsTrigger>
              <TabsTrigger value="token" className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Desde Email</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="backup-file" className="text-purple font-medium">
                    Seleccionar archivo de respaldo
                  </Label>
                  <p className="text-sm text-purple/60 mb-3">
                    Sube el archivo .json (descarga manual) o .txt (del email) que contiene tu respaldo
                  </p>
                  <Input
                    id="backup-file"
                    type="file"
                    accept=".json,.txt"
                    onChange={handleFileSelect}
                    className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                  />
                </div>

                {selectedFile && (
                  <div className="p-4 bg-dusty/5 rounded-xl border border-dusty/20">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-dusty" />
                      <span className="text-sm font-medium text-purple">{selectedFile.name}</span>
                      <span className="text-xs text-purple/60">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={restoreFromFile}
                  disabled={!selectedFile || isRestoring}
                  className="w-full bg-dusty hover:bg-dusty/90 text-white rounded-xl py-3"
                >
                  {isRestoring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Restaurando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Restaurar desde Archivo
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="token" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="restore-token" className="text-purple font-medium">
                    Token de restauración
                  </Label>
                  <p className="text-sm text-purple/60 mb-3">
                    Copia el token que recibiste en tu email (ej: abc123def456)
                  </p>
                  <Input
                    id="restore-token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Pega aquí tu token..."
                    className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="encrypted-data" className="text-purple font-medium">
                    Contenido del archivo adjunto
                  </Label>
                  <p className="text-sm text-purple/60 mb-3">
                    Abre el archivo .txt que recibiste por email y copia todo su contenido aquí
                  </p>
                  <Textarea
                    id="encrypted-data"
                    value={encryptedData}
                    onChange={(e) => setEncryptedData(e.target.value)}
                    placeholder="Pega aquí el contenido completo del archivo .txt..."
                    className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl min-h-[120px]"
                  />
                </div>

                <Button
                  onClick={restoreFromToken}
                  disabled={!token.trim() || !encryptedData.trim() || isRestoring}
                  className="w-full bg-dusty hover:bg-dusty/90 text-white rounded-xl py-3"
                >
                  {isRestoring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Restaurando...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Restaurar con Token
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Result Message */}
          {restoreResult && (
            <div className="mt-6">
              <div
                className={`p-4 rounded-xl border ${
                  restoreResult.success
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {restoreResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{restoreResult.message}</p>
                    {restoreResult.success && restoreResult.stats && (
                      <div className="mt-2 text-sm">
                        <p>
                          Se restauraron: {restoreResult.stats.people} personas, {restoreResult.stats.events} eventos,{" "}
                          {restoreResult.stats.ideas} ideas de regalo
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 Instrucciones</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Desde Archivo:</strong> Sube el archivo .json (descarga manual) o .txt (del email)
              </p>
              <p>
                <strong>Desde Email:</strong> Copia el token del email y el contenido completo del archivo .txt adjunto
              </p>
              <p className="text-blue-700">
                ⚠️ La restauración reemplazará todos tus datos actuales. Asegúrate de tener un respaldo si es necesario.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
