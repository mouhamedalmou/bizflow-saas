import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const mainLinks = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Products", path: "/products" },
  { label: "My Orders", path: "/my-orders" },
];

const adminLinks = [
  { label: "Admin Products", path: "/admin/products" },
  { label: "Admin Orders", path: "/admin/orders" },
];

const pageTitles = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/my-orders": "My Orders",
  "/admin/products": "Admin Products",
  "/admin/orders": "Admin Orders",
};

const getInitials = (name = "") => {
  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials || "U";
};

const navLinkClass = ({ isActive }) =>
  [
    "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-blue-600 text-white shadow-sm"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  ].join(" ");

const SidebarContent = ({ user, onNavigate }) => {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            BF
          </div>
          <div>
            <p className="font-bold text-slate-950 dark:text-white">
              BizFlow SaaS
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Business workspace
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Workspace
        </p>
        <div className="mt-2 space-y-1">
          {mainLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onNavigate}
              className={navLinkClass}
            >
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {user?.role === "admin" && (
          <div className="mt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Admin
            </p>
            <div className="mt-2 space-y-1">
              {adminLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onNavigate}
                  className={navLinkClass}
                >
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-blue-600">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
              {user?.name}
            </p>
            <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "BizFlow";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative h-full w-72 border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <SidebarContent
              user={user}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
        <SidebarContent user={user} />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
              >
                Menu
              </button>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  BizFlow
                </p>
                <h1 className="text-lg font-bold text-slate-950 dark:text-white">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {isDark ? "Light" : "Dark"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
