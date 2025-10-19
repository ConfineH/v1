"use client"

import { useState } from "react"
import { X, Edit, Trash2, Save, Calendar, User, Tag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { storage, type Person, type Event } from "@/lib/storage"

interface EventDetailModalProps {
  event: any // Can be Event or system event
  people: Person[]
  onClose: () => void
  onUpdate: () => void
}

export function EventDetailModal({ event, people, onClose, onUpdate }: EventDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: event.title || "",
    date: event.eventData?.date || "",
    personId: event.eventData?.personId || "",
    recurring: event.eventData?.recurring || false,
  })

  const isSystemEvent = event.type === "birthday" || event.type === "anniversary"
  const canEdit = event.canEdit && !isSystemEvent
  const canDelete = event.canDelete && !isSystemEvent

  const getPersonName = (personId: string) => {
    const person = people.find((p) => p.id === personId)
    return person?.name || "General"
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "birthday":
        return "Cumpleaños"
      case "anniversary":
        return "Aniversario"
      case "custom":
        return "Evento Personalizado"
      default:
        return "Evento"
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "birthday":
        return "bg-dusty text-white"
      case "anniversary":
        return "bg-purple text-white"
      case "custom":
        return "bg-gold text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no especificada"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const saveChanges = () => {
    if (!editData.title.trim() || !editData.date) {
      alert("Por favor completa el título y la fecha")
      return
    }

    const data = storage.load()
    const eventIndex = data.events.findIndex((e) => e.id === event.id)

    if (eventIndex !== -1) {
      const updatedEvent: Event = {
        ...data.events[eventIndex],
        title: editData.title.trim(),
        date: editData.date,
        personId: editData.personId,
        recurring: editData.recurring,
      }

      data.events[eventIndex] = updatedEvent
      storage.save(data)

      alert(`✅ "${updatedEvent.title}" actualizado correctamente`)
      setIsEditing(false)
      onUpdate()
    }
  }

  const deleteEvent = () => {
    if (!canDelete) return

    if (confirm(`¿Estás seguro de que quieres eliminar "${event.title}"?`)) {
      const data = storage.load()
      data.events = data.events.filter((e) => e.id !== event.id)
      storage.save(data)

      alert(`🗑️ "${event.title}" eliminado`)
      onClose()
      onUpdate()
    }
  }

  const cancelEditing = () => {
    setEditData({
      title: event.title || "",
      date: event.eventData?.date || "",
      personId: event.eventData?.personId || "",
      recurring: event.eventData?.recurring || false,
    })
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${event.color}`}></div>
            <CardTitle className="text-xl font-display text-purple">
              {isEditing ? "Editar Evento" : "Detalles del Evento"}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-purple/60 hover:text-purple">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Type Badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${getEventTypeColor(event.type)} px-3 py-1`}>{getEventTypeLabel(event.type)}</Badge>
            {isSystemEvent && (
              <Badge variant="outline" className="text-xs border-purple/20 text-purple">
                Evento del Sistema
              </Badge>
            )}
          </div>

          {/* Event Title */}
          <div className="space-y-2">
            <Label className="text-purple font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Título del Evento
            </Label>
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Título del evento"
                className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
              />
            ) : (
              <div className="p-3 bg-dusty/5 rounded-xl">
                <p className="text-purple font-medium text-lg">{event.title}</p>
              </div>
            )}
          </div>

          {/* Event Date */}
          <div className="space-y-2">
            <Label className="text-purple font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Fecha
            </Label>
            {isEditing ? (
              <Input
                type="date"
                value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
              />
            ) : (
              <div className="p-3 bg-dusty/5 rounded-xl">
                <p className="text-purple capitalize">{formatDate(event.eventData?.date || "")}</p>
              </div>
            )}
          </div>

          {/* Associated Person */}
          <div className="space-y-2">
            <Label className="text-purple font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Persona Asociada
            </Label>
            {isEditing ? (
              <Select
                value={editData.personId || "none"}
                onValueChange={(value) => setEditData({ ...editData, personId: value === "none" ? "" : value })}
              >
                <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                  <SelectValue placeholder="Seleccionar persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Evento general</SelectItem>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-dusty/5 rounded-xl">
                <p className="text-purple">{event.person || "Evento general"}</p>
              </div>
            )}
          </div>

          {/* Recurring Event */}
          {(canEdit || event.eventData?.recurring) && (
            <div className="space-y-2">
              <Label className="text-purple font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Configuración
              </Label>
              {isEditing ? (
                <div className="flex items-center space-x-2 p-3 bg-dusty/5 rounded-xl">
                  <input
                    type="checkbox"
                    id="recurring-edit"
                    checked={editData.recurring}
                    onChange={(e) => setEditData({ ...editData, recurring: e.target.checked })}
                    className="rounded border-dusty/30 text-dusty focus:ring-dusty/20"
                  />
                  <Label htmlFor="recurring-edit" className="text-purple text-sm">
                    Evento recurrente (anual)
                  </Label>
                </div>
              ) : (
                <div className="p-3 bg-dusty/5 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Badge variant={event.eventData?.recurring ? "default" : "secondary"} className="text-xs">
                      {event.eventData?.recurring ? "Recurrente" : "Evento único"}
                    </Badge>
                    {event.eventData?.recurring && <span className="text-xs text-purple/60">Se repite cada año</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* System Event Info */}
          {isSystemEvent && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">ℹ️</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">Evento del Sistema</h4>
                  <p className="text-blue-700 text-xs mt-1">
                    Este evento se genera automáticamente desde el perfil de {event.person}. Para modificarlo, edita la
                    información en la página de Personas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-dusty/10">
            {isEditing ? (
              <>
                <Button onClick={saveChanges} className="flex-1 bg-dusty hover:bg-dusty/90 text-white rounded-xl">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  className="flex-1 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                {canEdit && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Evento
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
                >
                  Cerrar
                </Button>
              </>
            )}
          </div>

          {/* Delete Button */}
          {canDelete && !isEditing && (
            <Button
              variant="outline"
              onClick={deleteEvent}
              className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Evento
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
