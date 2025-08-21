"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#88957d] hover:bg-[#7f6e62] text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cadastrando...
        </>
      ) : (
        "Cadastrar"
      )}
    </Button>
  )
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null)

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#7f6e62]">Criar conta</h1>
        <p className="text-lg text-gray-600">Cadastre-se no sistema GRIS</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{state.error}</div>
        )}

        {state?.success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded">
            {state.success}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#7f6e62]">
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
            <label htmlFor="password" className="block text-sm font-medium text-[#7f6e62]">
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

        <div className="text-center text-gray-600">
          Já tem uma conta?{" "}
          <Link href="/auth/login" className="text-[#88957d] hover:underline">
            Entrar
          </Link>
        </div>
      </form>
    </div>
  )
}
