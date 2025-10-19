"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { storage } from "@/lib/storage"
import { EmailBackupModal } from "@/components/email-backup/email-backup-modal"

export function DataWarningBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showEmailBackup, setShowEmailBackup] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  useEffect(() => {
    const data = storage.load()
    setIsVisible(!data.settings.warningDismissed)
  }, [])

  const dismissWarning = () => {
    const data = storage.load()
    data.settings.warningDismissed = true
    storage.save(data)
    setIsVisible(false)
  }

  const handleEmailBackup = () => {
    setShowEmailModal(true)
  }

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-yellow-800">⚠️ Tus datos se guardan localmente.</span>
            <span className="text-yellow-700 ml-1">Si cambias de dispositivo o borras caché, se perderán.</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailBackup}
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-100 text-xs bg-transparent"
          >
            <Mail className="h-3 w-3 mr-1" />
            Guardar por Email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissWarning}
            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EmailBackupModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />
    </div>
  )
}
