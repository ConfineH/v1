"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Heart, X, Plus, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { storage, type Person } from "@/lib/storage"
import Link from "next/link"

export function EditPersonForm() {
  const params = useParams()
  const router = useRouter()
  const personId = params.personId as string

  const [person, setPerson] = useState<Person | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    birthday: "",
    anniversary: "",
    notes: "",
  })
  const [tags, setTags] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [newInterest, setNewInterest] = useState("")

  useEffect(() => {
    loadPerson()
  }, [personId])

  const loadPerson = () => {
    const data = storage.load()
    const foundPerson = data.people.find((p) => p.id === personId)

    if (foundPerson) {
      setPerson(foundPerson)
      setFormData({
        name: foundPerson.name,
        relationship: foundPerson.relationship,
        birthday: foundPerson.birthday || "",
        anniversary: foundPerson.anniversary || "",
        notes: foundPerson.notes,
      })
      setTags(foundPerson.tags || [])
      setInterests(foundPerson.interests || [])
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: "tag" | "interest") => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (type === "tag") {
        addTag()
      } else {
        addInterest()
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.relationship) {
      alert("Por favor completa al menos el nombre y la relación")
      return
    }

    const data = storage.load()
    const personIndex = data.people.findIndex((p) => p.id === personId)

    if (personIndex !== -1) {
      const updatedPerson: Person = {
        ...data.people[personIndex],
        name: formData.name.trim(),
        relationship: formData.relationship,
        tags,
        interests,
        birthday: formData.birthday || undefined,
        anniversary: formData.anniversary || undefined,
        notes: formData.notes.trim(),
      }

      data.people[personIndex] = updatedPerson
      storage.save(data)

      alert(`✅ ${formData.name} actualizado correctamente`)
      router.push("/people")
    }
  }

  if (!person) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-dusty/50 mx-auto mb-4" />
          <h2 className="text-xl font-display text-purple mb-2">Persona no encontrada</h2>
          <p className="text-purple/60">La persona que intentas editar no existe</p>
          <Link href="/people">
            <Button className="mt-4 bg-dusty hover:bg-dusty/90 text-white rounded-xl">Volver a People</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-purple mb-2">Editar Persona</h1>
        <p className="text-purple/70">Actualiza la información de {person.name}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
          <CardHeader>
            <CardTitle className="text-xl font-display text-purple">Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple font-medium">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ingresa su nombre"
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship" className="text-purple font-medium">
                  Relación *
                </Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                >
                  <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                    <SelectValue placeholder="Selecciona la relación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Pareja</SelectItem>
                    <SelectItem value="spouse">Esposo/a</SelectItem>
                    <SelectItem value="parent">Padre/Madre</SelectItem>
                    <SelectItem value="sibling">Hermano/a</SelectItem>
                    <SelectItem value="child">Hijo/a</SelectItem>
                    <SelectItem value="friend">Amigo/a</SelectItem>
                    <SelectItem value="colleague">Colega</SelectItem>
                    <SelectItem value="grandparent">Abuelo/a</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-purple font-medium">
                  Cumpleaños
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anniversary" className="text-purple font-medium">
                  Aniversario (Opcional)
                </Label>
                <Input
                  id="anniversary"
                  type="date"
                  value={formData.anniversary}
                  onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-purple font-medium">Preferencias y Tags</Label>
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "tag")}
                  placeholder="Ej: café, libros, yoga..."
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
                <Button type="button" onClick={addTag} className="bg-dusty hover:bg-dusty/90 text-white rounded-xl">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-dusty/10 text-dusty px-3 py-1 flex items-center space-x-2"
                    >
                      <span>{tag}</span>
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-dusty/70">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-purple font-medium">Intereses</Label>
              <div className="flex space-x-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, "interest")}
                  placeholder="Ej: tecnología, cocina, deportes..."
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
                <Button
                  type="button"
                  onClick={addInterest}
                  className="bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="bg-purple/10 text-purple px-3 py-1 flex items-center space-x-2"
                    >
                      <span>{interest}</span>
                      <button type="button" onClick={() => removeInterest(interest)} className="hover:text-purple/70">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-purple font-medium">
                Notas Personales
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Cualquier nota especial sobre sus preferencias, cosas favoritas, o ideas de regalo..."
                className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl min-h-[100px]"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="bg-dusty hover:bg-dusty/90 text-white rounded-xl flex-1">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
              <Link href="/people" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
                >
                  Cancelar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
