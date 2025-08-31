import { supabaseDatabase } from "../database";
import { Reminder } from "./reminder.dto";

export async function getReminders(): Promise<Reminder[]> {
  try {
    const { data, error } = await supabaseDatabase
      .from("reminders")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("❌ Erro ao buscar lembretes:", error);
      throw error;
    }

    return (data as Reminder[]) || [];
  } catch (error) {
    console.error("❌ ERRO GERAL na função getReminders:", error);
    throw error;
  }
}

export async function createReminder(
  reminder: Omit<Reminder, "id" | "created_at">
): Promise<Reminder> {
  try {
    const { data, error } = await supabaseDatabase
      .from("reminders")
      .insert(reminder)
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao criar lembrete:", error);
      throw error;
    }

    return data as Reminder;
  } catch (error) {
    console.error("❌ ERRO GERAL na função createReminder:", error);
    throw error;
  }
}

export async function updateReminder(
  id: string,
  updates: Partial<Reminder>
): Promise<Reminder> {
  try {
    const { data, error } = await supabaseDatabase
      .from("reminders")
      .update({ ...updates })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao atualizar lembrete:", error);
      throw error;
    }

    return data as Reminder;
  } catch (error) {
    console.error("❌ ERRO GERAL na função updateReminder:", error);
    throw error;
  }
}

export async function deleteReminder(id: string): Promise<void> {
  try {
    const { error } = await supabaseDatabase
      .from("reminders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Erro ao deletar lembrete:", error);
      throw error;
    }
  } catch (error) {
    console.error("❌ ERRO GERAL na função deleteReminder:", error);
    throw error;
  }
}
