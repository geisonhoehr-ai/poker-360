"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function SupabaseRealtimeListener() {
  const { toast } = useToast()

  useEffect(() => {
    // Listener para military_events
    const eventsChannel = supabase
      .channel("events_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "military_events" }, (payload) => {
        console.log("Mudança em military_events!", payload)
        if (payload.eventType === "INSERT") {
          const newEvent = payload.new as any
          toast({
            title: "Novo Evento Adicionado!",
            description: `"${newEvent.title}" em ${format(new Date(newEvent.date), "dd/MM/yyyy", { locale: ptBR })} ${newEvent.time ? `às ${newEvent.time}` : ""}.`,
            duration: 5000,
          })
        } else if (payload.eventType === "UPDATE") {
          const updatedEvent = payload.new as any
          toast({
            title: "Evento Atualizado!",
            description: `O evento "${updatedEvent.title}" foi atualizado.`,
            duration: 5000,
          })
        } else if (payload.eventType === "DELETE") {
          const oldEvent = payload.old as any
          toast({
            title: "Evento Removido!",
            description: `O evento "${oldEvent.title}" foi removido.`,
            variant: "destructive",
            duration: 5000,
          })
        }
      })
      .subscribe()

    // Listener para military_flights
    const flightsChannel = supabase
      .channel("flights_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "military_flights" }, (payload) => {
        console.log("Mudança em military_flights!", payload)
        if (payload.eventType === "INSERT") {
          const newFlight = payload.new as any
          toast({
            title: "Novo Voo Agendado!",
            description: `Voo em ${format(new Date(newFlight.date), "dd/MM/yyyy", { locale: ptBR })} às ${newFlight.time_brasilia} (BR).`,
            duration: 5000,
          })
        } else if (payload.eventType === "UPDATE") {
          const updatedFlight = payload.new as any
          toast({
            title: "Voo Atualizado!",
            description: `Voo em ${format(new Date(updatedFlight.date), "dd/MM/yyyy", { locale: ptBR })} às ${updatedFlight.time_brasilia} (BR) foi atualizado.`,
            duration: 5000,
          })
        } else if (payload.eventType === "DELETE") {
          const oldFlight = payload.old as any
          toast({
            title: "Voo Removido!",
            description: `Um voo em ${format(new Date(oldFlight.date), "dd/MM/yyyy", { locale: ptBR })} foi removido.`,
            variant: "destructive",
            duration: 5000,
          })
        }
      })
      .subscribe()

    // Listener para military_justifications
    const justificationsChannel = supabase
      .channel("justifications_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "military_justifications" }, (payload) => {
        console.log("Mudança em military_justifications!", payload)
        if (payload.eventType === "INSERT") {
          const newJustification = payload.new as any
          toast({
            title: "Nova Justificativa Adicionada!",
            description: `Justificativa para o militar ${newJustification.military_id} (${newJustification.reason}) adicionada.`,
            duration: 5000,
          })
        } else if (payload.eventType === "UPDATE") {
          const updatedJustification = payload.new as any
          toast({
            title: "Justificativa Atualizada!",
            description: `Justificativa para o militar ${updatedJustification.military_id} (${updatedJustification.reason}) foi atualizada.`,
            duration: 5000,
          })
        } else if (payload.eventType === "DELETE") {
          const oldJustification = payload.old as any
          toast({
            title: "Justificativa Removida!",
            description: `Justificativa para o militar ${oldJustification.military_id} (${oldJustification.reason}) foi removida.`,
            variant: "destructive",
            duration: 5000,
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(eventsChannel)
      supabase.removeChannel(flightsChannel)
      supabase.removeChannel(justificationsChannel)
    }
  }, [toast])

  return null // Este componente não renderiza nada visível
}
