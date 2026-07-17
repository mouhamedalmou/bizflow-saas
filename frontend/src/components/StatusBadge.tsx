import { Ban, CheckCircle2, Clock3, PackageCheck, Truck } from "lucide-react";
import { Badge } from "./Badge";
export type DisplayOrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export interface StatusBadgeProps { status: DisplayOrderStatus }
const config = { pending: { label: "In attesa", color: "amber", icon: Clock3 }, processing: { label: "In lavorazione", color: "cyan", icon: PackageCheck }, shipped: { label: "Spedito", color: "blue", icon: Truck }, delivered: { label: "Consegnato", color: "emerald", icon: CheckCircle2 }, cancelled: { label: "Annullato", color: "red", icon: Ban } } as const;
export function StatusBadge({ status }: StatusBadgeProps) { const item = config[status]; const Icon = item.icon; return <Badge label={item.label} color={item.color} icon={<Icon aria-hidden="true" size={13} />} />; }
