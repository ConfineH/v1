"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Calendar, Gift, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Personas", href: "/people", icon: Users },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Ideas", href: "/gift-suggestions", icon: Gift },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-dusty/20 h-full">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2 mb-8">
          <Heart className="h-6 w-6 text-dusty fill-dusty" />
          <span className="text-xl font-display font-bold text-purple">Memento</span>
        </Link>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-dusty/10 text-dusty border border-dusty/20"
                    : "text-purple hover:bg-dusty/5 hover:text-dusty",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
