"use client"

import { useState, useEffect } from "react"
import { Heart, Users, Gift, Calendar, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { storage } from "@/lib/storage"

interface OnboardingModalProps {
  onComplete: () => void
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const data = storage.load()
    if (!data.settings.hasSeenOnboarding) {
      setIsVisible(true)
    }
  }, [])

  const steps = [
    {
      icon: Heart,
      title: "¡Bienvenido a Memento!",
      description:
        "Tu asistente personal para recordar fechas importantes y encontrar el regalo perfecto para tus seres queridos.",
      action: "Comenzar",
    },
    {
      icon: Users,
      title: "Añade a tus personas especiales",
      description: "Registra familiares, amigos y seres queridos con sus fechas importantes y preferencias.",
      action: "Continuar",
    },
    {
      icon: Calendar,
      title: "Nunca olvides una fecha",
      description: "Mantén un calendario de cumpleaños, aniversarios y eventos especiales con recordatorios.",
      action: "Continuar",
    },
    {
      icon: Gift,
      title: "Descubre ideas de regalo perfectas",
      description: "Recibe sugerencias personalizadas basadas en los intereses y preferencias de cada persona.",
      action: "¡Empezar!",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const completeOnboarding = () => {
    const data = storage.load()
    data.settings.hasSeenOnboarding = true

    // Add example person for first-time users
    if (data.people.length === 0) {
      const examplePerson = {
        id: "example-1",
        name: "María García",
        relationship: "friend",
        tags: ["coffee", "books", "yoga"],
        interests: ["reading", "wellness", "travel"],
        birthday: "1990-05-15",
        notes: "Le encantan los libros de misterio y el café artesanal",
        createdAt: new Date().toISOString(),
        otherEvents: [],
      }
      data.people.push(examplePerson)

      // Add example gift idea
      const exampleIdea = {
        id: "idea-1",
        personId: "example-1",
        title: "Suscripción de Café Gourmet",
        description: "Café premium mensual perfecto para los amantes del café",
        price: 25,
        category: "Comida y Bebida",
        status: "pending" as const,
        notes: "Perfecto para su amor por el café artesanal",
        createdAt: new Date().toISOString(),
      }
      data.giftIdeas.push(exampleIdea)
    }

    storage.save(data)
    setIsVisible(false)
    onComplete()
  }

  const skipOnboarding = () => {
    completeOnboarding()
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const IconComponent = currentStepData.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={skipOnboarding} className="text-purple/60 hover:text-purple">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-6">
            <div className="w-16 h-16 bg-dusty/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="h-8 w-8 text-dusty" />
            </div>
            <h2 className="text-2xl font-display font-bold text-purple mb-3">{currentStepData.title}</h2>
            <p className="text-purple/70 leading-relaxed">{currentStepData.description}</p>
          </div>

          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-dusty" : "bg-dusty/20"
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext} className="w-full bg-dusty hover:bg-dusty/90 text-white rounded-xl py-3">
            {currentStepData.action}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          {currentStep === 0 && (
            <Button variant="ghost" onClick={skipOnboarding} className="w-full mt-2 text-purple/60 hover:text-purple">
              Saltar introducción
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
