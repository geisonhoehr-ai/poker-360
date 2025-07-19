"use client"
import Image from "next/image"
import Link from "next/link"
import { useActiveSection } from "@/context/active-section-context"
import { ModeToggle } from "./mode-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export function AppHeader() {
  const { activeSection } = useActiveSection()
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Erro ao fazer logout:", error.message)
    } else {
      router.push("/login") // Redireciona para a página de login após o logout
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger variant="ghost" size="icon" className="md:hidden" />
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Image
            src="/placeholder-logo.png"
            alt="Sistema POKER 360 Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span>POKER 360</span>
        </Link>
      </div>
      <nav className="hidden md:flex md:items-center md:gap-5 lg:gap-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={`transition-colors hover:text-foreground ${activeSection === "Dashboard" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Dashboard
        </Link>
        <Link
          href="/attendance"
          className={`transition-colors hover:text-foreground ${activeSection === "Attendance" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Presença
        </Link>
        <Link
          href="/justifications"
          className={`transition-colors hover:text-foreground ${activeSection === "Justifications" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Justificativas
        </Link>
        <Link
          href="/key-management"
          className={`transition-colors hover:text-foreground ${activeSection === "Key Management" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Chaves
        </Link>
        <Link
          href="/permanence-checklist"
          className={`transition-colors hover:text-foreground ${activeSection === "Permanence Checklist" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Checklist
        </Link>
        <Link
          href="/event-calendar"
          className={`transition-colors hover:text-foreground ${activeSection === "Event Calendar" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Eventos
        </Link>
        <Link
          href="/flight-scheduler"
          className={`transition-colors hover:text-foreground ${activeSection === "Flight Scheduler" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Voos
        </Link>
        <Link
          href="/personal-notes"
          className={`transition-colors hover:text-foreground ${activeSection === "Personal Notes" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Notas
        </Link>
        <Link
          href="/history"
          className={`transition-colors hover:text-foreground ${activeSection === "History" ? "text-foreground" : "text-muted-foreground"}`}
        >
          Histórico
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <ModeToggle />
        {user ? (
          <Button onClick={handleLogout} variant="outline">
            Sair
          </Button>
        ) : (
          <Link href="/login">
            <Button variant="outline">Entrar</Button>
          </Link>
        )}
      </div>
    </header>
  )
}
