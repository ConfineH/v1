"use client"

import { useState } from "react"
import { Gift, Menu, X, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmailBackupModal } from "@/components/email-backup/email-backup-modal"
import { RestoreBackupModal } from "@/components/backup/restore-backup-modal"
import Link from "next/link"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)

  return (
    <>
      <header className="h-20 border-b border-dusty/20 bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Gift className="h-8 w-8 text-dusty" />
              <span className="text-xl font-display font-bold text-purple">Memento</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/people" className="text-purple/70 hover:text-purple transition-colors font-medium">
                Personas
              </Link>
              <Link href="/calendar" className="text-purple/70 hover:text-purple transition-colors font-medium">
                Calendario
              </Link>
              <Link href="/gift-suggestions" className="text-purple/70 hover:text-purple transition-colors font-medium">
                Regalos
              </Link>
              <Link href="/ideas" className="text-purple/70 hover:text-purple transition-colors font-medium">
                Ideas
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRestoreModalOpen(true)}
                className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBackupModalOpen(true)}
                className="border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Respaldar
              </Button>
              <Link href="/add-person">
                <Button size="sm" className="bg-dusty hover:bg-dusty/90 text-white rounded-xl transition-colors">
                  <Gift className="h-4 w-4 mr-2" />
                  Añadir Persona
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-purple hover:bg-dusty/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* About Button */}
            <Link href="/landing">
              <Button variant="ghost" className="text-purple/70 hover:text-purple">
                Acerca de
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-dusty/20 bg-white">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/people"
                  className="text-purple/70 hover:text-purple transition-colors font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Personas
                </Link>
                <Link
                  href="/calendar"
                  className="text-purple/70 hover:text-purple transition-colors font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Calendario
                </Link>
                <Link
                  href="/gift-suggestions"
                  className="text-purple/70 hover:text-purple transition-colors font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Regalos
                </Link>
                <Link
                  href="/ideas"
                  className="text-purple/70 hover:text-purple transition-colors font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Ideas
                </Link>
                <div className="flex flex-col space-y-3 pt-4 border-t border-dusty/20">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsRestoreModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="justify-start border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Restaurar Datos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsBackupModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="justify-start border-dusty/30 text-purple hover:bg-dusty/5 rounded-xl"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Respaldar Datos
                  </Button>
                  <Link href="/add-person" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full justify-start bg-dusty hover:bg-dusty/90 text-white rounded-xl">
                      <Gift className="h-4 w-4 mr-2" />
                      Añadir Persona
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <EmailBackupModal isOpen={isBackupModalOpen} onClose={() => setIsBackupModalOpen(false)} />
      <RestoreBackupModal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} />
    </>
  )
}
