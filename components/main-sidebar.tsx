"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LogOut, Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function MainSidebar() {
  const { toggleSidebar } = useSidebar()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const router = useRouter()

  /* ───────────────────────────────────────────
     Grab current user (no Clerk, only Supabase)
  ──────────────────────────────────────────── */
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_evt, session) => setUser(session?.user ?? null))
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  /* ─────────────────────────────────────────── */

  return (
    <Sidebar>
      {/* Top area with logo + collapse btn */}
      <SidebarHeader className="flex h-14 items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Fechar menu</span>
        </Button>
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Image src="/placeholder-logo.png" alt="POKER 360" width={28} height={28} className="rounded-full" />
          <span className="sr-only md:not-sr-only">POKER 360</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Example navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                { title: "Dashboard", href: "/dashboard" },
                { title: "Presença", href: "/attendance" },
                { title: "Histórico", href: "/history" },
              ].map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>{item.title}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Logged-in user footer (avatar + logout) */}
      {user && (
        <div className="flex items-center gap-3 p-3 border-t">
          <div className="relative size-7 overflow-hidden rounded-full">
            <Image src={user.user_metadata?.avatar_url || "/placeholder-user.jpg"} alt={user.email ?? "Avatar"} fill />
          </div>
          <span className="truncate text-sm">{user.email}</span>
          <Button variant="ghost" size="icon" aria-label="Sair" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}

      <SidebarRail />
    </Sidebar>
  )
}

// 👇 add this at the very end of the file
export default MainSidebar
