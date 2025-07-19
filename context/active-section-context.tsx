"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

type ActiveSectionContextType = {
  activeSection: string
  setActiveSection: React.Dispatch<React.SetStateAction<string>>
  timeOfLastClick: number
  setTimeOfLastClick: React.Dispatch<React.SetStateAction<number>>
}

export const ActiveSectionContext = createContext<ActiveSectionContextType | null>(null)

export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<string>("Dashboard")
  const [timeOfLastClick, setTimeOfLastClick] = useState<number>(0) // to disable the observer temporarily when clicking a link

  return (
    <ActiveSectionContext.Provider
      value={{
        activeSection,
        setActiveSection,
        timeOfLastClick,
        setTimeOfLastClick,
      }}
    >
      {children}
    </ActiveSectionContext.Provider>
  )
}

export function useActiveSection() {
  const context = useContext(ActiveSectionContext)

  if (context === null) {
    throw new Error("useActiveSection must be used within an ActiveSectionProvider")
  }

  return context
}
