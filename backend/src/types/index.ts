import type { Document, Types } from "mongoose";

export type UserRole = "admin" | "customer";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface IUser extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  image: string;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  productId: Types.ObjectId;
  product: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  id: string;
  userId: Types.ObjectId;
  user: Types.ObjectId | IUser;
  items: IOrderItem[];
  orderItems: IOrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDto { name: string; email: string; password: string }
export interface LoginDto { email: string; password: string }
export interface ProductDto { name: string; description: string; price: number; stock: number; category: string; image?: string; imageUrl?: string; sku?: string }
export interface UpdateProductDto extends Partial<ProductDto> {}
export interface CreateOrderItemDto { product: string; productId?: string; quantity: number }
export interface CreateOrderDto { orderItems?: CreateOrderItemDto[]; items?: CreateOrderItemDto[] }
export interface UpdateOrderStatusDto { status: OrderStatus }
export interface PaginationQuery { page?: string; limit?: string; category?: string; search?: string }
export interface RevenueQuery { period?: "day" | "week" | "month" }
export interface IdParams { id: string }
export interface TokenParams { token: string }
export interface JwtPayload { userId: string; iat?: number; exp?: number }
export interface ApiResponse<T> { success: boolean; data?: T; message?: string; pagination?: { page: number; limit: number; total: number; pages: number } }

export const isPopulatedUser = (user: Types.ObjectId | IUser): user is IUser => "email" in user;
