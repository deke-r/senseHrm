import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" />

  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!rolesArray.includes(user?.role)) {
      return <Navigate to="/login" />
    }
  }

  return children
}
