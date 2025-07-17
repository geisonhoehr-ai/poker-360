"use client"

import { useState, useEffect } from "react"
import { motivationalQuotes } from "@/lib/data"
import { format, isSameDay, parseISO } from "date-fns"

export function DailyQuotes() {
  const [quote, setQuote] = useState<string | null>(null) // Alterado para armazenar apenas uma frase
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    const storedDate = localStorage.getItem("quote_date") // Alterado o nome da chave
    const storedQuote = localStorage.getItem("quote_of_the_day") // Alterado o nome da chave

    if (storedDate && isSameDay(parseISO(storedDate), parseISO(today)) && storedQuote) {
      setQuote(storedQuote)
    } else {
      // Select a new random quote
      const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
      setQuote(newQuote)
      localStorage.setItem("quote_date", today)
      localStorage.setItem("quote_of_the_day", newQuote)
    }
  }, [today])

  if (!quote) {
    return null
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-card rounded-lg shadow-md mb-8 animate-in fade-in slide-in-from-top duration-500">
      <h2 className="text-lg font-semibold text-center mb-3 text-primary">Pensamento do Dia</h2>
      <p className="text-md italic text-center text-muted-foreground">&quot;{quote}&quot;</p>
    </div>
  )
}
