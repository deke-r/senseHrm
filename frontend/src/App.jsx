"use client";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import LeavePage from "./pages/Leave";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import ManageRequests from "./pages/admin/ManageRequests";

export default function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* ✅ Global Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <Routes>
        {/* ====== Public Routes ====== */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <Signup />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/forgot-password"
          element={
            !isAuthenticated ? (
              <ForgotPassword />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        {/* ====== Protected Routes ====== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
          path="/employees/:id"
          element={
            <ProtectedRoute>
              <EmployeeProfile />
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
          path="/leave"
          element={
            <ProtectedRoute>
              <LeavePage />
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
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />


        <Route
          path="/manage/requests"
          element={
            <ProtectedRoute requiredRole={["hr", "admin"]}>
              <ManageRequests />
            </ProtectedRoute>
          }
        />

        {/* ====== Default Route ====== */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />


        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}
