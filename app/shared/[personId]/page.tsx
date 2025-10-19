"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Heart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { storage, type Person, type SavedIdea } from "@/lib/storage"

export default function SharedPersonPage() {
  const params = useParams()
  const personId = params.personId as string
  const [person, setPerson] = useState<Person | null>(null)
  const [giftIdeas, setGiftIdeas] = useState<SavedIdea[]>([])
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    notes: "",
    price: "",
  })

  useEffect(() => {
    loadPersonData()
  }, [personId])

  const loadPersonData = () => {
    const data = storage.load()
    const foundPerson = data.people.find((p) => p.id === personId)
    if (foundPerson) {
      setPerson(foundPerson)
      const personIdeas = data.giftIdeas.filter((idea) => idea.personId === personId)
      setGiftIdeas(personIdeas)
    }
  }

  const addGiftIdea = () => {
    if (!newIdea.title.trim() || !person) return

    const data = storage.load()
    const idea: SavedIdea = {
      id: `shared-idea-${Date.now()}`,
      personId: person.id,
      title: newIdea.title.trim(),
      description: newIdea.description.trim(),
      price: newIdea.price ? Number.parseFloat(newIdea.price) : undefined,
      category: "Sugerencia Compartida",
      status: "pending",
      notes: newIdea.notes.trim(),
      createdAt: new Date().toISOString(),
    }

    data.giftIdeas.push(idea)
    storage.save(data)

    setGiftIdeas([...giftIdeas, idea])
    setNewIdea({ title: "", description: "", notes: "", price: "" })
  }

  const updateNotes = (ideaId: string, notes: string) => {
    const data = storage.load()
    const ideaIndex = data.giftIdeas.findIndex((idea) => idea.id === ideaId)
    if (ideaIndex !== -1) {
      data.giftIdeas[ideaIndex].notes = notes
      storage.save(data)
      setGiftIdeas(giftIdeas.map((idea) => (idea.id === ideaId ? { ...idea, notes } : idea)))
    }
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-dusty/50 mx-auto mb-4" />
          <h2 className="text-xl font-display text-purple mb-2">Persona no encontrada</h2>
          <p className="text-purple/60">El enlace compartido no es válido o ha expirado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-white border-b border-dusty/20 px-6 py-4">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-dusty fill-dusty" />
          <span className="text-xl font-display font-bold text-purple">Memento</span>
          <span className="text-purple/60">- Perfil Compartido</span>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Person Info */}
        <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
          <div className="h-24 bg-gradient-to-r from-dusty/20 to-purple/20"></div>
          <CardContent className="p-6 -mt-8">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <span className="text-dusty font-bold text-lg">
                  {person.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1 pt-2">
                <h1 className="text-2xl font-display font-bold text-purple">{person.name}</h1>
                <p className="text-purple/60 capitalize">{person.relationship}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {person.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-dusty/10 text-dusty text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {person.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-purple/10 text-purple text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
                {person.notes && <p className="text-sm text-purple/70 italic mt-2">"{person.notes}"</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Idea */}
        <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
          <CardHeader>
            <CardTitle className="text-xl font-display text-purple">Añadir Idea de Regalo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Título de la idea"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
              />
              <Input
                placeholder="Precio (opcional)"
                type="number"
                value={newIdea.price}
                onChange={(e) => setNewIdea({ ...newIdea, price: e.target.value })}
                className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
              />
            </div>
            <Input
              placeholder="Descripción breve"
              value={newIdea.description}
              onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
              className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
            />
            <Textarea
              placeholder="Notas adicionales..."
              value={newIdea.notes}
              onChange={(e) => setNewIdea({ ...newIdea, notes: e.target.value })}
              className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
            />
            <Button onClick={addGiftIdea} className="bg-dusty hover:bg-dusty/90 text-white rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Añadir Idea
            </Button>
          </CardContent>
        </Card>

        {/* Existing Ideas */}
        <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
          <CardHeader>
            <CardTitle className="text-xl font-display text-purple">Ideas de Regalo ({giftIdeas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {giftIdeas.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-dusty/50 mx-auto mb-4" />
                <p className="text-purple/60">Aún no hay ideas de regalo para {person.name}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {giftIdeas.map((idea) => (
                  <div key={idea.id} className="border border-dusty/10 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-purple">{idea.title}</h4>
                      {idea.price && <span className="text-sm font-medium text-purple">${idea.price}</span>}
                    </div>
                    {idea.description && <p className="text-sm text-purple/60 mb-2">{idea.description}</p>}
                    <Textarea
                      placeholder="Añadir notas..."
                      value={idea.notes}
                      onChange={(e) => updateNotes(idea.id, e.target.value)}
                      className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
