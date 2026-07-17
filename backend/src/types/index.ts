import type { Document, Types } from "mongoose";

export type UserRole = "admin" | "customer";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface IUser extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  comparePassword(password: string): Promise<boolean>;
  generatePasswordReset(): string;
}

export interface IProduct extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: Types.ObjectId;
  imageUrl: string;
  image: string;
  sku: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  decreaseStock(quantity: number): Promise<void>;
  increaseStock(quantity: number): Promise<void>;
  isLowStock(): boolean;
}

export interface IOrderItem {
  productId: Types.ObjectId;
  product: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  priceAtTime: number;
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
  shippingAddress: { street: string; city: string; zip: string; country: string };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  calculateTotal(): number;
  updateStatus(newStatus: OrderStatus): Promise<void>;
  getOrderTimeline(): OrderTimeline;
}

export interface OrderTimeline { status: OrderStatus; completed: OrderStatus[]; currentStep: number; updatedAt: Date }

export interface ICategory extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IDashboardStats extends Document<Types.ObjectId> {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  lowStockProducts: number;
  updatedAt: Date;
}

export interface RegisterDto { name: string; email: string; password: string }
export interface LoginDto { email: string; password: string }
export interface ProductDto { name: string; description: string; price: number; stock: number; category: string; image?: string; imageUrl?: string; sku?: string; createdBy?: string }
export interface UpdateProductDto extends Partial<ProductDto> {}
export interface CreateOrderItemDto { product: string; productId?: string; quantity: number }
export interface ShippingAddressDto { street: string; city: string; zip: string; country: string }
export interface CreateOrderDto { orderItems?: CreateOrderItemDto[]; items?: CreateOrderItemDto[]; shippingAddress: ShippingAddressDto; notes?: string }
export interface UpdateOrderStatusDto { status: OrderStatus }
export interface PaginationQuery { page?: string; limit?: string; category?: string; search?: string }
export interface RevenueQuery { period?: "day" | "week" | "month" }
export interface IdParams { id: string }
export interface TokenParams { token: string }
export interface JwtPayload { userId: string; iat?: number; exp?: number }
export interface ApiResponse<T> { success: boolean; data?: T; message?: string; pagination?: { page: number; limit: number; total: number; pages: number } }

export const isPopulatedUser = (user: Types.ObjectId | IUser): user is IUser => "email" in user;
