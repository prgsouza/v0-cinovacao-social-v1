import { createClient } from "@/lib/supabase/client";

export const supabaseDatabase = createClient();

// File upload utilities
export async function uploadFile(
  file: File,
  bucket:
    | "fotos_alunos"
    | "fotos_atividades"
    | "fotos_mulheres"
    | "galeria_imagens",
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
  bucket:
    | "fotos_alunos"
    | "fotos_atividades"
    | "fotos_mulheres"
    | "galeria_imagens",
  path: string
): Promise<void> {
  const { error } = await supabaseDatabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// Extract file path from Supabase storage URL
export function extractFilePathFromUrl(url: string): string | null {
  try {
    // URLs typically look like: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    const urlParts = url.split("/storage/v1/object/public/");
    if (urlParts.length < 2) return null;

    const pathWithBucket = urlParts[1];
    const pathParts = pathWithBucket.split("/");
    if (pathParts.length < 2) return null;

    // Remove bucket name and return the file path
    return pathParts.slice(1).join("/");
  } catch (error) {
    console.error("Error extracting file path from URL:", error);
    return null;
  }
}
