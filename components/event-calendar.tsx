"use client"

import { useState, useEffect, useRef, useCallback } from "react" // Adicionado useCallback
import { format, isBefore, isSameDay, setHours, setMinutes, parseISO } from "date-fns" // Adicionado parseISO
import { ptBR } from "date-fns/locale"
import { PlusCircle, Trash2, BellRing, Info, Pencil } from "lucide-react"

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { DatePicker } from "./date-picker"
import { militaryPersonnel } from "@/lib/data"
import type { Event } from "@/lib/types"
import { supabase } from "@/lib/supabase" // Importar o cliente Supabase

export function EventCalendar() {
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("")
  const [createdByMilitaryId, setCreatedByMilitaryId] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const notifiedEvents = useRef<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Função para buscar eventos do Supabase
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("military_events")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) {
      console.error("Erro ao buscar eventos:", error)
      toast({ title: "Erro", description: "Não foi possível carregar os eventos.", variant: "destructive" })
    } else {
      setEvents(
        data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description || undefined,
          date: parseISO(e.date), // Converter string ISO para Date
          time: e.time || undefined,
          createdByMilitaryId: e.created_by_military_id || undefined, // Mapeamento explícito
        })) as Event[],
      )
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Lógica de notificação (mantida, mas agora com dados do Supabase)
  useEffect(() => {
    const checkEvents = () => {
      const now = new Date()
      events.forEach((event) => {
        if (event.time && !notifiedEvents.current.has(event.id)) {
          const [hours, minutes] = event.time.split(":").map(Number)
          let eventDateTime = setHours(event.date, hours)
          eventDateTime = setMinutes(eventDateTime, minutes)

          // Notificar 15 minutos antes ou no horário exato
          const fifteenMinutesBefore = new Date(eventDateTime.getTime() - 15 * 60 * 1000)

          if (isSameDay(now, eventDateTime) && now >= fifteenMinutesBefore && now < eventDateTime) {
            toast({
              title: "Lembrete de Evento Próximo!",
              description: `${event.title} em ${format(eventDateTime, "HH:mm", { locale: ptBR })}. ${event.description ? `Detalhes: ${event.description}` : ""}`,
              action: <BellRing className="h-5 w-5" />,
              duration: 10000,
            })
            notifiedEvents.current.add(event.id)
          } else if (
            isSameDay(now, eventDateTime) &&
            now >= eventDateTime &&
            now < new Date(eventDateTime.getTime() + 5 * 60 * 1000)
          ) {
            // Notificar no horário e por 5 minutos depois
            toast({
              title: "Evento Agora!",
              description: `${event.title} está acontecendo agora. ${event.description ? `Detalhes: ${event.description}` : ""}`,
              action: <BellRing className="h-5 w-5" />,
              duration: 10000,
            })
            notifiedEvents.current.add(event.id)
          }
        }
      })
    }

    const interval = setInterval(checkEvents, 60 * 1000)
    checkEvents()
    return () => clearInterval(interval)
  }, [events, toast])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDate(undefined)
    setTime("")
    setCreatedByMilitaryId("")
    setEditingEvent(null)
    setIsDialogOpen(false)
  }

  const handleSaveEvent = async () => {
    if (!title || !date) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o título e a data do evento.",
        variant: "destructive",
      })
      return
    }

    const eventData = {
      title,
      description: description || null, // Usar null para campos opcionais vazios
      date: format(date, "yyyy-MM-dd"), // Formatar para DATE do Supabase
      time: time || null,
      created_by_military_id: createdByMilitaryId || null, // Mapeamento explícito
    }

    if (editingEvent) {
      // Update existing event
      const { error } = await supabase.from("military_events").update(eventData).eq("id", editingEvent.id)

      if (error) {
        console.error("Erro ao atualizar evento:", error)
        toast({ title: "Erro", description: "Não foi possível atualizar o evento.", variant: "destructive" })
      } else {
        toast({
          title: "Sucesso",
          description: "Evento atualizado.",
        })
        fetchEvents() // Recarregar eventos
      }
    } else {
      // Add new event
      const { error } = await supabase.from("military_events").insert([eventData])

      if (error) {
        console.error("Erro ao adicionar evento:", error)
        toast({ title: "Erro", description: "Não foi possível adicionar o evento.", variant: "destructive" })
      } else {
        toast({
          title: "Sucesso",
          description: "Evento adicionado.",
        })
        fetchEvents() // Recarregar eventos
      }
    }
    resetForm()
  }

  const handleEditClick = (event: Event) => {
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description || "")
    setDate(event.date)
    setTime(event.time || "")
    setCreatedByMilitaryId(event.createdByMilitaryId || "")
    setIsDialogOpen(true)
  }

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase.from("military_events").delete().eq("id", id)

    if (error) {
      console.error("Erro ao remover evento:", error)
      toast({ title: "Erro", description: "Não foi possível remover o evento.", variant: "destructive" })
    } else {
      toast({
        title: "Sucesso",
        description: "Evento removido.",
      })
      fetchEvents() // Recarregar eventos
    }
  }

  const getMilitaryName = (id: string | undefined) => {
    if (!id) return "N/A"
    const military = militaryPersonnel.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Desconhecido"
  }

  const sortedEvents = [...events].sort((a, b) => {
    // Sort by date, then by time if available
    if (isBefore(a.date, b.date)) return -1
    if (isBefore(b.date, a.date)) return 1

    if (a.time && b.time) {
      return a.time.localeCompare(b.time)
    }
    if (a.time) return -1 // Events with time come before events without time on the same date
    if (b.time) return 1
    return 0
  })

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Carregando Eventos...</CardTitle>
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
        <CardTitle>Avisos e Eventos</CardTitle>
        <CardDescription>Gerencie reuniões, atividades e lembretes importantes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Editar Evento" : "Adicionar Evento"}</DialogTitle>
              <DialogDescription>Preencha os detalhes do evento ou aviso.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Título</Label>
                <Input
                  id="event-title"
                  placeholder="Ex: Reunião no Auditório"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-description">Descrição (Opcional)</Label>
                <Textarea
                  id="event-description"
                  placeholder="Detalhes sobre o evento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Data</Label>
                <DatePicker date={date} setDate={setDate} placeholder="Selecione a data do evento" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Hora (Opcional)</Label>
                <Input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="created-by">Criado por (Opcional)</Label>
                <Select value={createdByMilitaryId} onValueChange={setCreatedByMilitaryId}>
                  <SelectTrigger id="created-by">
                    <SelectValue placeholder="Selecione o militar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {militaryPersonnel.map((military) => (
                      <SelectItem key={military.id} value={military.id}>
                        {`${military.rank} ${military.name}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveEvent}>
                {editingEvent ? "Salvar Alterações" : "Salvar Evento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <h3 className="text-lg font-semibold mt-8">Próximos Eventos</h3>
        {sortedEvents.length === 0 ? (
          <p className="text-muted-foreground">Nenhum evento ou aviso registrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {event.title}
                      {event.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{event.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell>{format(event.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{event.time || "-"}</TableCell>
                    <TableCell>{getMilitaryName(event.createdByMilitaryId)}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(event)}
                        aria-label={`Editar evento ${event.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        aria-label={`Remover evento ${event.title}`}
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
