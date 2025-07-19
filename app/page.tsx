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
import { DailyQuotes } from "@/components/daily-quotes"
import { WeatherForecast } from "@/components/weather-forecast" // Agora só o iframe

// Importar ícones do lucide-react
import {
  ClipboardListIcon,
  CalendarIcon,
  KeyIcon,
  CheckCircleIcon,
  BellIcon,
  PlaneIcon,
  NotebookPenIcon,
  BarChartIcon,
  CloudIcon,
} from "lucide-react"

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
          {/* DailyQuotes permanece aqui, WeatherForecast (antigo) foi removido */}
          <div className="flex justify-center w-full mb-8">
            <DailyQuotes />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-9 h-auto gap-1 p-1 bg-background/80 backdrop-blur-sm rounded-lg shadow-md">
              <TabsTrigger
                value="attendance"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <ClipboardListIcon className="h-5 w-5 mb-1" />
                Retirada de Faltas
              </TabsTrigger>
              <TabsTrigger
                value="justification"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <CalendarIcon className="h-5 w-5 mb-1" />
                Justificativas
              </TabsTrigger>
              <TabsTrigger
                value="keys"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <KeyIcon className="h-5 w-5 mb-1" />
                Claviculário
              </TabsTrigger>
              <TabsTrigger
                value="permanence"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <CheckCircleIcon className="h-5 w-5 mb-1" />
                Permanência
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <BellIcon className="h-5 w-5 mb-1" />
                Avisos e Eventos
              </TabsTrigger>
              <TabsTrigger
                value="flights"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <PlaneIcon className="h-5 w-5 mb-1" />
                Voo
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <NotebookPenIcon className="h-5 w-5 mb-1" />
                Minhas Notas
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <BarChartIcon className="h-5 w-5 mb-1" />
                Histórico
              </TabsTrigger>
              {/* Nova aba para o tempo */}
              <TabsTrigger
                value="weather"
                className="flex flex-col items-center justify-center text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <CloudIcon className="h-5 w-5 mb-1" />
                Tempo
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
            <TabsContent value="weather" className="mt-6 animate-in fade-in duration-300">
              {" "}
              {/* Conteúdo da nova aba */}
              <WeatherForecast />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
