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

      <div className="space-y-4 lg:hidden">
        {visibleOrders.map((order) => (
          <article
            key={order._id}
            className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {order.user?.name || "Unknown customer"}
                </p>
                <p className="text-sm text-slate-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <StatusBadge status={displayStatus(order.status)} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-lg font-bold text-slate-950">
                {formatCurrency(order.totalPrice)}
              </p>
              <select
                value={order.status}
                onChange={(event) =>
                  handleStatusChange(order._id, event.target.value as OrderStatus)
                }
                disabled={updatingId === order._id}
                className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium capitalize text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {getStatusOptions(order.status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>

      {orders.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] table-fixed text-sm">
              <colgroup>
                <col className="w-[13%]" />
                <col className="w-[27%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead className="border-b border-slate-300 bg-slate-100 text-left text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide">Order</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide">Customer</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide">Total</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {visibleOrders.map((order, index) => (
                  <tr key={order._id} className={`table-row transition-colors duration-150 hover:bg-indigo-50/70 dark:hover:bg-slate-700/70 ${index % 2 === 0 ? "bg-white dark:bg-slate-900/70" : "bg-slate-50 dark:bg-slate-800/35"}`}>
                    <td className="px-5 py-4 font-mono text-sm font-semibold tabular-nums text-slate-950">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">
                        {order.user?.name || "Unknown customer"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {order.user?.email || "No email"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold tabular-nums text-slate-950">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={displayStatus(order.status)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(order._id, event.target.value as OrderStatus)
                        }
                        disabled={updatingId === order._id}
                        className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-medium capitalize text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
