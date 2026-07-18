import { useEffect, useState, type ReactNode } from "react";
import { BadgeCheck, BarChart3, CircleDollarSign, FileText, Package, PieChart as PieChartIcon, ShoppingCart, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import Loader from "../components/Loader";
import { StatsCard } from "../components/StatsCard";
import type { DashboardStats, Order, OrderStatus } from "../types";
import { getApiErrorMessage } from "../api/axios";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
};

const ChartEmptyState = ({ icon, title, message }: { icon: ReactNode; title: string; message: string }) => (
  <div className="grid h-full place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center dark:border-slate-700 dark:bg-slate-950/30">
    <div>
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">{icon}</span>
      <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.token) {
      return;
    }

    const fetchDashboard = async () => {
      setError("");
      setLoading(true);

      try {
        if (user?.role === "admin") {
          const [statsResponse, recentOrdersResponse] = await Promise.all([
            api.get<DashboardStats>("/dashboard/stats"),
            api.get<Order[]>("/dashboard/recent-orders"),
          ]);

          setStats(statsResponse.data);
          setRecentOrders(recentOrdersResponse.data);
        } else {
          const { data } = await api.get<Order[]>("/orders/my-orders");
          setMyOrders(data);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load dashboard"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.role, user?.token]);

  if (!user?.token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  const chartTextColor = isDark ? "#cbd5e1" : "#475569";
  const chartGridColor = isDark ? "#1e293b" : "#e2e8f0";
  const chartTooltipStyle = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    borderRadius: "8px",
    color: isDark ? "#e2e8f0" : "#0f172a",
  };
  const statusColors: Record<OrderStatus, string> = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    shipped: "#6366f1",
    delivered: "#10b981",
    completed: "#10b981",
    cancelled: "#ef4444",
  };
  const monthlySales = stats?.monthlySales ?? [];
  const ordersByStatus = stats?.ordersByStatus ?? [];
  const hasRevenueData = monthlySales.some((item) => item.revenue > 0);
  const hasSalesData = monthlySales.some((item) => item.orders > 0);
  const hasStatusData = ordersByStatus.some((item) => item.count > 0);
  const adminStats = [
    { label: "Users", value: stats?.totalUsers ?? 0, icon: <Users size={21} />, color: "indigo" },
    { label: "Products", value: stats?.totalProducts ?? 0, icon: <Package size={21} />, color: "emerald" },
    { label: "Orders", value: stats?.totalOrders ?? 0, icon: <ShoppingCart size={21} />, color: "amber" },
    { label: "Invoices", value: stats?.totalInvoices ?? 0, icon: <FileText size={21} />, color: "red" },
    { label: "Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: <BadgeCheck size={21} />, color: "emerald" },
    { label: "Revenue", value: formatCurrency(stats?.totalRevenue ?? 0), icon: <CircleDollarSign size={21} />, color: "indigo" },
  ] as const;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 lg:text-4xl">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Welcome back, {user?.name}. Your role is {user?.role}.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {user?.role === "admin" ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {adminStats.map((item) => <StatsCard key={item.label} {...item} />)}
          </div>

          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Revenue chart
                  </h2>
                  <p className="text-sm text-slate-500">
                    Revenue trend for the last 6 months.
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-950">
                  {formatCurrency(stats?.totalRevenue ?? 0)}
                </p>
              </div>

              <div className="h-72">
                {hasRevenueData ? <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.monthlySales || []}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke={chartGridColor}
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: chartTextColor, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: chartTextColor, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer> : <ChartEmptyState icon={<BarChart3 size={22} />} title="No revenue data yet" message="Revenue activity will appear here as soon as orders are completed." />}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-slate-950">
                Orders analytics
              </h2>
              <p className="text-sm text-slate-500">
                Current fulfillment status split.
              </p>

              <div className="mt-4 h-56">
                {hasStatusData ? <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.ordersByStatus || []}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {(stats?.ordersByStatus || []).map((item) => (
                        <Cell
                          key={item.status}
                          fill={statusColors[item.status] || "#64748b"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value, name) => [value, name]}
                    />
                  </PieChart>
                </ResponsiveContainer> : <ChartEmptyState icon={<PieChartIcon size={22} />} title="No order activity yet" message="The fulfillment breakdown will appear after the first order." />}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(stats?.ordersByStatus || []).map((item) => (
                  <div
                    key={item.status}
                    className="rounded-md border border-slate-200 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            statusColors[item.status] || "#64748b",
                        }}
                      />
                      <p className="text-xs capitalize text-slate-500">
                        {item.status}
                      </p>
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {item.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="font-semibold text-slate-950">Monthly sales</h2>
              <p className="text-sm text-slate-500">
                Number of orders created per month.
              </p>
            </div>

            <div className="h-72">
              {hasSalesData ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlySales || []}>
                  <CartesianGrid
                    stroke={chartGridColor}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: chartTextColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: chartTextColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [value, "Orders"]}
                  />
                  <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer> : <ChartEmptyState icon={<BarChart3 size={22} />} title="No monthly sales yet" message="Monthly order volume will be displayed once sales begin." />}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-semibold text-slate-950">Recent orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-3 text-slate-700">
                        {order.user?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {order.status}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-950">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={4}>
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">My orders</h2>
          <p className="mt-1 text-sm text-slate-500">
            You have {myOrders.length} order{myOrders.length === 1 ? "" : "s"}.
          </p>

          <div className="mt-4 divide-y divide-slate-100">
            {myOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-950">
                    Order {order._id.slice(-6)}
                  </p>
                  <p className="text-sm text-slate-500">{order.status}</p>
                </div>
                <p className="font-semibold text-slate-950">
                  {formatCurrency(order.totalPrice)}
                </p>
              </div>
            ))}
            {myOrders.length === 0 && (
              <p className="py-4 text-sm text-slate-500">No orders yet.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
