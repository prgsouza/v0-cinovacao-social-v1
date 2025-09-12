// lib/attendance/attendance.service.ts

import { supabaseDatabase } from "../database";
import { Attendance } from "./attendance.dto";
// --- ADICIONADO: Importações necessárias para a nova função ---
import { Student } from "../student/student.dto";
import { getStudents } from "../student/student.service";

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

export async function getAtRiskStudents(consecutiveCount: number): Promise<Student[]> {
  const allAttendances = await getAttendance();

  const attendanceByStudent: Record<string, Attendance[]> = allAttendances.reduce((acc, att) => {
    acc[att.student_id] = acc[att.student_id] || [];
    acc[att.student_id].push(att);
    return acc;
  }, {} as Record<string, Attendance[]>);

  const atRiskStudentIds: string[] = [];
  for (const studentId in attendanceByStudent) {
    const records = attendanceByStudent[studentId].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (records.length < consecutiveCount) {
      continue; 
    }

    let consecutiveAbsences = 0;
    for (let i = 0; i < consecutiveCount; i++) {
      if (records[i].status === 'absent') {
        consecutiveAbsences++;
      } else {
        break; 
      }
    }

    if (consecutiveAbsences === consecutiveCount) {
      atRiskStudentIds.push(studentId);
    }
  }

  if (atRiskStudentIds.length === 0) {
    return [];
  }
  
  const allStudents = await getStudents();
  const atRiskStudents = allStudents.filter(student => atRiskStudentIds.includes(student.id));

  return atRiskStudents;
}
