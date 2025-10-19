"use client"

import { useState, useEffect } from "react"
import { Calendar, Gift, Heart, Plus, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type Person, type Event } from "@/lib/storage"
import Link from "next/link"
import { QuickStartModal } from "@/components/onboarding/quick-start-modal"

export function SimpleDashboard() {
  const [people, setPeople] = useState<Person[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [savedIdeasCount, setSavedIdeasCount] = useState(0)
  const [showQuickStart, setShowQuickStart] = useState(false)

  useEffect(() => {
    loadData()

    const handleUpdate = () => loadData()
    document.addEventListener("memento:data-updated", handleUpdate)
    return () => document.removeEventListener("memento:data-updated", handleUpdate)
  }, [])

  const loadData = () => {
    const data = storage.load()
    setPeople(data.people)
    setSavedIdeasCount(data.savedIdeas?.length || 0)

    // Get upcoming events (next 90 days)
    const today = new Date()
    const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)

    const upcoming = data.events
      .filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate >= today && eventDate <= in90Days
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)

    setUpcomingEvents(upcoming)

    // Show quick start if no people added yet
    if (data.people.length === 0 && !data.settings.hasSeenOnboarding) {
      setShowQuickStart(true)
    }
  }

  const getPersonName = (personId?: string) => {
    if (!personId) return "General"
    const person = people.find((p) => p.id === personId)
    return person?.name || "Desconocido"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoy"
    if (diffDays === 1) return "Mañana"
    if (diffDays < 7) return `En ${diffDays} días`

    return date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-display font-bold text-purple mb-2">¡Bienvenido a Memento!</h1>
              <p className="text-purple/70">Tu asistente personal para regalos memorables</p>
            </div>
            <Heart className="h-12 w-12 text-dusty fill-dusty" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple/70">Personas</CardTitle>
              <Calendar className="h-4 w-4 text-dusty" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple">{people.length}</div>
              <p className="text-xs text-purple/60 mt-1">en tu lista</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple/70">Próximos Eventos</CardTitle>
              <TrendingUp className="h-4 w-4 text-dusty" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple">{upcomingEvents.length}</div>
              <p className="text-xs text-purple/60 mt-1">en los próximos 90 días</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple/70">Ideas Guardadas</CardTitle>
              <Gift className="h-4 w-4 text-dusty" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple">{savedIdeasCount}</div>
              <p className="text-xs text-purple/60 mt-1">listas para regalar</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-dusty to-dusty/80 text-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Añade tu primera persona</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-6">
                Empieza añadiendo a alguien especial. Te ayudaremos a recordar sus fechas importantes y encontrar el
                regalo perfecto.
              </p>
              <Link href="/add-person">
                <Button className="bg-white text-dusty hover:bg-white/90 rounded-xl w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Persona
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple to-purple/80 text-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Explora ideas de regalo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-6">
                Descubre sugerencias personalizadas basadas en intereses, ocasiones y presupuestos.
              </p>
              <Link href="/gift-suggestions">
                <Button className="bg-white text-purple hover:bg-white/90 rounded-xl w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Ver Sugerencias
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
            <CardHeader>
              <CardTitle className="text-xl font-display text-purple">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-cream rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="bg-dusty/10 p-3 rounded-lg">
                        <Calendar className="h-5 w-5 text-dusty" />
                      </div>
                      <div>
                        <h3 className="font-medium text-purple">{event.title}</h3>
                        <p className="text-sm text-purple/60">
                          {getPersonName(event.recipientIds?.[0])} • {formatDate(event.date)}
                        </p>
                      </div>
                    </div>
                    <Link href="/gift-suggestions">
                      <Button
                        variant="outline"
                        className="border-dusty/30 text-dusty hover:bg-dusty/5 rounded-xl bg-transparent"
                      >
                        Ver Ideas
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <Link href="/calendar" className="block mt-4">
                <Button
                  variant="outline"
                  className="w-full border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
                >
                  Ver Todos los Eventos
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {people.length === 0 && (
          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10 text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-dusty/20 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-purple mb-2">Empieza tu viaje de regalos</h3>
              <p className="text-purple/60 mb-6">Añade personas, crea eventos y encuentra ideas increíbles</p>
              <Link href="/add-person">
                <Button className="bg-dusty hover:bg-dusty/90 text-white rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Primera Persona
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {showQuickStart && <QuickStartModal onClose={() => setShowQuickStart(false)} />}
    </div>
  )
}
