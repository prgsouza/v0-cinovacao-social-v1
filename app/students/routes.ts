import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase/client";

// Função para obter todos os alunos
export async function GET() {
  const { data, error } = await supabase.from("students").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// Função para criar um novo aluno
export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase.from("students").insert([body]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
