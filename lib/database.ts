import { createClient } from "@/lib/supabase/client"

export interface Student {
  id: string
  name: string
  community: string
  age: number
  photo_url?: string
  guardian_name: string
  guardian_phone: string
  observations?: string
  can_go_alone: boolean
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  name: string
  category: string
  description?: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  title: string
  description?: string
  responsible: string
  date: string
  spots: number
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  student_id: string
  date: string
  status: string
  created_at: string
}

export interface Lend {
  id: string
  material_id?: string
  item_name: string
  category: string
  description?: string
  quantity: number
  borrower: string
  delivered_by: string
  authorized_by: string
  due_date: string
  returned_at?: string
  created_at: string
  updated_at: string
}

// Students
export async function getStudents(): Promise<Student[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("students").select("*").order("name")

  if (error) throw error
  return data || []
}

export async function createStudent(student: Omit<Student, "id" | "created_at" | "updated_at">): Promise<Student> {
  const supabase = createClient()
  const { data, error } = await supabase.from("students").insert(student).select().single()

  if (error) throw error
  return data
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("students")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteStudent(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("students").delete().eq("id", id)

  if (error) throw error
}

// Materials
export async function getMaterials(): Promise<Material[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("materials").select("*").order("name")

  if (error) throw error
  return data || []
}

export async function createMaterial(material: Omit<Material, "id" | "created_at" | "updated_at">): Promise<Material> {
  const supabase = createClient()
  const { data, error } = await supabase.from("materials").insert(material).select().single()

  if (error) throw error
  return data
}

export async function updateMaterial(id: string, updates: Partial<Material>): Promise<Material> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("materials")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMaterial(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("materials").delete().eq("id", id)

  if (error) throw error
}

// Activities
export async function getActivities(): Promise<Activity[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("activities").select("*").order("date", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createActivity(activity: Omit<Activity, "id" | "created_at" | "updated_at">): Promise<Activity> {
  const supabase = createClient()
  const { data, error } = await supabase.from("activities").insert(activity).select().single()

  if (error) throw error
  return data
}

export async function updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("activities")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("activities").delete().eq("id", id)

  if (error) throw error
}

// Attendance
export async function getAttendance(date?: string): Promise<Attendance[]> {
  const supabase = createClient()
  let query = supabase.from("attendance").select("*")

  if (date) {
    query = query.eq("date", date)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createAttendance(attendance: Omit<Attendance, "id" | "created_at">): Promise<Attendance> {
  const supabase = createClient()
  const { data, error } = await supabase.from("attendance").insert(attendance).select().single()

  if (error) throw error
  return data
}

export async function updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance> {
  const supabase = createClient()
  const { data, error } = await supabase.from("attendance").update(updates).eq("id", id).select().single()

  if (error) throw error
  return data
}

// Lends
export async function getLends(): Promise<Lend[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("lends").select("*").order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createLend(lend: Omit<Lend, "id" | "created_at" | "updated_at">): Promise<Lend> {
  const supabase = createClient()
  const { data, error } = await supabase.from("lends").insert(lend).select().single()

  if (error) throw error
  return data
}

export async function updateLend(id: string, updates: Partial<Lend>): Promise<Lend> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("lends")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLend(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("lends").delete().eq("id", id)

  if (error) throw error
}

// File upload utilities
export async function uploadFile(
  file: File,
  bucket: "fotos_alunos" | "fotos_atividades",
  path: string,
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return publicUrl
}

export async function deleteFile(bucket: "fotos_alunos" | "fotos_atividades", path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw error
}
