"use client"

import { useState, useEffect, useCallback } from "react"
import { PlusCircle, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { militaryPersonnel } from "@/lib/data"
import type { NoteItem } from "@/lib/types"
import { supabase } from "@/lib/supabase" // Importar o cliente Supabase

export function PersonalNotes() {
  const { toast } = useToast()
  const [selectedMilitaryId, setSelectedMilitaryId] = useState<string>("")
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [newNoteContent, setNewNoteContent] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Função para buscar notas do Supabase para o militar selecionado
  const fetchNotes = useCallback(
    async (militaryId: string) => {
      if (!militaryId) {
        setNotes([])
        return
      }
      setLoading(true)
      const { data, error } = await supabase
        .from("military_personal_notes")
        .select("*")
        .eq("military_id", militaryId)
        .order("created_at", { ascending: false }) // Ordenar por mais recente primeiro

      if (error) {
        console.error("Erro ao buscar notas pessoais:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as notas pessoais do Supabase.",
          variant: "destructive",
        })
        setNotes([])
      } else {
        setNotes(
          data.map((n: any) => ({
            id: n.id,
            content: n.content,
            isCompleted: n.is_completed, // Mapeamento explícito
          })) as NoteItem[],
        )
      }
      setLoading(false)
    },
    [toast],
  )

  // Carregar notas quando o militar selecionado muda
  useEffect(() => {
    fetchNotes(selectedMilitaryId)
  }, [selectedMilitaryId, fetchNotes])

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "Erro",
        description: "A nota não pode estar vazia.",
        variant: "destructive",
      })
      return
    }
    if (!selectedMilitaryId) {
      toast({
        title: "Erro",
        description: "Nenhum militar selecionado para adicionar notas.",
        variant: "destructive",
      })
      return
    }

    const { data, error } = await supabase
      .from("military_personal_notes")
      .insert([
        {
          military_id: selectedMilitaryId,
          content: newNoteContent.trim(),
          is_completed: false, // Mapeamento explícito
        },
      ])
      .select() // Retorna os dados inseridos

    if (error) {
      console.error("Erro ao adicionar nota:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a nota.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Nota adicionada.",
      })
      setNewNoteContent("")
      fetchNotes(selectedMilitaryId) // Recarregar notas após adicionar
    }
  }

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from("military_personal_notes").delete().eq("id", id)

    if (error) {
      console.error("Erro ao remover nota:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover a nota.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Nota removida.",
      })
      fetchNotes(selectedMilitaryId) // Recarregar notas após remover
    }
  }

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("military_personal_notes")
      .update({ is_completed: !currentStatus }) // Mapeamento explícito
      .eq("id", id)

    if (error) {
      console.error("Erro ao atualizar status da nota:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da nota.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Status da nota atualizado.",
      })
      fetchNotes(selectedMilitaryId) // Recarregar notas após atualizar
    }
  }

  const sortedNotes = [...notes].sort((a, b) => {
    // Completed items at the bottom
    if (a.isCompleted && !b.isCompleted) return 1
    if (!a.isCompleted && b.isCompleted) return -1
    return 0
  })

  const getMilitaryName = (id: string) => {
    const military = militaryPersonnel.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Selecione o militar"
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Carregando Notas...</CardTitle>
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
        <CardTitle>Minhas Notas e Checklist</CardTitle>
        <CardDescription>Deixe recados, guarde informações ou crie um checklist de atividades.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="military-notes">Militar</Label>
          <Select value={selectedMilitaryId} onValueChange={setSelectedMilitaryId}>
            <SelectTrigger id="military-notes">
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

        {selectedMilitaryId ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Anotações de {getMilitaryName(selectedMilitaryId)}</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar nova nota ou item de checklist..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddNote()
                  }
                }}
              />
              <Button onClick={handleAddNote} size="icon" aria-label="Adicionar nota">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>

            {sortedNotes.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma nota ou item de checklist adicionado para este militar.</p>
            ) : (
              <div className="space-y-3">
                {sortedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 border rounded-md bg-card text-card-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`note-${note.id}`}
                        checked={note.isCompleted}
                        onCheckedChange={() => handleToggleComplete(note.id, note.isCompleted)}
                        aria-label={`Marcar nota "${note.content}" como ${note.isCompleted ? "não concluída" : "concluída"}`}
                      />
                      <Label
                        htmlFor={`note-${note.id}`}
                        className={`text-base ${note.isCompleted ? "line-through text-muted-foreground" : ""}`}
                      >
                        {note.content}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNote(note.id)}
                      aria-label={`Remover nota "${note.content}"`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Selecione um militar para gerenciar suas notas e checklist.</p>
        )}
      </CardContent>
    </Card>
  )
}
