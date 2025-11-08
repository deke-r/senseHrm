"use client"

import { useState, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    if (storedToken) {
      setToken(storedToken)
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error("Error parsing stored user:", err)
      }
    }
    setLoading(false)
  }, [])

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      if (!response.ok) throw new Error("Signup failed")
      return { success: true }
    } catch (error) {
      console.log(error)
      return { success: false, error: error.message }
    }
  }

  const login = async (email, password) => {
    try {
      const controller = new AbortController();
      const { signal } = controller;
  
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal,
      });
  

      if (!response.ok) {

        await response.text().catch(() => null);
        return { success: false, error: "Invalid credentials" };
      }
  
      const data = await response.json().catch(() => null);
      if (!data || !data.token) {
        return { success: false, error: "Invalid response from server" };
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
  
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: "Unable to connect to the server" };
    }
  };
  
  

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error("Failed to send OTP")
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const verifyOtp = async (email, otp, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      if (!response.ok) throw new Error("OTP verification failed")
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = (redirect = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  
    if (redirect) {
      window.location.href = "/login";
    }
  };
  

  return {
    user,
    token,
    loading,
    signup,
    login,
    logout,
    forgotPassword,
    verifyOtp,
    isAuthenticated: !!token,
  }
}
