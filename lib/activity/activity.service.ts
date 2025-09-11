import {
  supabaseDatabase,
  uploadFile,
  deleteFile,
  extractFilePathFromUrl,
} from "../database";
import { Activity } from "./activity.dto";

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
  try {
    // First, get the activity data to check if there's a photo to delete
    const { data: activity, error: fetchError } = await supabaseDatabase
      .from("activities")
      .select("photo_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error(
        "Erro ao buscar dados da atividade para deletar:",
        fetchError
      );
      throw fetchError;
    }

    // If there's a photo, delete it from storage
    if (activity?.photo_url) {
      try {
        const filePath = extractFilePathFromUrl(activity.photo_url);
        if (filePath) {
          await deleteFile("fotos_atividades", filePath);
          console.log("✅ Foto da atividade deletada do storage:", filePath);
        }
      } catch (storageError) {
        console.warn(
          "⚠️ Erro ao deletar foto do storage (continuando com a exclusão):",
          storageError
        );
        // Continue with deletion even if photo deletion fails
      }
    }

    // Delete the activity record
    const { error } = await supabaseDatabase
      .from("activities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar atividade:", error);
      throw error;
    }

    console.log("✅ Atividade e foto deletadas com sucesso");
  } catch (error) {
    console.error("Erro geral ao deletar atividade:", error);
    throw error;
  }
}

export async function uploadActivityPhoto(
  activityId: string,
  file: File
): Promise<string> {
  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.");
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("Arquivo muito grande. O tamanho máximo é 5MB.");
  }

  try {
    // Get current activity data to check for existing photo
    const { data: currentActivity, error: fetchError } = await supabaseDatabase
      .from("activities")
      .select("photo_url")
      .eq("id", activityId)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar dados atuais da atividade:", fetchError);
      throw fetchError;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `activity-${activityId}-${timestamp}.${fileExtension}`;
    const filePath = `activity-photos/${fileName}`;

    // Upload new file to Supabase Storage
    const photoUrl = await uploadFile(file, "fotos_atividades", filePath);

    // Update activity record with new photo URL
    const { data, error } = await supabaseDatabase
      .from("activities")
      .update({
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activityId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar URL da foto da atividade:", error);
      throw error;
    }

    // Delete old photo if it exists (after successful upload and update)
    if (currentActivity?.photo_url) {
      try {
        const oldFilePath = extractFilePathFromUrl(currentActivity.photo_url);
        if (oldFilePath) {
          await deleteFile("fotos_atividades", oldFilePath);
          console.log("✅ Foto antiga da atividade deletada:", oldFilePath);
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
    console.error("Erro no upload da foto da atividade:", error);
    throw error;
  }
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
