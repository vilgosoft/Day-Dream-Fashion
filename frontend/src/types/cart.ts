export interface CartItem {
  id: number;
  product_variation_id: number;
  product_name: string;
  product_slug: string;
  product_image: string;
  size_name: string;
  color_name: string;
  price: number;
  quantity: number;
  stock_quantity: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_price: number;
}
