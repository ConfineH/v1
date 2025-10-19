"use client"

import { useState } from "react"
import { X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ExitSurveyProps {
  onClose: () => void
  onSubmit: (data: SurveyData) => void
}

interface SurveyData {
  nps: number
  willingness_to_pay: string
  feedback: string
}

export function ExitSurvey({ onClose, onSubmit }: ExitSurveyProps) {
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [willingnessToPay, setWillingnessToPay] = useState("")
  const [feedback, setFeedback] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

  const handleSubmit = () => {
    if (npsScore !== null) {
      onSubmit({
        nps: npsScore,
        willingness_to_pay: willingnessToPay,
        feedback: feedback,
      })
      onClose()
    }
  }

  const steps = [
    {
      title: "¿Recomendarías Memento?",
      content: (
        <div className="space-y-4">
          <p className="text-purple/70 text-sm text-center">
            En una escala del 0 al 10, ¿qué tan probable es que recomiendes Memento a un amigo?
          </p>
          <div className="grid grid-cols-11 gap-1">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => setNpsScore(i)}
                className={`h-10 w-full rounded-lg border-2 text-sm font-medium transition-all ${
                  npsScore === i
                    ? "border-dusty bg-dusty text-white"
                    : "border-dusty/20 text-purple hover:border-dusty/40"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-purple/60">
            <span>Muy improbable</span>
            <span>Muy probable</span>
          </div>
        </div>
      ),
    },
    {
      title: "¿Pagarías por Memento?",
      content: (
        <RadioGroup value={willingnessToPay} onValueChange={setWillingnessToPay}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free-only" id="free-only" />
              <Label htmlFor="free-only" className="text-purple">
                Solo si es gratis
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1-5" id="1-5" />
              <Label htmlFor="1-5" className="text-purple">
                $1-5 por mes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5-10" id="5-10" />
              <Label htmlFor="5-10" className="text-purple">
                $5-10 por mes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10-20" id="10-20" />
              <Label htmlFor="10-20" className="text-purple">
                $10-20 por mes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="20+" id="20+" />
              <Label htmlFor="20+" className="text-purple">
                Más de $20 por mes
              </Label>
            </div>
          </div>
        </RadioGroup>
      ),
    },
    {
      title: "¿Algún comentario?",
      content: (
        <div className="space-y-4">
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Cuéntanos qué te gustó, qué mejorarías, o cualquier sugerencia..."
            className="border-dusty/30 focus:border-dusty focus:ring-dusty/20 rounded-xl min-h-[100px]"
          />
        </div>
      ),
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-display text-purple">{steps[currentStep].title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-purple/60 hover:text-purple">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[currentStep].content}

          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-dusty" : "bg-dusty/20"
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
              >
                Anterior
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 0 && npsScore === null}
                className="flex-1 bg-dusty hover:bg-dusty/90 text-white rounded-xl"
              >
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex-1 bg-dusty hover:bg-dusty/90 text-white rounded-xl">
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
