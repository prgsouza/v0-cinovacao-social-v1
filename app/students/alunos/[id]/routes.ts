import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase/client";

// Função para obter um aluno pelo ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase.from("students").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

// Função para atualizar um aluno pelo ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { data, error } = await supabase.from("students").update(body).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// Função para deletar um aluno pelo ID
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase.from("students").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Aluno removido" });
}

// Função para atualizar o campo "present"
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { present } = body;

  const { data, error } = await supabase
    .from("students")
    .update({ present })
    .eq("id", params.id)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}