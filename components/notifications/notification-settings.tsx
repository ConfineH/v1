"use client"

import { useState, useEffect } from "react"
import { Bell, Mail, Calendar, DollarSign, Check, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage, type NotificationSettings as NotificationSettingsType } from "@/lib/storage"

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    email: "",
    subscribed: false,
    eventReminders: {
      enabled: true,
      customDays: 14,
      weekBefore: true,
      dayBefore: true,
    },
    monthlyDigest: {
      enabled: true,
      dayOfMonth: 1,
    },
    priceAlerts: {
      enabled: true,
      threshold: 20,
    },
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const data = storage.load()
    if (data.settings?.notifications) {
      setSettings(data.settings.notifications)
    }
  }, [])

  const handleSave = async () => {
    if (!settings.email) {
      setMessage({ type: "error", text: "Por favor, introduce tu email" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Save to local storage
      const data = storage.load()
      data.settings.notifications = settings
      storage.save(data)

      // Subscribe to notifications if email is provided and subscribed is true
      if (settings.subscribed) {
        const response = await fetch("/api/notifications/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: settings.email, settings }),
        })

        if (!response.ok) {
          throw new Error("Error al suscribirse a las notificaciones")
        }
      }

      setMessage({ type: "success", text: "Configuración guardada correctamente" })
    } catch (error) {
      console.error("Error saving notification settings:", error)
      setMessage({ type: "error", text: "Error al guardar la configuración" })
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (updates: Partial<NotificationSettingsType>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const updateEventReminders = (updates: Partial<NotificationSettingsType["eventReminders"]>) => {
    setSettings((prev) => ({
      ...prev,
      eventReminders: { ...prev.eventReminders, ...updates },
    }))
  }

  const updateMonthlyDigest = (updates: Partial<NotificationSettingsType["monthlyDigest"]>) => {
    setSettings((prev) => ({
      ...prev,
      monthlyDigest: { ...prev.monthlyDigest, ...updates },
    }))
  }

  const updatePriceAlerts = (updates: Partial<NotificationSettingsType["priceAlerts"]>) => {
    setSettings((prev) => ({
      ...prev,
      priceAlerts: { ...prev.priceAlerts, ...updates },
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-purple mb-2">Configuración de Notificaciones</h2>
        <p className="text-purple/70">Configura cómo y cuándo quieres recibir recordatorios y actualizaciones</p>
      </div>

      {message && (
        <Card
          className={`border-l-4 ${message.type === "success" ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {message.type === "success" ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
              <p className={message.type === "success" ? "text-green-800" : "text-red-800"}>{message.text}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Configuration */}
      <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple">
            <Mail className="h-5 w-5" />
            <span>Configuración de Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-purple font-medium">
              Dirección de Email
            </Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => updateSettings({ email: e.target.value })}
              placeholder="tu@email.com"
              className="mt-1 border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
            />
            <p className="text-sm text-purple/60 mt-1">
              Usaremos este email para enviarte recordatorios y actualizaciones
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-purple font-medium">Suscribirse a Notificaciones</Label>
              <p className="text-sm text-purple/60">Recibir emails de recordatorios y actualizaciones</p>
            </div>
            <Switch
              checked={settings.subscribed}
              onCheckedChange={(checked) => updateSettings({ subscribed: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Reminders */}
      <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple">
            <Calendar className="h-5 w-5" />
            <span>Recordatorios de Eventos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-purple font-medium">Activar Recordatorios</Label>
              <p className="text-sm text-purple/60">Recibir recordatorios de cumpleaños y eventos especiales</p>
            </div>
            <Switch
              checked={settings.eventReminders.enabled}
              onCheckedChange={(enabled) => updateEventReminders({ enabled })}
            />
          </div>

          {settings.eventReminders.enabled && (
            <>
              <div>
                <Label className="text-purple font-medium">Recordatorio Personalizado</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.eventReminders.customDays}
                    onChange={(e) => updateEventReminders({ customDays: Number.parseInt(e.target.value) || 14 })}
                    className="w-20 border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                  />
                  <span className="text-purple/70">días antes del evento</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-purple font-medium">Una semana antes</Label>
                  <Switch
                    checked={settings.eventReminders.weekBefore}
                    onCheckedChange={(weekBefore) => updateEventReminders({ weekBefore })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-purple font-medium">Un día antes</Label>
                  <Switch
                    checked={settings.eventReminders.dayBefore}
                    onCheckedChange={(dayBefore) => updateEventReminders({ dayBefore })}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Monthly Digest */}
      <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple">
            <Bell className="h-5 w-5" />
            <span>Resumen Mensual</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-purple font-medium">Activar Resumen Mensual</Label>
              <p className="text-sm text-purple/60">Recibir un resumen de eventos próximos y estadísticas</p>
            </div>
            <Switch
              checked={settings.monthlyDigest.enabled}
              onCheckedChange={(enabled) => updateMonthlyDigest({ enabled })}
            />
          </div>

          {settings.monthlyDigest.enabled && (
            <div>
              <Label className="text-purple font-medium">Día del mes para enviar</Label>
              <Select
                value={settings.monthlyDigest.dayOfMonth.toString()}
                onValueChange={(value) => updateMonthlyDigest({ dayOfMonth: Number.parseInt(value) })}
              >
                <SelectTrigger className="mt-1 border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Día {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Alerts */}
      <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple">
            <DollarSign className="h-5 w-5" />
            <span>Alertas de Precio</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-purple font-medium">Activar Alertas de Precio</Label>
              <p className="text-sm text-purple/60">
                Recibir notificaciones cuando los regalos guardados tengan descuentos
              </p>
            </div>
            <Switch
              checked={settings.priceAlerts.enabled}
              onCheckedChange={(enabled) => updatePriceAlerts({ enabled })}
            />
          </div>

          {settings.priceAlerts.enabled && (
            <div>
              <Label className="text-purple font-medium">Umbral de descuento mínimo</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type="number"
                  min="5"
                  max="90"
                  step="5"
                  value={settings.priceAlerts.threshold}
                  onChange={(e) => updatePriceAlerts({ threshold: Number.parseInt(e.target.value) || 20 })}
                  className="w-20 border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
                <span className="text-purple/70">% de descuento</span>
              </div>
              <p className="text-sm text-purple/60 mt-1">
                Solo recibirás alertas cuando el descuento sea igual o mayor a este porcentaje
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading || !settings.email}
          className="bg-dusty hover:bg-dusty/90 text-white rounded-xl px-8"
        >
          {loading ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </div>
  )
}
