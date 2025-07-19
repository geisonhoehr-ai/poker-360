"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "@/components/ui/chart"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

interface AttendanceRecord {
  id: string
  military_member_id: string
  military_member_name: string
  date: string
  status: string
}

interface JustificationRecord {
  id: string
  military_member_id: string
  military_member_name: string
  type: string
  status: string
}

interface EventRecord {
  id: string
  date: string
  category: string
}

interface FlightRecord {
  id: string
  date: string
  flight_type: string
}

interface PermanenceRecord {
  id: string
  date: string
  status: string
}

export function AnalyticsDashboard() {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [justificationData, setJustificationData] = useState<any[]>([])
  const [eventData, setEventData] = useState<any[]>([])
  const [flightData, setFlightData] = useState<any[]>([])
  const [permanenceData, setPermanenceData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Attendance Data
      const { data: attendance, error: attError } = await supabase.from("attendance_records").select("*")
      if (attError) console.error("Error fetching attendance for analytics:", attError)
      else {
        const dailyAttendance = attendance.reduce(
          (acc: { [key: string]: { presente: number; ausente: number } }, record: AttendanceRecord) => {
            const date = format(new Date(record.date), "yyyy-MM-dd")
            if (!acc[date]) {
              acc[date] = { presente: 0, ausente: 0 }
            }
            if (record.status === "presente") {
              acc[date].presente++
            } else if (record.status === "ausente") {
              acc[date].ausente++
            }
            return acc
          },
          {},
        )
        setAttendanceData(Object.keys(dailyAttendance).map((date) => ({ date, ...dailyAttendance[date] })))
      }

      // Fetch Justification Data
      const { data: justifications, error: jusError } = await supabase.from("military_justifications").select("*")
      if (jusError) console.error("Error fetching justifications for analytics:", jusError)
      else {
        const statusCounts = justifications.reduce((acc: { [key: string]: number }, record: JustificationRecord) => {
          acc[record.status] = (acc[record.status] || 0) + 1
          return acc
        }, {})
        setJustificationData(Object.keys(statusCounts).map((status) => ({ status, count: statusCounts[status] })))
      }

      // Fetch Event Data
      const { data: events, error: eventError } = await supabase.from("military_events").select("*")
      if (eventError) console.error("Error fetching events for analytics:", eventError)
      else {
        const categoryCounts = events.reduce((acc: { [key: string]: number }, record: EventRecord) => {
          acc[record.category] = (acc[record.category] || 0) + 1
          return acc
        }, {})
        setEventData(Object.keys(categoryCounts).map((category) => ({ category, count: categoryCounts[category] })))
      }

      // Fetch Flight Data
      const { data: flights, error: flightError } = await supabase.from("military_flights").select("*")
      if (flightError) console.error("Error fetching flights for analytics:", flightError)
      else {
        const typeCounts = flights.reduce((acc: { [key: string]: number }, record: FlightRecord) => {
          acc[record.flight_type] = (acc[record.flight_type] || 0) + 1
          return acc
        }, {})
        setFlightData(Object.keys(typeCounts).map((type) => ({ type, count: typeCounts[type] })))
      }

      // Fetch Permanence Data
      const { data: permanence, error: permError } = await supabase.from("daily_permanence_records").select("*")
      if (permError) console.error("Error fetching permanence for analytics:", permError)
      else {
        const statusCounts = permanence.reduce((acc: { [key: string]: number }, record: PermanenceRecord) => {
          acc[record.status] = (acc[record.status] || 0) + 1
          return acc
        }, {})
        setPermanenceData(Object.keys(statusCounts).map((status) => ({ status, count: statusCounts[status] })))
      }
    }

    fetchData()
  }, [])

  const attendanceChartConfig = {
    presente: {
      label: "Presente",
      color: "hsl(var(--chart-1))",
    },
    ausente: {
      label: "Ausente",
      color: "hsl(var(--chart-2))",
    },
  } as const

  const justificationChartConfig = {
    count: {
      label: "Número de Justificativas",
      color: "hsl(var(--chart-3))",
    },
    status: {
      label: "Status",
    },
  } as const

  const eventChartConfig = {
    count: {
      label: "Número de Eventos",
      color: "hsl(var(--chart-4))",
    },
    category: {
      label: "Categoria",
    },
  } as const

  const flightChartConfig = {
    count: {
      label: "Número de Voos",
      color: "hsl(var(--chart-5))",
    },
    type: {
      label: "Tipo de Voo",
    },
  } as const

  const permanenceChartConfig = {
    count: {
      label: "Número de Registros",
      color: "hsl(var(--chart-6))",
    },
    status: {
      label: "Status",
    },
  } as const

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Faltas Diárias</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={attendanceData} config={attendanceChartConfig} type="line" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Justificativas por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={justificationData} config={justificationChartConfig} type="pie" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Eventos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={eventData} config={eventChartConfig} type="pie" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Voos por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={flightData} config={flightChartConfig} type="pie" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Permanência por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart data={permanenceData} config={permanenceChartConfig} type="pie" />
        </CardContent>
      </Card>
    </div>
  )
}
