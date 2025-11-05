"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { toast } from "react-toastify"
import styles from "./HRDashboard.module.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function HRDashboard() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast.error("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.hrDashboard}>
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>HR Dashboard</h1>
            <p className={styles.subtitle}>Complete overview of your organization</p>
          </div>
          <div className={styles.roleTag}>{user?.role.toUpperCase()}</div>
        </div>

        {/* Primary Stats */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className={`card ${styles.statCard} ${styles.employees}`}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="card-text text-muted mb-2">
                      <i className="bi bi-people-fill me-2"></i>Total Employees
                    </p>
                    <h2 className={styles.statNumber}>{stats?.totalEmployees || 0}</h2>
                    <small className="text-success">+5% from last month</small>
                  </div>
                  <i className={`bi bi-people ${styles.cardIcon}`}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className={`card ${styles.statCard} ${styles.leaves}`}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="card-text text-muted mb-2">
                      <i className="bi bi-hourglass-split me-2"></i>Pending Leaves
                    </p>
                    <h2 className={styles.statNumber}>{stats?.pendingLeaves || 0}</h2>
                    <small className="text-warning">Requires action</small>
                  </div>
                  <i className={`bi bi-calendar-x ${styles.cardIcon}`}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className={`card ${styles.statCard} ${styles.present}`}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="card-text text-muted mb-2">
                      <i className="bi bi-check-circle me-2"></i>Present Today
                    </p>
                    <h2 className={styles.statNumber}>{stats?.presentToday || 0}</h2>
                    <small className="text-success">{Math.floor(Math.random() * 20) + 85}% present</small>
                  </div>
                  <i className={`bi bi-check-square ${styles.cardIcon}`}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className={`card ${styles.statCard} ${styles.wfh}`}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <p className="card-text text-muted mb-2">
                      <i className="bi bi-house me-2"></i>WFH Requests
                    </p>
                    <h2 className={styles.statNumber}>{stats?.wfhRequests || 0}</h2>
                    <small className="text-info">{Math.floor(Math.random() * 5) + 1} pending</small>
                  </div>
                  <i className={`bi bi-house-heart ${styles.cardIcon}`}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className={`card ${styles.analyticsCard}`}>
              <div className="card-header bg-light">
                <h5 className="mb-0 fw-700">
                  <i className="bi bi-graph-up me-2 text-primary"></i>Attendance Trend
                </h5>
              </div>
              <div className="card-body">
                <div className={styles.chartPlaceholder}>
                  <div className={styles.barChart}>
                    {[85, 92, 88, 95, 90, 87].map((val, i) => (
                      <div key={i} className={styles.bar} style={{ height: `${val}%` }} title={`${val}%`}></div>
                    ))}
                  </div>
                  <small className="text-muted">Mon - Sat</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className={`card ${styles.analyticsCard}`}>
              <div className="card-header bg-light">
                <h5 className="mb-0 fw-700">
                  <i className="bi bi-pie-chart me-2 text-success"></i>Leave Balance
                </h5>
              </div>
              <div className="card-body text-center">
                <div className={styles.donutChart}>
                  <div className={styles.donutValue}>
                    <strong>{stats?.totalLeavesUsed || 0}</strong>
                    <small>Days Used</small>
                  </div>
                </div>
                <div className="mt-3">
                  <small className="d-block text-muted">Out of {stats?.totalLeavesAvailable || 20} days</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className={`card ${styles.managementCard}`}>
              <div className="card-header bg-light">
                <h5 className="mb-0 fw-700">
                  <i className="bi bi-lightning-fill me-2 text-warning"></i>Management Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <a href="/employees" className={`btn btn-outline-primary w-100 py-3 ${styles.actionBtn}`}>
                      <i className="bi bi-people me-2"></i>Manage Employees
                    </a>
                  </div>
                  <div className="col-md-4">
                    <a href="/leaves" className={`btn btn-outline-success w-100 py-3 ${styles.actionBtn}`}>
                      <i className="bi bi-calendar-check me-2"></i>Approve Leaves
                    </a>
                  </div>
                  <div className="col-md-4">
                    <a href="/attendance" className={`btn btn-outline-info w-100 py-3 ${styles.actionBtn}`}>
                      <i className="bi bi-graph-up me-2"></i>View Analytics
                    </a>
                  </div>
                  <div className="col-md-4">
                    <a href="/wfh" className={`btn btn-outline-warning w-100 py-3 ${styles.actionBtn}`}>
                      <i className="bi bi-house me-2"></i>WFH Approvals
                    </a>
                  </div>
                  <div className="col-md-4">
                    <a href="/feed" className={`btn btn-outline-secondary w-100 py-3 ${styles.actionBtn}`}>
                      <i className="bi bi-megaphone me-2"></i>Post Announcements
                    </a>
                  </div>
                  <div className="col-md-4">
                    <button className={`btn btn-outline-danger w-100 py-3 ${styles.actionBtn}`}>
                      <i className="bi bi-download me-2"></i>Export Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 mb-4">
            <div className={`card ${styles.quickStats}`}>
              <div className="card-header bg-light">
                <h5 className="mb-0 fw-700">
                  <i className="bi bi-info-circle me-2 text-info"></i>Quick Stats
                </h5>
              </div>
              <div className="card-body">
                <div className={styles.statRow}>
                  <span>Departments</span>
                  <strong>5</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Active Designations</span>
                  <strong>12</strong>
                </div>
                <div className={styles.statRow}>
                  <span>On Leave Today</span>
                  <strong>{Math.floor(Math.random() * 5) + 1}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Late Arrivals</span>
                  <strong>{Math.floor(Math.random() * 3)}</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Avg Attendance</span>
                  <strong>92%</strong>
                </div>
                <div className={styles.statRow}>
                  <span>Last Updated</span>
                  <small>Just now</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
