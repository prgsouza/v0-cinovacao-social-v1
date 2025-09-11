import {
  supabaseDatabase,
  uploadFile,
  deleteFile,
  extractFilePathFromUrl,
} from "../database";
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
  try {
    // First, get the student data to check if there's a photo to delete
    const { data: student, error: fetchError } = await supabaseDatabase
      .from("students")
      .select("photo_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error(
        "Erro ao buscar dados do estudante para deletar:",
        fetchError
      );
      throw fetchError;
    }

    // If there's a photo, delete it from storage
    if (student?.photo_url) {
      try {
        const filePath = extractFilePathFromUrl(student.photo_url);
        if (filePath) {
          await deleteFile("fotos_alunos", filePath);
          console.log("✅ Foto do estudante deletada do storage:", filePath);
        }
      } catch (storageError) {
        console.warn(
          "⚠️ Erro ao deletar foto do storage (continuando com a exclusão):",
          storageError
        );
        // Continue with deletion even if photo deletion fails
      }
    }

    // Delete the student record
    const { error } = await supabaseDatabase
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar estudante:", error);
      throw error;
    }

    console.log("✅ Estudante e foto deletados com sucesso");
  } catch (error) {
    console.error("Erro geral ao deletar estudante:", error);
    throw error;
  }
}

// Upload student profile photo
export async function uploadStudentPhoto(
  file: File,
  studentId: string
): Promise<string> {
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("Arquivo muito grande. Tamanho máximo: 5MB.");
  }

  try {
    // Get current student data to check for existing photo
    const { data: currentStudent, error: fetchError } = await supabaseDatabase
      .from("students")
      .select("photo_url")
      .eq("id", studentId)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar dados atuais do estudante:", fetchError);
      throw fetchError;
    }

    const fileExtension = file.name.split(".").pop();
    const fileName = `${studentId}-${Date.now()}.${fileExtension}`;
    const filePath = `profile-photos/${fileName}`;

    const photoUrl = await uploadFile(file, "fotos_alunos", filePath);
    console.log("✅ Student photo uploaded successfully:", photoUrl);

    // Delete old photo if it exists (after successful upload)
    if (currentStudent?.photo_url) {
      try {
        const oldFilePath = extractFilePathFromUrl(currentStudent.photo_url);
        if (oldFilePath) {
          await deleteFile("fotos_alunos", oldFilePath);
          console.log("✅ Foto antiga do estudante deletada:", oldFilePath);
        }
      } catch (deleteError) {
        console.warn(
          "⚠️ Erro ao deletar foto antiga (nova foto já salva):",
          deleteError
        );
        // Don't throw error here since the new photo was successfully uploaded
      }
    }

    return photoUrl;
  } catch (error) {
    console.error("❌ Error uploading student photo:", error);
    throw error;
  }
}
