import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";
import type { Order, OrderStatus } from "../types";
import { getApiErrorMessage } from "../api/axios";
import { EmptyState } from "../components/EmptyState";
import { PageHeader, InlineAlert } from "../components/PageLayout";
import { Pagination } from "../components/Pagination";
import { SearchInput } from "../components/SearchInput";
import { StatusBadge, type DisplayOrderStatus } from "../components/StatusBadge";

const orderStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const formatDate = (value: string): string => {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const getStatusOptions = (currentStatus: OrderStatus): OrderStatus[] => {
  if (orderStatuses.includes(currentStatus)) {
    return orderStatuses;
  }

  return [currentStatus, ...orderStatuses].filter(Boolean);
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    api
      .get<Order[]>("/orders")
      .then(({ data }) => {
        if (isMounted) {
          setOrders(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Unable to load orders"));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus): Promise<void> => {
    setUpdatingId(orderId);

    try {
      const { data } = await api.put<Order>(`/orders/${orderId}/status`, { status });

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === data._id ? data : order))
      );
      toast.success(`Order ${orderId.slice(-8).toUpperCase()} is now ${status}.`);
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to update order status");

      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading admin orders..." />;
  }

  const filteredOrders = orders.filter((order) => `${order._id} ${order.user?.name ?? ""} ${order.user?.email ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const totalPages = Math.ceil(filteredOrders.length / 10);
  const visibleOrders = filteredOrders.slice((page - 1) * 10, page * 10);
  const displayStatus = (status: OrderStatus): DisplayOrderStatus => status === "completed" ? "delivered" : status;

  return (
    <section className="space-y-8 lg:space-y-10">
      <PageHeader title="Admin Orders" subtitle="Review all customer orders and manage fulfillment status." actions={<SearchInput onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search orders..." />} />

      {error && (
        <InlineAlert>{error}</InlineAlert>
      )}

      {orders.length === 0 && !error && (
        <EmptyState title="No orders yet" message="Customer orders will appear here as soon as products are ordered." />
      )}

      {orders.length > 0 && (
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="min-w-0 overflow-hidden">
            <table className="w-full table-fixed text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[13%]" />
                <col className="w-[14%]" />
                <col className="w-[19%]" />
              </colgroup>
              <thead className="border-b border-slate-300 bg-slate-100 text-left text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                <tr>
                  {['Order', 'Customer', 'Date', 'Total', 'Status', 'Update'].map((label) => <th key={label} className="break-words px-1 py-2 text-[8px] font-bold uppercase tracking-normal sm:px-2 sm:text-[9px] md:px-3 md:py-3 lg:px-5 lg:py-3.5 lg:text-xs lg:tracking-wide">{label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {visibleOrders.map((order, index) => (
                  <tr key={order._id} className={`table-row transition-colors duration-150 hover:bg-indigo-50/70 dark:hover:bg-slate-700/70 ${index % 2 === 0 ? "bg-white dark:bg-slate-900/70" : "bg-slate-50 dark:bg-slate-800/35"}`}>
                    <td className="break-all px-1 py-2 font-mono font-semibold tabular-nums text-slate-950 dark:text-slate-100 sm:px-2 md:px-3 lg:px-5 lg:py-4">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="min-w-0 px-1 py-2 sm:px-2 md:px-3 lg:px-5 lg:py-4">
                      <p className="line-clamp-2 break-words font-medium leading-tight text-slate-950 dark:text-slate-100">
                        {order.user?.name || "Unknown customer"}
                      </p>
                      <p className="hidden break-all text-[8px] text-slate-500 sm:block lg:text-xs">
                        {order.user?.email || "No email"}
                      </p>
                    </td>
                    <td className="break-words px-1 py-2 leading-tight text-slate-700 dark:text-slate-300 sm:px-2 md:px-3 lg:px-5 lg:py-4">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="break-words px-1 py-2 font-mono font-semibold tabular-nums text-slate-950 dark:text-slate-100 sm:px-2 md:px-3 lg:px-5 lg:py-4">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-1 py-2 sm:px-2 md:px-3 lg:px-5 lg:py-3.5">
                      <StatusBadge status={displayStatus(order.status)} />
                    </td>
                    <td className="px-1 py-2 sm:px-2 md:px-3 lg:px-5 lg:py-3.5">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(order._id, event.target.value as OrderStatus)
                        }
                        disabled={updatingId === order._id}
                        aria-label={`Update order ${order._id.slice(-8)} status`}
                        className="w-full max-w-full rounded-md border border-slate-300 bg-slate-100 px-0.5 py-1 text-[7px] font-medium capitalize text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:px-1 sm:text-[9px] md:text-xs lg:px-3 lg:py-2 lg:text-sm"
                      >
                        {getStatusOptions(order.status).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
};

export default AdminOrders;
