import React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import styles from "./Employees.module.css"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function Employees() {
  const { token, user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setEmployees(data)
    } catch (error) {
      toast.error("Failed to load employees")
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (editingId) {
        const response = await fetch(`${API_URL}/employees/${editingId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Update failed")
        toast.success("Employee updated")
      } else {
        const response = await fetch(`${API_URL}/employees`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error("Add failed")
        toast.success("Employee added")
      }
      setShowModal(false)
      setEditingId(null)
      reset()
      fetchEmployees()
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const deleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`${API_URL}/employees/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Delete failed")
        toast.success("Employee deleted")
        fetchEmployees()
      } catch (error) {
        toast.error(error.message)
      }
    }
  }

  const canManage = user?.role === "admin" || user?.role === "hr"
  const filteredEmployees = employees.filter((e) => e.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className={styles.employeesContainer}>
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <i className="bi bi-people me-2"></i>Employee Management
            </h1>
            <p className={styles.subtitle}>Manage all employees in your organization</p>
          </div>
          {canManage && (
            <button
              onClick={() => {
                setShowModal(true)
                setEditingId(null)
                reset()
              }}
              className={`btn btn-primary ${styles.addBtn}`}
            >
              <i className="bi bi-plus-lg me-2"></i>Add Employee
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className={`card ${styles.searchCard}`}>
          <div className="card-body py-3">
            <div className="input-group">
              <span className="input-group-text bg-light">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search employees by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={`card ${styles.tableCard}`}>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className={styles.tableHead}>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Date of Joining</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className={styles.tableRow}>
                    <td>
                      <strong>{emp.name}</strong>
                    </td>
                    <td>{emp.email}</td>
                    <td>
                      <span className={styles.badge}>{emp.department}</span>
                    </td>
                    <td>{emp.doj}</td>
                    {canManage && (
                      <td>
                        <button
                          onClick={() => {
                            setEditingId(emp.id)
                            setShowModal(true)
                          }}
                          className={`btn btn-sm btn-warning me-2 ${styles.actionBtn}`}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className={`btn btn-sm btn-danger ${styles.actionBtn}`}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
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
                <i className={`bi ${editingId ? "bi-pencil" : "bi-plus-lg"} me-2`}></i>
                {editingId ? "Edit Employee" : "Add New Employee"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label className="form-label fw-600">Full Name</label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className="form-control"
                    placeholder="Enter full name"
                  />
                  {errors.name && <div className="text-danger small mt-1">{errors.name.message}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="form-control"
                    placeholder="Enter email address"
                  />
                  {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
                </div>

                {!editingId && (
                  <div className="mb-4">
                    <label className="form-label fw-600">Password</label>
                    <input
                      type="password"
                      {...register("password", { required: !editingId && "Password is required" })}
                      className="form-control"
                      placeholder="Enter password"
                    />
                    {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label fw-600">Department</label>
                  <select {...register("department")} className="form-select">
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-600">Date of Birth</label>
                    <input type="date" {...register("dob")} className="form-control" />
                  </div>
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-600">Date of Joining</label>
                    <input type="date" {...register("doj")} className="form-control" />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingId(null)
                    }}
                    className="btn btn-secondary flex-grow-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary flex-grow-1">
                    {loading ? "Saving..." : "Save"}
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
