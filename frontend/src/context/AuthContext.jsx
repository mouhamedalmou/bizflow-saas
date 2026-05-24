import { useEffect, useState } from "react";
import { AuthContext } from "./authContextCore";

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser);

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

export const AuthProvider = ({ children }) => {
  const [user, setCurrentUser] = useState(getStoredUser);
  const [loading] = useState(false);

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

  const setUser = (nextUser) => {
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
        setUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
