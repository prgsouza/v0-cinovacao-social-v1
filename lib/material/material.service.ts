import { supabaseDatabase } from "../database";
import { Material } from "./material.dto";

export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabaseDatabase
    .from("materials")
    .select("*")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function createMaterial(
  material: Omit<Material, "id" | "created_at" | "updated_at">
): Promise<Material> {
  const { data, error } = await supabaseDatabase
    .from("materials")
    .insert(material)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMaterial(
  id: string,
  updates: Partial<Material>
): Promise<Material> {
  const { data, error } = await supabaseDatabase
    .from("materials")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMaterial(id: string): Promise<void> {
  const { error } = await supabaseDatabase
    .from("materials")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
