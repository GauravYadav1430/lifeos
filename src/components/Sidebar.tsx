"use client"

import { Home, CheckSquare, Target, Book, BrainCircuit, Calendar, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: CheckSquare, label: "Tasks & Habits", href: "/tasks" },
  { icon: Target, label: "Goals", href: "/goals" },
  { icon: Book, label: "Journal", href: "/journal" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: BrainCircuit, label: "AI Insights", href: "/ai" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen border-r border-border glass hidden md:flex flex-col p-4">
      <div className="flex items-center space-x-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-500 shadow-lg shadow-primary/20 flex items-center justify-center">
          <span className="text-white font-bold text-lg">L</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">LifeOS</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )
}
