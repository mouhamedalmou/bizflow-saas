import type { ReactNode } from "react";

export type UserRole = "admin" | "customer";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface User {
  id: string;
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  token: string;
  isEmailVerified?: boolean;
  phone?: string;
}

export interface Product {
  id: string;
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string | { id?: string; _id?: string; name: string };
  image: string;
  imageUrl?: string;
  sku: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderProduct {
  product: string | Product;
  name: string;
  quantity: number;
  price: number;
  priceAtTime?: number;
  productId?: string;
}

export interface CartItem { productId: string; quantity: number }
export interface ShippingAddress { street: string; city: string; zip: string; country: string }
export interface DateRange { from: string; to: string }

export interface Order {
  id: string;
  _id: string;
  userId: string;
  user: User;
  products: OrderProduct[];
  orderItems?: OrderProduct[];
  totalPrice: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: ShippingAddress;
  notes?: string;
}

export interface DashboardStats {
  revenue: number;
  totalOrders: number;
  activeOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalInvoices: number;
  activeSubscriptions: number;
  monthlySales: MonthlySale[];
  ordersByStatus: StatusCount[];
}

export interface MonthlySale { month: string; revenue: number; orders: number }
export interface StatusCount { status: OrderStatus; count: number }
export interface ApiMessage { message: string }
export interface ApiErrorBody { message?: string; error?: string }
export interface ApiEnvelope<T> { success: boolean; data: T; pagination?: { page: number; limit: number; total: number; pages: number } }
export interface ChartData { period: string; revenue: number; orders: number }
export interface TrendData { date: string; orders: number; revenue: number }
export interface TopProduct { id?: string; _id: string; name: string; unitsSold: number; revenue: number }
export interface RegisterInput { name: string; email: string; password: string }
export interface LoginInput { email: string; password: string }
export interface ProductInput { name: string; description: string; price: number; stock: number; category: string; sku: string; image?: File | string; imageUrl?: string }
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  logoutRemote: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  setUser: (user: User | null) => void;
}
export interface ThemeContextValue { theme: "light" | "dark"; isDark: boolean; toggleTheme: () => void }
export interface ChildrenProps { children: ReactNode }

export const entityId = (entity: { id?: string; _id?: string }): string => entity.id ?? entity._id ?? "";
export const orderItems = (order: Order): OrderProduct[] => order.products ?? order.orderItems ?? [];
export const categoryName = (category: Product["category"]): string => typeof category === "string" ? category : category.name;
export const categoryId = (category: Product["category"]): string => typeof category === "string" ? category : entityId(category);
