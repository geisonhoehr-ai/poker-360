// lib/types.ts
export type MilitaryMember = {
  id: string
  rank: string
  name: string
}

export type CallType = "Início de Expediente" | "Término de Expediente" | "Formatura" | "Palestra"

export type AbsenceReason =
  | "PRESENTE"
  | "AUSENTE"
  | "DISPENSA"
  | "ENTRANDO DE SERVIÇO"
  | "FORMATURA"
  | "GSAU"
  | "HÓRUS"
  | "MERCADO"
  | "REUNIÃO"
  | "SAINDO DE SERVIÇO"
  | "TACF"
  | "VOO ✈︎"
  | "VOO NOTURNO"

export type Justification = {
  id: string
  militaryId: string
  reason: string
  startDate: Date
  endDate: Date
}

export type AttendanceRecord = {
  id: string
  militaryId: string
  militaryName: string
  rank: string
  callType: CallType
  date: string
  status: AbsenceReason
}

export type Event = {
  id: string
  title: string
  description?: string
  date: Date
  time?: string
  createdByMilitaryId?: string
}

export type NoteItem = {
  id: string
  content: string
  isCompleted: boolean
}

export type PermanenceChecklistItem = {
  id: string
  content: string
  isCompleted: boolean
}

export type DailyPermanenceRecord = {
  id: string
  militaryId: string
  militaryName: string
  date: string
  checklist: PermanenceChecklistItem[]
}

export type FlightRecord = {
  id: string
  date: Date
  timeZulu: string
  timeBrasilia: string
  pilotIds: string[]
  description?: string
}

export type Key = {
  id: string
  roomNumber: string
  roomName: string
}

export type KeyMovement = {
  id: string
  keyId: string
  type: "retirada" | "entrega"
  militaryId: string
  timestamp: string
}
