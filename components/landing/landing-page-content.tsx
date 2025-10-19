"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Calendar, Gift, ArrowRight, CheckCircle, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function LandingPageContent() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call - in production, connect to your email service
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Newsletter signup:", email)
    setSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-dusty/5">
      {/* Simple Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-7 w-7 text-dusty fill-dusty" />
            <span className="text-2xl font-display font-bold text-purple">Memento</span>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl bg-transparent"
            >
              Probar Demo
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Focused on problem/solution */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-dusty/10 text-dusty px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="inline h-4 w-4 mr-2" />
            La solución a regalos olvidados
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-purple mb-6 leading-tight">
            Nunca más olvides un
            <span className="text-dusty"> cumpleaños importante</span>
          </h1>

          <p className="text-lg md:text-xl text-purple/70 mb-8 max-w-2xl mx-auto">
            Memento organiza las fechas especiales de tus seres queridos y te sugiere el regalo perfecto. Simple,
            personal, efectivo.
          </p>

          {/* Email Capture Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12 px-4 rounded-xl border-dusty/30 focus:border-dusty text-base"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-8 bg-dusty hover:bg-dusty/90 text-white rounded-xl font-medium"
                >
                  {isLoading ? "Enviando..." : "Empezar Gratis"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-purple/60 mt-3">Gratis para siempre · Sin tarjeta de crédito</p>
            </form>
          ) : (
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-lg border border-dusty/20">
              <CheckCircle className="h-12 w-12 text-dusty mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-purple mb-2">¡Bienvenido a Memento!</h3>
              <p className="text-purple/70 mb-6">Te hemos enviado un email con instrucciones para empezar.</p>
              <Link href="/">
                <Button className="bg-dusty hover:bg-dusty/90 text-white rounded-xl w-full">
                  Ir a la Aplicación
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-purple/60 mt-8">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>500+ usuarios activos</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>1000+ regalos perfectos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Value Props */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-white rounded-2xl border-dusty/10 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-dusty/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-dusty" />
              </div>
              <h3 className="font-display font-bold text-purple mb-2">Recordatorios</h3>
              <p className="text-sm text-purple/70">Te avisamos a tiempo para que nunca llegues con las manos vacías</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-dusty/10 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-dusty/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Gift className="h-6 w-6 text-dusty" />
              </div>
              <h3 className="font-display font-bold text-purple mb-2">Ideas Personalizadas</h3>
              <p className="text-sm text-purple/70">Sugerencias basadas en sus intereses y tu presupuesto</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-2xl border-dusty/10 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-dusty/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-dusty" />
              </div>
              <h3 className="font-display font-bold text-purple mb-2">Simple y Rápido</h3>
              <p className="text-sm text-purple/70">Añade personas en segundos y empieza a usarlo inmediatamente</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works - Simple 3 Steps */}
      <section className="bg-gradient-to-r from-purple/5 to-dusty/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-purple mb-4">Cómo funciona</h2>
            <p className="text-lg text-purple/70">Tres pasos simples para nunca más olvidar un regalo</p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-dusty text-white rounded-xl flex items-center justify-center font-display font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="font-display font-bold text-purple text-xl mb-2">Añade a tus personas favoritas</h3>
                <p className="text-purple/70">Nombre, cumpleaños e intereses. Toma menos de 30 segundos por persona.</p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-dusty text-white rounded-xl flex items-center justify-center font-display font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="font-display font-bold text-purple text-xl mb-2">Recibe recordatorios a tiempo</h3>
                <p className="text-purple/70">
                  Te avisamos cuando se acerca una fecha importante para que no te pille por sorpresa.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-dusty text-white rounded-xl flex items-center justify-center font-display font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="font-display font-bold text-purple text-xl mb-2">Descubre el regalo perfecto</h3>
                <p className="text-purple/70">Ideas personalizadas basadas en sus gustos. Elige y compra en minutos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-purple to-dusty rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">¿Listo para ser el mejor regalador?</h2>
          <p className="text-lg text-white/90 mb-8">Únete a cientos de personas que ya usan Memento</p>

          {!submitted && (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12 px-4 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 px-8 bg-white text-purple hover:bg-white/90 rounded-xl font-medium"
                >
                  Empezar Gratis
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-dusty/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-dusty fill-dusty" />
            <span className="font-display font-bold text-purple">Memento</span>
          </div>
          <p className="text-sm text-purple/60">Hecho con ❤️ para hacer felices a las personas</p>
        </div>
      </footer>
    </div>
  )
}
