"use client"

import { useEffect, useState } from "react"
import { Bell, Gift, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { storage, type Person, type Event } from "@/lib/storage"

interface Reminder {
  id: string
  type: "birthday" | "anniversary" | "event"
  person: Person
  event?: Event
  daysUntil: number
  message: string
}

export function ReminderSystem() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showReminders, setShowReminders] = useState(false)

  useEffect(() => {
    checkReminders()
    // Check reminders every hour
    const interval = setInterval(checkReminders, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const checkReminders = () => {
    const data = storage.load()
    const today = new Date()
    const upcomingReminders: Reminder[] = []

    data.people.forEach((person) => {
      // Check birthday
      if (person.birthday) {
        const birthday = new Date(person.birthday)
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())

        // If birthday already passed this year, check next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1)
        }

        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        // Show reminders for events within 30 days
        if (daysUntil <= 30 && daysUntil >= 0) {
          upcomingReminders.push({
            id: `birthday-${person.id}`,
            type: "birthday",
            person,
            daysUntil,
            message:
              daysUntil === 0
                ? `¡Hoy es el cumpleaños de ${person.name}!`
                : daysUntil === 1
                  ? `El cumpleaños de ${person.name} es mañana`
                  : `El cumpleaños de ${person.name} es en ${daysUntil} días`,
          })
        }
      }

      // Check anniversary
      if (person.anniversary) {
        const anniversary = new Date(person.anniversary)
        const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate())

        if (thisYearAnniversary < today) {
          thisYearAnniversary.setFullYear(today.getFullYear() + 1)
        }

        const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntil <= 30 && daysUntil >= 0) {
          upcomingReminders.push({
            id: `anniversary-${person.id}`,
            type: "anniversary",
            person,
            daysUntil,
            message:
              daysUntil === 0
                ? `¡Hoy es el aniversario con ${person.name}!`
                : daysUntil === 1
                  ? `El aniversario con ${person.name} es mañana`
                  : `El aniversario con ${person.name} es en ${daysUntil} días`,
          })
        }
      }

      // Check other events
      person.otherEvents?.forEach((event) => {
        const eventDate = new Date(event.date)
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntil <= 30 && daysUntil >= 0) {
          upcomingReminders.push({
            id: `event-${event.id}`,
            type: "event",
            person,
            event,
            daysUntil,
            message:
              daysUntil === 0
                ? `¡Hoy es ${event.title}!`
                : daysUntil === 1
                  ? `${event.title} es mañana`
                  : `${event.title} es en ${daysUntil} días`,
          })
        }
      })
    })

    // Sort by days until event
    upcomingReminders.sort((a, b) => a.daysUntil - b.daysUntil)
    setReminders(upcomingReminders)
    setShowReminders(upcomingReminders.length > 0)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return Gift
      case "anniversary":
        return Gift
      default:
        return Calendar
    }
  }

  const getPriorityColor = (daysUntil: number) => {
    if (daysUntil === 0) return "bg-red-100 border-red-300 text-red-800"
    if (daysUntil <= 3) return "bg-orange-100 border-orange-300 text-orange-800"
    if (daysUntil <= 7) return "bg-yellow-100 border-yellow-300 text-yellow-800"
    return "bg-blue-100 border-blue-300 text-blue-800"
  }

  if (!showReminders || reminders.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <Card className="bg-white rounded-2xl shadow-lg border-dusty/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-dusty" />
              <h3 className="font-display font-bold text-purple">Recordatorios</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReminders(false)}
              className="text-purple/60 hover:text-purple"
            >
              ×
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {reminders.slice(0, 5).map((reminder) => {
              const IconComponent = getIcon(reminder.type)
              return (
                <div key={reminder.id} className={`p-3 rounded-lg border ${getPriorityColor(reminder.daysUntil)}`}>
                  <div className="flex items-start space-x-2">
                    <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{reminder.message}</p>
                      {reminder.daysUntil > 0 && (
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(Date.now() + reminder.daysUntil * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {reminders.length > 5 && (
            <p className="text-xs text-purple/60 mt-2 text-center">+{reminders.length - 5} recordatorios más</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
