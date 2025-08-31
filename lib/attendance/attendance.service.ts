import { supabaseDatabase } from "../database";
import { Attendance } from "./attendance.dto";

export async function getAttendance(date?: string): Promise<Attendance[]> {
  let query = supabaseDatabase.from("attendance").select("*");
  if (date) {
    query = query.eq("date", date);
  }
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createAttendance(
  attendance: Omit<Attendance, "id" | "created_at">
): Promise<Attendance> {
  const { data, error } = await supabaseDatabase
    .from("attendance")
    .upsert(attendance)
    .select()
    .single();
  if (error) {
    console.error("Erro no upsert da chamada:", error);
    throw error;
  }
  return data;
}

export async function updateAttendance(
  id: string,
  updates: Partial<Attendance>
): Promise<Attendance> {
  const { data, error } = await supabaseDatabase
    .from("attendance")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
