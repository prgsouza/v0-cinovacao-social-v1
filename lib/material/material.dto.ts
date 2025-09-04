export interface Material {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  necessary: number;
  created_at: string;
  updated_at: string;
}
