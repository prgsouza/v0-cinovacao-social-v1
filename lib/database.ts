import { createClient } from "@/lib/supabase/client";
import { ReactNode } from "react";
import { subDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

export interface Student {
  id: string;
  name: string;
  community: string;
  age: number;
  photo_url?: string;
  guardian_name: string;
  guardian_phone: string;
  observations?: string;
  can_go_alone: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  responsible: string;
  date: string;
  spots: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  date: string;
  status: string;
  created_at: string;
}

export interface Lend {
  id: string;
  material_id: string;
  item_name: string;
  borrower: string;
  quantity: number;
  due_date: string;
  category: string;
  description?: string;
  authorized_by: string;
  delivered_by: string;
  returned_at?: string;
  created_at: string;
  updated_at: string;
  delivery_date: string;
}

export type Reminder = {
  id: string;
  title: string;
  description?: string;
  date: string;
  created_at: string;
};

const supabase = createClient();

// Students
export async function getStudents(): Promise<Student[]> {
  console.log("✅ 2. SERVIDOR: A função getStudents foi chamada!");
  try {
    const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("students")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

// Materials
export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function createMaterial(
  material: Omit<Material, "id" | "created_at" | "updated_at">
): Promise<Material> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("materials")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMaterial(id: string): Promise<void> {
  const { error } = await supabase.from("materials").delete().eq("id", id);
  if (error) throw error;
}

// Activities
export async function getActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createActivity(
  activity: Omit<Activity, "id" | "created_at" | "updated_at">
): Promise<Activity> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("activities")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw error;
}

// Attendance
export async function getAttendance(date?: string): Promise<Attendance[]> {
  let query = supabase.from("attendance").select("*");
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("attendance")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Lends
export async function getLends(): Promise<Lend[]> {
  const { data, error } = await supabase
    .from("lends")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createLend(
  lend: Omit<Lend, "id" | "created_at" | "updated_at">
): Promise<Lend> {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("lends")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLend(id: string): Promise<void> {
  const { error } = await supabase.from("lends").delete().eq("id", id);
  if (error) throw error;
}

// File upload utilities
export async function uploadFile(
  file: File,
  bucket: "fotos_alunos" | "fotos_atividades",
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

export async function deleteFile(
  bucket: "fotos_alunos" | "fotos_atividades",
  path: string
): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// Reminders
export async function getReminders(): Promise<Reminder[]> {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Reminder[];
}

export async function createReminder(
  reminder: Omit<Reminder, "id" | "created_at">
): Promise<Reminder> {
  const { data, error } = await supabase
    .from("reminders")
    .insert(reminder)
    .select()
    .single();

  if (error) throw error;
  return data as Reminder;
}

// ==================================================================
// FUNÇÃO DO GRÁFICO (REAPLICADA COM A LÓGICA MAIS ROBUSTA)
// ==================================================================
export async function getWeeklyAttendanceSummary(): Promise<
  { day: string; presences: number; absences: number; justified: number }[]
> {
  console.log("✅ Servidor: Buscando resumo de chamadas da semana...");

  try {
    // 1. Reutilizamos sua função existente para buscar os registros.
    const allAttendanceData = await getAttendance();
    console.log(
      `Encontrados ${allAttendanceData.length} registros de chamada no total para processar.`
    );

    // 2. Usamos um objeto simples para a contagem
    const summary: {
      [date: string]: {
        presences: number;
        absences: number;
        justified: number;
      };
    } = {};

    // 3. Criamos os "potes" de contagem dinamicamente a partir dos dados recebidos
    for (const record of allAttendanceData) {
      // Se o pote para esta data ainda não existe, crie-o.
      if (!summary[record.date]) {
        summary[record.date] = { presences: 0, absences: 0, justified: 0 };
      }

      // 4. Adicionamos a contagem ao pote correto
      const status = record.status.toLowerCase();
      if (status === "presente" || status === "present") {
        summary[record.date].presences++;
      } else if (status === "faltou" || status === "absent") {
        summary[record.date].absences++;
      } else if (status === "justificada" || status === "justified") {
        summary[record.date].justified++;
      }
    }

    // 5. Transformamos o objeto em uma lista e ordenamos pela data mais recente
    const sortedSummary = Object.entries(summary)
      .map(([date, counts]) => ({
        date: date,
        ...counts,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 6. Pegamos apenas os 7 dias mais recentes que tiveram aula
    const latest7DaysWithData = sortedSummary.slice(0, 7);

    // 7. Formatamos para o gráfico
    const chartData = latest7DaysWithData
      .map(({ date, presences, absences, justified }) => ({
        day: format(new Date(date + "T12:00:00Z"), "EEE", { locale: ptBR })
          .charAt(0)
          .toUpperCase(),
        presences,
        absences,
        justified,
      }))
      .reverse(); // Inverte para mostrar do mais antigo para o mais novo

    console.log("✅ Servidor: Resumo da semana gerado com sucesso:", chartData);
    return chartData;
  } catch (error) {
    console.error("❌ Erro geral na função getWeeklyAttendanceSummary:", error);
    throw error;
  }
}
