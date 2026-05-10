import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionToken: string | null;
  checkSession: (token?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (sessionToken) {
      // Inyectamos la cookie mágicamente (soporte para HTTP local y HTTPS producción)
      headers.set('Cookie', `next-auth.session-token=${sessionToken}; __Secure-next-auth.session-token=${sessionToken}`);
    }
    return fetch(url, { ...options, headers });
  };

  const checkSession = async (token?: string) => {
    try {
      setLoading(true);
      let currentToken = token;

      if (!currentToken) {
        currentToken = await SecureStore.getItemAsync('session_token');
      }

      if (currentToken) {
        setSessionToken(currentToken);
        await SecureStore.setItemAsync('session_token', currentToken);

        // Verificar validez usando nuestro propio endpoint móvil para evitar problemas de cookies de NextAuth
        const res = await fetch(`${API_URL}/api/mobile/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify({ token: currentToken }),
          cache: 'no-store'
        });
        const data = await res.json();

        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          setSessionToken(null);
          await SecureStore.deleteItemAsync('session_token');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('session_token');
      setSessionToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, sessionToken, checkSession, logout, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
