"use client"
import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { useAuth } from "./hooks/useAuth"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

// Pages
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import HRDashboard from "./pages/HRDashboard"
import Employees from "./pages/Employees"
import EmployeeProfile from "./pages/EmployeeProfile"
import Leaves from "./pages/Leaves"
import Attendance from "./pages/Attendance"
import WFH from "./pages/WFH"
import Feed from "./pages/Feed"
import Profile from "./pages/Profile"

export default function App() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
   
      <Routes>
 
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate to={user?.role === "employee" ? "/employee-dashboard" : "/hr-dashboard"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <Signup />
            ) : (
              <Navigate to={user?.role === "employee" ? "/employee-dashboard" : "/hr-dashboard"} />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            !isAuthenticated ? (
              <ForgotPassword />
            ) : (
              <Navigate to={user?.role === "employee" ? "/employee-dashboard" : "/hr-dashboard"} />
            )
          }
        />

        {/* Protected Routes - Role-based */}
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr-dashboard"
          element={
            <ProtectedRoute requiredRole={["hr", "admin"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <Leaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wfh"
          element={
            <ProtectedRoute>
              <WFH />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? (user?.role === "employee" ? "/employee-dashboard" : "/hr-dashboard") : "/login"}
            />
          }
        />
      </Routes>
    </Router>
  )
}
