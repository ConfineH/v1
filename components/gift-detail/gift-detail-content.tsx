"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Check,
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Tag,
  Calendar,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { storage, type Person } from "@/lib/storage"
import { staticSuggestions, type StaticSuggestion } from "@/lib/static-suggestions"
import { trackEvents } from "@/components/analytics/tracking"

export function GiftDetailContent() {
  const params = useParams()
  const router = useRouter()
  const giftId = params.giftId as string

  const [gift, setGift] = useState<StaticSuggestion | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [notes, setNotes] = useState("")
  const [selectedPerson, setSelectedPerson] = useState("")
  const [isVisitingStore, setIsVisitingStore] = useState(false)
  const [hasVisitedStore, setHasVisitedStore] = useState(false)

  useEffect(() => {
    loadGiftData()
  }, [giftId])

  const loadGiftData = () => {
    // Find gift in static suggestions
    const foundGift = staticSuggestions.find((g) => g.id === giftId)
    if (foundGift) {
      setGift(foundGift)
    }

    // Load people data
    const data = storage.load()
    setPeople(data.people)

    // Check if this gift is already saved and load existing notes
    const existingIdea = data.giftIdeas.find((idea) => idea.title === foundGift?.title)
    if (existingIdea) {
      setNotes(existingIdea.notes)
      setSelectedPerson(existingIdea.personId)
    }
  }

  const visitStore = () => {
    if (!gift) return

    setIsVisitingStore(true)

    // Use real link if available, otherwise simulate
    const storeUrl = gift.realLink || `https://tienda.com/producto/${gift.title.toLowerCase().replace(/\s+/g, "-")}`

    // Open in new tab
    window.open(storeUrl, "_blank")

    // Track the visit
    console.log(`Visiting store for: ${gift.title}`)

    // After a short delay, show the "Did you purchase?" prompt
    setTimeout(() => {
      setIsVisitingStore(false)
      setHasVisitedStore(true)
    }, 2000)
  }

  const saveGiftIdea = () => {
    if (!gift) return

    const data = storage.load()

    // Check if already saved
    const existingIdea = data.giftIdeas.find(
      (idea) => idea.title === gift.title && (selectedPerson === "" || idea.personId === selectedPerson),
    )

    if (existingIdea) {
      // Update existing idea
      existingIdea.notes = notes
      existingIdea.personId = selectedPerson
    } else {
      // Create new idea
      const newIdea = {
        id: `detail-${Date.now()}`,
        personId: selectedPerson,
        title: gift.title,
        description: gift.description,
        price: gift.price,
        category: gift.category,
        status: "pending" as const,
        notes: notes,
        createdAt: new Date().toISOString(),
      }
      data.giftIdeas.push(newIdea)
    }

    storage.save(data)
    trackEvents.saveGiftIdea(gift.category, gift.price)

    alert(`💾 "${gift.title}" guardado en Ideas Vault`)
  }

  const markAsPurchased = () => {
    if (!gift) return

    const data = storage.load()

    // Find or create the gift idea
    let existingIdea = data.giftIdeas.find(
      (idea) => idea.title === gift.title && (selectedPerson === "" || idea.personId === selectedPerson),
    )

    if (!existingIdea) {
      existingIdea = {
        id: `purchased-detail-${Date.now()}`,
        personId: selectedPerson,
        title: gift.title,
        description: gift.description,
        price: gift.price,
        category: gift.category,
        status: "purchased" as const,
        notes: notes || "Comprado desde vista detallada",
        createdAt: new Date().toISOString(),
        purchasedAt: new Date().toISOString(),
      }
      data.giftIdeas.push(existingIdea)
    } else {
      existingIdea.status = "purchased"
      existingIdea.purchasedAt = new Date().toISOString()
      existingIdea.notes = notes
    }

    // Add to gift history if person is selected
    if (selectedPerson) {
      const historyEntry = {
        id: `history-${Date.now()}`,
        personId: selectedPerson,
        giftIdeaId: existingIdea.id,
        eventId: "",
        date: new Date().toISOString(),
        notes: "Comprado desde vista detallada del regalo",
      }
      data.giftHistory.push(historyEntry)
    }

    storage.save(data)

    alert(`✅ "${gift.title}" marcado como comprado`)
    setHasVisitedStore(false)
  }

  const shareGift = () => {
    if (!gift) return

    const shareUrl = `${window.location.origin}/gift-detail/${gift.id}`
    navigator.clipboard.writeText(shareUrl)
    alert("Enlace del regalo copiado al portapapeles")
  }

  const getPersonName = (personId: string) => {
    const person = people.find((p) => p.id === personId)
    return person?.name || "Seleccionar persona"
  }

  if (!gift) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-dusty/50 mx-auto mb-4" />
          <h2 className="text-xl font-display text-purple mb-2">Regalo no encontrado</h2>
          <p className="text-purple/60">El regalo que buscas no existe</p>
          <Button onClick={() => router.back()} className="mt-4 bg-dusty hover:bg-dusty/90 text-white rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button
          variant="outline"
          onClick={shareGift}
          className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartir
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gift Image and Basic Info */}
        <div className="space-y-6">
          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10 overflow-hidden">
            <div className="aspect-square relative">
              <img src={gift.imageUrl || "/placeholder.svg"} alt={gift.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4">
                <Badge className="bg-dusty text-white text-sm px-3 py-1">{gift.category}</Badge>
              </div>
            </div>
          </Card>

          {/* Store Visit Section */}
          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
            <CardHeader>
              <CardTitle className="text-lg font-display text-purple flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Comprar Regalo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasVisitedStore ? (
                <div className="space-y-3">
                  <p className="text-purple/70 text-sm">
                    Te llevaremos a la tienda online donde puedes comprar este regalo.
                  </p>
                  <Button
                    onClick={visitStore}
                    disabled={isVisitingStore}
                    className="w-full bg-dusty hover:bg-dusty/90 text-white rounded-xl py-3"
                  >
                    {isVisitingStore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Abriendo tienda...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visitar Tienda Online
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-center">
                    <h4 className="font-medium text-blue-900 mb-2">¿Compraste este regalo?</h4>
                    <p className="text-sm text-blue-700 mb-4">
                      Si completaste la compra, márcalo como comprado para llevarlo a tu historial.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={markAsPurchased}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Sí, lo compré
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setHasVisitedStore(false)}
                      className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl bg-transparent"
                    >
                      No, solo miré
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gift Details and Actions */}
        <div className="space-y-6">
          {/* Main Info */}
          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
            <CardContent className="p-6 space-y-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-purple mb-2">{gift.title}</h1>
                <p className="text-purple/70 text-lg">{gift.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-dusty">${gift.price}</div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                  ))}
                  <span className="text-sm text-purple/60 ml-2">(4.8)</span>
                </div>
              </div>

              {/* Tags and Occasions */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-purple mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Características
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gift.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-purple/20 text-purple">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-purple mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Ideal para
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gift.occasions.map((occasion) => (
                      <Badge key={occasion} variant="secondary" className="text-xs bg-dusty/10 text-dusty">
                        {occasion === "birthday"
                          ? "Cumpleaños"
                          : occasion === "anniversary"
                            ? "Aniversario"
                            : occasion === "christmas"
                              ? "Navidad"
                              : occasion === "mothers-day"
                                ? "Día de la Madre"
                                : occasion === "fathers-day"
                                  ? "Día del Padre"
                                  : occasion}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save to Ideas Vault */}
          <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
            <CardHeader>
              <CardTitle className="text-lg font-display text-purple flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Guardar en Ideas Vault</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-purple font-medium flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Para quién es este regalo (opcional)
                </Label>
                <select
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full p-3 border border-dusty/30 rounded-xl focus:border-dusty focus:ring-dusty/20 text-purple"
                >
                  <option value="">Seleccionar persona</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-purple font-medium">
                  Notas personales
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="¿Por qué es perfecto para esta persona? ¿Cuándo lo regalarías?"
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl min-h-[100px]"
                />
              </div>

              <Button onClick={saveGiftIdea} className="w-full bg-dusty hover:bg-dusty/90 text-white rounded-xl py-3">
                <Save className="h-4 w-4 mr-2" />
                Guardar en Ideas Vault
              </Button>
            </CardContent>
          </Card>

          {/* Recommended For */}
          {gift.relationships && gift.relationships.length > 0 && (
            <Card className="bg-gradient-to-br from-dusty/10 to-purple/10 rounded-2xl shadow-sm border-dusty/20">
              <CardContent className="p-6">
                <h4 className="font-display font-bold text-purple mb-3">Recomendado para:</h4>
                <div className="flex flex-wrap gap-2">
                  {gift.relationships.map((relationship) => (
                    <Badge key={relationship} className="bg-white/80 text-purple border border-dusty/20">
                      {relationship === "partner"
                        ? "Pareja"
                        : relationship === "parent"
                          ? "Padres"
                          : relationship === "sibling"
                            ? "Hermanos"
                            : relationship === "friend"
                              ? "Amigos"
                              : relationship === "colleague"
                                ? "Colegas"
                                : relationship}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
