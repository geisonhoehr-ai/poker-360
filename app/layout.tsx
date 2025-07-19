import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Toaster } from "@/components/ui/sonner"
import SupabaseRealtimeListener from "@/components/supabase-realtime-listener"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MainSidebar } from "@/components/main-sidebar"
import { ActiveSectionProvider } from "@/context/active-section-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema POKER 360",
  description: "Aplicativo para gerenciamento de faltas de militares do Esquadrão Poker.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ActiveSectionProvider>
            <SidebarProvider defaultOpen>
              <div className="flex flex-col min-h-screen">
                <AppHeader />
                <div className="flex flex-1">
                  <MainSidebar />
                  <SidebarInset className="flex-1 flex flex-col">{children}</SidebarInset>
                </div>
                <AppFooter />
              </div>
              <Toaster />
              <SupabaseRealtimeListener />
            </SidebarProvider>
          </ActiveSectionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
