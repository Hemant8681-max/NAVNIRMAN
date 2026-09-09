import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("sih_access_token"),
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sih_user") || "null");
    } catch {
      return null;
    }
  });

  const saveAuth = (data) => {
    localStorage.setItem("sih_access_token", data.data.accessToken);
    localStorage.setItem("sih_user", JSON.stringify(data.data.user));
    setToken(data.data.accessToken);
    setUser(data.data.user);
  };

  const login = async (payload) => {
    const data = await authApi.login(payload);
    saveAuth(data);
    return data;
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    saveAuth(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("sih_access_token");
    localStorage.removeItem("sih_user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("sih:unauthorized", handler);
    return () => window.removeEventListener("sih:unauthorized", handler);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, login, register, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
