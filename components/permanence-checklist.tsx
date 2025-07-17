"use client"

import { useState, useEffect, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { v4 as uuidv4 } from "uuid"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input" // Import Input for new item
import { PlusCircle, Trash2, Pencil } from "lucide-react" // Import icons for manage section
import { useToast } from "@/hooks/use-toast"
import { militaryPersonnel, defaultPermanenceChecklistItems } from "@/lib/data"
import type { PermanenceChecklistItem, DailyPermanenceRecord } from "@/lib/types"

export function PermanenceChecklist() {
  const { toast } = useToast()
  const [selectedMilitaryId, setSelectedMilitaryId] = useState<string>("")
  const [currentDailyChecklist, setCurrentDailyChecklist] = useState<PermanenceChecklistItem[]>([]) // For daily completion
  const [personalChecklistTemplates, setPersonalChecklistTemplates] = useState<
    Record<string, PermanenceChecklistItem[]>
  >({}) // For custom templates
  const [dailyRecords, setDailyRecords] = useState<DailyPermanenceRecord[]>([])
  const [newChecklistItemContent, setNewChecklistItemContent] = useState<string>("")
  const [editingChecklistItem, setEditingChecklistItem] = useState<PermanenceChecklistItem | null>(null)

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), [])

  // Filter military personnel for S1 and S2 ranks only
  const permanenceMilitary = useMemo(() => {
    return militaryPersonnel.filter((m) => m.rank === "S1" || m.rank === "S2")
  }, [])

  useEffect(() => {
    // Load all daily records
    const storedRecords = localStorage.getItem("military_permanence_records")
    if (storedRecords) {
      setDailyRecords(JSON.parse(storedRecords))
    }
    // Load personal checklist templates
    const storedTemplates = localStorage.getItem("military_personal_checklist_templates")
    if (storedTemplates) {
      setPersonalChecklistTemplates(JSON.parse(storedTemplates))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("military_permanence_records", JSON.stringify(dailyRecords))
  }, [dailyRecords])

  useEffect(() => {
    localStorage.setItem("military_personal_checklist_templates", JSON.stringify(personalChecklistTemplates))
  }, [personalChecklistTemplates])

  // Load or initialize checklist when military or date changes
  useEffect(() => {
    if (!selectedMilitaryId) {
      setCurrentDailyChecklist([])
      return
    }

    const militaryName = permanenceMilitary.find((m) => m.id === selectedMilitaryId)?.name || "Desconhecido"

    // 1. Try to load today's completed checklist for the selected military
    const todayRecord = dailyRecords.find((record) => record.militaryId === selectedMilitaryId && record.date === today)

    if (todayRecord) {
      setCurrentDailyChecklist(todayRecord.checklist)
      toast({
        title: "Checklist Diário Carregado",
        description: `Checklist de ${militaryName} para hoje (${format(parseISO(today), "dd/MM/yyyy", { locale: ptBR })}) carregado.`,
      })
    } else {
      // 2. If no daily record, load the personal template for the selected military
      const personalTemplate = personalChecklistTemplates[selectedMilitaryId]

      if (personalTemplate && personalTemplate.length > 0) {
        // Use a copy of the template, resetting completion status for a new day
        setCurrentDailyChecklist(personalTemplate.map((item) => ({ ...item, isCompleted: false })))
        toast({
          title: "Checklist Padrão Carregado",
          description: `Checklist padrão de ${militaryName} carregado para hoje (${format(parseISO(today), "dd/MM/yyyy", { locale: ptBR })}).`,
        })
      } else {
        // 3. If no personal template, use the global default checklist
        const newChecklist = defaultPermanenceChecklistItems.map((item) => ({
          ...item,
          id: uuidv4(),
          isCompleted: false,
        }))
        setCurrentDailyChecklist(newChecklist)
        toast({
          title: "Novo Checklist Padrão",
          description: `Novo checklist padrão iniciado para ${militaryName} para hoje (${format(parseISO(today), "dd/MM/yyyy", { locale: ptBR })}).`,
        })
      }
    }
  }, [selectedMilitaryId, today, dailyRecords, personalChecklistTemplates, permanenceMilitary])

  const handleToggleComplete = (id: string) => {
    setCurrentDailyChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item)),
    )
  }

  const handleSaveDailyChecklist = () => {
    if (!selectedMilitaryId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o militar em permanência.",
        variant: "destructive",
      })
      return
    }

    const militaryName = permanenceMilitary.find((m) => m.id === selectedMilitaryId)?.name || "Desconhecido"

    const newRecord: DailyPermanenceRecord = {
      id: uuidv4(),
      militaryId: selectedMilitaryId,
      militaryName: militaryName,
      date: today,
      checklist: currentDailyChecklist,
    }

    // Remove any existing record for today for this military before adding the new one
    const updatedRecords = dailyRecords.filter(
      (record) => !(record.militaryId === selectedMilitaryId && record.date === today),
    )
    setDailyRecords([...updatedRecords, newRecord])

    toast({
      title: "Checklist Salvo!",
      description: `Checklist de permanência para ${militaryName} em ${format(parseISO(today), "dd/MM/yyyy", { locale: ptBR })} salvo com sucesso.`,
    })
  }

  const getMilitaryName = (id: string) => {
    const military = permanenceMilitary.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Selecione o militar"
  }

  const hasSavedChecklistForToday = useMemo(() => {
    return dailyRecords.some((record) => record.militaryId === selectedMilitaryId && record.date === today)
  }, [selectedMilitaryId, today, dailyRecords])

  // --- Template Management Functions ---
  const handleAddTemplateItem = () => {
    if (!newChecklistItemContent.trim()) {
      toast({
        title: "Erro",
        description: "O item do checklist não pode estar vazio.",
        variant: "destructive",
      })
      return
    }

    const newItem: PermanenceChecklistItem = {
      id: uuidv4(),
      content: newChecklistItemContent.trim(),
      isCompleted: false, // Templates are not completed
    }

    setPersonalChecklistTemplates((prev) => ({
      ...prev,
      [selectedMilitaryId]: [...(prev[selectedMilitaryId] || []), newItem],
    }))
    setNewChecklistItemContent("")
    toast({ title: "Sucesso", description: "Item adicionado ao checklist padrão." })
  }

  const handleEditTemplateItem = (item: PermanenceChecklistItem) => {
    setEditingChecklistItem(item)
    setNewChecklistItemContent(item.content)
  }

  const handleUpdateTemplateItem = () => {
    if (!editingChecklistItem || !newChecklistItemContent.trim()) {
      toast({
        title: "Erro",
        description: "O item do checklist não pode estar vazio.",
        variant: "destructive",
      })
      return
    }

    setPersonalChecklistTemplates((prev) => ({
      ...prev,
      [selectedMilitaryId]: (prev[selectedMilitaryId] || []).map((item) =>
        item.id === editingChecklistItem.id ? { ...item, content: newChecklistItemContent.trim() } : item,
      ),
    }))
    setNewChecklistItemContent("")
    setEditingChecklistItem(null)
    toast({ title: "Sucesso", description: "Item do checklist padrão atualizado." })
  }

  const handleDeleteTemplateItem = (id: string) => {
    setPersonalChecklistTemplates((prev) => ({
      ...prev,
      [selectedMilitaryId]: (prev[selectedMilitaryId] || []).filter((item) => item.id !== id),
    }))
    toast({ title: "Sucesso", description: "Item removido do checklist padrão." })
  }

  const currentMilitaryTemplate = useMemo(() => {
    return (
      personalChecklistTemplates[selectedMilitaryId] ||
      defaultPermanenceChecklistItems.map((item) => ({ ...item, id: uuidv4(), isCompleted: false }))
    )
  }, [selectedMilitaryId, personalChecklistTemplates])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Permanência - Checklist Diário</CardTitle>
        <CardDescription>
          Marque as atividades realizadas durante o serviço de permanência.
          <br />
          Data atual: {format(parseISO(today), "dd/MM/yyyy", { locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="military-permanence">Militar em Permanência</Label>
          <Select value={selectedMilitaryId} onValueChange={setSelectedMilitaryId}>
            <SelectTrigger id="military-permanence">
              <SelectValue placeholder="Selecione o militar" />
            </SelectTrigger>
            <SelectContent>
              {permanenceMilitary.map((military) => (
                <SelectItem key={military.id} value={military.id}>
                  {`${military.rank} ${military.name}`.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMilitaryId ? (
          <div className="space-y-8">
            {/* Section for Daily Completion */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Atividades para {getMilitaryName(selectedMilitaryId)}:</h3>
              {currentDailyChecklist.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma atividade definida para o checklist diário.</p>
              ) : (
                <div className="space-y-3">
                  {currentDailyChecklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-card text-card-foreground"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`checklist-item-${item.id}`}
                          checked={item.isCompleted}
                          onCheckedChange={() => handleToggleComplete(item.id)}
                          aria-label={`Marcar atividade "${item.content}" como ${item.isCompleted ? "não realizada" : "realizada"}`}
                        />
                        <Label
                          htmlFor={`checklist-item-${item.id}`}
                          className={`text-base ${item.isCompleted ? "line-through text-muted-foreground" : ""}`}
                        >
                          {item.content}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={handleSaveDailyChecklist} className="w-full">
                {hasSavedChecklistForToday ? "Atualizar Checklist do Dia" : "Salvar Checklist do Dia"}
              </Button>
            </div>

            {/* Section for Template Management - Sempre visível quando um militar é selecionado */}
            <div className="space-y-4 border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold">Gerenciar Checklist Padrão do Militar</h3>
              <p className="text-sm text-muted-foreground">
                Adicione, edite ou remova itens do checklist padrão para {getMilitaryName(selectedMilitaryId)}.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar novo item ao checklist padrão..."
                  value={newChecklistItemContent}
                  onChange={(e) => setNewChecklistItemContent(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      if (editingChecklistItem) {
                        handleUpdateTemplateItem()
                      } else {
                        handleAddTemplateItem()
                      }
                    }
                  }}
                />
                <Button onClick={editingChecklistItem ? handleUpdateTemplateItem : handleAddTemplateItem} size="icon">
                  {editingChecklistItem ? <Pencil className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                </Button>
              </div>

              {currentMilitaryTemplate.length === 0 ? (
                <p className="text-muted-foreground">Nenhum item no checklist padrão.</p>
              ) : (
                <div className="space-y-3">
                  {currentMilitaryTemplate.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-card text-card-foreground"
                    >
                      <Label className="text-base">{item.content}</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTemplateItem(item)}
                          aria-label={`Editar item "${item.content}"`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTemplateItem(item.id)}
                          aria-label={`Remover item "${item.content}"`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Selecione um militar para ver e gerenciar o checklist de permanência.</p>
        )}
      </CardContent>
    </Card>
  )
}
