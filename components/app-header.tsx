import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import {
  MenuIcon,
  HomeIcon,
  CalendarIcon,
  ClipboardListIcon,
  PlaneIcon,
  KeyIcon,
  NotebookPenIcon,
  BarChartIcon,
} from "lucide-react"

export function AppHeader() {
  return (
    <header className="flex h-16 w-full items-center justify-between px-4 md:px-6 border-b">
      <Link className="flex items-center gap-2 font-semibold" href="#">
        <img src="/placeholder-logo.svg" alt="Logo" className="h-6 w-6" />
        <span className="sr-only">Military App</span>
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <Link className="flex items-center gap-2 hover:text-primary" href="/">
          <HomeIcon className="h-4 w-4" />
          Início
        </Link>
        <Link className="flex items-center gap-2 hover:text-primary" href="/attendance">
          <ClipboardListIcon className="h-4 w-4" />
          Faltas
        </Link>
        <Link className="flex items-center gap-2 hover:text-primary" href="/justifications">
          <CalendarIcon className="h-4 w-4" />
          Justificativas
        </Link>
        <Link className="flex items-center gap-2 hover:text-primary" href="/flights">
          <PlaneIcon className="h-4 w-4" />
          Voos
        </Link>
        <Link className="flex items-center gap-2 hover:text-primary" href="/keys">
          <KeyIcon className="h-4 w-4" />
          Chaves
        </Link>
        <Link className="flex items-center gap-2 hover:text-primary" href="/notes">
          <NotebookPenIcon className="h-4 w-4" />
          Notas
        </Link>
        <Link className="flex items-center gap-2 hover:text-primary" href="/history">
          <BarChartIcon className="h-4 w-4" />
          Histórico
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button className="md:hidden bg-transparent" size="icon" variant="outline">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 p-4">
              <Link className="flex items-center gap-2 hover:text-primary" href="/">
                <HomeIcon className="h-4 w-4" />
                Início
              </Link>
              <Link className="flex items-center gap-2 hover:text-primary" href="/attendance">
                <ClipboardListIcon className="h-4 w-4" />
                Faltas
              </Link>
              <Link className="flex items-center gap-2 hover:text-primary" href="/justifications">
                <CalendarIcon className="h-4 w-4" />
                Justificativas
              </Link>
              <Link className="flex items-center gap-2 hover:text-primary" href="/flights">
                <PlaneIcon className="h-4 w-4" />
                Voos
              </Link>
              <Link className="flex items-center gap-2 hover:text-primary" href="/keys">
                <KeyIcon className="h-4 w-4" />
                Chaves
              </Link>
              <Link className="flex items-center gap-2 hover:text-primary" href="/notes">
                <NotebookPenIcon className="h-4 w-4" />
                Notas
              </Link>
              <Link className="flex items-center gap-2 hover:text-primary" href="/history">
                <BarChartIcon className="h-4 w-4" />
                Histórico
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
