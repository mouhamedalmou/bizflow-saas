import { useEffect, useState } from "react";
import { AuthContext } from "./authContextCore";
import type { ChildrenProps, User } from "../types";

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
  const [loading] = useState<boolean>(false);

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

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        setUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
