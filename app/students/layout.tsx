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

const sidebarItems = [
  {
    title: "MENU",
    items: [
      { title: "Visão Geral", icon: LayoutDashboard, href: "/students/dashboard" },
      { title: "Alunos", icon: Users, href: "/students/alunos" },
      { title: "Chamadas", icon: UserCheck, href: "/students/chamadas" },
    ],
  },
  {
    title: "GERAL",
    items: [
      { title: "Configurações", icon: Settings, href: "/students/configuracoes" },
      { title: "Ajuda", icon: HelpCircle, href: "/students/ajuda" },
      { title: "Voltar ao Hub", icon: Home, href: "/" },
    ],
  },
]

export default function StudentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <PageContainer>
      <SidebarProvider>
        <div className="flex w-full min-h-screen bg-gray-50">
          
          <Sidebar className="bg-[#E6742D] backdrop-blur-sm border-r border-none">
            <SidebarContent className="bg-[#E6742D] text-white">
              <div className="p-4 border-b flex justify-center border-b bg-[#E6742D]">
                <div className="">
                  <Image src="/images/gris-logo.png" alt="GRIS Logo" width={130} height={75} className="pt-3 pr-4" />
                </div>
              </div>
              {sidebarItems.map((group) => (
                <SidebarGroup key={group.title} className="pl-4">
                  <SidebarGroupLabel className="text-white text-[1.25rem] font-bold">{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                          <Link href={item.href} className="w-full">
                            <SidebarMenuButton
                              className={`${
                                pathname === item.href
                                  ? "bg-white font-medium text-black/90"
                                  : "text-white/85 font-medium hover:bg-white"
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

          <main className="flex-1 relative">
            <div className="absolute top-5 left-5 z-30">
              <SidebarTrigger className="text-white bg-[#E6742D] hover:shadow-2 hover:bg-[#E6742D]" />
            </div>
            <div className="p-6 pt-16 lg:pt-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </PageContainer>
  )
}