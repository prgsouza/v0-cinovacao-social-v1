export interface Student {
  id: string;
  name: string;
  community: string;
  age: number;
  photo_url?: string;
  guardian_name: string;
  guardian_phone: string;
  observations?: string;
  can_go_alone: boolean;
  created_at: string;
  updated_at: string;
}
