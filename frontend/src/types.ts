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
}

export interface Product {
  id: string;
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  sku: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderProduct {
  product: string | Product;
  name: string;
  quantity: number;
  price: number;
}

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
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}
export interface ThemeContextValue { theme: "light" | "dark"; isDark: boolean; toggleTheme: () => void }
export interface ChildrenProps { children: ReactNode }

export const entityId = (entity: { id?: string; _id?: string }): string => entity.id ?? entity._id ?? "";
export const orderItems = (order: Order): OrderProduct[] => order.products ?? order.orderItems ?? [];
