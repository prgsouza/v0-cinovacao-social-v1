"use client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, LogOut, Menu, Settings } from "lucide-react"
import { signOut } from "@/lib/actions"

interface NavigationHeaderProps {
  title: string
  showBackButton?: boolean
  showLogout?: boolean
}

export function NavigationHeader({ title, showBackButton = true, showLogout = true }: NavigationHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-[#d5c4aa]/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/images/gris-logo.png" alt="GRIS Logo" width={50} height={50} className="rounded-full" />
            <div>
              <h1 className="text-2xl font-bold text-[#7f6e62]">{title}</h1>
              {showBackButton && (
                <Link
                  href="/"
                  className="text-sm text-[#88957d] hover:text-[#7f6e62] transition-colors flex items-center gap-1"
                >
                  <Home className="w-3 h-3" />
                  Voltar ao Hub
                </Link>
              )}
            </div>
          </div>

          {showLogout && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="text-[#7f6e62] border-[#7f6e62] bg-transparent">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-[#7f6e62]">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
