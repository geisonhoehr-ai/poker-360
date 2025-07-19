"use client"

import { useState, useEffect, useCallback } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PlusCircle, Pencil, LogIn, LogOut, Trash2, KeyRound } from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { militaryPersonnel } from "@/lib/data"
import type { Key, KeyMovement } from "@/lib/types"
import { supabase } from "@/lib/supabase"

export function KeyManagement() {
  const { toast } = useToast()
  const [keys, setKeys] = useState<Key[]>([])
  const [keyMovements, setKeyMovements] = useState<KeyMovement[]>([])
  const [roomNumber, setRoomNumber] = useState<string>("")
  const [roomName, setRoomName] = useState<string>("")
  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<Key | null>(null)

  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [selectedKeyInMovementDialogId, setSelectedKeyInMovementDialogId] = useState<string>("")
  const [movementType, setMovementType] = useState<"retirada" | "entrega" | null>(null)
  const [movementMilitaryId, setMovementMilitaryId] = useState<string>("")

  const [loadingKeys, setLoadingKeys] = useState(true)
  const [loadingMovements, setLoadingMovements] = useState(true)

  // Funções para buscar dados do Supabase
  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true)
    const { data, error } = await supabase
      .from("claviculario_keys")
      .select("*")
      .order("room_number", { ascending: true })
    if (error) {
      console.error("Erro ao buscar chaves:", error)
      toast({ title: "Erro", description: "Não foi possível carregar as chaves.", variant: "destructive" })
    } else {
      setKeys(
        data.map((k: any) => ({
          id: k.id,
          roomNumber: k.room_number,
          roomName: k.room_name,
        })) as Key[],
      )
      console.log("Chaves carregadas:", data)
    }
    setLoadingKeys(false)
  }, [toast])

  const fetchKeyMovements = useCallback(async () => {
    setLoadingMovements(true)
    const { data, error } = await supabase
      .from("claviculario_movements")
      .select("*")
      .order("timestamp", { ascending: false })
    if (error) {
      console.error("Erro ao buscar movimentos de chaves:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os movimentos de chaves.",
        variant: "destructive",
      })
    } else {
      setKeyMovements(
        data.map((m: any) => ({
          id: m.id,
          keyId: m.key_id,
          type: m.type,
          militaryId: m.military_id,
          timestamp: m.timestamp,
        })) as KeyMovement[],
      )
    }
    setLoadingMovements(false)
  }, [toast])

  useEffect(() => {
    fetchKeys()
    fetchKeyMovements()
  }, [fetchKeys, fetchKeyMovements])

  const resetKeyForm = () => {
    setRoomNumber("")
    setRoomName("")
    setEditingKey(null)
    setIsKeyDialogOpen(false)
  }

  const handleSaveKey = async () => {
    if (!roomNumber || !roomName) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o número e o nome da sala.",
        variant: "destructive",
      })
      return
    }

    if (editingKey) {
      const { error } = await supabase
        .from("claviculario_keys")
        .update({ room_number: roomNumber, room_name: roomName })
        .eq("id", editingKey.id)

      if (error) {
        console.error("Erro ao atualizar chave:", error)
        toast({ title: "Erro", description: "Não foi possível atualizar a chave.", variant: "destructive" })
      } else {
        toast({ title: "Sucesso", description: "Chave atualizada." })
        fetchKeys()
      }
    } else {
      const { error } = await supabase
        .from("claviculario_keys")
        .insert([{ room_number: roomNumber, room_name: roomName }])

      if (error) {
        console.error("Erro ao cadastrar chave:", error)
        toast({ title: "Erro", description: "Não foi possível cadastrar a chave.", variant: "destructive" })
      } else {
        toast({ title: "Sucesso", description: "Chave cadastrada." })
        fetchKeys()
      }
    }
    resetKeyForm()
  }

  const handleEditKeyClick = (key: Key) => {
    setEditingKey(key)
    setRoomNumber(key.roomNumber)
    setRoomName(key.roomName)
    setIsKeyDialogOpen(true)
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta chave e todos os seus movimentos associados?")) {
      return
    }

    const { error: deleteMovementsError } = await supabase.from("claviculario_movements").delete().eq("key_id", id)

    if (deleteMovementsError) {
      console.error("Erro ao excluir movimentos da chave:", deleteMovementsError)
      toast({
        title: "Erro",
        description: "Não foi possível excluir os movimentos associados à chave.",
        variant: "destructive",
      })
      return
    }

    const { error: deleteKeyError } = await supabase.from("claviculario_keys").delete().eq("id", id)

    if (deleteKeyError) {
      console.error("Erro ao excluir chave:", deleteKeyError)
      toast({ title: "Erro", description: "Não foi possível excluir a chave.", variant: "destructive" })
    } else {
      toast({ title: "Sucesso", description: "Chave e seus movimentos foram removidos." })
      fetchKeys()
      fetchKeyMovements()
    }
  }

  const getMilitaryName = (id: string) => {
    const military = militaryPersonnel.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Desconhecido"
  }

  const getKeyStatus = (keyId: string) => {
    const movements = keyMovements
      .filter((m) => m.keyId === keyId)
      .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())

    if (movements.length === 0) {
      return { status: "Disponível", holder: null, time: null, type: null }
    }
    const lastMovement = movements[0]
    if (lastMovement.type === "retirada") {
      return {
        status: "Retirada",
        holder: getMilitaryName(lastMovement.militaryId),
        time: lastMovement.timestamp,
        type: "retirada",
      }
    } else {
      return {
        status: "Disponível",
        holder: getMilitaryName(lastMovement.militaryId),
        time: lastMovement.timestamp,
        type: "entrega",
      }
    }
  }

  const handleMovementActionFromTable = (key: Key, type: "retirada" | "entrega") => {
    setSelectedKeyInMovementDialogId(key.id)
    setMovementType(type)
    setMovementMilitaryId("")
    setIsMovementDialogOpen(true)
  }

  const handleOpenGenericMovementDialog = () => {
    setSelectedKeyInMovementDialogId("")
    setMovementType(null)
    setMovementMilitaryId("")
    setIsMovementDialogOpen(true)
  }

  const handleSaveMovement = async () => {
    if (!selectedKeyInMovementDialogId || !movementType || !movementMilitaryId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione a chave, o tipo de movimento e o militar.",
        variant: "destructive",
      })
      return
    }

    const newMovement = {
      key_id: selectedKeyInMovementDialogId,
      type: movementType,
      military_id: movementMilitaryId,
      timestamp: new Date().toISOString(),
    }

    const { error } = await supabase.from("claviculario_movements").insert([newMovement])

    if (error) {
      console.error("Erro ao salvar movimento de chave:", error)
      toast({ title: "Erro", description: "Não foi possível registrar o movimento.", variant: "destructive" })
    } else {
      const selectedKey = keys.find((k) => k.id === selectedKeyInMovementDialogId)
      toast({
        title: "Sucesso",
        description: `Chave ${selectedKey?.roomNumber || ""} - ${selectedKey?.roomName || ""} foi ${movementType === "retirada" ? "retirada" : "entregue"}.`,
      })
      fetchKeyMovements()
    }
    setIsMovementDialogOpen(false)
    setSelectedKeyInMovementDialogId("")
    setMovementType(null)
    setMovementMilitaryId("")
  }

  if (loadingKeys || loadingMovements) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Carregando Claviculário...</CardTitle>
          <CardDescription>Aguarde enquanto carregamos as informações das chaves.</CardDescription>
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
        <CardTitle>Claviculário</CardTitle>
        <CardDescription>Gerencie o registro de retirada e entrega de chaves.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dialog for adding/editing keys */}
        <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={resetKeyForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Nova Chave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingKey ? "Editar Chave" : "Cadastrar Chave"}</DialogTitle>
              <DialogDescription>Preencha os detalhes da chave.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="room-number">Número da Sala</Label>
                <Input
                  id="room-number"
                  placeholder="Ex: 101"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-name">Nome da Sala</Label>
                <Input
                  id="room-name"
                  placeholder="Ex: Sala de Reuniões"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveKey}>
                {editingKey ? "Salvar Alterações" : "Cadastrar Chave"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Novo botão para registrar movimento genérico */}
        <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={handleOpenGenericMovementDialog}>
              <KeyRound className="mr-2 h-4 w-4" /> Registrar Movimento de Chave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Movimento de Chave</DialogTitle>
              <DialogDescription>Selecione a chave, o tipo de movimento e o militar.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-select">Chave</Label>
                <Select
                  value={selectedKeyInMovementDialogId}
                  onValueChange={setSelectedKeyInMovementDialogId}
                  disabled={!!selectedKeyInMovementDialogId && keys.some((k) => k.id === selectedKeyInMovementDialogId)}
                >
                  <SelectTrigger id="key-select">
                    <SelectValue placeholder="Selecione a chave" />
                  </SelectTrigger>
                  <SelectContent>
                    {keys.map((key) => (
                      <SelectItem key={key.id} value={key.id}>
                        {`${key.roomNumber} - ${key.roomName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-type">Tipo de Movimento</Label>
                <Select
                  value={movementType || ""}
                  onValueChange={(value: "retirada" | "entrega") => setMovementType(value)}
                >
                  <SelectTrigger id="movement-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retirada">Retirada</SelectItem>
                    <SelectItem value="entrega">Entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="movement-military">Militar</Label>
                <Select value={movementMilitaryId} onValueChange={setMovementMilitaryId}>
                  <SelectTrigger id="movement-military">
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
                <Label>Horário</Label>
                <Input type="text" value={format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })} readOnly />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveMovement}>
                Confirmar Movimento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <h3 className="text-lg font-semibold mt-8">Chaves Cadastradas</h3>
        {keys.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma chave cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sala</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Movimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => {
                  const { status, holder, time, type } = getKeyStatus(key.id)
                  return (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.roomNumber}</TableCell>
                      <TableCell>{key.roomName}</TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${status === "Disponível" ? "text-green-600" : "text-red-600"}`}
                        >
                          {status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {time
                          ? `${type === "retirada" ? "Retirada por" : "Entregue por"} ${holder} em ${format(parseISO(time), "dd/MM/yyyy HH:mm", { locale: ptBR })}`
                          : "Nenhum movimento"}
                      </TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        {status === "Disponível" ? (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMovementActionFromTable(key, "retirada")}
                            aria-label="Registrar retirada"
                          >
                            <LogIn className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMovementActionFromTable(key, "entrega")}
                            aria-label="Registrar entrega"
                          >
                            <LogOut className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditKeyClick(key)}
                          aria-label={`Editar chave ${key.roomNumber}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteKey(key.id)}
                          aria-label={`Remover chave ${key.roomNumber}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
