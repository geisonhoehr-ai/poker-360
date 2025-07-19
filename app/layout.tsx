import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AppHeader } from "@/components/app-header"
import SupabaseRealtimeListener from "@/components/supabase-realtime-listener"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Military Attendance App",
  description: "Application for managing military personnel attendance and absences.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppHeader />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
          <Toaster />
          <SupabaseRealtimeListener />
        </ThemeProvider>
      </body>
    </html>
  )
}
