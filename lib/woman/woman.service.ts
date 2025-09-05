import { supabaseDatabase } from "../database";
import { Woman } from "./woman.dto";

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
  updates: Partial<Omit<Woman, 'id' | 'created_at'>>
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
  const { error } = await supabaseDatabase
    .from("women")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar mulher:", error);
    throw error;
  }
}

export async function updateAttendances(
  attendanceData: Record<string, 'present' | 'absent'>
): Promise<void> {
  const supabase = supabaseDatabase;
  const womenIds = Object.keys(attendanceData);

  const { data: currentProfiles, error: fetchError } = await supabase
    .from('women')
    .select('*')
    .in('id', womenIds);

  if (fetchError) {
    console.error("Erro ao buscar perfis para chamada:", fetchError);
    throw new Error("Falha ao buscar dados para salvar chamada.");
  }

  if (!currentProfiles) {
    throw new Error("Nenhum perfil encontrado para atualizar.");
  }

  const updates = currentProfiles.map(profile => {
    const status = attendanceData[profile.id];
    return {
      id: profile.id,
      presences: status === 'present' ? profile.presences + 1 : profile.presences,
      absences: status === 'absent' ? profile.absences + 1 : profile.absences,
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

  const { error: upsertError } = await supabase.from('women').upsert(updates);

  if (upsertError) {
    console.error('Erro ao salvar chamada (upsert):', upsertError);
    throw new Error('Não foi possível salvar a chamada.');
  }
}

export async function resetAllRankings(): Promise<void> {
  const supabase = supabaseDatabase;

  const { error } = await supabase
    .from('women')
    .update({ presences: 0, absences: 0, total_sessions: 0 })

    .neq('id', '00000000-0000-0000-0000-000000000000'); 

  if (error) {
    console.error("Erro ao zerar ranking:", error);
    throw new Error("Não foi possível zerar o ranking.");
  }
}