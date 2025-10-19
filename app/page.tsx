"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { DataWarningBanner } from "@/components/layout/data-warning-banner"
import { QuickStartModal } from "@/components/onboarding/quick-start-modal"
import { storage } from "@/lib/storage"
import { SimpleDashboard } from "@/components/dashboard/simple-dashboard"

export default function DashboardPage() {
  const [showQuickStart, setShowQuickStart] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    const data = storage.load()
    setShowQuickStart(data.people.length === 0)
    setDataLoaded(true)
  }, [])

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-dusty border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DataWarningBanner />
      <MainLayout>
        <SimpleDashboard />
      </MainLayout>
      {showQuickStart && <QuickStartModal onClose={() => setShowQuickStart(false)} />}
    </>
  )
}
