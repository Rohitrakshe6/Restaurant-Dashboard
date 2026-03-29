export type TableStatus = 'available' | 'occupied';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  description?: string;
  spicyLevel?: 1 | 2 | 3;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId?: string;
  type: 'dine-in' | 'parcel';
  items: OrderItem[];
  status: 'active' | 'billing' | 'completed' | 'cancelled';
  createdAt: string;
  totalAmount: number;
  customerName?: string;
  customerMobile?: string;
}
