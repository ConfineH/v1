"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import { useRouter } from "next/navigation"

export function AddPersonForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    gender: "",
    birthday: "",
    anniversary: "",
    budgetMin: "0",
    budgetMax: "150",
    closeness: "50",
    notes: "",
  })
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [useBudget, setUseBudget] = useState(false)

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addInterest()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.relationship) {
      alert("Por favor completa al menos el nombre y la relación")
      return
    }

    const data = storage.load()

    const budgetRange = useBudget ? `€${formData.budgetMin}-€${formData.budgetMax}` : undefined

    const newPerson = {
      id: `person-${Date.now()}`,
      name: formData.name.trim(),
      relationship: formData.relationship,
      gender: formData.gender || undefined,
      birthday: formData.birthday || undefined,
      anniversary: formData.anniversary || undefined,
      interests,
      budgetRange,
      closeness: Number.parseInt(formData.closeness),
      notes: formData.notes.trim(),
      tags: interests,
      createdAt: new Date().toISOString(),
    }

    data.people.push(newPerson)
    storage.save(data)

    router.push("/")
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-purple mb-2">Añadir Nueva Persona</h1>
        <p className="text-purple/70">Información esencial para encontrar el regalo perfecto</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-white rounded-2xl shadow-sm border-dusty/10">
          <CardHeader>
            <CardTitle className="text-xl font-display text-purple">Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name & Relationship */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple font-medium">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: María"
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
                  required
                >
                  <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Pareja</SelectItem>
                    <SelectItem value="spouse">Esposo/a</SelectItem>
                    <SelectItem value="parent">Padre/Madre</SelectItem>
                    <SelectItem value="sibling">Hermano/a</SelectItem>
                    <SelectItem value="child">Hijo/a</SelectItem>
                    <SelectItem value="friend">Amigo/a</SelectItem>
                    <SelectItem value="coworker">Compañero/a de trabajo</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gender & Age/Birthday */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-purple font-medium">
                  Género
                </Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl">
                    <SelectValue placeholder="Selecciona (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                    <SelectItem value="prefer-not-say">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-purple font-medium">
                  Fecha de Nacimiento
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl"
                />
              </div>
            </div>

            {/* Budget Range Toggle */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useBudget"
                  checked={useBudget}
                  onChange={(e) => setUseBudget(e.target.checked)}
                  className="w-4 h-4 text-dusty bg-gray-100 border-gray-300 rounded focus:ring-dusty focus:ring-2"
                />
                <Label htmlFor="useBudget" className="text-purple font-medium cursor-pointer">
                  Establecer rango de presupuesto típico
                </Label>
              </div>

              {useBudget && (
                <>
                  <Label className="text-purple font-medium">
                    Presupuesto: €{formData.budgetMin} - €{formData.budgetMax}
                  </Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-purple/60">
                        <span>Mínimo: €{formData.budgetMin}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="5"
                        value={formData.budgetMin}
                        onChange={(e) => {
                          const min = Number.parseInt(e.target.value)
                          const max = Number.parseInt(formData.budgetMax)
                          if (min <= max) {
                            setFormData({ ...formData, budgetMin: e.target.value })
                          }
                        }}
                        className="w-full h-2 bg-dusty/20 rounded-lg appearance-none cursor-pointer accent-dusty"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-purple/60">
                        <span>Máximo: €{formData.budgetMax}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="5"
                        value={formData.budgetMax}
                        onChange={(e) => {
                          const min = Number.parseInt(formData.budgetMin)
                          const max = Number.parseInt(e.target.value)
                          if (max >= min) {
                            setFormData({ ...formData, budgetMax: e.target.value })
                          }
                        }}
                        className="w-full h-2 bg-dusty/20 rounded-lg appearance-none cursor-pointer accent-dusty"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-purple/60 text-center mt-2">
                    Rango seleccionado: €{formData.budgetMin} - €{formData.budgetMax}
                  </div>
                </>
              )}
            </div>

            {/* Closeness Score */}
            <div className="space-y-2">
              <Label htmlFor="closeness" className="text-purple font-medium">
                Nivel de Cercanía: {formData.closeness}%
              </Label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-purple/60">Conocido</span>
                <input
                  id="closeness"
                  type="range"
                  min="0"
                  max="100"
                  value={formData.closeness}
                  onChange={(e) => setFormData({ ...formData, closeness: e.target.value })}
                  className="flex-1 h-2 bg-dusty/20 rounded-lg appearance-none cursor-pointer accent-dusty"
                />
                <span className="text-sm text-purple/60">Muy cercano</span>
              </div>
            </div>

            {/* Interests/Hobbies */}
            <div className="space-y-2">
              <Label className="text-purple font-medium">Intereses y Hobbies (Tags)</Label>
              <div className="flex space-x-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: café, libros, yoga, tecnología..."
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

            {/* Anniversary (optional) */}
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

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-purple font-medium">
                Notas Adicionales
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Cosas que le gustan, aversiones, preferencias especiales..."
                className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl min-h-[100px]"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="bg-dusty hover:bg-dusty/90 text-white rounded-xl flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Guardar Persona
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
