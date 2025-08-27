import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase/client";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await req.json();

  const { title, responsible, spots, description, photo_url, date } = body;

  const { data, error } = await supabase
    .from("activities")
    .update({
      title,
      responsible,
      spots,
      description,
      photo_url,
      date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
