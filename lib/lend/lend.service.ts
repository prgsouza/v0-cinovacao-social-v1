import { supabaseDatabase } from "../database";
import { Lend } from "./lend.dto";

export async function getLends(): Promise<Lend[]> {
  const { data, error } = await supabaseDatabase
    .from("lends")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createLend(
  lend: Omit<Lend, "id" | "created_at" | "updated_at">
): Promise<Lend> {
  const { data, error } = await supabaseDatabase
    .from("lends")
    .insert(lend)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLend(
  id: string,
  updates: Partial<Lend>
): Promise<Lend> {
  const { data, error } = await supabaseDatabase
    .from("lends")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLend(id: string): Promise<void> {
  const { error } = await supabaseDatabase.from("lends").delete().eq("id", id);
  if (error) throw error;
}
