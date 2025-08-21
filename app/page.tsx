import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Package, LogOut } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { signOut } from "@/lib/actions"

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-[#7f6e62]">Conecte o Supabase para começar</h1>
        </div>
      </PageContainer>
    )
  }

  let user = null
  try {
    const supabase = await createClient()
    const {
      data: { user: userData },
    } = await supabase.auth.getUser()
    user = userData
  } catch (error) {
    console.error("[v0] Supabase connection error:", error)
    // If there's an error connecting to Supabase, redirect to login
    redirect("/auth/login")
  }

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logo and User Info */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/gris-logo.png"
              alt="GRIS Logo"
              width={120}
              height={120}
              className="rounded-full shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#7f6e62] mb-2">Hub GRIS</h1>
          <p className="text-lg text-[#7f6e62]/80">Sistema de Gestão para ONG</p>

          {/* User info and logout */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <p className="text-sm text-[#7f6e62]">Bem-vindo, {user.email}</p>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm" className="border-[#d5c4aa] bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </form>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Management Card */}
            <Link href="/students" className="group">
              <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#88957d] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#7f6e62] transition-colors">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#7f6e62] mb-4">Gestão de Alunos</h2>
                  <p className="text-[#7f6e62]/70 leading-relaxed">
                    Gerencie informações dos alunos, controle de presença, atividades diárias e acompanhamento
                    educacional.
                  </p>
                  <div className="mt-6 inline-flex items-center text-[#88957d] font-semibold group-hover:text-[#7f6e62] transition-colors">
                    Acessar Sistema
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Materials Management Card */}
            <Link href="/materials" className="group">
              <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-[#d09c91] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#7f6e62] transition-colors">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#7f6e62] mb-4">Gestão de Materiais</h2>
                  <p className="text-[#7f6e62]/70 leading-relaxed">
                    Controle de inventário, rastreamento de empréstimos solidários e gestão de recursos da organização.
                  </p>
                  <div className="mt-6 inline-flex items-center text-[#d09c91] font-semibold group-hover:text-[#7f6e62] transition-colors">
                    Acessar Sistema
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-[#7f6e62]/60 text-sm">© 2024 GRIS - Organização Não Governamental</p>
        </div>
      </div>
    </PageContainer>
  )
}
