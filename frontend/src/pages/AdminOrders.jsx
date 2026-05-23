import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";

const orderStatuses = ["pending", "processing", "shipped", "delivered"];

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const formatDate = (value) => {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const getStatusClass = (status) => {
  return statusStyles[status] || "bg-slate-50 text-slate-700 border-slate-200";
};

const getStatusOptions = (currentStatus) => {
  if (orderStatuses.includes(currentStatus)) {
    return orderStatuses;
  }

  return [currentStatus, ...orderStatuses].filter(Boolean);
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    api
      .get("/orders")
      .then(({ data }) => {
        if (isMounted) {
          setOrders(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || "Unable to load orders");
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

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);

    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === data._id ? data : order))
      );
      toast.success(`Order ${orderId.slice(-8).toUpperCase()} is now ${status}.`);
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        "Unable to update order status";

      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <Loader label="Loading admin orders..." />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Admin Orders</h1>
          <p className="text-sm text-slate-500">
            Review all customer orders and manage fulfillment status.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 && !error && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            No orders yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Customer orders will appear here as soon as products are ordered.
          </p>
        </div>
      )}

      <div className="space-y-4 lg:hidden">
        {orders.map((order) => (
          <article
            key={order._id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
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
              <span
                className={[
                  "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                  getStatusClass(order.status),
                ].join(" ")}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-lg font-bold text-slate-950">
                {formatCurrency(order.totalPrice)}
              </p>
              <select
                value={order.status}
                onChange={(event) =>
                  handleStatusChange(order._id, event.target.value)
                }
                disabled={updatingId === order._id}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
        <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-950">
                        {order.user?.name || "Unknown customer"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.user?.email || "No email"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-950">
                      {formatCurrency(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                          getStatusClass(order.status),
                        ].join(" ")}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(order._id, event.target.value)
                        }
                        disabled={updatingId === order._id}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
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
    </section>
  );
};

export default AdminOrders;
