// lib/data.ts
import type { AbsenceReason, CallType, MilitaryMember, PermanenceChecklistItem } from "./types"

/**
 * Militares cadastrados na aplicação.
 * Caso precise adicionar ou remover nomes, faça aqui.
 */
export const militaryPersonnel: MilitaryMember[] = [
  { id: "TC-carneiro", rank: "TC", name: "CARNEIRO" },
  { id: "MJ-maia", rank: "MJ", name: "MAIA" },
  { id: "CP-miranda", rank: "CP", name: "MIRANDA" },
  { id: "CP-camila-caldas", rank: "CP", name: "CAMILA CALDAS" },
  { id: "CP-farias", rank: "CP", name: "FARIAS" },
  { id: "CP-spinelli", rank: "CP", name: "SPINELLI" },
  { id: "CP-almeida", rank: "CP", name: "ALMEIDA" },
  { id: "CP-junior", rank: "CP", name: "JÚNIOR" },
  { id: "CP-felippe-miranda", rank: "CP", name: "FELIPPE MIRANDA" },
  { id: "CP-eduardo", rank: "CP", name: "EDUARDO" },
  { id: "CP-mairink", rank: "CP", name: "MAIRINK" },
  { id: "1T-ismael", rank: "1T", name: "ISMAEL" },
  { id: "2T-obregon", rank: "2T", name: "OBREGON" },
  { id: "SO-eliasafe", rank: "SO", name: "ELIAS" },
  { id: "1S-menezes", rank: "1S", name: "MENEZES" },
  { id: "2S-jacobs", rank: "2S", name: "JACOBS" },
  { id: "2S-ribas", rank: "2S", name: "RIBAS" },
  { id: "2S-edgar", rank: "2S", name: "EDGAR" },
  { id: "2S-madureiro", rank: "2S", name: "MADUREIRO" },
  { id: "2S-oriel", rank: "2S", name: "ORIEL" },
  { id: "2S-frank", rank: "2S", name: "FRANK" },
  { id: "3S-braz", rank: "3S", name: "BRAZ" },
  { id: "3S-pittigliani", rank: "3S", name: "PITTIGLIANI" },
  { id: "3S-l-teixeira", rank: "3S", name: "L. TEIXEIRA" },
  { id: "3S-maia", rank: "3S", name: "MAIA" },
  { id: "3S-anne", rank: "3S", name: "ANNE" },
  { id: "3S-jaques", rank: "3S", name: "JAQUES" },
  { id: "3S-vilela", rank: "3S", name: "VILELA" },
  { id: "3S-hoehr", rank: "3S", name: "HÖEHR" },
  { id: "3S-henrique", rank: "3S", name: "HENRIQUE" },
  { id: "S1-vieira", rank: "S1", name: "VIEIRA" },
  { id: "S1-nycolas", rank: "S1", name: "NYCOLAS" },
  { id: "S1-gabriel-reis", rank: "S1", name: "GABRIEL REIS" },
  { id: "S2-mateus-fontoura", rank: "S2", name: "MATEUS FONTOURA" },
  { id: "S2-douglas-silva", rank: "S2", name: "DOUGLAS SILVA" },
  { id: "S2-da-rosa", rank: "S2", name: "DA ROSA" },
  { id: "S2-denardin", rank: "S2", name: "DENARDIN" },
  { id: "S2-milanesi", rank: "S2", name: "MILANESI" },
  { id: "S2-joao-gabriel", rank: "S2", name: "JOÃO GABRIEL" },
  { id: "S2-vieira", rank: "S2", name: "VIEIRA" },
]

/**
 * Tipos de chamada disponíveis na aplicação.
 */
export const callTypes: CallType[] = ["Início de Expediente", "Término de Expediente", "Formatura", "Palestra"]

/**
 * Motivos de ausência / presença que aparecem no `AttendanceTracker`.
 * Mantenha a primeira posição como "PRESENTE" para facilitar a UX.
 */
export const absenceReasons: AbsenceReason[] = [
  "PRESENTE",
  "AUSENTE",
  "DISPENSA",
  "ENTRANDO DE SERVIÇO",
  "FORMATURA",
  "GSAU",
  "HÓRUS",
  "MERCADO",
  "REUNIÃO",
  "SAINDO DE SERVIÇO",
  "TACF",
  "VOO ✈︎",
  "VOO NOTURNO",
]

/**
 * Itens padrão do checklist de permanência (PermanenceChecklist).
 * Cada item receberá um `id` incremental quando gravado no banco.
 */
export const defaultPermanenceChecklistItems: Omit<PermanenceChecklistItem, "id" | "isCompleted">[] = [
  { content: "Verificar e-mails da caixa de entrada." },
  { content: "Checar rádio e sistemas de comunicação." },
  { content: "Registrar entrada/saída de visitantes." },
  { content: "Verificar segurança das instalações." },
  { content: "Organizar documentos pendentes." },
  { content: "Preparar relatório de ocorrências." },
  { content: "Verificar suprimentos de escritório." },
  { content: "Realizar ronda de rotina." },
  { content: "Atender chamadas telefônicas." },
  { content: "Manter área de trabalho organizada." },
]

/**
 * Mensagens motivacionais exibidas no componente DailyQuotes.
 */
export const motivationalQuotes: string[] = [
  "A disciplina é a ponte entre metas e realizações.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Não espere por oportunidades, crie-as.",
  "A persistência realiza o impossível.",
  "Seu único limite é você mesmo.",
  "Grandes coisas nunca vêm de zonas de conforto.",
  "Acredite em si mesmo e em tudo o que você é.",
  "A força não vem da capacidade física, mas de uma vontade indomável.",
  "Cada dia é uma nova chance para mudar sua vida.",
  "O futuro pertence àqueles que acreditam na beleza de seus sonhos.",
  "A coragem não é a ausência do medo, mas o triunfo sobre ele.",
  "Faça o necessário para ser feliz, mas lembre-se: felicidade é simples.",
  "O êxito é ir de fracasso em fracasso sem perder o entusiasmo.",
  "A vida é 10% o que acontece e 90% como você reage.",
  "Não importa quão devagar você vá, desde que não pare.",
]
