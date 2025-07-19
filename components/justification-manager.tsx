"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"

function JustificationManager() {
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Justificativa enviada:", { type, description, startDate, endDate })
    // Lógica para enviar a justificativa
    setType("")
    setDescription("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Gerenciar Justificativas</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo de Justificativa</Label>
            <Input
              id="type"
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Ex: Médica, Serviço, Particular"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da justificativa..."
              className="min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="startDate">Data de Início</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="endDate">Data de Término</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">
            Enviar Justificativa
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export { JustificationManager }
export default JustificationManager
