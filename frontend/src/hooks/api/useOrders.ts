import { useCallback } from "react";
import api from "../../api/axios";
import { useAuth } from "../useAuth";
import type { ApiEnvelope, CartItem, DateRange, Order, OrderStatus, ShippingAddress } from "../../types";
import { invalidateCache } from "./cache";
import { useMutation } from "./useMutation";
import { useQuery } from "./useQuery";

interface OrderFilter { status?: OrderStatus; dateRange?: DateRange }
const unwrapOrders = (payload: Order[] | ApiEnvelope<Order[]>): { orders: Order[]; total: number } => Array.isArray(payload) ? { orders: payload, total: payload.length } : { orders: payload.data, total: payload.pagination?.total ?? payload.data.length };
export function useOrders(filter: OrderFilter = {}) { const { user } = useAuth(); const endpoint = user?.role === "admin" ? "/orders" : "/orders/my-orders"; const key = `orders:${user?.id ?? "guest"}:${filter.status ?? "all"}:${filter.dateRange?.from ?? ""}:${filter.dateRange?.to ?? ""}`; const fetcher = useCallback(async () => { const { data } = await api.get<Order[] | ApiEnvelope<Order[]>>(endpoint, { params: { status: filter.status, from: filter.dateRange?.from, to: filter.dateRange?.to } }); return unwrapOrders(data); }, [endpoint, filter.dateRange?.from, filter.dateRange?.to, filter.status]); const query = useQuery(key, fetcher, { enabled: Boolean(user), refreshInterval: 30_000 }); return { orders: query.data?.orders ?? [], total: query.data?.total ?? 0, loading: query.loading, error: query.error, refetch: query.refetch }; }
export function useCreateOrder(items: CartItem[]) { const mutation = useCallback(async (address: ShippingAddress): Promise<Order> => { const { data } = await api.post<Order>("/orders", { orderItems: items.map((item) => ({ product: item.productId, quantity: item.quantity })), shippingAddress: address }); invalidateCache("orders:"); invalidateCache("products:"); invalidateCache("dashboard:"); return data; }, [items]); return useMutation(mutation); }
export function useUpdateOrderStatus(orderId: string, newStatus: OrderStatus) { const mutation = useCallback(async (): Promise<Order> => { const { data } = await api.put<Order>(`/orders/${orderId}/status`, { status: newStatus }); invalidateCache("orders:"); invalidateCache("dashboard:"); return data; }, [newStatus, orderId]); const result = useMutation<void, Order>(mutation); return { mutate: () => result.mutate(undefined), loading: result.loading, error: result.error }; }
