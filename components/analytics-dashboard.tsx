"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase" // Corrigido: import { supabase }
import { Chart } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface AttendanceData {
  date: string
  present: number
  absent: number
}

interface EventData {
  category: string
  count: number
}

interface FlightData {
  status: string
  count: number
}

interface PermanenceData {
  status: string
  count: number
}

export function AnalyticsDashboard() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])
  const [eventData, setEventData] = useState<EventData[]>([])
  const [flightData, setFlightData] = useState<FlightData[]>([])
  const [permanenceData, setPermanenceData] = useState<PermanenceData[]>([])
  const [loading, setLoading] = useState(true)
  // Removido: const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      // Fetch Attendance Data
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from("attendance_records")
        .select("date, status")
      if (attendanceError) console.error("Error fetching attendance data:", attendanceError)
      if (attendanceRecords) {
        const dailySummary: { [key: string]: { present: number; absent: number } } = {}
        attendanceRecords.forEach((record) => {
          const date = new Date(record.date).toLocaleDateString("pt-BR")
          if (!dailySummary[date]) {
            dailySummary[date] = { present: 0, absent: 0 }
          }
          if (record.status === "presente") {
            dailySummary[date].present++
          } else {
            dailySummary[date].absent++
          }
        })
        const formattedAttendance = Object.keys(dailySummary).map((date) => ({
          date,
          present: dailySummary[date].present,
          absent: dailySummary[date].absent,
        }))
        setAttendanceData(formattedAttendance)
      }

      // Fetch Event Data
      const { data: events, error: eventError } = await supabase.from("military_events").select("category")
      if (eventError) console.error("Error fetching event data:", eventError)
      if (events) {
        const categoryCounts: { [key: string]: number } = {}
        events.forEach((event) => {
          categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1
        })
        const formattedEvents = Object.keys(categoryCounts).map((category) => ({
          category,
          count: categoryCounts[category],
        }))
        setEventData(formattedEvents)
      }

      // Fetch Flight Data
      const { data: flights, error: flightError } = await supabase.from("military_flights").select("status")
      if (flightError) console.error("Error fetching flight data:", flightError)
      if (flights) {
        const statusCounts: { [key: string]: number } = {}
        flights.forEach((flight) => {
          statusCounts[flight.status] = (statusCounts[flight.status] || 0) + 1
        })
        const formattedFlights = Object.keys(statusCounts).map((status) => ({
          status,
          count: statusCounts[status],
        }))
        setFlightData(formattedFlights)
      }

      // Fetch Permanence Data
      const { data: permanenceRecords, error: permanenceError } = await supabase
        .from("daily_permanence_records")
        .select("status")
      if (permanenceError) console.error("Error fetching permanence data:", permanenceError)
      if (permanenceRecords) {
        const statusCounts: { [key: string]: number } = {}
        permanenceRecords.forEach((record) => {
          statusCounts[record.status] = (statusCounts[record.status] || 0) + 1
        })
        const formattedPermanence = Object.keys(statusCounts).map((status) => ({
          status,
          count: statusCounts[status],
        }))
        setPermanenceData(formattedPermanence)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard de Análises</h2>
      <Tabs defaultValue="attendance">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 p-1">
          <TabsTrigger value="attendance" className="text-xs sm:text-sm px-2 py-2">
            Presença
          </TabsTrigger>
          <TabsTrigger value="events" className="text-xs sm:text-sm px-2 py-2">
            Eventos
          </TabsTrigger>
          <TabsTrigger value="flights" className="text-xs sm:text-sm px-2 py-2">
            Voos
          </TabsTrigger>
          <TabsTrigger value="permanence" className="text-xs sm:text-sm px-2 py-2">
            Permanência
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="mt-6 animate-in fade-in duration-300">
          <Chart
            data={attendanceData}
            type="bar"
            dataKey="date"
            valueKey="present"
            title="Presença Diária"
            description="Número de militares presentes por dia."
            colors={["#4CAF50", "#F44336"]} // Green for present, Red for absent
          />
          <Chart
            data={attendanceData}
            type="line"
            dataKey="date"
            valueKey="absent"
            title="Ausências Diárias"
            description="Número de militares ausentes por dia."
            colors={["#F44336"]}
          />
        </TabsContent>
        <TabsContent value="events" className="mt-6 animate-in fade-in duration-300">
          <Chart
            data={eventData}
            type="pie"
            nameKey="category"
            valueKey="count"
            title="Eventos por Categoria"
            description="Distribuição de eventos por tipo."
          />
        </TabsContent>
        <TabsContent value="flights" className="mt-6 animate-in fade-in duration-300">
          <Chart
            data={flightData}
            type="pie"
            nameKey="status"
            valueKey="count"
            title="Status de Voos"
            description="Distribuição de voos por status."
          />
        </TabsContent>
        <TabsContent value="permanence" className="mt-6 animate-in fade-in duration-300">
          <Chart
            data={permanenceData}
            type="pie"
            nameKey="status"
            valueKey="count"
            title="Status de Permanência"
            description="Distribuição de registros de permanência por status."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
