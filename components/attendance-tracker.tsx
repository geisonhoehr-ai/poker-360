"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle } from "lucide-react"
import { militaryPersonnel, callTypes, absenceReasons } from "@/lib/static-data"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import type { AttendanceRecord, CallType, AbsenceReason } from "@/lib/types"

function AttendanceTracker() {
  const [selectedMilitary, setSelectedMilitary] = useState<string>("")
  const [selectedCallType, setSelectedCallType] = useState<CallType | "">("")
  const [selectedStatus, setSelectedStatus] = useState<AbsenceReason | "">("")
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const today = format(new Date(), "yyyy-MM-dd")
  const [status, setStatus] = useState<"presente" | "ausente" | null>(null)

  useEffect(() => {
    fetchAttendanceHistory()
  }, [])

  const fetchAttendanceHistory = async () => {
    const { data: records, error } = await supabase
      .from("military_attendance_records")
      .select("*")
      .order("date", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching attendance history:", error)
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de presença.",
        variant: "destructive",
      })
    } else {
      setAttendanceHistory(records as AttendanceRecord[])
    }
  }

  const handleSubmit = async () => {
    if (!selectedMilitary || !selectedCallType || !selectedStatus) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    const military = militaryPersonnel.find((m) => m.id === selectedMilitary)
    if (!military) {
      toast({
        title: "Militar não encontrado",
        description: "O militar selecionado não é válido.",
        variant: "destructive",
      })
      return
    }

    const newRecord: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt"> = {
      militaryId: military.id,
      militaryName: military.name,
      rank: military.rank,
      callType: selectedCallType,
      date: today,
      status: selectedStatus,
    }

    const { data, error } = await supabase.from("military_attendance_records").insert([newRecord]).select()

    if (error) {
      console.error("Error inserting attendance record:", error)
      toast({
        title: "Erro ao registrar presença",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Presença Registrada!",
        description: `${military.name} - ${selectedStatus} para ${selectedCallType} em ${today}.`,
      })
      setSelectedMilitary("")
      setSelectedCallType("")
      setSelectedStatus("")
      fetchAttendanceHistory() // Refresh history
    }
  }

  const handleMarkAttendance = (newStatus: "presente" | "ausente") => {
    setStatus(newStatus)
    console.log(`Presença marcada como: ${newStatus}`)
    // Lógica para registrar a presença no banco de dados
  }

  return (
    <div className="p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registro de Presença</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Button
              variant={status === "presente" ? "default" : "outline"}
              onClick={() => handleMarkAttendance("presente")}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" /> Presente
            </Button>
            <Button
              variant={status === "ausente" ? "destructive" : "outline"}
              onClick={() => handleMarkAttendance("ausente")}
              className="flex items-center gap-2"
            >
              <XCircle className="h-5 w-5" /> Ausente
            </Button>
          </div>
          {status && (
            <p className="text-sm text-muted-foreground">
              Status atual: <span className="font-semibold">{status.toUpperCase()}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Select value={selectedMilitary} onValueChange={setSelectedMilitary}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Militar" />
            </SelectTrigger>
            <SelectContent>
              {militaryPersonnel.map((militar) => (
                <SelectItem key={militar.id} value={militar.id}>
                  {militar.rank} {militar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCallType} onValueChange={setSelectedCallType}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Chamada" />
            </SelectTrigger>
            <SelectContent>
              {callTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {absenceReasons.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSubmit} className="col-span-full">
            Registrar Presença
          </Button>

          {attendanceHistory.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum registro de presença encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Militar</th>
                    <th className="p-2 text-left">Chamada</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((record) => (
                    <tr key={record.id} className="border-b last:border-b-0">
                      <td className="p-2">{record.date}</td>
                      <td className="p-2">
                        {record.rank} {record.militaryName}
                      </td>
                      <td className="p-2">{record.callType}</td>
                      <td className="p-2">{record.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { AttendanceTracker }
export default AttendanceTracker
