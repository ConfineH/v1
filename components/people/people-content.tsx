"use client"

import { useState, useEffect } from "react"
import { Plus, Clock, Share2, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { storage, type Person } from "@/lib/storage"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function PeopleContent() {
  const [people, setPeople] = useState<Person[]>([])
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const data = storage.load()
    setPeople(data.people)
  }

  const sharePersonProfile = (personId: string) => {
    const shareUrl = `${window.location.origin}/shared/${personId}`
    navigator.clipboard.writeText(shareUrl)
    alert("Enlace copiado al portapapeles")
  }

  const editPerson = (personId: string) => {
    router.push(`/edit-person/${personId}`)
  }

  const deletePerson = (personId: string) => {
    const person = people.find((p) => p.id === personId)
    if (!person) return

    if (
      confirm(
        `¿Estás seguro de que quieres eliminar a ${person.name}? Esta acción también eliminará todas las ideas de regalo y eventos asociados.`,
      )
    ) {
      const data = storage.load()

      // Remove person
      data.people = data.people.filter((p) => p.id !== personId)

      // Remove associated gift ideas
      data.giftIdeas = data.giftIdeas.filter((idea) => idea.personId !== personId)

      // Remove associated events
      data.events = data.events.filter((event) => event.personId !== personId)

      // Remove from gift history
      data.giftHistory = data.giftHistory.filter((history) => history.personId !== personId)

      storage.save(data)

      // Update local state
      setPeople(data.people)

      alert(`${person.name} ha sido eliminado junto con toda su información asociada`)
    }
  }

  const calculateNextEvent = (person: Person) => {
    const today = new Date()
    let nextEvent = null
    let minDays = Number.POSITIVE_INFINITY

    if (person.birthday) {
      const birthday = new Date(person.birthday)
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil < minDays) {
        minDays = daysUntil
        nextEvent = {
          type: "Birthday",
          date: thisYearBirthday.toISOString(),
          daysLeft: daysUntil,
        }
      }
    }

    if (person.anniversary) {
      const anniversary = new Date(person.anniversary)
      const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate())
      if (thisYearAnniversary < today) {
        thisYearAnniversary.setFullYear(today.getFullYear() + 1)
      }
      const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil < minDays) {
        minDays = daysUntil
        nextEvent = {
          type: "Anniversary",
          date: thisYearAnniversary.toISOString(),
          daysLeft: daysUntil,
        }
      }
    }

    return (
      nextEvent || {
        type: "No upcoming events",
        date: "",
        daysLeft: 0,
      }
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-purple">People</h1>
        <Link href="/add-person">
          <Button className="bg-dusty hover:bg-dusty/90 text-white rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person) => {
          const nextEvent = calculateNextEvent(person)

          return (
            <Card
              key={person.id}
              className="bg-white rounded-2xl shadow-sm border-dusty/10 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-24 bg-gradient-to-r from-dusty/20 to-purple/20"></div>
              <CardContent className="p-6 -mt-8">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16 border-4 border-white shadow-sm">
                    <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
                    <AvatarFallback className="bg-dusty/10 text-dusty font-medium text-lg">
                      {person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 pt-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-bold text-lg text-purple">{person.name}</h3>
                        <p className="text-purple/60 text-sm capitalize">{person.relationship}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-purple/60 hover:text-purple">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => editPerson(person.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => sharePersonProfile(person.id)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Compartir
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deletePerson(person.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {nextEvent.type !== "No upcoming events" && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-dusty" />
                      <span className="text-purple">
                        {nextEvent.type} in {nextEvent.daysLeft} days
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {[...person.tags, ...person.interests].slice(0, 3).map((item) => (
                      <Badge key={item} variant="secondary" className="bg-dusty/10 text-dusty text-xs">
                        {item}
                      </Badge>
                    ))}
                    {[...person.tags, ...person.interests].length > 3 && (
                      <Badge variant="secondary" className="bg-purple/10 text-purple text-xs">
                        +{[...person.tags, ...person.interests].length - 3} more
                      </Badge>
                    )}
                  </div>

                  {person.notes && <p className="text-sm text-purple/70 italic">"{person.notes}"</p>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
