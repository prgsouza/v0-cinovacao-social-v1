import { createClient } from "@/lib/supabase/client";

export const supabaseDatabase = createClient();

// File upload utilities
export async function uploadFile(
  file: File,
  bucket: "fotos_alunos" | "fotos_atividades",
  path: string
): Promise<string> {
  const { data, error } = await supabaseDatabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = supabaseDatabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

export async function deleteFile(
  bucket: "fotos_alunos" | "fotos_atividades",
  path: string
): Promise<void> {
  const { error } = await supabaseDatabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
