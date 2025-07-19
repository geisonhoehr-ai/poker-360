"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase" // Corrigido: import { supabase }
import { useToast } from "@/components/ui/use-toast"

export function SupabaseRealtimeListener() {
  const { toast } = useToast()
  // Removido: const supabase = createClient()

  useEffect(() => {
    const handleRealtimeEvent = (payload: any, tableName: string) => {
      let message = ""
      let title = ""

      switch (payload.eventType) {
        case "INSERT":
          title = `Novo registro em ${tableName}`
          message = `Um novo item foi adicionado: ${JSON.stringify(payload.new)}`
          break
        case "UPDATE":
          title = `Registro atualizado em ${tableName}`
          message = `Um item foi atualizado: ${JSON.stringify(payload.new)}`
          break
        case "DELETE":
          title = `Registro excluído em ${tableName}`
          message = `Um item foi excluído: ${JSON.stringify(payload.old)}`
          break
        default:
          return
      }

      toast({
        title: title,
        description: message,
        duration: 5000,
      })
    }

    const channels = [
      supabase
        .channel("military_events_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "military_events" }, (payload) =>
          handleRealtimeEvent(payload, "Avisos e Eventos"),
        )
        .subscribe(),
      supabase
        .channel("military_flights_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "military_flights" }, (payload) =>
          handleRealtimeEvent(payload, "Voo"),
        )
        .subscribe(),
      supabase
        .channel("military_justifications_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "military_justifications" }, (payload) =>
          handleRealtimeEvent(payload, "Justificativas"),
        )
        .subscribe(),
      supabase
        .channel("daily_permanence_records_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "daily_permanence_records" }, (payload) =>
          handleRealtimeEvent(payload, "Permanência"),
        )
        .subscribe(),
      supabase
        .channel("military_personal_notes_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "military_personal_notes" }, (payload) =>
          handleRealtimeEvent(payload, "Minhas Notas"),
        )
        .subscribe(),
    ]

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [toast, supabase])

  return null // Este componente não renderiza nada visível
}
