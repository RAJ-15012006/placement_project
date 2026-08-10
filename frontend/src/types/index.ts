export type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  business_name: string;
  gst?: string;
  customer_type: 'retail' | 'wholesale' | 'distributor';
  address: string;
  status: 'lead' | 'active' | 'inactive';
  follow_up_date?: string;
  notes?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  location?: string;
}

export interface ChallanItem {
  product_id: number;
  product_name?: string;
  sku?: string;
  unit_price: number;
  quantity: number;
  current_stock?: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name?: string;
  customer_business?: string;
  items: ChallanItem[];
  total_qty: number;
  subtotal: number;
  status: 'draft' | 'confirmed' | 'cancelled';
  created_by?: number;
  created_by_name?: string;
  created_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  quantity_changed: number;
  movement_type: 'IN' | 'OUT';
  reason: string;
  created_by_name?: string;
  created_at: string;
}
