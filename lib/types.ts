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
  reason: string // e.g., "Férias", "Missão", "Dispensa Laudo, "Curso"
  startDate: Date
  endDate: Date
}

export type AttendanceRecord = {
  id: string // Adicionado ID para facilitar a edição/remoção no histórico
  militaryId: string
  militaryName: string // Adicionado para facilitar a exibição/exportação
  rank: string // Adicionado para facilitar a exibição/exportação
  callType: CallType
  date: string // YYYY-MM-DD
  status: AbsenceReason
}

export type Event = {
  id: string
  title: string
  description?: string // Nova propriedade
  date: Date
  time?: string // Optional time, e.g., "14:30"
  createdByMilitaryId?: string // Novo: Militar que criou o evento
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
  id: string // UUID for the record
  militaryId: string
  militaryName: string
  date: string // YYYY-MM-DD
  checklist: PermanenceChecklistItem[]
}

export type FlightRecord = {
  id: string
  date: Date
  timeZulu: string // Horário em Zulu (UTC)
  timeBrasilia: string // Horário local de Brasília
  pilotIds: string[] // IDs dos pilotos
  description?: string // Detalhes do voo
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
  timestamp: string // ISO string
}
