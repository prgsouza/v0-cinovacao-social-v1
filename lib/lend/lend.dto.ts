export interface Lend {
  id: string;
  material_id: string;
  item_name: string;
  borrower: string;
  quantity: number;
  due_date: string;
  category: string;
  description?: string;
  authorized_by: string;
  delivered_by: string;
  returned_at?: string;
  created_at: string;
  updated_at: string;
  delivery_date: string;
}
