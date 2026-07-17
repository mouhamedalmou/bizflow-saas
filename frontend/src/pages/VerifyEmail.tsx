import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { getApiErrorMessage } from "../api/axios";
import type { ApiMessage } from "../types";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const { data } = await api.get<ApiMessage>(`/auth/verify-email/${token}`);

        if (isMounted) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          setMessage(getApiErrorMessage(err, "Invalid or expired verification link."));
        }
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            BizFlow SaaS
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            Verify email
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Secure your account before accessing the workspace.
          </p>
        </div>

        <div className="px-6 py-6">
          <div
            className={[
              "flex items-start gap-3 rounded-lg border px-4 py-4",
              isLoading
                ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-200"
                : isSuccess
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200"
                  : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200",
            ].join(" ")}
          >
            <span
              className={[
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                isLoading
                  ? "bg-blue-600 text-white"
                  : isSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white",
              ].join(" ")}
            >
              {isLoading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : isSuccess ? (
                "✓"
              ) : (
                "!"
              )}
            </span>

            <div>
              <h2 className="font-semibold">
                {isLoading
                  ? "Checking verification link"
                  : isSuccess
                    ? "Email verified"
                    : "Verification failed"}
              </h2>
              <p className="mt-1 text-sm opacity-90">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {isSuccess ? (
              <Link
                to="/login"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Continue to login
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Create a new account
              </Link>
            )}

            <Link
              to="/login"
              className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
