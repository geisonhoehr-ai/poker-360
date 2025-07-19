"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export default function SupabaseRealtimeListener() {
  const { toast } = useToast()

  useEffect(() => {
    const channels = [
      supabase
        .channel("attendance_records_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records" }, (payload) => {
          console.log("Change received!", payload)
          toast({
            title: "Atualização de Faltas",
            description: `Registro de falta ${payload.eventType} para ${payload.new?.military_member_name || payload.old?.military_member_name}.`,
          })
        })
        .subscribe(),

      supabase
        .channel("military_justifications_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "military_justifications" }, (payload) => {
          console.log("Change received!", payload)
          toast({
            title: "Atualização de Justificativas",
            description: `Justificativa ${payload.eventType} para ${payload.new?.military_member_name || payload.old?.military_member_name}.`,
          })
        })
        .subscribe(),

      supabase
        .channel("military_events_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "military_events" }, (payload) => {
          console.log("Change received!", payload)
          toast({
            title: "Atualização de Eventos",
            description: `Evento ${payload.eventType}: ${payload.new?.title || payload.old?.title}.`,
          })
        })
        .subscribe(),

      supabase
        .channel("military_flights_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "military_flights" }, (payload) => {
          console.log("Change received!", payload)
          toast({
            title: "Atualização de Voos",
            description: `Voo ${payload.eventType} para ${payload.new?.military_member_name || payload.old?.military_member_name}.`,
          })
        })
        .subscribe(),

      supabase
        .channel("daily_permanence_records_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "daily_permanence_records" }, (payload) => {
          console.log("Change received!", payload)
          toast({
            title: "Atualização de Permanência",
            description: `Registro de permanência ${payload.eventType} para ${payload.new?.military_member_name || payload.old?.military_member_name}.`,
          })
        })
        .subscribe(),

      supabase
        .channel("military_personal_notes_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "military_personal_notes" }, (payload) => {
          console.log("Change received!", payload)
          toast({
            title: "Atualização de Notas Pessoais",
            description: `Nota pessoal ${payload.eventType} para ${payload.new?.military_member_name || payload.old?.military_member_name}.`,
          })
        })
        .subscribe(),
    ]

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel))
    }
  }, [toast])

  return null
}
