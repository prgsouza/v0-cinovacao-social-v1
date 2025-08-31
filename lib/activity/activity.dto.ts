export interface Activity {
  id: string;
  title: string;
  description?: string;
  responsible: string;
  date: string;
  spots: number;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}
