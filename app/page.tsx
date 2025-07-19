import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DailyQuotes } from "@/components/daily-quotes"
import { WeatherForecast } from "@/components/weather-forecast"
import { AttendanceTracker } from "@/components/attendance-tracker"
import { JustificationManager } from "@/components/justification-manager"
import { KeyManagement } from "@/components/key-management"
import { PermanenceChecklist } from "@/components/permanence-checklist"
import { EventCalendar } from "@/components/event-calendar"
import { FlightScheduler } from "@/components/flight-scheduler"
import { PersonalNotes } from "@/components/personal-notes"
import { HistoryTabs } from "@/components/history-tabs"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citações Diárias</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyQuotes />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Previsão do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherForecast />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dashboard de Análises</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsDashboard />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registro de Presença</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceTracker />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gerenciador de Justificativas</CardTitle>
          </CardHeader>
          <CardContent>
            <JustificationManager />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gerenciamento de Chaves</CardTitle>
          </CardHeader>
          <CardContent>
            <KeyManagement />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklist de Permanência</CardTitle>
          </CardHeader>
          <CardContent>
            <PermanenceChecklist />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calendário de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <EventCalendar />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendador de Voos</CardTitle>
          </CardHeader>
          <CardContent>
            <FlightScheduler />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notas Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonalNotes />
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryTabs />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
