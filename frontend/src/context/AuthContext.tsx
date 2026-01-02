import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const { data } = await api.get("/api/auth/users/me");
          setUser(data);
        } catch (error: any) {
          console.error("Failed to fetch user", error);
          // Only logout on 401 errors (unauthorized/invalid token)
          // Other errors (network, server) should not trigger logout
          // as the axios interceptor may have already handled token refresh
          if (error?.response?.status === 401) {
            logout();
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = (newToken: string, newRefreshToken: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("refresh_token", newRefreshToken);
    setToken(newToken);
    toast.success("Successfully logged in");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
    toast.info("Logged out");
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const { data } = await api.get("/api/auth/users/me");
        setUser(data);
      } catch (error) {
        console.error("Failed to refresh user", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
