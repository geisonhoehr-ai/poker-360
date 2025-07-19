"use client"

import { useState, useEffect, useCallback } from "react"
import { format, isAfter, isBefore, isEqual } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

import { DatePicker } from "./date-picker"
import { militaryPersonnel } from "@/lib/data"
import type { Justification } from "@/lib/types"
import { supabase } from "@/lib/supabase"

export function JustificationManager() {
  const { toast } = useToast()
  const [justifications, setJustifications] = useState<Justification[]>([])
  const [selectedMilitaryId, setSelectedMilitaryId] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingJustifications, setLoadingJustifications] = useState(true)

  const fetchJustifications = useCallback(async () => {
    setLoadingJustifications(true)
    const { data, error } = await supabase
      .from("military_justifications")
      .select("*")
      .order("end_date", { ascending: true }) // Ordenar para melhor visualização

    if (error) {
      console.error("Erro ao buscar justificativas do Supabase:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as justificativas do Supabase.",
        variant: "destructive",
      })
    } else {
      setJustifications(
        data.map((j: any) => ({
          id: j.id,
          militaryId: j.military_id,
          reason: j.reason,
          startDate: new Date(j.start_date),
          endDate: new Date(j.end_date),
        })),
      )
    }
    setLoadingJustifications(false)
  }, [toast])

  useEffect(() => {
    fetchJustifications()
  }, [fetchJustifications])

  const handleAddJustification = async () => {
    // Adicione 'async' aqui
    if (!selectedMilitaryId || !reason || !startDate || !endDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    if (isAfter(startDate, endDate)) {
      toast({
        title: "Erro",
        description: "A data de início não pode ser posterior à data de término.",
        variant: "destructive",
      })
      return
    }

    // Formatar datas para o formato 'YYYY-MM-DD' exigido pelo Supabase DATE type
    const formattedStartDate = format(startDate, "yyyy-MM-dd")
    const formattedEndDate = format(endDate, "yyyy-MM-dd")

    const { data, error } = await supabase
      .from("military_justifications")
      .insert([
        {
          military_id: selectedMilitaryId,
          reason: reason,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        },
      ])
      .select() // Adicione .select() para obter os dados inseridos, se necessário

    if (error) {
      console.error("Erro ao salvar justificativa no Supabase:", error)
      toast({
        title: "Erro ao salvar justificativa",
        description: `Detalhes: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Justificativa adicionada e salva no Supabase.",
      })
      fetchJustifications() // Recarrega a lista após a inserção
    }

    setSelectedMilitaryId("")
    setReason("")
    setStartDate(undefined)
    setEndDate(undefined)
    setIsDialogOpen(false)
  }

  const handleDeleteJustification = async (id: string) => {
    // Adicione 'async' aqui
    const { error } = await supabase.from("military_justifications").delete().eq("id", id)

    if (error) {
      console.error("Erro ao remover justificativa do Supabase:", error)
      toast({
        title: "Erro ao remover justificativa",
        description: `Detalhes: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Justificativa removida do Supabase.",
      })
      fetchJustifications() // Recarrega a lista após a remoção
    }
  }

  const getMilitaryName = (id: string) => {
    const military = militaryPersonnel.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Desconhecido"
  }

  const sortedJustifications = [...justifications].sort((a, b) => {
    // Sort by end date, then by start date
    if (isEqual(a.endDate, b.endDate)) {
      return isBefore(a.startDate, b.startDate) ? -1 : 1
    }
    return isBefore(a.endDate, b.endDate) ? -1 : 1
  })

  if (loadingJustifications) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Carregando Justificativas...</CardTitle>
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
        <CardTitle>Gerenciar Justificativas</CardTitle>
        <CardDescription>Adicione ou remova justificativas para militares ausentes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Justificativa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Justificativa</DialogTitle>
              <DialogDescription>Preencha os detalhes da justificativa para o militar.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="military">Militar</Label>
                <Select value={selectedMilitaryId} onValueChange={setSelectedMilitaryId}>
                  <SelectTrigger id="military">
                    <SelectValue placeholder="Selecione o militar" />
                  </SelectTrigger>
                  <SelectContent>
                    {militaryPersonnel.map((military) => (
                      <SelectItem key={military.id} value={military.id}>
                        {`${military.rank} ${military.name}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo</Label>
                <Input
                  id="reason"
                  placeholder="Ex: Férias, Missão, Dispensa Laudo, Curso"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddJustification}>
                Salvar Justificativa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <h3 className="text-lg font-semibold mt-8">Justificativas Atuais</h3>
        {justifications.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma justificativa registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Militar</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Término</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJustifications.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="font-medium">{getMilitaryName(j.militaryId)}</TableCell>
                    <TableCell>{j.reason}</TableCell>
                    <TableCell>{format(j.startDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{format(j.endDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteJustification(j.id)}
                        aria-label={`Remover justificativa para ${getMilitaryName(j.militaryId)}`}
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
