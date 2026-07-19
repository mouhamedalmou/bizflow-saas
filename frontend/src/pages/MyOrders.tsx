import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import type { Order, OrderStatus } from "../types";
import { getApiErrorMessage } from "../api/axios";
import { EmptyState } from "../components/EmptyState";
import { InlineAlert, PageHeader } from "../components/PageLayout";
import { Pagination } from "../components/Pagination";
import { StatusBadge, type DisplayOrderStatus } from "../components/StatusBadge";

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

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    api
      .get<Order[]>("/orders/my-orders")
      .then(({ data }) => {
        if (isMounted) {
          setOrders(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Unable to load your orders"));
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

  if (loading) {
    return <Loader label="Loading your orders..." />;
  }

  const totalPages = Math.ceil(orders.length / 10);
  const visibleOrders = orders.slice((page - 1) * 10, page * 10);
  const displayStatus = (status: OrderStatus): DisplayOrderStatus => status === "completed" ? "delivered" : status;

  return (
    <section className="space-y-8 lg:space-y-10">
      <PageHeader title="My Orders" subtitle="Track your purchases and order status." />

      {error && (
        <InlineAlert>{error}</InlineAlert>
      )}

      {!error && orders.length === 0 && (
        <EmptyState title="No orders yet" message="Your future orders will appear here after you buy a product." />
      )}

      {visibleOrders.length > 0 && <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <table className="w-full table-fixed text-[9px] sm:text-xs lg:text-sm">
          <colgroup><col className="w-[18%]" /><col className="w-[18%]" /><col className="w-[29%]" /><col className="w-[17%]" /><col className="w-[18%]" /></colgroup>
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
            <tr>{['Order', 'Date', 'Items', 'Total', 'Status'].map((label) => <th key={label} className="break-words px-1.5 py-2 text-[8px] font-bold uppercase tracking-normal sm:px-3 sm:py-3 sm:text-[10px] lg:px-5 lg:text-xs lg:tracking-wide">{label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {visibleOrders.map((order, index) => <tr key={order._id} className={index % 2 === 0 ? "bg-white dark:bg-slate-900/70" : "bg-slate-50 dark:bg-slate-800/35"}>
              <td className="break-all px-1.5 py-2 font-mono font-semibold text-slate-950 dark:text-slate-100 sm:px-3 lg:px-5 lg:py-4">#{order._id.slice(-8).toUpperCase()}</td>
              <td className="break-words px-1.5 py-2 leading-tight text-slate-600 dark:text-slate-300 sm:px-3 lg:px-5 lg:py-4">{formatDate(order.createdAt)}</td>
              <td className="min-w-0 px-1.5 py-2 sm:px-3 lg:px-5 lg:py-4">{order.orderItems?.map((item, itemIndex) => <p key={`${order._id}-${itemIndex}`} className="break-words leading-tight text-slate-700 dark:text-slate-200"><span className="font-medium">{item.name}</span> <span className="text-slate-500">×{item.quantity}</span></p>)}</td>
              <td className="break-words px-1.5 py-2 font-mono font-semibold tabular-nums text-slate-950 dark:text-slate-100 sm:px-3 lg:px-5 lg:py-4">{formatCurrency(order.totalPrice)}</td>
              <td className="px-1.5 py-2 sm:px-3 lg:px-5 lg:py-4"><StatusBadge status={displayStatus(order.status)} /></td>
            </tr>)}
          </tbody>
        </table>
      </div>}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
};

export default MyOrders;
