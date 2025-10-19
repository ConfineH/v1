"use client"

import { useState } from "react"
import { X, Users, Calendar, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface QuickStartModalProps {
  onComplete: () => void
}

export function QuickStartModal({ onComplete }: QuickStartModalProps) {
  const [step, setStep] = useState(1)

  const steps = [
    {
      icon: Users,
      title: "Añade Personas",
      description: "Guarda información sobre tus seres queridos",
      color: "bg-dusty",
    },
    {
      icon: Calendar,
      title: "Recibe Recordatorios",
      description: "Nunca olvides una fecha importante",
      color: "bg-purple",
    },
    {
      icon: Gift,
      title: "Encuentra Regalos Perfectos",
      description: "Ideas personalizadas para cada ocasión",
      color: "bg-gold",
    },
  ]

  const currentStep = steps[step - 1]
  const Icon = currentStep.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index + 1 <= step ? "w-8 bg-dusty" : "w-2 bg-dusty/20"
                  }`}
                />
              ))}
            </div>
            <button onClick={onComplete} className="text-purple/60 hover:text-purple">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div
              className={`w-20 h-20 ${currentStep.color} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <Icon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-purple mb-3">{currentStep.title}</h2>
            <p className="text-purple/70">{currentStep.description}</p>
          </div>

          <div className="flex space-x-3">
            {step < 3 ? (
              <>
                <Button
                  variant="outline"
                  onClick={onComplete}
                  className="flex-1 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
                >
                  Saltar
                </Button>
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 bg-dusty hover:bg-dusty/90 text-white rounded-xl"
                >
                  Siguiente
                </Button>
              </>
            ) : (
              <Button onClick={onComplete} className="w-full bg-dusty hover:bg-dusty/90 text-white rounded-xl">
                ¡Empezar!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
