import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import type { NavLinkRenderProps } from "react-router-dom";
import type { User } from "../types";
import { Bell, Boxes, ClipboardList, LayoutDashboard, LogOut, Menu, Moon, Package, Search, Settings, ShieldCheck, Sun } from "lucide-react";

const mainLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "My Orders", path: "/my-orders", icon: ClipboardList },
];

const adminLinks = [
  { label: "Admin Products", path: "/admin/products", icon: Boxes },
  { label: "Admin Orders", path: "/admin/orders", icon: ShieldCheck },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/my-orders": "My Orders",
  "/admin/products": "Admin Products",
  "/admin/orders": "Admin Orders",
};

const getInitials = (name = ""): string => {
  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials || "U";
};

const navLinkClass = ({ isActive }: NavLinkRenderProps): string =>
  [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
    isActive
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
  ].join(" ");

interface SidebarContentProps { user: User | null; onNavigate?: () => void }

const SidebarContent = ({ user, onNavigate }: SidebarContentProps) => {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white shadow-lg shadow-indigo-950/30">
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
          {mainLinks.map((link) => {
            const Icon = link.icon;
            return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onNavigate}
              className={navLinkClass}
            >
              <Icon size={18} /><span>{link.label}</span>
            </NavLink>
          )})}
        </div>

        {user?.role === "admin" && (
          <div className="mt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Admin
            </p>
            <div className="mt-2 space-y-1">
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={onNavigate}
                  className={navLinkClass}
                >
                  <Icon size={18} /><span>{link.label}</span>
                </NavLink>
              )})}
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"><Settings size={18} />Settings</button>
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
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-transparent dark:text-slate-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative h-full w-72 border-r border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <SidebarContent
              user={user}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:block">
        <SidebarContent user={user} />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/80">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
              >
                <Menu size={20} />
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

            <div className="hidden max-w-md flex-1 md:block"><label className="relative block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} /><input aria-label="Search" placeholder="Search products, orders..." className="w-full rounded-xl border border-slate-700 bg-slate-900/70 py-2 pl-10 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" /></label></div>
            <div className="flex items-center gap-2">
              <button aria-label="Notifications" className="relative rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-indigo-500 hover:text-white"><Bell size={19} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" /></button>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:bg-slate-800"
              >
                {isDark ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className="rounded-lg bg-slate-900 p-2 text-white hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <LogOut size={19} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
        <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">© {new Date().getFullYear()} BizFlow SaaS. All rights reserved.</footer>
      </div>
    </div>
  );
};

export default SidebarLayout;
