"use client";


import Image from "next/image";
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
} from "@/components/ui/sidebar";

import { Archive, Users, Home } from "lucide-react";
import { PageContainer } from "@/components/page-container";

interface MaterialsLayoutProps {
  children: React.ReactNode;
  activeTab: "materials" | "lends";
  setActiveTab: (tab: "materials" | "lends") => void;
}

export default function MaterialsLayout({ children, activeTab, setActiveTab }: MaterialsLayoutProps) {
  return (
    <PageContainer>
      <SidebarProvider>
        <div className="flex w-full min-h-screen bg-trasparent">
          <Sidebar className="bg-[#E7732D] text-white border-r border-none">
            <SidebarContent className="bg-[#E7732D] text-white">
              <div className="p-4 border-b flex justify-center bg-[#E7732D]">
                <Image
                  src="/images/gris-logo.png"
                  alt="GRIS Logo"
                  width={130}
                  height={75}
                  className="pt-3 pr-4"
                />
              </div>

              <SidebarGroup className="pl-4">
                <SidebarGroupLabel className="text-white text-[1.25rem] font-bold">
                  MENU
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "materials"}
                        onClick={() => setActiveTab("materials")}
                      >
                        <Archive className="w-4 h-4" />
                        <span>Materiais</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "lends"}
                        onClick={() => setActiveTab("lends")}
                      >
                        <Users className="w-4 h-4" />
                        <span>Empréstimos Solidários</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="pl-4 mt-6">
                <SidebarGroupLabel className="text-white text-[1.25rem] font-bold">
                  GERAL
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/" className="w-full">
                          <Home className="w-4 h-4" />
                          <span>Voltar ao Hub</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 relative">
            <div className="absolute top-5 -left-1 ">
              <SidebarTrigger className="text-white bg-[#E7732D] hover:shadow-lg fixed" />
            </div>
            <div className="p-6 pt-16 lg:pt-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </PageContainer>
  );
}
