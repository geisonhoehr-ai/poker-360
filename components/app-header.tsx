import Link from "next/link"
import Image from "next/image" // Certifique-se de que Image está importado
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-center px-4 md:px-6 relative">
        {" "}
        {/* Adicionado relative para posicionar os botões */}
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          {" "}
          {/* Logo ao lado do texto */}
          <Image src="/images/1_10GPAV.png" alt="Squadron Logo" width={60} height={60} className="object-contain" />
          <div className="flex flex-col">
            {" "}
            {/* Texto empilhado */}
            <span className="text-lg font-semibold text-red-600">1º/10º GAV - ESQUADRÃO POKER</span>{" "}
            {/* Título em vermelho */}
            <span className="text-xs text-muted-foreground">"Da Pátria os olhos... na guerra e na paz..."</span>
          </div>
        </Link>
        <div className="absolute right-4 flex items-center gap-4">
          {" "}
          {/* Botões à direita */}
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem>Suporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
