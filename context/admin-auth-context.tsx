"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AdminAuthContextType {
  isLoggedIn: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const ADMIN_STORAGE_KEY = "animestream_admin_session"

// Admin credentials
const ADMIN_USERNAME = "kaitoll12"
const ADMIN_PASSWORD = "chocolatada123"

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (session === "authenticated") {
      setIsLoggedIn(true)
    }
    setIsLoaded(true)
  }, [])

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_STORAGE_KEY, "authenticated")
      setIsLoggedIn(true)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY)
    setIsLoggedIn(false)
  }

  if (!isLoaded) {
    return null
  }

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
