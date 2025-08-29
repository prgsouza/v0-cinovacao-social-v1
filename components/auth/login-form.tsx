"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#217E53] hover:bg-[#FBB600] text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Entrando...
        </>
      ) : (
        "Entrar"
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#FBB600]">Bem-vindo de volta</h1>
        <p className="text-lg text-[#FBB600]">Entre na sua conta do GRIS</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{state.error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#FBB600]">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              className="bg-white border-[#d5c4aa] text-[#7f6e62] placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#FBB600]">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-white border-[#d5c4aa] text-[#7f6e62]"
            />
          </div>
        </div>

        <SubmitButton />

      </form>
    </div>
  )
}
