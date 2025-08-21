import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignUpForm from "@/components/auth/sign-up-form"
import { PageContainer } from "@/components/page-container"
import Image from "next/image"

export default async function SignUpPage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <h1 className="text-2xl font-bold mb-4 text-[#7f6e62]">Conecte o Supabase para começar</h1>
        </div>
      </PageContainer>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to home page
  if (session) {
    redirect("/")
  }

  return (
    <PageContainer>
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Image
              src="/images/gris-logo.png"
              alt="GRIS Logo"
              width={80}
              height={80}
              className="mx-auto rounded-full shadow-lg"
            />
          </div>
          <SignUpForm />
        </div>
      </div>
    </PageContainer>
  )
}
