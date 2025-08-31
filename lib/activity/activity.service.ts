import { supabaseDatabase } from "../database";
import { Activity } from "./activity.dto";
import { uploadFile } from "../database";

export async function getActivities(): Promise<Activity[]> {
  const { data, error } = await supabaseDatabase
    .from("activities")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createActivity(
  activity: Omit<Activity, "id" | "created_at" | "updated_at">
): Promise<Activity> {
  const { data, error } = await supabaseDatabase
    .from("activities")
    .insert(activity)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateActivity(
  id: string,
  updates: Partial<Activity>
): Promise<Activity> {
  const { data, error } = await supabaseDatabase
    .from("activities")
    .update(updates)
    .eq("id", id) // aqui precisa ser o id real da atividade
    .select()
    .single();

  if (error) {
    console.error("❌ Erro ao atualizar atividade:", error);
    throw error;
  }

  return data as Activity;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabaseDatabase
    .from("activities")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function uploadActivityPhoto(
  file: File,
  path: string
): Promise<string> {
  return uploadFile(file, "fotos_atividades", path);
}

export async function getActivitiesByResponsible(
  responsible: string
): Promise<Activity[]> {
  const { data, error } = await supabaseDatabase
    .from("activities")
    .select("*")
    .eq("responsible", responsible)
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getActivitiesByDate(date: string): Promise<Activity[]> {
  const { data, error } = await supabaseDatabase
    .from("activities")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}
