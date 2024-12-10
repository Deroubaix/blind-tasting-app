"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { AuthenticatedUser } from "../../services/server/IAuthService";
import { SessionAuthService } from "../../services/server/SessionAuthService";

export type AuthContextValue = {
  user: AuthenticatedUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isInitialLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const authService = useMemo(() => new SessionAuthService(), []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedUser = await authService.fetchMe();
        setUser(fetchedUser);
      } catch (error) {
        console.warn("Failed to fetch user:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchUser();
  }, [authService]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const signedInUser = await authService.signIn(email, password);
      setUser(signedInUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      signIn,
      signOut,
      isLoading,
      isInitialLoading,
    }),
    [user, isLoading, isInitialLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuthProvider() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthProvider must be used within an AuthProvider");
  }
  return context;
}
