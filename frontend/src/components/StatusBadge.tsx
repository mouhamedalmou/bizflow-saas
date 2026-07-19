import { Ban, CheckCircle2, Clock3, PackageCheck, Truck } from "lucide-react";
import { Badge } from "./Badge";
export type DisplayOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export interface StatusBadgeProps { status: DisplayOrderStatus }
const config = { pending: { label: "Pending", color: "amber", icon: Clock3 }, processing: { label: "Processing", color: "cyan", icon: PackageCheck }, shipped: { label: "Shipped", color: "blue", icon: Truck }, delivered: { label: "Delivered", color: "emerald", icon: CheckCircle2 }, cancelled: { label: "Cancelled", color: "red", icon: Ban } } as const;
export function StatusBadge({ status }: StatusBadgeProps) { const item = config[status]; const Icon = item.icon; return <Badge label={<span className="hidden sm:inline">{item.label}</span>} color={item.color} icon={<Icon aria-hidden="true" className="h-3 w-3 shrink-0" />} />; }
