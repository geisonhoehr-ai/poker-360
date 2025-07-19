"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase" // Corrigido: import { supabase }
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AnalyticsDashboard } from "./analytics-dashboard"

interface AttendanceRecord {
  id: string
  military_member_id: string
  military_member_name: string
  date: string
  status: string
  justification_id: string | null
}

interface JustificationRecord {
  id: string
  military_member_id: string
  military_member_name: string
  type: string
  start_date: string
  end_date: string
  reason: string
  status: string
}

interface EventRecord {
  id: string
  title: string
  description: string
  date: string
  category: string
}

interface FlightRecord {
  id: string
  military_member_id: string
  military_member_name: string
  date: string
  flight_type: string
  status: string
}

interface PermanenceRecord {
  id: string
  military_member_id: string
  military_member_name: string
  date: string
  status: string
  notes: string
}

interface PersonalNoteRecord {
  id: string
  military_member_id: string
  military_member_name: string
  date: string
  note_content: string
}

export function HistoryTabs() {
  const [activeTab, setActiveTab] = useState("attendance")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [justificationRecords, setJustificationRecords] = useState<JustificationRecord[]>([])
  const [eventRecords, setEventRecords] = useState<EventRecord[]>([])
  const [flightRecords, setFlightRecords] = useState<FlightRecord[]>([])
  const [permanenceRecords, setPermanenceRecords] = useState<PermanenceRecord[]>([])
  const [personalNoteRecords, setPersonalNoteRecords] = useState<PersonalNoteRecord[]>([])

  const [attendanceSearch, setAttendanceSearch] = useState("")
  const [attendanceFilterStatus, setAttendanceFilterStatus] = useState("all")

  const [justificationSearch, setJustificationSearch] = useState("")
  const [justificationFilterStatus, setJustificationFilterStatus] = useState("all")
  const [justificationFilterType, setJustificationFilterType] = useState("all")

  const [eventSearch, setEventSearch] = useState("")
  const [eventFilterCategory, setEventFilterCategory] = useState("all")

  const [flightSearch, setFlightSearch] = useState("")
  const [flightFilterStatus, setFlightFilterStatus] = useState("all")
  const [flightFilterType, setFlightFilterType] = useState("all")

  const [permanenceSearch, setPermanenceSearch] = useState("")
  const [permanenceFilterStatus, setPermanenceFilterStatus] = useState("all")

  const [personalNoteSearch, setPersonalNoteSearch] = useState("")

  useEffect(() => {
    const fetchAllRecords = async () => {
      console.log("Fetching all records for HistoryTabs...")
      const { data: attendance, error: attError } = await supabase.from("attendance_records").select("*")
      if (attError) console.error("Error fetching attendance records:", attError)
      else setAttendanceRecords(attendance || [])

      const { data: justifications, error: jusError } = await supabase.from("military_justifications").select("*")
      if (jusError) console.error("Error fetching justification records:", jusError)
      else setJustificationRecords(justifications || [])

      const { data: events, error: eventError } = await supabase.from("military_events").select("*")
      if (eventError) console.error("Error fetching event records:", eventError)
      else setEventRecords(events || [])

      const { data: flights, error: flightError } = await supabase.from("military_flights").select("*")
      if (flightError) console.error("Error fetching flight records:", flightError)
      else setFlightRecords(flights || [])

      const { data: permanence, error: permError } = await supabase.from("daily_permanence_records").select("*")
      if (permError) console.error("Error fetching permanence records:", permError)
      else setPermanenceRecords(permanence || [])

      const { data: personalNotes, error: notesError } = await supabase.from("military_personal_notes").select("*")
      if (notesError) console.error("Error fetching personal notes:", notesError)
      else setPersonalNoteRecords(personalNotes || [])
      console.log("Finished fetching all records.")
    }

    fetchAllRecords()
  }, [])

  const filteredAttendance = attendanceRecords.filter(
    (record) =>
      record.military_member_name.toLowerCase().includes(attendanceSearch.toLowerCase()) &&
      (attendanceFilterStatus === "all" || record.status === attendanceFilterStatus),
  )

  const filteredJustifications = justificationRecords.filter(
    (record) =>
      record.military_member_name.toLowerCase().includes(justificationSearch.toLowerCase()) &&
      (justificationFilterStatus === "all" || record.status === justificationFilterStatus) &&
      (justificationFilterType === "all" || record.type === justificationFilterType),
  )

  const filteredEvents = eventRecords.filter(
    (record) =>
      record.title.toLowerCase().includes(eventSearch.toLowerCase()) &&
      (eventFilterCategory === "all" || record.category === eventFilterCategory),
  )

  const filteredFlights = flightRecords.filter(
    (record) =>
      record.military_member_name.toLowerCase().includes(flightSearch.toLowerCase()) &&
      (flightFilterStatus === "all" || record.status === flightFilterStatus) &&
      (flightFilterType === "all" || record.flight_type === flightFilterType),
  )

  const filteredPermanence = permanenceRecords.filter(
    (record) =>
      record.military_member_name.toLowerCase().includes(permanenceSearch.toLowerCase()) &&
      (permanenceFilterStatus === "all" || record.status === permanenceFilterStatus),
  )

  const filteredPersonalNotes = personalNoteRecords.filter(
    (record) =>
      record.note_content.toLowerCase().includes(personalNoteSearch.toLowerCase()) ||
      record.military_member_name.toLowerCase().includes(personalNoteSearch.toLowerCase()),
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Histórico e Análises</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 h-auto gap-1 p-1">
            <TabsTrigger value="attendance" className="text-xs sm:text-sm px-2 py-2">
              Faltas
            </TabsTrigger>
            <TabsTrigger value="justifications" className="text-xs sm:text-sm px-2 py-2">
              Justificativas
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
            <TabsTrigger value="notes" className="text-xs sm:text-sm px-2 py-2">
              Notas Pessoais
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">
              Análises
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="mt-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar militar..."
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={attendanceFilterStatus} onValueChange={setAttendanceFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Militar
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Justificativa ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {record.military_member_name}
                      </td>
                      <td className="px-6 py-4">{format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                      <td className="px-6 py-4">{record.status}</td>
                      <td className="px-6 py-4">{record.justification_id || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="justifications" className="mt-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar militar ou motivo..."
                value={justificationSearch}
                onChange={(e) => setJustificationSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={justificationFilterStatus} onValueChange={setJustificationFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={justificationFilterType} onValueChange={setJustificationFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="dispensa">Dispensa</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="licenca">Licença</SelectItem>
                  <SelectItem value="missao">Missão</SelectItem>
                  <SelectItem value="medico">Médico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Militar
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Período
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Motivo
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJustifications.map((record) => (
                    <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {record.military_member_name}
                      </td>
                      <td className="px-6 py-4">{record.type}</td>
                      <td className="px-6 py-4">
                        {format(new Date(record.start_date), "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(new Date(record.end_date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4">{record.reason}</td>
                      <td className="px-6 py-4">{record.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar título ou descrição..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={eventFilterCategory} onValueChange={setEventFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="operacao">Operação</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Título
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Descrição
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Categoria
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((record) => (
                    <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {record.title}
                      </td>
                      <td className="px-6 py-4">{record.description}</td>
                      <td className="px-6 py-4">{format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                      <td className="px-6 py-4">{record.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="flights" className="mt-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar militar..."
                value={flightSearch}
                onChange={(e) => setFlightSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={flightFilterStatus} onValueChange={setFlightFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={flightFilterType} onValueChange={setFlightFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="instrucao">Instrução</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Militar
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Tipo de Voo
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.map((record) => (
                    <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {record.military_member_name}
                      </td>
                      <td className="px-6 py-4">{format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                      <td className="px-6 py-4">{record.flight_type}</td>
                      <td className="px-6 py-4">{record.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="permanence" className="mt-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar militar ou notas..."
                value={permanenceSearch}
                onChange={(e) => setPermanenceSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={permanenceFilterStatus} onValueChange={setPermanenceFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Militar
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Notas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPermanence.map((record) => (
                    <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {record.military_member_name}
                      </td>
                      <td className="px-6 py-4">{format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                      <td className="px-6 py-4">{record.status}</td>
                      <td className="px-6 py-4">{record.notes || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar por conteúdo ou militar..."
                value={personalNoteSearch}
                onChange={(e) => setPersonalNoteSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Militar
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Conteúdo da Nota
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonalNotes.map((record) => (
                    <tr key={record.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {record.military_member_name}
                      </td>
                      <td className="px-6 py-4">{format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}</td>
                      <td className="px-6 py-4">{record.note_content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 animate-in fade-in duration-300">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
