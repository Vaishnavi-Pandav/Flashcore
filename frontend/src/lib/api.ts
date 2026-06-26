import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  category: { id: string; name: string; slug: string };
  is_deleted: boolean;
  created_at: string;
}

export interface PaginatedProducts {
  total: number;
  skip: number;
  limit: number;
  items: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  body: string;
  created_at: string;
}

export interface ProductDetail extends Product {
  reviews: Review[];
}

export interface ProductFilters {
  skip?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: "newest" | "price_asc" | "price_desc";
}

export const fetchProducts = async (filters: ProductFilters): Promise<PaginatedProducts> => {
  const params: Record<string, any> = {};
  if (filters.skip !== undefined) params.skip = filters.skip;
  if (filters.limit !== undefined) params.limit = filters.limit;
  if (filters.search) params.search = filters.search;
  if (filters.category_id) params.category_id = filters.category_id;
  if (filters.min_price !== undefined) params.min_price = filters.min_price;
  if (filters.max_price !== undefined) params.max_price = filters.max_price;
  if (filters.sort_by) params.sort_by = filters.sort_by;
  const { data } = await api.get<PaginatedProducts>("/products", { params });
  return data;
};

export const fetchProductBySlug = async (slug: string): Promise<ProductDetail> => {
  const { data } = await api.get<ProductDetail>(`/products/${slug}`);
  return data;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>("/products/categories");
  return data;
};

export default api;
