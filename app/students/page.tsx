// app/students/page.tsx

import { redirect } from 'next/navigation'

export default function StudentsRootPage() {
  // Redireciona o usuário de /students para /students/dashboard
  redirect('/students/dashboard')
}
