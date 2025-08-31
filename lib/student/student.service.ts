import { supabaseDatabase } from "../database";
import { Student } from "./student.dto";

export async function getStudents(): Promise<Student[]> {
  console.log("✅ 2. SERVIDOR: A função getStudents foi chamada!");
  try {
    const { data, error } = await supabaseDatabase
      .from("students")
      .select("*")
      .order("name");
    if (error) {
      console.error(
        "❌ 3. SERVIDOR (FALHA): Ocorreu um erro no Supabase:",
        error
      );
      throw error;
    }
    console.log("✅ 4. SERVIDOR (SUCESSO): Alunos encontrados:", data.length);
    return data || [];
  } catch (error) {
    console.error("❌ ERRO GERAL na função getStudents:", error);
    throw error;
  }
}

export async function createStudent(
  student: Omit<Student, "id" | "created_at" | "updated_at">
): Promise<Student> {
  const { data, error } = await supabaseDatabase
    .from("students")
    .insert(student)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStudent(
  id: string,
  updates: Partial<Student>
): Promise<Student> {
  const { data, error } = await supabaseDatabase
    .from("students")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabaseDatabase
    .from("students")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
