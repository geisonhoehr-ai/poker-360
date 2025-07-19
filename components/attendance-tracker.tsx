"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format, isWithinInterval, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

import { militaryPersonnel, callTypes, absenceReasons } from "@/lib/data"
import type { AbsenceReason, CallType, Justification, AttendanceRecord } from "@/lib/types"
import { supabase } from "@/lib/supabase"

import { CheckCircle, XCircle, Shield, User } from "lucide-react"

export function AttendanceTracker() {
  const { toast } = useToast()
  const [currentCallType, setCurrentCallType] = useState<CallType | "">("")
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AbsenceReason>>({})
  const [justifications, setJustifications] = useState<Justification[]>([])
  const [loadingJustifications, setLoadingJustifications] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(true)
  const currentDate = useMemo(() => new Date(), [])

  // Função para buscar justificativas do Supabase
  const fetchJustifications = useCallback(async () => {
    setLoadingJustifications(true)
    console.log("Fetching justifications from Supabase...")
    const { data, error } = await supabase
      .from("military_justifications")
      .select("*")
      .gte("end_date", format(currentDate, "yyyy-MM-dd")) // Apenas justificativas ativas ou futuras

    if (error) {
      console.error("Erro ao buscar justificativas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as justificativas do Supabase.",
        variant: "destructive",
      })
    } else {
      const fetchedJustifications = data.map((j: any) => ({
        id: j.id,
        militaryId: j.military_id,
        reason: j.reason,
        startDate: parseISO(j.start_date), // Converter string ISO para Date
        endDate: parseISO(j.end_date), // Converter string ISO para Date
      }))
      setJustifications(fetchedJustifications)
      console.log("Justificativas carregadas:", fetchedJustifications)
    }
    setLoadingJustifications(false)
  }, [currentDate, toast])

  // Função para buscar registros de faltas do Supabase (opcional, para pré-preencher se houver)
  const fetchAttendanceRecords = useCallback(async () => {
    setLoadingAttendance(true)
    console.log("Fetching attendance records from Supabase...")
    const { data, error } = await supabase
      .from("military_attendance_records")
      .select("*")
      .eq("date", format(currentDate, "yyyy-MM-dd")) // Buscar apenas registros do dia atual

    if (error) {
      console.error("Erro ao buscar registros de faltas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros de faltas do Supabase.",
        variant: "destructive",
      })
    } else {
      const initialStatuses: Record<string, AbsenceReason> = {}
      data.forEach((record: AttendanceRecord) => {
        if (!record.status.startsWith("JUSTIFICADO")) {
          initialStatuses[record.militaryId] = record.status as AbsenceReason
        }
      })
      setAttendanceStatuses(initialStatuses)
      console.log("Registros de faltas carregados:", data)
    }
    setLoadingAttendance(false)
  }, [currentDate, toast])

  useEffect(() => {
    fetchJustifications()
    fetchAttendanceRecords()
  }, [fetchJustifications, fetchAttendanceRecords])

  const isMilitaryJustified = (militaryId: string) => {
    const justified = justifications.some((j) => {
      if (j.militaryId === militaryId) {
        const isWithin = isWithinInterval(currentDate, { start: j.startDate, end: j.endDate })
        // console.log(`Militar ${militaryId} - Justificativa: ${j.reason}, Início: ${j.startDate}, Fim: ${j.endDate}, Dentro do intervalo: ${isWithin}`)
        return isWithin
      }
      return false
    })
    return justified
  }

  const getJustificationReason = (militaryId: string) => {
    const justification = justifications.find((j) => {
      if (j.militaryId === militaryId) {
        return isWithinInterval(currentDate, { start: j.startDate, end: j.endDate })
      }
      return false
    })
    return justification?.reason || ""
  }

  const getStatusIcon = (militaryId: string, isJustified: boolean) => {
    if (isJustified) {
      return <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    }

    const status = attendanceStatuses[militaryId] || "AUSENTE"
    if (status === "PRESENTE") {
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
    }
    if (status === "AUSENTE") {
      return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
    }
    return <User className="h-5 w-5 text-muted-foreground" />
  }

  const allMilitaryPersonnel = useMemo(() => {
    return militaryPersonnel.map((military) => ({
      ...military,
      isJustified: isMilitaryJustified(military.id),
      justificationReason: getJustificationReason(military.id),
    }))
  }, [justifications, currentDate])

  const handleStatusChange = (militaryId: string, status: AbsenceReason) => {
    const military = allMilitaryPersonnel.find((m) => m.id === militaryId)
    if (military?.isJustified) {
      toast({
        title: "Atenção",
        description: "Militar justificado não pode ter o status alterado manualmente.",
        variant: "default",
      })
      return
    }

    setAttendanceStatuses((prev) => ({
      ...prev,
      [militaryId]: status,
    }))
  }

  const getRowColor = (militaryId: string, isJustified: boolean) => {
    if (isJustified) {
      return "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-500"
    }

    const status = attendanceStatuses[militaryId] || "AUSENTE"
    if (status === "PRESENTE") {
      return "bg-green-50 dark:bg-green-950/20 border-l-4 border-l-green-500"
    }
    return "bg-red-50 dark:bg-red-950/20 border-l-4 border-l-red-500"
  }

  const getDisplayStatus = (militaryId: string, isJustified: boolean, justificationReason: string) => {
    if (isJustified) {
      return `JUSTIFICADO (${justificationReason})`
    }
    return attendanceStatuses[militaryId] || "AUSENTE"
  }

  const handleSaveAttendance = async () => {
    if (!currentCallType) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o tipo de chamada.",
        variant: "destructive",
      })
      return
    }

    const recordsToInsert = allMilitaryPersonnel.map((military) => ({
      military_id: military.id,
      military_name: military.name,
      rank: military.rank,
      call_type: currentCallType,
      date: format(currentDate, "yyyy-MM-dd"),
      status: military.isJustified
        ? `JUSTIFICADO (${military.justificationReason})`
        : attendanceStatuses[military.id] || "AUSENTE",
    }))

    const { error: deleteError } = await supabase
      .from("military_attendance_records")
      .delete()
      .eq("date", format(currentDate, "yyyy-MM-dd"))
      .eq("call_type", currentCallType)

    if (deleteError) {
      console.error("Erro ao remover registros antigos:", deleteError)
      toast({
        title: "Erro",
        description: "Não foi possível limpar registros antigos antes de salvar.",
        variant: "destructive",
      })
      return
    }

    const { error: insertError } = await supabase.from("military_attendance_records").insert(recordsToInsert)

    if (insertError) {
      console.error("Erro ao salvar registros de faltas no Supabase:", insertError)
      toast({
        title: "Erro",
        description: "Não foi possível salvar os registros de faltas no Supabase.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: `Registros de faltas para "${currentCallType}" salvos no Supabase!`,
      })
      fetchAttendanceRecords()
    }
  }

  if (loadingJustifications || loadingAttendance) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Carregando Dados...</CardTitle>
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
        <CardTitle>Retirada de Faltas</CardTitle>
        <CardDescription>Registre a presença e ausência dos militares.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="call-type">Tipo de Chamada</Label>
          <Select value={currentCallType} onValueChange={(value: CallType) => setCurrentCallType(value)}>
            <SelectTrigger id="call-type">
              <SelectValue placeholder="Selecione o tipo de chamada" />
            </SelectTrigger>
            <SelectContent>
              {callTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Militares ({format(currentDate, "dd/MM/yyyy", { locale: ptBR })})</Label>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Militar</TableHead>
                  <TableHead className="w-[200px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allMilitaryPersonnel.map((military) => (
                  <TableRow
                    key={military.id}
                    className={`transition-all duration-300 ${getRowColor(military.id, military.isJustified)} ${
                      military.isJustified ? "opacity-90" : ""
                    }`}
                  >
                    <TableCell className="font-medium flex items-center gap-2">
                      {getStatusIcon(military.id, military.isJustified)}
                      {`${military.rank} ${military.name}`.trim()}
                    </TableCell>
                    <TableCell>
                      {military.isJustified ? (
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md text-center">
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            {getDisplayStatus(military.id, military.isJustified, military.justificationReason)}
                          </span>
                        </div>
                      ) : (
                        <Select
                          value={attendanceStatuses[military.id] || "AUSENTE"}
                          onValueChange={(value: AbsenceReason) => handleStatusChange(military.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            {absenceReasons.map((reason) => (
                              <SelectItem key={reason} value={reason}>
                                {reason}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
              <span>Presente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
              <span>Ausente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
              <span>Justificado</span>
            </div>
          </div>
        </div>

        <Button onClick={handleSaveAttendance} className="w-full" disabled={!currentCallType}>
          Salvar Retirada de Faltas
        </Button>
      </CardContent>
    </Card>
  )
}
