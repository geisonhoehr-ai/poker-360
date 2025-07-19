import Image from "next/image"
import { ModeToggle } from "./mode-toggle"

interface AppHeaderProps {
  logoSrc: string
}

export function AppHeader({ logoSrc }: AppHeaderProps) {
  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-md mb-8">
      <div className="flex items-center gap-4">
        <Image
          src={logoSrc || "/placeholder.svg"}
          alt="Logo Esquadrão Poker"
          width={60}
          height={60}
          className="object-contain"
        />
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Sistema POKER 360</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            1º/10º GAV - ESQUADRÃO POKER
            <br />
            "Da Pátria os olhos... na guerra e na paz..."
          </p>
        </div>
      </div>
      <ModeToggle />
    </header>
  )
}
