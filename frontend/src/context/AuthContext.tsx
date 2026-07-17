import { useEffect, useState } from "react";
import { AuthContext } from "./authContextCore";
import type { ChildrenProps, User } from "../types";
import type { LoginInput, RegisterInput } from "../types";
import api, { getApiErrorMessage } from "../api/axios";

const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser) as User;

    if (!user?.token) {
      localStorage.removeItem("user");
      return null;
    }

    return user;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }: ChildrenProps) => {
  const [user, setCurrentUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem("user");
      setCurrentUser(null);
    };

    window.addEventListener("bizflow:auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("bizflow:auth-expired", handleAuthExpired);
    };
  }, []);

  const setUser = (nextUser: User | null): void => {
    if (!nextUser?.token) {
      localStorage.removeItem("user");
      setCurrentUser(null);
      return;
    }

    localStorage.setItem("user", JSON.stringify(nextUser));
    setCurrentUser(nextUser);
  };

  const clearSession = (): void => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  const login = async (input: LoginInput): Promise<User> => {
    setLoading(true); setError(null);
    try { const { data } = await api.post<User>("/auth/login", input); setUser(data); return data; }
    catch (reason: unknown) { const message = getApiErrorMessage(reason, "Accesso non riuscito."); setError(message); throw reason; }
    finally { setLoading(false); }
  };

  const register = async (input: RegisterInput): Promise<void> => {
    setLoading(true); setError(null);
    try { await api.post("/auth/register", input); }
    catch (reason: unknown) { const message = getApiErrorMessage(reason, "Registrazione non riuscita."); setError(message); throw reason; }
    finally { setLoading(false); }
  };

  const logoutRemote = async (): Promise<void> => { try { await api.post("/auth/logout"); } finally { clearSession(); } };
  const logout = (): void => { void logoutRemote(); clearSession(); };
  const refreshUser = async (): Promise<User | null> => {
    const token = user?.token; if (!token) return null;
    setLoading(true); setError(null);
    try { const { data } = await api.get<Omit<User, "token">>("/auth/me"); const refreshed = { ...data, token }; setUser(refreshed); return refreshed; }
    catch (reason: unknown) { setError(getApiErrorMessage(reason, "Impossibile aggiornare il profilo.")); return null; }
    finally { setLoading(false); }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        register,
        setUser,
        logout,
        logoutRemote,
        refreshUser,
        loading,
        isLoading: loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
