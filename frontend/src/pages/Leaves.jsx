"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import styles from "./Leaves.module.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function Leaves() {
  const { token, user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setLeaves(data)
    } catch (error) {
      toast.error("Failed to load leaves")
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/leaves`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Submit failed")
      toast.success("Leave request submitted")
      setShowModal(false)
      reset()
      fetchLeaves()
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      const response = await fetch(`${API_URL}/leaves/${leaveId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Update failed")
      toast.success(`Leave ${status}`)
      fetchLeaves()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const canApprove = user?.role === "admin" || user?.role === "hr"
  const displayLeaves = user?.role === "employee" ? leaves.filter((l) => l.user_id === user.id) : leaves

  return (
    <div className={styles.leavesContainer}>
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <i className="bi bi-calendar-check me-2"></i>Leave Management
            </h1>
            <p className={styles.subtitle}>Manage and track your leaves</p>
          </div>
          {user?.role === "employee" && (
            <button onClick={() => setShowModal(true)} className={`btn btn-success ${styles.addBtn}`}>
              <i className="bi bi-plus-lg me-2"></i>Apply Leave
            </button>
          )}
        </div>

        {/* Table */}
        <div className={`card ${styles.tableCard}`}>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className={styles.tableHead}>
                <tr>
                  <th>Employee</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {canApprove && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayLeaves.map((leave) => (
                  <tr key={leave.id} className={styles.tableRow}>
                    <td>
                      <span className={styles.employeeName}>Employee #{leave.user_id}</span>
                    </td>
                    <td>{leave.from_date}</td>
                    <td>{leave.to_date}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <span className={`badge ${styles[`status-${leave.status}`]}`}>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      </span>
                    </td>
                    {canApprove && leave.status === "pending" && (
                      <td>
                        <button
                          onClick={() => updateLeaveStatus(leave.id, "approved")}
                          className={`btn btn-sm btn-success me-2 ${styles.actionBtn}`}
                          title="Approve"
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <button
                          onClick={() => updateLeaveStatus(leave.id, "rejected")}
                          className={`btn btn-sm btn-danger ${styles.actionBtn}`}
                          title="Reject"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modal}>
          <div className={`card ${styles.modalContent}`}>
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-calendar-plus me-2"></i>Apply for Leave
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label className="form-label fw-600">From Date</label>
                  <input
                    type="date"
                    {...register("from_date", { required: "From date is required" })}
                    className="form-control"
                  />
                  {errors.from_date && <div className="text-danger small mt-1">{errors.from_date.message}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600">To Date</label>
                  <input
                    type="date"
                    {...register("to_date", { required: "To date is required" })}
                    className="form-control"
                  />
                  {errors.to_date && <div className="text-danger small mt-1">{errors.to_date.message}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600">Reason</label>
                  <textarea
                    {...register("reason", { required: "Reason is required" })}
                    className="form-control"
                    rows="3"
                    placeholder="Enter reason for leave"
                  ></textarea>
                  {errors.reason && <div className="text-danger small mt-1">{errors.reason.message}</div>}
                </div>

                <div className="d-flex gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-grow-1">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-success flex-grow-1">
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
