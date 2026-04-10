export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  category_name?: string;
  base_price: number;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  is_trending: boolean;
  images: ProductImage[];
  variations: ProductVariation[];
  created_at: string;
}

export interface ProductImage {
  id: number;
  image_path: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariation {
  id: number;
  size_id: number;
  size_name: string;
  color_id: number;
  color_name: string;
  color_hex: string;
  sku: string;
  price: number;
  stock_quantity: number;
  status: 'active' | 'inactive';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parent_id: number | null;
  status: 'active' | 'inactive';
  children?: Category[];
}

export interface Size {
  id: number;
  name: string;
  sort_order: number;
}

export interface Color {
  id: number;
  name: string;
  hex_code: string;
}
