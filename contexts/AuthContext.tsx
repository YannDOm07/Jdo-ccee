"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  checkStatus: () => Promise<void>;
  setLoggedIn: (val: boolean) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const setLoggedIn = useCallback((val: boolean) => {
    setIsLoggedIn(val);
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      setIsLoggedIn(!!data.loggedIn);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/profil/logout", { method: "POST" });
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Run on pathname changes but only if it's a page that might change auth state 
  useEffect(() => {
    const sensitivePages = ["/profil", "/inscription", "/connexion", "/"];
    if (sensitivePages.some(page => pathname === page || pathname.startsWith(page))) {
       // Only fetch if not already in a loading state to avoid redundant calls
       if (!isLoading) checkStatus();
    }
  }, [pathname, checkStatus, isLoading]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, checkStatus, setLoggedIn, logout }}>
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
