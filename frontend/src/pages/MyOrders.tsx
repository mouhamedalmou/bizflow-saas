import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import type { Order, OrderStatus } from "../types";
import { getApiErrorMessage } from "../api/axios";

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

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const getStatusClass = (status: OrderStatus): string => {
  return statusStyles[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">My Orders</h1>
          <p className="text-sm text-slate-500">
            Track your purchases and order status.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Your future orders will appear here after you buy a product.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <article
            key={order._id}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                    getStatusClass(order.status),
                  ].join(" ")}
                >
                  {order.status}
                </span>
                <p className="text-lg font-bold text-slate-950">
                  {formatCurrency(order.totalPrice)}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
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
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MyOrders;
