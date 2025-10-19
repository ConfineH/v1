"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, Heart, Gift, TrendingUp, Clock, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { storage, type Person, type SavedIdea, type Event } from "@/lib/storage"
import { NotificationSettings } from "@/components/notifications/notification-settings"
import { MainLayout } from "@/components/layout/main-layout"
import { QuickStartModal } from "@/components/onboarding/quick-start-modal"

export function DashboardContent() {
  const [people, setPeople] = useState<Person[]>([])
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    loadData()
    const data = storage.load()
    if (!data.settings.hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const loadData = () => {
    try {
      const data = storage.load()
      setPeople(data.people || [])
      setSavedIdeas(data.giftIdeas || data.savedIdeas || [])
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUpcomingEvents = () => {
    const today = new Date()
    const upcoming = []

    // Add birthdays
    people.forEach((person) => {
      if (person.birthday) {
        const birthday = new Date(person.birthday)
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1)
        }
        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 30) {
          upcoming.push({
            id: `birthday-${person.id}`,
            title: `Cumpleaños de ${person.name}`,
            date: thisYearBirthday,
            daysUntil,
            type: "birthday",
            person: person.name,
          })
        }
      }

      // Add anniversaries
      if (person.anniversary) {
        const anniversary = new Date(person.anniversary)
        const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate())
        if (thisYearAnniversary < today) {
          thisYearAnniversary.setFullYear(today.getFullYear() + 1)
        }
        const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 30) {
          upcoming.push({
            id: `anniversary-${person.id}`,
            title: `Aniversario con ${person.name}`,
            date: thisYearAnniversary,
            daysUntil,
            type: "anniversary",
            person: person.name,
          })
        }
      }

      // Add other events
      person.otherEvents?.forEach((event) => {
        const eventDate = new Date(event.date)
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntil <= 30 && daysUntil >= 0) {
          upcoming.push({
            id: event.id,
            title: event.title,
            date: eventDate,
            daysUntil,
            type: "custom",
            person: person.name,
          })
        }
      })
    })

    // Add standalone events
    events.forEach((event) => {
      const eventDate = new Date(event.date)
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil <= 30 && daysUntil >= 0) {
        const person = people.find((p) => p.id === event.personId)
        upcoming.push({
          id: event.id,
          title: event.title,
          date: eventDate,
          daysUntil,
          type: "event",
          person: person?.name || "Sin asignar",
        })
      }
    })

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5)
  }

  const getRecentIdeas = () => {
    return savedIdeas
      .sort((a, b) => new Date(b.createdAt || b.savedAt).getTime() - new Date(a.createdAt || a.savedAt).getTime())
      .slice(0, 5)
  }

  const getStats = () => {
    const totalPeople = people.length
    const totalIdeas = savedIdeas.length
    const purchasedIdeas = savedIdeas.filter((idea) => idea.status === "purchased").length
    const upcomingEvents = getUpcomingEvents().length

    return {
      totalPeople,
      totalIdeas,
      purchasedIdeas,
      upcomingEvents,
    }
  }

  const stats = getStats()
  const upcomingEvents = getUpcomingEvents()
  const recentIdeas = getRecentIdeas()

  const handleOnboardingComplete = () => {
    const data = storage.load()
    data.settings.hasSeenOnboarding = true
    storage.save(data)
    setShowOnboarding(false)
  }

  return (
    <>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-display font-bold text-purple">Dashboard</h1>
            <p className="text-purple/70 mt-1">Resumen de tu actividad y próximos eventos</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-purple/5 to-dusty/5 rounded-2xl shadow-sm border-dusty/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple/70 text-sm font-medium">Personas</p>
                        <p className="text-2xl font-display font-bold text-purple">{stats.totalPeople}</p>
                      </div>
                      <div className="w-12 h-12 bg-dusty/20 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-dusty" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple/5 to-dusty/5 rounded-2xl shadow-sm border-dusty/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple/70 text-sm font-medium">Ideas Guardadas</p>
                        <p className="text-2xl font-display font-bold text-purple">{stats.totalIdeas}</p>
                      </div>
                      <div className="w-12 h-12 bg-dusty/20 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-dusty" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple/5 to-dusty/5 rounded-2xl shadow-sm border-dusty/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple/70 text-sm font-medium">Regalos Comprados</p>
                        <p className="text-2xl font-display font-bold text-purple">{stats.purchasedIdeas}</p>
                      </div>
                      <div className="w-12 h-12 bg-dusty/20 rounded-full flex items-center justify-center">
                        <Gift className="h-6 w-6 text-dusty" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple/5 to-dusty/5 rounded-2xl shadow-sm border-dusty/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple/70 text-sm font-medium">Eventos Próximos</p>
                        <p className="text-2xl font-display font-bold text-purple">{stats.upcomingEvents}</p>
                      </div>
                      <div className="w-12 h-12 bg-dusty/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-dusty" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple">
                      <Clock className="h-5 w-5" />
                      <span>Próximos Eventos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-3 bg-dusty/5 rounded-xl">
                            <div>
                              <p className="font-medium text-purple">{event.title}</p>
                              <p className="text-sm text-purple/70">{event.person}</p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  event.daysUntil <= 7 ? "destructive" : event.daysUntil <= 14 ? "default" : "secondary"
                                }
                                className="rounded-full"
                              >
                                {event.daysUntil === 0
                                  ? "Hoy"
                                  : event.daysUntil === 1
                                    ? "Mañana"
                                    : `${event.daysUntil}d`}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={() => (window.location.href = "/calendar")}
                          variant="outline"
                          className="w-full border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                        >
                          Ver Calendario Completo
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-purple/30 mx-auto mb-3" />
                        <p className="text-purple/60 mb-4">No hay eventos próximos</p>
                        <Button
                          onClick={() => (window.location.href = "/people")}
                          className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                        >
                          Añadir Personas
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Ideas */}
                <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple">
                      <Star className="h-5 w-5" />
                      <span>Ideas Recientes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentIdeas.length > 0 ? (
                      <div className="space-y-4">
                        {recentIdeas.map((idea) => {
                          const person = people.find((p) => p.id === idea.personId)
                          return (
                            <div key={idea.id} className="flex items-center space-x-3 p-3 bg-dusty/5 rounded-xl">
                              <img
                                src={idea.imageUrl || "/placeholder.svg"}
                                alt={idea.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-purple truncate">{idea.title}</p>
                                <p className="text-sm text-purple/70">{person?.name || "Sin asignar"}</p>
                              </div>
                              <Badge
                                variant={idea.status === "purchased" ? "default" : "secondary"}
                                className="rounded-full"
                              >
                                {idea.status === "purchased" ? "Comprado" : "Guardado"}
                              </Badge>
                            </div>
                          )
                        })}
                        <Button
                          onClick={() => (window.location.href = "/ideas")}
                          variant="outline"
                          className="w-full border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                        >
                          Ver Todas las Ideas
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-purple/30 mx-auto mb-3" />
                        <p className="text-purple/60 mb-4">No tienes ideas guardadas</p>
                        <Button
                          onClick={() => (window.location.href = "/gift-suggestions")}
                          className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                        >
                          Explorar Sugerencias
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple">
                    <TrendingUp className="h-5 w-5" />
                    <span>Acciones Rápidas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => (window.location.href = "/add-person")}
                      variant="outline"
                      className="h-20 flex-col space-y-2 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                    >
                      <Users className="h-6 w-6" />
                      <span>Añadir Persona</span>
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/gift-suggestions")}
                      variant="outline"
                      className="h-20 flex-col space-y-2 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                    >
                      <Gift className="h-6 w-6" />
                      <span>Buscar Regalos</span>
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/calendar")}
                      variant="outline"
                      className="h-20 flex-col space-y-2 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                    >
                      <Calendar className="h-6 w-6" />
                      <span>Ver Calendario</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
      {showOnboarding && <QuickStartModal onComplete={handleOnboardingComplete} />}
    </>
  )
}
