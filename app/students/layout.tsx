// app/students/layout.tsx

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PageContainer } from "@/components/page-container"
import { LayoutDashboard, Users, UserCheck, Settings, HelpCircle, LogOut, Home } from "lucide-react"

// A lista de itens foi ATUALIZADA conforme seu pedido
const sidebarItems = [
  {
    title: "MENU",
    items: [
      { title: "Visão Geral", icon: LayoutDashboard, href: "/students/dashboard" },
      { title: "Alunos", icon: Users, href: "/students/alunos" },
      // O item "Mulheres" foi trocado por "Chamadas"
      { title: "Chamadas", icon: UserCheck, href: "/students/chamadas" },
    ],
  },
  {
    title: "GERAL",
    items: [
      { title: "Configurações", icon: Settings, href: "/students/configuracoes" },
      { title: "Ajuda", icon: HelpCircle, href: "/students/ajuda" },
      { title: "-Sair", icon: LogOut, href: "/auth/login" },
    ],
  },
]

export default function StudentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <PageContainer>
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <Sidebar className="bg-white/95 backdrop-blur-sm border-r border-[#d5c4aa]/30">
            <SidebarContent>
              <div className="p-4 border-b border-[#d5c4aa]/30">
                <div className="flex items-center gap-3">
                  <Image src="/images/gris-logo.png" alt="GRIS Logo" width={40} height={40} className="rounded-full" />
                  <div>
                    <h2 className="font-semibold text-[#7f6e62]">GRIS</h2>
                    <p className="text-xs text-gray-600">Gestão de Alunos</p>
                  </div>
                </div>
                <Link href="/" className="flex items-center gap-2 text-sm text-[#88957d] hover:text-[#7f6e62] transition-colors mt-2">
                  <Home className="w-3 h-3" />
                  Voltar ao Hub
                </Link>
              </div>
              {sidebarItems.map((group) => (
                <SidebarGroup key={group.title}>
                  <SidebarGroupLabel className="text-[#7f6e62] font-semibold">{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Link href={item.href} className="w-full">
                            <SidebarMenuButton
                              className={`${
                                pathname === item.href
                                  ? "bg-[#88957d] text-white"
                                  : "text-[#7f6e62] hover:bg-[#d5c4aa]/30"
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
          <main className="flex-1">
            <div className="border-b border-[#d5c4aa]/30 bg-white/95 backdrop-blur-sm p-4 sticky top-0 z-20">
              <SidebarTrigger className="text-[#7f6e62]" />
            </div>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </PageContainer>
  )
}