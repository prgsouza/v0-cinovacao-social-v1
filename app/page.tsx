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
          <h1 className="text-2xl font-bold mb-4 text-[#7f6e62]">
            Conecte o Supabase para começar
          </h1>
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
    redirect("/auth/login")
  }

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <PageContainer>
      <div
        className="relative flex min-h-screen flex-col items-center justify-start px-4 py-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage: "url('/images/plano-de-fundo-login.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay suave se quiser escurecer o fundo */}
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header com Logo e info do usuário */}
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
            <h1 className="text-4xl font-bold text-white mb-2">Hub GRIS</h1>
            <p className="text-lg text-white/80">
              Sistema de Gestão para ONG
            </p>

            <div className="mt-6 flex items-center justify-center gap-4">
              <p className="text-sm text-white">Bem-vindo, {user.email}</p>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="border-white text-white bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </form>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Link href="/students" className="group">
                <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-[#217E53] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#7f6e62] transition-colors">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#7f6e62] mb-4">
                      Gestão de Alunos
                    </h2>
                    <p className="text-[#7f6e62]/70 leading-relaxed">
                      Gerencie informações dos alunos, controle de presença, atividades diárias e acompanhamento educacional.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/materials" className="group">
                <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-[#E6742D] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#7f6e62] transition-colors">
                      <Package className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#7f6e62] mb-4">
                      Gestão de Materiais
                    </h2>
                    <p className="text-[#7f6e62]/70 leading-relaxed">
                      Controle de inventário, rastreamento de empréstimos solidários e gestão de recursos da organização.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-white/60 text-sm">© 2024 GRIS - Organização Não Governamental</p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
