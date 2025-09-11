import {
  supabaseDatabase,
  uploadFile,
  deleteFile,
  extractFilePathFromUrl,
} from "../database";
import { Woman } from "./woman.dto";

export async function uploadWomanPhoto(
  womanId: string,
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
    // Get current woman data to check for existing photo
    const { data: currentWoman, error: fetchError } = await supabaseDatabase
      .from("women")
      .select("photo_url")
      .eq("id", womanId)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar dados atuais da mulher:", fetchError);
      throw fetchError;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `woman-${womanId}-${timestamp}.${fileExtension}`;
    const filePath = `profile-photos/${fileName}`;

    // Upload file to Supabase Storage
    const photoUrl = await uploadFile(file, "fotos_mulheres", filePath);

    // Update woman record with photo URL
    const { data, error } = await supabaseDatabase
      .from("women")
      .update({
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", womanId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar URL da foto:", error);
      throw error;
    }

    // Delete old photo if it exists (after successful upload and update)
    if (currentWoman?.photo_url) {
      try {
        const oldFilePath = extractFilePathFromUrl(currentWoman.photo_url);
        if (oldFilePath) {
          await deleteFile("fotos_mulheres", oldFilePath);
          console.log("✅ Foto antiga da mulher deletada:", oldFilePath);
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
    console.error("Erro no upload da foto:", error);
    throw error;
  }
}

export async function getWomen(): Promise<Woman[]> {
  try {
    const { data, error } = await supabaseDatabase
      .from("women")
      .select("*")
      .order("name");

    if (error) {
      console.error("Erro ao buscar mulheres no Supabase:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro geral na função getWomen:", error);
    throw error;
  }
}

export async function createWoman(
  womanData: Omit<Woman, "id" | "created_at" | "updated_at">
): Promise<Woman> {
  const { data, error } = await supabaseDatabase
    .from("women")
    .insert(womanData)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar mulher:", error);
    throw error;
  }
  return data;
}

export async function updateWoman(
  id: string,
  updates: Partial<Omit<Woman, "id" | "created_at">>
): Promise<Woman> {
  const { data, error } = await supabaseDatabase
    .from("women")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar mulher:", error);
    throw error;
  }
  return data;
}

export async function deleteWoman(id: string): Promise<void> {
  try {
    // First, get the woman data to check if there's a photo to delete
    const { data: woman, error: fetchError } = await supabaseDatabase
      .from("women")
      .select("photo_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar dados da mulher para deletar:", fetchError);
      throw fetchError;
    }

    // If there's a photo, delete it from storage
    if (woman?.photo_url) {
      try {
        const filePath = extractFilePathFromUrl(woman.photo_url);
        if (filePath) {
          await deleteFile("fotos_mulheres", filePath);
          console.log("✅ Foto da mulher deletada do storage:", filePath);
        }
      } catch (storageError) {
        console.warn(
          "⚠️ Erro ao deletar foto do storage (continuando com a exclusão):",
          storageError
        );
        // Continue with deletion even if photo deletion fails
      }
    }

    // Delete the woman record
    const { error } = await supabaseDatabase
      .from("women")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar mulher:", error);
      throw error;
    }

    console.log("✅ Mulher e foto deletadas com sucesso");
  } catch (error) {
    console.error("Erro geral ao deletar mulher:", error);
    throw error;
  }
}

export async function updateAttendances(
  attendanceData: Record<string, "present" | "absent">
): Promise<void> {
  const supabase = supabaseDatabase;
  const womenIds = Object.keys(attendanceData);

  const { data: currentProfiles, error: fetchError } = await supabase
    .from("women")
    .select("*")
    .in("id", womenIds);

  if (fetchError) {
    console.error("Erro ao buscar perfis para chamada:", fetchError);
    throw new Error("Falha ao buscar dados para salvar chamada.");
  }

  if (!currentProfiles) {
    throw new Error("Nenhum perfil encontrado para atualizar.");
  }

  const updates = currentProfiles.map((profile: Woman) => {
    const status = attendanceData[profile.id];
    return {
      id: profile.id,
      presences:
        status === "present" ? profile.presences + 1 : profile.presences,
      absences: status === "absent" ? profile.absences + 1 : profile.absences,
      total_sessions: profile.total_sessions + 1,
      name: profile.name,
      age: profile.age,
      community: profile.community,
      phone: profile.phone,
      observations: profile.observations,
      photo_url: profile.photo_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  });

  console.log(updates);

  const { error: upsertError } = await supabase.from("women").upsert(updates);

  if (upsertError) {
    console.error("Erro ao salvar chamada (upsert):", upsertError);
    throw new Error("Não foi possível salvar a chamada.");
  }
}

export async function resetAllRankings(): Promise<void> {
  const supabase = supabaseDatabase;

  const { error } = await supabase
    .from("women")
    .update({ presences: 0, absences: 0, total_sessions: 0 })

    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("Erro ao zerar ranking:", error);
    throw new Error("Não foi possível zerar o ranking.");
  }
}
