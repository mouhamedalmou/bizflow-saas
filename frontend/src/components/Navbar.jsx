import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const navLinkClass = ({ isActive }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-blue-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  ].join(" ");

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <NavLink
            to="/dashboard"
            className="text-lg font-bold text-slate-950 dark:text-white"
          >
            BizFlow SaaS
          </NavLink>

          {user?.role === "admin" && (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white dark:bg-blue-600">
              Admin
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/products" className={navLinkClass}>
                Products
              </NavLink>
              <NavLink to="/my-orders" className={navLinkClass}>
                My Orders
              </NavLink>
              {user.role === "admin" && (
                <>
                  <NavLink to="/admin/products" className={navLinkClass}>
                    Admin Products
                  </NavLink>
                  <NavLink to="/admin/orders" className={navLinkClass}>
                    Admin Orders
                  </NavLink>
                </>
              )}

              <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

              <span className="max-w-48 truncate text-sm text-slate-500 dark:text-slate-400">
                {user.name}
              </span>
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
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {isDark ? "Light" : "Dark"}
              </button>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
