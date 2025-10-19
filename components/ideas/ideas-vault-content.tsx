"use client"

import { useState, useEffect } from "react"
import { Search, Edit3, Trash2, ExternalLink, Plus, Package, Heart, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { storage, type SavedIdea, type Person } from "@/lib/storage"
import { staticSuggestions } from "@/lib/static-suggestions"

export function IdeasVaultContent() {
  const [ideas, setIdeas] = useState<SavedIdea[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [filteredIdeas, setFilteredIdeas] = useState<SavedIdea[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPersonId, setSelectedPersonId] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    personId: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterAndSortIdeas()
  }, [ideas, searchTerm, selectedPersonId, selectedCategory, sortBy])

  const loadData = () => {
    try {
      const data = storage.load()
      setIdeas(data.giftIdeas || [])
      setPeople(data.people || [])
    } catch (error) {
      console.error("Error loading data:", error)
      setIdeas([])
      setPeople([])
    }
  }

  const filterAndSortIdeas = () => {
    let filtered = [...ideas]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.notes.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Person filter
    if (selectedPersonId !== "all") {
      filtered = filtered.filter((idea) => idea.personId === selectedPersonId)
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((idea) => idea.category === selectedCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "price":
          return (b.price || 0) - (a.price || 0)
        case "name":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredIdeas(filtered)
  }

  const getImageUrl = (idea: SavedIdea): string => {
    // Priority 1: Use saved imageUrl
    if (idea.imageUrl) {
      console.log(`Using saved image for ${idea.title}:`, idea.imageUrl)
      return idea.imageUrl
    }

    // Priority 2: Find in static suggestions by title
    const staticSuggestion = staticSuggestions.find((s) => s.title === idea.title)
    if (staticSuggestion?.imageUrl) {
      console.log(`Using static suggestion image for ${idea.title}:`, staticSuggestion.imageUrl)
      return staticSuggestion.imageUrl
    }

    // Priority 3: Fallback to placeholder
    console.log(`Using placeholder for ${idea.title}`)
    return "/placeholder.svg?height=200&width=200"
  }

  const getRealLink = (idea: SavedIdea): string => {
    // Priority 1: Use saved realLink
    if (idea.realLink) {
      return idea.realLink
    }

    // Priority 2: Find in static suggestions
    const staticSuggestion = staticSuggestions.find((s) => s.title === idea.title)
    if (staticSuggestion?.realLink) {
      return staticSuggestion.realLink
    }

    // Priority 3: Fallback to Amazon search
    return `https://amazon.com/s?k=${encodeURIComponent(idea.title)}`
  }

  const updateIdeaNotes = (ideaId: string, notes: string) => {
    try {
      const data = storage.load()
      const ideaIndex = data.giftIdeas.findIndex((idea) => idea.id === ideaId)
      if (ideaIndex !== -1) {
        data.giftIdeas[ideaIndex].notes = notes
        storage.save(data)
        loadData()
      }
    } catch (error) {
      console.error("Error updating notes:", error)
    }
  }

  const toggleIdeaStatus = (ideaId: string) => {
    try {
      const data = storage.load()
      const ideaIndex = data.giftIdeas.findIndex((idea) => idea.id === ideaId)
      if (ideaIndex !== -1) {
        const idea = data.giftIdeas[ideaIndex]
        if (idea.status === "pending") {
          idea.status = "purchased"
          idea.purchasedAt = new Date().toISOString()
        } else {
          idea.status = "pending"
          delete idea.purchasedAt
        }
        storage.save(data)
        loadData()
      }
    } catch (error) {
      console.error("Error toggling status:", error)
    }
  }

  const deleteIdea = (ideaId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta idea?")) {
      try {
        const data = storage.load()
        data.giftIdeas = data.giftIdeas.filter((idea) => idea.id !== ideaId)
        storage.save(data)
        loadData()
      } catch (error) {
        console.error("Error deleting idea:", error)
      }
    }
  }

  const addCustomIdea = () => {
    if (!newIdea.title.trim() || !newIdea.personId) return

    try {
      const data = storage.load()
      const customIdea: SavedIdea = {
        id: Date.now().toString(),
        personId: newIdea.personId,
        title: newIdea.title.trim(),
        description: newIdea.description.trim(),
        price: newIdea.price ? Number.parseFloat(newIdea.price) : undefined,
        category: newIdea.category || "Personalizado",
        status: "pending",
        notes: "",
        createdAt: new Date().toISOString(),
        imageUrl: "/placeholder.svg?height=200&width=200",
      }

      data.giftIdeas.push(customIdea)
      storage.save(data)
      loadData()

      // Reset form
      setNewIdea({
        title: "",
        description: "",
        price: "",
        category: "",
        personId: "",
      })
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding custom idea:", error)
    }
  }

  const getPersonName = (personId: string) => {
    const person = people.find((p) => p.id === personId)
    return person?.name || "Persona eliminada"
  }

  const getCategories = () => {
    const categories = Array.from(new Set(ideas.map((idea) => idea.category)))
    return categories.sort()
  }

  const pendingIdeas = ideas.filter((idea) => idea.status === "pending")
  const purchasedIdeas = ideas.filter((idea) => idea.status === "purchased")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-purple">Ideas Vault</h1>
          <p className="text-purple/70 mt-1">
            {pendingIdeas.length} ideas guardadas, {purchasedIdeas.length} regalos comprados
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Idea
        </Button>
      </div>

      {/* Add Custom Idea Form */}
      {showAddForm && (
        <Card className="bg-white rounded-2xl shadow-sm border-dusty/20">
          <CardHeader>
            <CardTitle className="text-lg font-display text-purple">Añadir Idea Personalizada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple mb-2">Título *</label>
                <Input
                  placeholder="Nombre del regalo"
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple mb-2">Para quién *</label>
                <Select value={newIdea.personId} onValueChange={(value) => setNewIdea({ ...newIdea, personId: value })}>
                  <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                    <SelectValue placeholder="Seleccionar persona" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple mb-2">Descripción</label>
              <Textarea
                placeholder="Describe el regalo..."
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple mb-2">Precio (€)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newIdea.price}
                  onChange={(e) => setNewIdea({ ...newIdea, price: e.target.value })}
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple mb-2">Categoría</label>
                <Input
                  placeholder="Ej: Electrónicos, Libros..."
                  value={newIdea.category}
                  onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={addCustomIdea}
                disabled={!newIdea.title.trim() || !newIdea.personId}
                className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
              >
                Guardar Idea
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
              >
                Cancelar
              </Button>
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
                  placeholder="Buscar ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple mb-2">Persona</label>
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las personas</SelectItem>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <label className="block text-sm font-medium text-purple mb-2">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                  <SelectItem value="name">Nombre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Grid */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <Card
              key={idea.id}
              className={`bg-white rounded-2xl shadow-sm border-dusty/20 hover:shadow-md transition-all duration-200 overflow-hidden ${
                idea.status === "purchased" ? "opacity-75" : ""
              }`}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={getImageUrl(idea) || "/placeholder.svg"}
                  alt={idea.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log(`Image failed to load for ${idea.title}, using fallback`)
                    e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                  }}
                />
                <div className="absolute top-3 left-3">
                  <Badge
                    className={
                      idea.status === "purchased"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-dusty/10 text-dusty border-dusty/20"
                    }
                  >
                    {idea.status === "purchased" ? (
                      <>
                        <Package className="h-3 w-3 mr-1" />
                        Comprado
                      </>
                    ) : (
                      <>
                        <Heart className="h-3 w-3 mr-1" />
                        Guardado
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-purple text-lg leading-tight">{idea.title}</h3>
                    <p className="text-purple/70 text-sm mt-1">Para {getPersonName(idea.personId)}</p>
                    {idea.description && <p className="text-purple/60 text-sm mt-2 line-clamp-2">{idea.description}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-dusty/10 text-dusty border-dusty/20">
                      {idea.category}
                    </Badge>
                    {idea.price && <span className="font-bold text-purple">€{idea.price}</span>}
                  </div>

                  {/* Notes Section */}
                  <div>
                    {editingId === idea.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          placeholder="Añadir notas..."
                          className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              updateIdeaNotes(idea.id, editingNotes)
                              setEditingId(null)
                              setEditingNotes("")
                            }}
                            size="sm"
                            className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingId(null)
                              setEditingNotes("")
                            }}
                            size="sm"
                            variant="outline"
                            className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {idea.notes ? (
                          <p className="text-sm text-purple/70 bg-gray-50 p-3 rounded-lg">{idea.notes}</p>
                        ) : (
                          <p className="text-sm text-purple/40 italic">Sin notas</p>
                        )}
                        <Button
                          onClick={() => {
                            setEditingId(idea.id)
                            setEditingNotes(idea.notes)
                          }}
                          size="sm"
                          variant="ghost"
                          className="mt-2 text-purple/60 hover:text-purple hover:bg-dusty/5 rounded-xl p-1"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          {idea.notes ? "Editar" : "Añadir"} notas
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2 border-t border-dusty/20">
                    <Button
                      onClick={() => (window.location.href = `/gift-detail/${idea.id}`)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      onClick={() => window.open(getRealLink(idea), "_blank")}
                      size="sm"
                      variant="outline"
                      className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => toggleIdeaStatus(idea.id)}
                      size="sm"
                      className={
                        idea.status === "purchased"
                          ? "flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                          : "flex-1 bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                      }
                    >
                      {idea.status === "purchased" ? "✓ Comprado" : "Marcar como Comprado"}
                    </Button>
                    <Button
                      onClick={() => deleteIdea(idea.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-purple/40 flex items-center justify-between pt-2 border-t border-dusty/10">
                    <span>
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                    {idea.purchasedAt && <span>Comprado: {new Date(idea.purchasedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-purple/30 mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-purple mb-2">No hay ideas guardadas</h3>
          <p className="text-purple/60 mb-4">
            {searchTerm || selectedPersonId !== "all" || selectedCategory !== "all"
              ? "No se encontraron ideas con los filtros aplicados"
              : "Comienza explorando regalos y guardando tus favoritos"}
          </p>
          <div className="flex justify-center space-x-3">
            {(searchTerm || selectedPersonId !== "all" || selectedCategory !== "all") && (
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedPersonId("all")
                  setSelectedCategory("all")
                }}
                variant="outline"
                className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
              >
                Limpiar Filtros
              </Button>
            )}
            <Button
              onClick={() => (window.location.href = "/gift-suggestions")}
              className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
            >
              Explorar Regalos
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
