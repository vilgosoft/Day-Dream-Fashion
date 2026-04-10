export interface Order {
  id: number;
  order_number: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: Address;
  billing_address: Address | null;
  payment_method: string;
  razorpay_payment_id: string | null;
  status: OrderStatus;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  product_slug: string;
  size_name: string;
  color_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Address {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';
