import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiRequest("/api/auth/me")
      .then((payload) => {
        if (!cancelled) {
          setUser(payload.data.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      async login(email, password) {
        const payload = await apiRequest("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        setUser(payload.data.user);
        return payload.data.user;
      },
      async register(data) {
        const payload = await apiRequest("/api/auth/register", {
          method: "POST",
          body: data,
        });
        setUser(payload.data.user);
        return payload.data.user;
      },
      async logout() {
        await apiRequest("/api/auth/logout", { method: "POST" });
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
