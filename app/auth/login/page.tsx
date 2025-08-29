import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/auth/login-form"
import { PageContainer } from "@/components/page-container"
import Image from "next/image"

export default async function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-[#7f6e62]">Conecte o Supabase para começar</h1>
            <p className="text-gray-600">Configure as variáveis de ambiente do Supabase para usar a autenticação.</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  const supabase = await createClient()

  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      redirect("/")
    }
  }

  return (
    <PageContainer>
      <div
        className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
        style={{
          backgroundImage: "url('/images/plano-de-fundo-login.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-md space-y-8 bg-white/80 p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <Image
              src="/images/gris-logo.png"
              alt="GRIS Logo"
              width={80}
              height={80}
              className="mx-auto rounded-full shadow-lg"
            />
          </div>
          <LoginForm />
        </div>
      </div>
    </PageContainer>
  )
}
