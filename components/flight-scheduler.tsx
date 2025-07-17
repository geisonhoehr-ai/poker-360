"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format, isBefore, setHours, setMinutes, parseISO } from "date-fns" // Adicionado parseISO
import { ptBR } from "date-fns/locale"
import { PlusCircle, Trash2, Pencil } from "lucide-react"
import { formatInTimeZone } from "date-fns-tz"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DatePicker } from "./date-picker"
import { militaryPersonnel } from "@/lib/data"
import type { FlightRecord } from "@/lib/types"
import { supabase } from "@/lib/supabase" // Importar o cliente Supabase

export function FlightScheduler() {
  const { toast } = useToast()
  const [flights, setFlights] = useState<FlightRecord[]>([])
  const [flightDate, setFlightDate] = useState<Date | undefined>(undefined)
  const [flightTimeLocal, setFlightTimeLocal] = useState<string>("") // Horário local de input
  const [selectedPilots, setSelectedPilots] = useState<string[]>([])
  const [flightDescription, setFlightDescription] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<FlightRecord | null>(null)
  const [loading, setLoading] = useState(true)

  const BRASILIA_TIMEZONE = "America/Sao_Paulo"

  // Filter pilots to only TC, MJ, CP ranks
  const eligiblePilots = useMemo(() => {
    return militaryPersonnel.filter((m) => ["TC", "MJ", "CP"].includes(m.rank))
  }, [])

  // Função para buscar voos do Supabase
  const fetchFlights = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("military_flights")
      .select("*")
      .order("date", { ascending: true })
      .order("time_zulu", { ascending: true })

    if (error) {
      console.error("Erro ao buscar voos:", error)
      toast({ title: "Erro", description: "Não foi possível carregar os voos.", variant: "destructive" })
    } else {
      setFlights(
        data.map((f: any) => ({
          id: f.id,
          date: parseISO(f.date), // Converter string ISO para Date
          timeZulu: f.time_zulu, // Mapeamento explícito
          timeBrasilia: f.time_brasilia, // Mapeamento explícito
          pilotIds: f.pilot_ids, // Mapeamento explícito (já é array)
          description: f.description || undefined,
        })) as FlightRecord[],
      )
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    fetchFlights()
  }, [fetchFlights])

  const resetForm = () => {
    setFlightDate(undefined)
    setFlightTimeLocal("")
    setSelectedPilots([])
    setFlightDescription("")
    setEditingFlight(null)
    setIsDialogOpen(false)
  }

  const handleSaveFlight = async () => {
    if (!flightDate || !flightTimeLocal || selectedPilots.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha a data, hora e selecione pelo menos um piloto.",
        variant: "destructive",
      })
      return
    }

    // Combine date and local time to create a Date object in local timezone
    const [hours, minutes] = flightTimeLocal.split(":").map(Number)
    let localDateTime = setHours(flightDate, hours)
    localDateTime = setMinutes(localDateTime, minutes)

    // Convert local time to Zulu (UTC)
    const timeZulu = formatInTimeZone(localDateTime, "UTC", "HH:mm'Z'")

    // Convert local time to Brasília local time string for display
    const timeBrasilia = formatInTimeZone(localDateTime, BRASILIA_TIMEZONE, "HH:mm")

    const flightData = {
      date: format(flightDate, "yyyy-MM-dd"), // Formatar para DATE do Supabase
      time_zulu: timeZulu, // Mapeamento explícito
      time_brasilia: timeBrasilia, // Mapeamento explícito
      pilot_ids: selectedPilots, // Mapeamento explícito
      description: flightDescription || null, // Usar null para campos opcionais vazios
    }

    if (editingFlight) {
      const { error } = await supabase.from("military_flights").update(flightData).eq("id", editingFlight.id)

      if (error) {
        console.error("Erro ao atualizar voo:", error)
        toast({ title: "Erro", description: "Não foi possível atualizar o voo.", variant: "destructive" })
      } else {
        toast({
          title: "Sucesso",
          description: "Voo atualizado.",
        })
        fetchFlights() // Recarregar voos
      }
    } else {
      const { error } = await supabase.from("military_flights").insert([flightData])

      if (error) {
        console.error("Erro ao agendar voo:", error)
        toast({ title: "Erro", description: "Não foi possível agendar o voo.", variant: "destructive" })
      } else {
        toast({
          title: "Sucesso",
          description: "Voo agendado.",
        })
        fetchFlights() // Recarregar voos
      }
    }
    resetForm()
  }

  const handleEditClick = (flight: FlightRecord) => {
    setEditingFlight(flight)
    setFlightDate(flight.date)
    setFlightTimeLocal(flight.timeBrasilia) // Usar timeBrasilia para preencher o input local
    setSelectedPilots(flight.pilotIds)
    setFlightDescription(flight.description || "")
    setIsDialogOpen(true)
  }

  const handleDeleteFlight = async (id: string) => {
    const { error } = await supabase.from("military_flights").delete().eq("id", id)

    if (error) {
      console.error("Erro ao remover voo:", error)
      toast({ title: "Erro", description: "Não foi possível remover o voo.", variant: "destructive" })
    } else {
      toast({
        title: "Sucesso",
        description: "Voo removido.",
      })
      fetchFlights() // Recarregar voos
    }
  }

  const getPilotNames = (ids: string[]) => {
    return ids
      .map((id) => {
        const pilot = eligiblePilots.find((p) => p.id === id)
        return pilot ? `${pilot.rank} ${pilot.name}`.trim() : "Desconhecido"
      })
      .join(", ")
  }

  const sortedFlights = [...flights].sort((a, b) => {
    // Sort by date, then by timeZulu
    if (isBefore(a.date, b.date)) return -1
    if (isBefore(b.date, a.date)) return 1
    return a.timeZulu.localeCompare(b.timeZulu)
  })

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Carregando Voos...</CardTitle>
          <CardDescription>Aguarde enquanto carregamos as informações do Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Agendamento de Voos</CardTitle>
        <CardDescription>Agende voos e selecione os pilotos responsáveis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agendar Novo Voo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingFlight ? "Editar Voo" : "Agendar Voo"}</DialogTitle>
              <DialogDescription>Preencha os detalhes do voo.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="flight-date">Data do Voo</Label>
                <DatePicker date={flightDate} setDate={setFlightDate} placeholder="Selecione a data do voo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flight-time">Hora do Voo (Local)</Label>
                <Input
                  id="flight-time"
                  type="time"
                  value={flightTimeLocal}
                  onChange={(e) => setFlightTimeLocal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pilots">Pilotos</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      {selectedPilots.length > 0 ? getPilotNames(selectedPilots) : "Selecionar Pilotos"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuLabel>Selecionar Pilotos</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {eligiblePilots.map((pilot) => (
                      <DropdownMenuCheckboxItem
                        key={pilot.id}
                        checked={selectedPilots.includes(pilot.id)}
                        onCheckedChange={(checked) => {
                          setSelectedPilots((prev) =>
                            checked ? [...prev, pilot.id] : prev.filter((id) => id !== pilot.id),
                          )
                        }}
                      >
                        {`${pilot.rank} ${pilot.name}`.trim()}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flight-description">Descrição (Opcional)</Label>
                <Textarea
                  id="flight-description"
                  placeholder="Detalhes adicionais sobre o voo..."
                  value={flightDescription}
                  onChange={(e) => setFlightDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveFlight}>
                {editingFlight ? "Salvar Alterações" : "Agendar Voo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <h3 className="text-lg font-semibold mt-8">Voos Agendados</h3>
        {sortedFlights.length === 0 ? (
          <p className="text-muted-foreground">Nenhum voo agendado.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora (Z)</TableHead>
                  <TableHead>Hora (BR)</TableHead>
                  <TableHead>Pilotos</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell>{format(flight.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{flight.timeZulu}</TableCell>
                    <TableCell>{flight.timeBrasilia}</TableCell>
                    <TableCell>{getPilotNames(flight.pilotIds)}</TableCell>
                    <TableCell>{flight.description || "-"}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(flight)}
                        aria-label={`Editar voo em ${format(flight.date, "dd/MM/yyyy", { locale: ptBR })}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteFlight(flight.id)}
                        aria-label={`Remover voo em ${format(flight.date, "dd/MM/yyyy", { locale: ptBR })}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
