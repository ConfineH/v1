"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Heart, ExternalLink, User, Calendar, Tag, Sparkles, Gift } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage, type Person, type SavedIdea } from "@/lib/storage"
import { staticSuggestions, getSuggestionsForPerson, type GiftSuggestion } from "@/lib/static-suggestions"

export function GiftSuggestionsContent() {
  const [people, setPeople] = useState<Person[]>([])
  const [selectedPersonId, setSelectedPersonId] = useState<string>("all") // Updated default value
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [suggestions, setSuggestions] = useState<GiftSuggestion[]>([])
  const [filteredSuggestions, setFilteredSuggestions] = useState<GiftSuggestion[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all") // Updated initial state
  const [priceRange, setPriceRange] = useState<string>("all") // Updated initial state
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedPersonId === "all") {
      setSelectedPerson(null)
      setSuggestions(staticSuggestions)
      setFilteredSuggestions(staticSuggestions)
    } else {
      const person = people.find((p) => p.id === selectedPersonId)
      setSelectedPerson(person || null)
      if (person) {
        setLoading(true)
        // Simulate loading delay for better UX
        setTimeout(() => {
          const personSuggestions = getSuggestionsForPerson(person)
          setSuggestions(personSuggestions)
          setFilteredSuggestions(personSuggestions)
          setLoading(false)
        }, 500)
      }
    }
  }, [selectedPersonId, people])

  useEffect(() => {
    filterSuggestions()
  }, [suggestions, searchTerm, selectedCategory, priceRange])

  const loadData = () => {
    const data = storage.load()
    setPeople(data.people)
    setSavedIdeas(data.giftIdeas)
  }

  const filterSuggestions = () => {
    let filtered = [...suggestions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (suggestion) =>
          suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          suggestion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          suggestion.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((suggestion) => suggestion.category === selectedCategory)
    }

    // Price range filter
    if (priceRange && priceRange !== "all") {
      filtered = filtered.filter((suggestion) => {
        if (!suggestion.price) return false
        const price = suggestion.price
        switch (priceRange) {
          case "under-25":
            return price < 25
          case "25-50":
            return price >= 25 && price <= 50
          case "50-100":
            return price >= 50 && price <= 100
          case "over-100":
            return price > 100
          default:
            return true
        }
      })
    }

    setFilteredSuggestions(filtered)
  }

  const saveGiftIdea = (suggestion: GiftSuggestion) => {
    if (!selectedPersonId || selectedPersonId === "all") return

    const data = storage.load()
    const newIdea: SavedIdea = {
      id: Date.now().toString(),
      personId: selectedPersonId,
      title: suggestion.title,
      description: suggestion.description,
      price: suggestion.price,
      category: suggestion.category,
      status: "pending",
      notes: "",
      createdAt: new Date().toISOString(),
      imageUrl: suggestion.imageUrl,
      realLink: suggestion.realLink,
      originalPrice: suggestion.price,
      lastPriceCheck: new Date().toISOString(),
    }

    data.giftIdeas.push(newIdea)
    storage.save(data)
    setSavedIdeas([...data.giftIdeas])
  }

  const markAsPurchased = (suggestion: GiftSuggestion) => {
    if (!selectedPersonId || selectedPersonId === "all") return

    const data = storage.load()
    const newIdea: SavedIdea = {
      id: Date.now().toString(),
      personId: selectedPersonId,
      title: suggestion.title,
      description: suggestion.description,
      price: suggestion.price,
      category: suggestion.category,
      status: "purchased",
      notes: "",
      createdAt: new Date().toISOString(),
      purchasedAt: new Date().toISOString(),
      imageUrl: suggestion.imageUrl,
      realLink: suggestion.realLink,
      originalPrice: suggestion.price,
      lastPriceCheck: new Date().toISOString(),
    }

    data.giftIdeas.push(newIdea)
    storage.save(data)
    setSavedIdeas([...data.giftIdeas])
  }

  const isIdeaSaved = (suggestion: GiftSuggestion) => {
    return savedIdeas.some(
      (idea) => idea.title === suggestion.title && idea.personId === selectedPersonId && idea.status === "pending",
    )
  }

  const isIdeaPurchased = (suggestion: GiftSuggestion) => {
    return savedIdeas.some(
      (idea) => idea.title === suggestion.title && idea.personId === selectedPersonId && idea.status === "purchased",
    )
  }

  const getCategories = () => {
    const categories = Array.from(new Set(suggestions.map((s) => s.category)))
    return categories.sort()
  }

  const getUpcomingEvents = () => {
    if (!selectedPerson) return []

    const today = new Date()
    const events = []

    // Birthday
    if (selectedPerson.birthday) {
      const birthday = new Date(selectedPerson.birthday)
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1)
      }
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil <= 90) {
        events.push({
          title: "Cumpleaños",
          date: thisYearBirthday,
          daysUntil,
          tags: ["birthday", "celebration"],
        })
      }
    }

    // Anniversary
    if (selectedPerson.anniversary) {
      const anniversary = new Date(selectedPerson.anniversary)
      const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate())
      if (thisYearAnniversary < today) {
        thisYearAnniversary.setFullYear(today.getFullYear() + 1)
      }
      const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil <= 90) {
        events.push({
          title: "Aniversario",
          date: thisYearAnniversary,
          daysUntil,
          tags: ["anniversary", "love", "romantic"],
        })
      }
    }

    // Other events
    selectedPerson.otherEvents?.forEach((event) => {
      const eventDate = new Date(event.date)
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil <= 90 && daysUntil >= 0) {
        events.push({
          title: event.title,
          date: eventDate,
          daysUntil,
          tags: event.tags || [],
        })
      }
    })

    return events.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-purple">Sugerencias de Regalos</h1>
          <p className="text-purple/70 mt-1">Encuentra el regalo perfecto para cada ocasión</p>
        </div>
      </div>

      {/* Person Selection */}
      <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-purple mb-2">Selecciona una persona (opcional)</label>
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                  <SelectValue placeholder="Todas las personas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las personas</SelectItem> // Updated value prop
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} ({person.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {people.length === 0 && (
              <div className="flex items-end">
                <Button
                  onClick={() => (window.location.href = "/add-person")}
                  className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                >
                  Añadir Persona
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Context Card - Show when person is selected */}
      {selectedPerson && (
        <Card className="bg-gradient-to-r from-dusty/5 to-purple/5 rounded-2xl shadow-sm border-dusty/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-dusty/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-dusty" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-purple">Regalos para {selectedPerson.name}</h3>
                <p className="text-purple/70 mb-4">{selectedPerson.relationship}</p>

                {/* Interests */}
                {selectedPerson.interests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-purple/80 mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Intereses:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPerson.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="bg-dusty/10 text-dusty border-dusty/20">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Events */}
                {getUpcomingEvents().length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-purple/80 mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Próximos eventos:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getUpcomingEvents()
                        .slice(0, 3)
                        .map((event, index) => (
                          <Badge key={index} variant="outline" className="border-purple/30 text-purple">
                            {event.title} ({event.daysUntil}d)
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple/40" />
                <Input
                  placeholder="Buscar regalos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple mb-2">Categoría</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {getCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple mb-2">Precio</label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                  <SelectValue placeholder="Cualquier precio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier precio</SelectItem>
                  <SelectItem value="under-25">Menos de €25</SelectItem>
                  <SelectItem value="25-50">€25 - €50</SelectItem>
                  <SelectItem value="50-100">€50 - €100</SelectItem>
                  <SelectItem value="over-100">Más de €100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setPriceRange("all")
                }}
                variant="outline"
                className="w-full border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-dusty border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple/70">Generando sugerencias personalizadas...</p>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-purple/70">
              {filteredSuggestions.length}{" "}
              {filteredSuggestions.length === 1 ? "regalo encontrado" : "regalos encontrados"}
              {selectedPerson && (
                <span className="ml-2 inline-flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-dusty" />
                  Personalizados para {selectedPerson.name}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className="bg-white rounded-2xl shadow-sm border-dusty/20 hover:shadow-md transition-all duration-200 overflow-hidden group"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={suggestion.imageUrl || "/placeholder.svg"}
                    alt={suggestion.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {suggestion.score && suggestion.score > 0.7 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-dusty text-white border-0">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recomendado
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-purple text-lg leading-tight">{suggestion.title}</h3>
                      <p className="text-purple/70 text-sm mt-1 line-clamp-2">{suggestion.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-dusty/10 text-dusty border-dusty/20">
                          {suggestion.category}
                        </Badge>
                        {suggestion.price && <span className="font-bold text-purple">€{suggestion.price}</span>}
                      </div>
                    </div>

                    {/* Tags */}
                    {suggestion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {suggestion.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-purple/20 text-purple/60">
                            {tag}
                          </Badge>
                        ))}
                        {suggestion.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-purple/20 text-purple/60">
                            +{suggestion.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Occasions */}
                    {suggestion.occasions.length > 0 && (
                      <div className="text-xs text-purple/60">
                        <span className="font-medium">Ideal para:</span> {suggestion.occasions.slice(0, 2).join(", ")}
                        {suggestion.occasions.length > 2 && "..."}
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={() => (window.location.href = `/gift-detail/${suggestion.id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                      >
                        Ver Detalles
                      </Button>

                      {suggestion.realLink && (
                        <Button
                          onClick={() => window.open(suggestion.realLink, "_blank")}
                          variant="outline"
                          size="sm"
                          className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {selectedPersonId && selectedPersonId !== "all" && (
                      <div className="flex space-x-2 pt-2 border-t border-dusty/20">
                        {isIdeaPurchased(suggestion) ? (
                          <Button
                            disabled
                            size="sm"
                            className="flex-1 bg-green-100 text-green-800 hover:bg-green-100 rounded-xl"
                          >
                            ✓ Comprado
                          </Button>
                        ) : isIdeaSaved(suggestion) ? (
                          <Button
                            disabled
                            size="sm"
                            className="flex-1 bg-dusty/10 text-dusty hover:bg-dusty/10 rounded-xl"
                          >
                            <Heart className="h-4 w-4 mr-2 fill-current" />
                            Guardado
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => saveGiftIdea(suggestion)}
                              size="sm"
                              variant="outline"
                              className="flex-1 border-dusty/30 text-dusty hover:bg-dusty/5 rounded-xl"
                            >
                              <Heart className="h-4 w-4 mr-2" />
                              Guardar
                            </Button>
                            <Button
                              onClick={() => markAsPurchased(suggestion)}
                              size="sm"
                              className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                            >
                              Comprado
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSuggestions.length === 0 && (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-purple/30 mx-auto mb-4" />
              <h3 className="text-lg font-display font-bold text-purple mb-2">No se encontraron regalos</h3>
              <p className="text-purple/60 mb-4">Intenta ajustar los filtros o buscar con otros términos</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setPriceRange("all")
                }}
                variant="outline"
                className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
              >
                Limpiar Filtros
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
