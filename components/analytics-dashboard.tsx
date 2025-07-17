"use client"

import { useState, useEffect, useCallback } from "react"
import { format, parseISO } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Chart } from "@/components/ui/chart"
import { militaryPersonnel } from "@/lib/data"

export function AnalyticsDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [eventData, setEventData] = useState<any[]>([])
  const [flightPilotData, setFlightPilotData] = useState<any[]>([])
  const [permanenceCompletionData, setPermanenceCompletionData] = useState<any[]>([])

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch Attendance Data
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from("military_attendance_records")
        .select("status")
      if (attendanceError) throw attendanceError

      const statusCounts: Record<string, number> = {}
      attendanceRecords.forEach((record) => {
        statusCounts[record.status] = (statusCounts[record.status] || 0) + 1
      })
      setAttendanceData(
        Object.keys(statusCounts).map((status) => ({
          name: status,
          value: statusCounts[status],
        })),
      )

      // Fetch Event Data
      const { data: events, error: eventsError } = await supabase.from("military_events").select("date")
      if (eventsError) throw eventsError

      const eventMonthCounts: Record<string, number> = {}
      events.forEach((event) => {
        const monthYear = format(parseISO(event.date), "MM/yyyy")
        eventMonthCounts[monthYear] = (eventMonthCounts[monthYear] || 0) + 1
      })
      setEventData(
        Object.keys(eventMonthCounts)
          .sort()
          .map((monthYear) => ({
            name: monthYear,
            value: eventMonthCounts[monthYear],
          })),
      )

      // Fetch Flight Data by Pilot
      const { data: flights, error: flightsError } = await supabase.from("military_flights").select("pilot_ids")
      if (flightsError) throw flightsError

      const pilotFlightCounts: Record<string, number> = {}
      flights.forEach((flight) => {
        flight.pilot_ids.forEach((pilotId: string) => {
          const pilot = militaryPersonnel.find((m) => m.id === pilotId)
          const pilotName = pilot ? `${pilot.rank} ${pilot.name}`.trim() : "Desconhecido"
          pilotFlightCounts[pilotName] = (pilotFlightCounts[pilotName] || 0) + 1
        })
      })
      setFlightPilotData(
        Object.keys(pilotFlightCounts).map((pilotName) => ({
          name: pilotName,
          value: pilotFlightCounts[pilotName],
        })),
      )

      // Fetch Permanence Checklist Completion Data
      const { data: permanenceRecords, error: permanenceError } = await supabase
        .from("daily_permanence_records")
        .select("checklist")
      if (permanenceError) throw permanenceError

      let totalTasks = 0
      let completedTasks = 0
      permanenceRecords.forEach((record) => {
        record.checklist.forEach((item: any) => {
          totalTasks++
          if (item.isCompleted) {
            completedTasks++
          }
        })
      })

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      setPermanenceCompletionData([
        { name: "Concluídas", value: completedTasks },
        { name: "Pendentes", value: totalTasks - completedTasks },
      ])
    } catch (error: any) {
      console.error("Erro ao buscar dados para análises:", error.message)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados para o dashboard de análises.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Carregando Análises...</CardTitle>
          <CardDescription>Aguarde enquanto carregamos os dados para os gráficos.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral das Análises</CardTitle>
          <CardDescription>Gráficos e estatísticas sobre os dados do aplicativo.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Chart
            data={attendanceData}
            type="pie"
            pieValueKey="value"
            pieNameKey="name"
            title="Distribuição de Status de Faltas"
            description="Status de presença/ausência registrados."
            colors={["#00C49F", "#FF8042", "#0088FE"]} // Green for Presente, Orange for Ausente, Blue for Justificado
          />
          <Chart
            data={eventData}
            type="bar"
            dataKey="value"
            nameKey="name"
            title="Eventos por Mês"
            description="Número de avisos e eventos registrados ao longo do tempo."
          />
          <Chart
            data={flightPilotData}
            type="bar"
            dataKey="value"
            nameKey="name"
            title="Voos por Piloto"
            description="Contagem de voos agendados por piloto."
          />
          <Chart
            data={permanenceCompletionData}
            type="pie"
            pieValueKey="value"
            pieNameKey="name"
            title="Conclusão de Checklists de Permanência"
            description="Proporção de tarefas concluídas vs. pendentes nos checklists."
            colors={["#00C49F", "#FFBB28"]} // Green for Concluídas, Yellow for Pendentes
          />
        </CardContent>
      </Card>
    </div>
  )
}
