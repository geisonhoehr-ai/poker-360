"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttendanceTracker } from "@/components/attendance-tracker"
import { JustificationManager } from "@/components/justification-manager"
import { HistoryTabs } from "@/components/history-tabs"
import { EventCalendar } from "@/components/event-calendar"
import { PersonalNotes } from "@/components/personal-notes"
import { PermanenceChecklist } from "@/components/permanence-checklist"
import { FlightScheduler } from "@/components/flight-scheduler"
import { KeyManagement } from "@/components/key-management"
import { AppHeader } from "@/components/app-header"
import { DailyQuotes } from "@/components/daily-quotes"
import { WeatherForecast } from "@/components/weather-forecast"
import { AppFooter } from "@/components/app-footer"

export default function Home() {
  const [activeTab, setActiveTab] = useState("attendance")

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url('/images/lion-background.png')` }}
    >
      {/* Overlay para melhorar a legibilidade do texto sobre a imagem de fundo */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70"></div>
      <main className="relative z-10 flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
        <div className="w-full max-w-5xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
            <AppHeader logoSrc="/images/1_10GPAV.png" />
            <WeatherForecast />
          </div>
          <DailyQuotes />
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-8 h-auto gap-1 p-1">
              <TabsTrigger value="attendance" className="text-xs sm:text-sm px-2 py-2">
                Retirada de Faltas
              </TabsTrigger>
              <TabsTrigger value="justification" className="text-xs sm:text-sm px-2 py-2">
                Justificativas
              </TabsTrigger>
              <TabsTrigger value="keys" className="text-xs sm:text-sm px-2 py-2">
                Claviculário
              </TabsTrigger>
              <TabsTrigger value="permanence" className="text-xs sm:text-sm px-2 py-2">
                Permanência
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs sm:text-sm px-2 py-2">
                Avisos e Eventos
              </TabsTrigger>
              <TabsTrigger value="flights" className="text-xs sm:text-sm px-2 py-2">
                Voo
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-xs sm:text-sm px-2 py-2">
                Minhas Notas
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm px-2 py-2">
                Histórico
              </TabsTrigger>
            </TabsList>
            <TabsContent value="attendance" className="mt-6 animate-in fade-in duration-300">
              <AttendanceTracker />
            </TabsContent>
            <TabsContent value="justification" className="mt-6 animate-in fade-in duration-300">
              <JustificationManager />
            </TabsContent>
            <TabsContent value="history" className="mt-6 animate-in fade-in duration-300">
              <HistoryTabs />
            </TabsContent>
            <TabsContent value="permanence" className="mt-6 animate-in fade-in duration-300">
              <PermanenceChecklist />
            </TabsContent>
            <TabsContent value="flights" className="mt-6 animate-in fade-in duration-300">
              <FlightScheduler />
            </TabsContent>
            <TabsContent value="keys" className="mt-6 animate-in fade-in duration-300">
              <KeyManagement />
            </TabsContent>
            <TabsContent value="events" className="mt-6 animate-in fade-in duration-300">
              <EventCalendar />
            </TabsContent>
            <TabsContent value="notes" className="mt-6 animate-in fade-in duration-300">
              <PersonalNotes />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <AppFooter />
    </div>
  )
}
