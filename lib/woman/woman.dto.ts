export interface Woman {
  id: string;
  name: string;
  age: number;
  community: string;
  phone: string;
  observations?: string | null;
  photo_url?: string | null;
  presences: number;
  absences: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
}