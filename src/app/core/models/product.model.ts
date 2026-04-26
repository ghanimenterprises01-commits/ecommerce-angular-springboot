export interface Product {
  id: number;
  name: string;
  description: string;
  specifications: string | null;
  price: number;
  stock: number;
  emoji: string;
  imageUrl: string | null;
  imageUrls: string[];
  badge: string | null;
  categoryName: string;
  categorySlug: string;
  inStock: boolean;
}

export interface ProductRequest {
  name: string;
  description: string;
  specifications?: string;
  retailPrice: number;
  wholesalePrice: number;
  costPrice?: number;
  stock: number;    
  emoji: string;
  categoryId: number;
  badge?: string;
  imageUrls?: string[]
}

export interface AdminProduct {
  id: number;
  name: string;
  description: string;
  specifications: string | null;
  retailPrice: number;
  wholesalePrice: number;
  costPrice: number | null;
  profitMarginRetail: number | null;
  profitMarginWholesale: number | null;
  stock: number;
  emoji: string;
  imageUrl: string | null;
  imageUrls: string[];
  badge: string | null;
  categoryName: string;
  categorySlug: string;
  inStock: boolean;
  active: boolean;
}