import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseRealtimeListener } from "@/components/supabase-realtime-listener" // Importar o novo componente

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Military Attendance App",
  description: "Gerenciamento de presença e atividades militares",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 py-8 px-4 md:px-6 lg:px-8">{children}</main>
            <AppFooter />
          </div>
          <Toaster />
          <SupabaseRealtimeListener /> {/* Adicionar o listener de Supabase Realtime aqui */}
        </ThemeProvider>
      </body>
    </html>
  )
}
