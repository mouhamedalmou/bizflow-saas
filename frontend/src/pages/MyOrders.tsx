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

      <div className="space-y-4">
        {visibleOrders.map((order) => (
          <article
            key={order._id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={displayStatus(order.status)} />
                <p className="font-mono text-lg font-bold tabular-nums text-slate-950 dark:text-slate-100">
                  {formatCurrency(order.totalPrice)}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {order.orderItems?.map((item) => (
                <div
                  key={`${order._id}-${item.product}`}
                  className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div>
                    <p className="font-medium text-slate-950">{item.name}</p>
                    <p className="text-slate-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-slate-600">
                    Unit: {formatCurrency(item.price)}
                  </p>
                  <p className="font-mono font-semibold tabular-nums text-slate-950 dark:text-slate-100">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
};

export default MyOrders;
