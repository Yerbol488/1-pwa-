import { createContext, useContext, useState, type ReactNode } from "react";

// Mock auth: no real backend. Just local React state to gate routes
// so the login screen can navigate to the dashboard.
interface AuthContextValue {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const value: AuthContextValue = {
    isAuthenticated,
    login: () => setAuthenticated(true),
    logout: () => setAuthenticated(false),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
