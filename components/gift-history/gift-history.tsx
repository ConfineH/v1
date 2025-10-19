"use client"

import { useEffect, useState } from "react"
import { Calendar, Gift, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage, type GiftHistory, type Person, type SavedIdea } from "@/lib/storage"

export function GiftHistoryComponent() {
  const [history, setHistory] = useState<GiftHistory[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [giftIdeas, setGiftIdeas] = useState<SavedIdea[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const data = storage.load()
    setHistory(data.giftHistory)
    setPeople(data.people)
    setGiftIdeas(data.giftIdeas)
  }

  const getPersonName = (personId: string) => {
    return people.find((p) => p.id === personId)?.name || "Persona desconocida"
  }

  const getGiftTitle = (giftIdeaId: string) => {
    return giftIdeas.find((g) => g.id === giftIdeaId)?.title || "Regalo desconocido"
  }

  const addToHistory = (personId: string, giftIdeaId: string, eventId: string) => {
    const data = storage.load()
    const newHistoryEntry: GiftHistory = {
      id: `history-${Date.now()}`,
      personId,
      giftIdeaId,
      eventId,
      date: new Date().toISOString(),
      notes: "",
    }

    data.giftHistory.push(newHistoryEntry)
    storage.save(data)
    setHistory([...history, newHistoryEntry])
  }

  return (
    <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
      <CardHeader>
        <CardTitle className="text-xl font-display text-purple flex items-center space-x-2">
          <Gift className="h-5 w-5" />
          <span>Historial de Regalos</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-dusty/50 mx-auto mb-4" />
            <p className="text-purple/60">Aún no hay regalos en el historial</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="border border-dusty/10 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-dusty" />
                      <span className="font-medium text-purple">{getPersonName(entry.personId)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-purple" />
                      <span className="text-purple/80">{getGiftTitle(entry.giftIdeaId)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-purple/60" />
                      <span className="text-sm text-purple/60">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Regalado
                  </Badge>
                </div>
                {entry.notes && <p className="text-sm text-purple/70 mt-2 italic">"{entry.notes}"</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
