import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("hms_token") || null);
  const [user,  setUser]  = useState(() => {
    try {
      const s = sessionStorage.getItem("hms_user");
      if (!s) return null;
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed.roles === "string") {
        parsed.roles = parsed.roles
          .replace(/[\[\]]/g, "")
          .split(",")
          .map(r => r.trim())
          .filter(Boolean);
      }
      return parsed;
    } catch { return null; }
  });

  const login = useCallback((tokenVal, userVal) => {
    sessionStorage.setItem("hms_token", tokenVal);
    sessionStorage.setItem("hms_user", JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("hms_token");
    sessionStorage.removeItem("hms_user");
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = useCallback(() => {
    return user?.roles?.includes("ROLE_ADMIN") || false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);