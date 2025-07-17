"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, Search } from "lucide-react" // Adicionado Search icon
import type {
  Key,
  PermanenceChecklistItem,
  AttendanceRecord,
  DailyPermanenceRecord,
  FlightRecord,
  KeyMovement,
  Event,
} from "@/lib/types"
import { militaryPersonnel } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input" // Importar Input
import { AnalyticsDashboard } from "./analytics-dashboard"

// Sub-component for Attendance History
function AttendanceHistoryContent() {
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("") // Novo estado para busca
  const [selectedStatus, setSelectedStatus] = useState<string>("all") // Novo estado para filtro de status
  const [selectedCallType, setSelectedCallType] = useState<string>("all") // Novo estado para filtro de tipo de chamada
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("military_attendance_records")
      .select("*")
      .order("date", { ascending: false })
    if (error) {
      console.error("Erro ao buscar histórico de faltas:", error)
    } else {
      setAllRecords(
        data.map((r: any) => ({
          id: r.id,
          militaryId: r.military_id,
          militaryName: r.military_name,
          rank: r.rank,
          callType: r.call_type,
          date: r.date,
          status: r.status,
        })) as AttendanceRecord[],
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const uniqueDates = useMemo(() => {
    const dates = new Set(allRecords.map((record) => record.date))
    return Array.from(dates).sort((a, b) => b.localeCompare(a))
  }, [allRecords])

  const uniqueCallTypes = useMemo(() => {
    const types = new Set(allRecords.map((record) => record.callType))
    return Array.from(types).sort()
  }, [allRecords])

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(allRecords.map((record) => record.status))
    return Array.from(statuses).sort()
  }, [allRecords])

  const filteredRecords = useMemo(() => {
    let records = allRecords

    if (selectedDate !== "all") {
      records = records.filter((record) => record.date === selectedDate)
    }
    if (selectedStatus !== "all") {
      records = records.filter((record) => record.status === selectedStatus)
    }
    if (selectedCallType !== "all") {
      records = records.filter((record) => record.callType === selectedCallType)
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      records = records.filter(
        (record) =>
          record.militaryName.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.rank.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.status.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.callType.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }
    return records
  }, [allRecords, selectedDate, selectedStatus, selectedCallType, searchTerm])

  const groupedRecords = useMemo(() => {
    const groups: Record<string, Record<string, AttendanceRecord[]>> = {}
    filteredRecords.forEach((record) => {
      if (!groups[record.date]) {
        groups[record.date] = {}
      }
      if (!groups[record.date][record.callType]) {
        groups[record.date][record.callType] = []
      }
      groups[record.date][record.callType].push(record)
    })
    return groups
  }, [filteredRecords])

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      alert("Não há dados para exportar.")
      return
    }

    const headers = ["Data", "Tipo de Chamada", "Posto/Graduação", "Nome", "Status"]
    const csvRows = []

    csvRows.push(headers.join(","))

    filteredRecords.forEach((record) => {
      const row = [
        format(parseISO(record.date), "dd/MM/yyyy", { locale: ptBR }),
        record.callType,
        record.rank,
        record.militaryName,
        record.status,
      ]
      csvRows.push(row.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
    })

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    const filename = selectedDate === "all" ? "historico_faltas_completo.csv" : `faltas_${selectedDate}.csv`
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="search-attendance">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-attendance"
              placeholder="Buscar militar, status, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-filter-attendance">Filtrar por Data</Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger id="date-filter-attendance">
              <SelectValue placeholder="Todas as datas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as datas</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status-filter-attendance">Filtrar por Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger id="status-filter-attendance">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="calltype-filter-attendance">Filtrar por Tipo de Chamada</Label>
          <Select value={selectedCallType} onValueChange={setSelectedCallType}>
            <SelectTrigger id="calltype-filter-attendance">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {uniqueCallTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleExportCsv} disabled={filteredRecords.length === 0} className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" /> Exportar CSV
      </Button>

      {Object.keys(groupedRecords).length === 0 ? (
        <p className="text-muted-foreground">Nenhum registro de falta encontrado com os filtros aplicados.</p>
      ) : (
        <div className="space-y-8 mt-6">
          {Object.keys(groupedRecords)
            .sort((a, b) => b.localeCompare(a))
            .map((date) => (
              <div key={date} className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Data: {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
                </h3>
                {Object.keys(groupedRecords[date]).map((callType) => (
                  <div key={`${date}-${callType}`} className="space-y-2">
                    <h4 className="text-md font-medium">Chamada: {callType}</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Posto/Graduação</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedRecords[date][callType].map((record) => (
                            <TableRow key={`${record.militaryId}-${record.callType}-${record.date}`}>
                              <TableCell>{record.rank}</TableCell>
                              <TableCell className="font-medium">{record.militaryName}</TableCell>
                              <TableCell>{record.status}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

// Sub-component for Permanence History
function PermanenceHistoryContent() {
  const [allRecords, setAllRecords] = useState<DailyPermanenceRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("") // Novo estado para busca
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("daily_permanence_records")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      if (error.code === "42P01") {
        console.warn("Tabela daily_permanence_records ainda não existe no Supabase – exibindo lista vazia.")
        setAllRecords([])
      } else {
        console.error("Erro ao buscar histórico de permanência:", error)
      }
    } else {
      setAllRecords(
        data.map((r) => ({
          id: r.id,
          militaryId: r.military_id,
          militaryName: r.military_name,
          date: r.date,
          checklist: r.checklist as PermanenceChecklistItem[],
        })) as DailyPermanenceRecord[],
      )
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const uniqueDates = useMemo(() => {
    const dates = new Set(allRecords.map((record) => record.date))
    return Array.from(dates).sort((a, b) => b.localeCompare(a))
  }, [allRecords])

  const filteredRecords = useMemo(() => {
    let records = allRecords
    if (selectedDate !== "all") {
      records = records.filter((record) => record.date === selectedDate)
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      records = records.filter(
        (record) =>
          record.militaryName.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.checklist.some((item) => item.content.toLowerCase().includes(lowerCaseSearchTerm)),
      )
    }
    return records
  }, [allRecords, selectedDate, searchTerm])

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      alert("Não há dados para exportar.")
      return
    }

    const headers = ["Data", "Militar", "Tarefas Concluídas", "Total de Tarefas", "Detalhes do Checklist"]
    const csvRows = []

    csvRows.push(headers.join(","))

    filteredRecords.forEach((record) => {
      const completedTasks = record.checklist.filter((item) => item.isCompleted).length
      const totalTasks = record.checklist.length
      const checklistDetails = record.checklist
        .map((item) => `${item.content} [${item.isCompleted ? "Concluído" : "Pendente"}]`)
        .join("; ")

      const row = [
        format(parseISO(record.date), "dd/MM/yyyy", { locale: ptBR }),
        record.militaryName,
        completedTasks,
        totalTasks,
        checklistDetails,
      ]
      csvRows.push(row.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
    })

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    const filename = selectedDate === "all" ? "historico_permanencia_completo.csv" : `permanencia_${selectedDate}.csv`
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (allRecords.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nenhum registro encontrado. Se você ainda não criou a tabela
        <code className="mx-1">daily_permanence_records</code> no Supabase, execute o script SQL correspondente ou
        cadastre um checklist para gerar seu primeiro registro.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="search-permanence">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-permanence"
              placeholder="Buscar militar ou tarefa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-filter-permanence">Filtrar por Data</Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger id="date-filter-permanence">
              <SelectValue placeholder="Todas as datas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as datas</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleExportCsv} disabled={filteredRecords.length === 0} className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" /> Exportar CSV
      </Button>

      {filteredRecords.length === 0 ? (
        <p className="text-muted-foreground">Nenhum registro de permanência salvo com os filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs text-foreground uppercase bg-muted">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Data
                </th>
                <th scope="col" className="px-6 py-3">
                  Militar
                </th>
                <th scope="col" className="px-6 py-3">
                  Tarefas Concluídas
                </th>
                <th scope="col" className="px-6 py-3">
                  Total de Tarefas
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((record) => (
                  <tr key={record.id} className="bg-background border-b hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                      {format(parseISO(record.date), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4">{record.militaryName}</td>
                    <td className="px-6 py-4">{record.checklist.filter((item) => item.isCompleted).length}</td>
                    <td className="px-6 py-4">{record.checklist.length}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Sub-component for Flight History
function FlightHistoryContent() {
  const [allRecords, setAllRecords] = useState<FlightRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("") // Novo estado para busca
  const [selectedPilot, setSelectedPilot] = useState<string>("all") // Novo estado para filtro de piloto
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("military_flights")
      .select("*")
      .order("date", { ascending: false })
      .order("time_zulu", { ascending: false })
    if (error) {
      console.error("Erro ao buscar histórico de voos:", error)
    } else {
      setAllRecords(
        data.map((f: any) => ({
          id: f.id,
          date: parseISO(f.date),
          timeZulu: f.time_zulu,
          timeBrasilia: f.time_brasilia,
          pilotIds: f.pilot_ids,
          description: f.description,
        })) as FlightRecord[],
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const uniqueDates = useMemo(() => {
    const dates = new Set(allRecords.map((record) => format(record.date, "yyyy-MM-dd")))
    return Array.from(dates).sort((a, b) => b.localeCompare(a))
  }, [allRecords])

  const allPilotsInFlights = useMemo(() => {
    const pilotIds = new Set<string>()
    allRecords.forEach((record) => record.pilotIds.forEach((id) => pilotIds.add(id)))
    return Array.from(pilotIds)
      .map((id) => {
        const pilot = militaryPersonnel.find((p) => p.id === id)
        return { id, name: pilot ? `${pilot.rank} ${pilot.name}`.trim() : "Desconhecido" }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allRecords])

  const filteredRecords = useMemo(() => {
    let records = allRecords
    if (selectedDate !== "all") {
      records = records.filter((record) => format(record.date, "yyyy-MM-dd") === selectedDate)
    }
    if (selectedPilot !== "all") {
      records = records.filter((record) => record.pilotIds.includes(selectedPilot))
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      records = records.filter(
        (record) =>
          record.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
          getPilotNames(record.pilotIds).toLowerCase().includes(lowerCaseSearchTerm) ||
          record.timeZulu.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.timeBrasilia.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }
    return records
  }, [allRecords, selectedDate, selectedPilot, searchTerm])

  const getPilotNames = (ids: string[]) => {
    return ids
      .map((id) => {
        const pilot = militaryPersonnel.find((p) => p.id === id)
        return pilot ? `${pilot.rank} ${pilot.name}`.trim() : "Desconhecido"
      })
      .join(", ")
  }

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      alert("Não há dados para exportar.")
      return
    }

    const headers = ["Data", "Hora (Z)", "Hora (BR)", "Pilotos", "Descrição"]
    const csvRows = []

    csvRows.push(headers.join(","))

    filteredRecords.forEach((record) => {
      const row = [
        format(record.date, "dd/MM/yyyy", { locale: ptBR }),
        record.timeZulu,
        record.timeBrasilia,
        getPilotNames(record.pilotIds),
        record.description || "-",
      ]
      csvRows.push(row.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
    })

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    const filename = selectedDate === "all" ? "historico_voos_completo.csv" : `voos_${selectedDate}.csv`
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="search-flights">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-flights"
              placeholder="Buscar descrição, piloto, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-filter-flights">Filtrar por Data</Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger id="date-filter-flights">
              <SelectValue placeholder="Todas as datas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as datas</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pilot-filter-flights">Filtrar por Piloto</Label>
          <Select value={selectedPilot} onValueChange={setSelectedPilot}>
            <SelectTrigger id="pilot-filter-flights">
              <SelectValue placeholder="Todos os pilotos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os pilotos</SelectItem>
              {allPilotsInFlights.map((pilot) => (
                <SelectItem key={pilot.id} value={pilot.id}>
                  {pilot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleExportCsv} disabled={filteredRecords.length === 0} className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" /> Exportar CSV
      </Button>

      {filteredRecords.length === 0 ? (
        <p className="text-muted-foreground">Nenhum voo agendado com os filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora (Z)</TableHead>
                <TableHead>Hora (BR)</TableHead>
                <TableHead>Pilotos</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell>{format(flight.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{flight.timeZulu}</TableCell>
                  <TableCell>{flight.timeBrasilia}</TableCell>
                  <TableCell>{getPilotNames(flight.pilotIds)}</TableCell>
                  <TableCell>{flight.description || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// Sub-component for Event History
function EventHistoryContent() {
  const [allRecords, setAllRecords] = useState<Event[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("") // Novo estado para busca
  const [selectedCreator, setSelectedCreator] = useState<string>("all") // Novo estado para filtro de criador
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("military_events")
      .select("*")
      .order("date", { ascending: false })
      .order("time", { ascending: false })
    if (error) {
      console.error("Erro ao buscar histórico de eventos:", error)
    } else {
      setAllRecords(
        data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description || undefined,
          date: parseISO(e.date),
          time: e.time || undefined,
          createdByMilitaryId: e.created_by_military_id || undefined,
        })) as Event[],
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const uniqueDates = useMemo(() => {
    const dates = new Set(allRecords.map((record) => format(record.date, "yyyy-MM-dd")))
    return Array.from(dates).sort((a, b) => b.localeCompare(a))
  }, [allRecords])

  const allCreators = useMemo(() => {
    const creatorIds = new Set<string>()
    allRecords.forEach((record) => {
      if (record.createdByMilitaryId) {
        creatorIds.add(record.createdByMilitaryId)
      }
    })
    return Array.from(creatorIds)
      .map((id) => {
        const military = militaryPersonnel.find((m) => m.id === id)
        return { id, name: military ? `${military.rank} ${military.name}`.trim() : "Desconhecido" }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [allRecords])

  const filteredRecords = useMemo(() => {
    let records = allRecords
    if (selectedDate !== "all") {
      records = records.filter((record) => format(record.date, "yyyy-MM-dd") === selectedDate)
    }
    if (selectedCreator !== "all") {
      records = records.filter((record) => record.createdByMilitaryId === selectedCreator)
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      records = records.filter(
        (record) =>
          record.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
          getMilitaryName(record.createdByMilitaryId).toLowerCase().includes(lowerCaseSearchTerm),
      )
    }
    return records
  }, [allRecords, selectedDate, selectedCreator, searchTerm])

  const getMilitaryName = (id: string | undefined) => {
    if (!id) return "N/A"
    const military = militaryPersonnel.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Desconhecido"
  }

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      alert("Não há dados para exportar.")
      return
    }

    const headers = ["Data", "Hora", "Título", "Descrição", "Criado Por"]
    const csvRows = []

    csvRows.push(headers.join(","))

    filteredRecords.forEach((record) => {
      const row = [
        format(record.date, "dd/MM/yyyy", { locale: ptBR }),
        record.time || "-",
        record.title,
        record.description || "-",
        getMilitaryName(record.createdByMilitaryId),
      ]
      csvRows.push(row.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
    })

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    const filename = selectedDate === "all" ? "historico_eventos_completo.csv" : `eventos_${selectedDate}.csv`
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="search-events">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-events"
              placeholder="Buscar título, descrição, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-filter-events">Filtrar por Data</Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger id="date-filter-events">
              <SelectValue placeholder="Todas as datas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as datas</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="creator-filter-events">Filtrar por Criador</Label>
          <Select value={selectedCreator} onValueChange={setSelectedCreator}>
            <SelectTrigger id="creator-filter-events">
              <SelectValue placeholder="Todos os criadores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os criadores</SelectItem>
              {allCreators.map((creator) => (
                <SelectItem key={creator.id} value={creator.id}>
                  {creator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleExportCsv} disabled={filteredRecords.length === 0} className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" /> Exportar CSV
      </Button>

      {filteredRecords.length === 0 ? (
        <p className="text-muted-foreground">Nenhum evento registrado com os filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Criado Por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{format(event.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{event.time || "-"}</TableCell>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.description || "-"}</TableCell>
                  <TableCell>{getMilitaryName(event.createdByMilitaryId)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// Sub-component for Key Management History
function KeyManagementHistoryContent() {
  const [allMovements, setAllMovements] = useState<KeyMovement[]>([])
  const [allKeys, setAllKeys] = useState<Key[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("") // Novo estado para busca
  const [selectedKey, setSelectedKey] = useState<string>("all") // Novo estado para filtro de chave
  const [selectedMovementType, setSelectedMovementType] = useState<string>("all") // Novo estado para filtro de tipo de movimento
  const [loading, setLoading] = useState(true)

  const fetchHistoryData = useCallback(async () => {
    setLoading(true)
    const { data: movementsData, error: movementsError } = await supabase
      .from("claviculario_movements")
      .select("*")
      .order("timestamp", { ascending: false })

    if (movementsError) {
      console.error("Erro ao buscar movimentos de chaves:", movementsError)
    } else {
      setAllMovements(
        movementsData.map((m: any) => ({
          id: m.id,
          keyId: m.key_id,
          type: m.type,
          militaryId: m.military_id,
          timestamp: m.timestamp,
        })) as KeyMovement[],
      )
    }

    const { data: keysData, error: keysError } = await supabase.from("claviculario_keys").select("*")

    if (keysError) {
      console.error("Erro ao buscar chaves para histórico:", keysError)
    } else {
      setAllKeys(
        keysData.map((k: any) => ({
          id: k.id,
          roomNumber: k.room_number,
          roomName: k.room_name,
        })) as Key[],
      )
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchHistoryData()
  }, [fetchHistoryData])

  const uniqueDates = useMemo(() => {
    const dates = new Set(allMovements.map((movement) => format(parseISO(movement.timestamp), "yyyy-MM-dd")))
    return Array.from(dates).sort((a, b) => b.localeCompare(a))
  }, [allMovements])

  const filteredMovements = useMemo(() => {
    let movements = allMovements
    if (selectedDate !== "all") {
      movements = movements.filter((movement) => format(parseISO(movement.timestamp), "yyyy-MM-dd") === selectedDate)
    }
    if (selectedKey !== "all") {
      movements = movements.filter((movement) => movement.keyId === selectedKey)
    }
    if (selectedMovementType !== "all") {
      movements = movements.filter((movement) => movement.type === selectedMovementType)
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase()
      movements = movements.filter(
        (movement) =>
          getKeyDetails(movement.keyId).toLowerCase().includes(lowerCaseSearchTerm) ||
          getMilitaryName(movement.militaryId).toLowerCase().includes(lowerCaseSearchTerm) ||
          movement.type.toLowerCase().includes(lowerCaseSearchTerm),
      )
    }
    return movements
  }, [allMovements, selectedDate, selectedKey, selectedMovementType, searchTerm])

  const getKeyDetails = (keyId: string) => {
    const key = allKeys.find((k) => k.id === keyId)
    return key ? `${key.roomNumber} - ${key.roomName}` : "Chave Desconhecida"
  }

  const getMilitaryName = (id: string) => {
    const military = militaryPersonnel.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Desconhecido"
  }

  const handleExportCsv = () => {
    if (filteredMovements.length === 0) {
      alert("Não há dados para exportar.")
      return
    }

    const headers = ["Data/Hora", "Chave", "Tipo de Movimento", "Militar"]
    const csvRows = []

    csvRows.push(headers.join(","))

    filteredMovements.forEach((movement) => {
      const row = [
        format(parseISO(movement.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
        getKeyDetails(movement.keyId),
        movement.type === "retirada" ? "Retirada" : "Entrega",
        getMilitaryName(movement.militaryId),
      ]
      csvRows.push(row.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
    })

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    const filename = selectedDate === "all" ? "historico_claviculario_completo.csv" : `claviculario_${selectedDate}.csv`
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="search-keys">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-keys"
              placeholder="Buscar chave, militar, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-filter-keys">Filtrar por Data</Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger id="date-filter-keys">
              <SelectValue placeholder="Todas as datas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as datas</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {format(parseISO(date), "dd/MM/yyyy", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="key-filter-keys">Filtrar por Chave</Label>
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger id="key-filter-keys">
              <SelectValue placeholder="Todas as chaves" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as chaves</SelectItem>
              {allKeys.map((key) => (
                <SelectItem key={key.id} value={key.id}>
                  {getKeyDetails(key.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="movement-type-filter-keys">Filtrar por Tipo</Label>
          <Select value={selectedMovementType} onValueChange={setSelectedMovementType}>
            <SelectTrigger id="movement-type-filter-keys">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="retirada">Retirada</SelectItem>
              <SelectItem value="entrega">Entrega</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button onClick={handleExportCsv} disabled={filteredMovements.length === 0} className="w-full sm:w-auto">
        <Download className="mr-2 h-4 w-4" /> Exportar CSV
      </Button>

      {filteredMovements.length === 0 ? (
        <p className="text-muted-foreground">Nenhum movimento de chave registrado com os filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Chave</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Militar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements
                .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())
                .map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {format(parseISO(movement.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{getKeyDetails(movement.keyId)}</TableCell>
                    <TableCell>{movement.type === "retirada" ? "Retirada" : "Entrega"}</TableCell>
                    <TableCell>{getMilitaryName(movement.militaryId)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export function HistoryTabs() {
  const [activeTab, setActiveTab] = useState("attendance")

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Histórico e Análises</CardTitle>
        <CardDescription>Visualize, exporte e analise os registros de todos os módulos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
            <TabsTrigger value="attendance">Faltas</TabsTrigger>
            <TabsTrigger value="permanence">Permanência</TabsTrigger>
            <TabsTrigger value="flights">Voos</TabsTrigger>
            <TabsTrigger value="events">Avisos e Eventos</TabsTrigger>
            <TabsTrigger value="keys">Claviculário</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>
          <TabsContent value="attendance" className="mt-6">
            <AttendanceHistoryContent />
          </TabsContent>
          <TabsContent value="permanence" className="mt-6">
            <PermanenceHistoryContent />
          </TabsContent>
          <TabsContent value="flights" className="mt-6">
            <FlightHistoryContent />
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <EventHistoryContent />
          </TabsContent>
          <TabsContent value="keys" className="mt-6">
            <KeyManagementHistoryContent />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
