import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../style/ManageEmployees.module.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useForm } from "react-hook-form";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  /* ===============================
     Fetch Employees & Departments
  =============================== */
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/manage/employees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEmployees(res.data || []);
    } catch {
      // silently fail
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const activeDepts = res.data.filter(
        (d) => d.status.toLowerCase() === "active"
      );
      setDepartments(activeDepts);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  /* ===============================
     Toggle Status
  =============================== */
  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      const res = await axios.patch(
        `${API_URL}/manage/employees/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert(res.data.message);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Open Add/Edit Employee Modal
  =============================== */
  const openAddEmployee = () => {
    setIsEditing(false);
    setSelectedEmp(null);
    reset({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "employee",
      department: "",
      designation: "",
      reporting_manager_id: "",
      reporting_manager_name: "",
    });
    new bootstrap.Offcanvas("#employeeModal").show();
  };

  const openEditEmployee = (emp) => {
    setIsEditing(true);
    setSelectedEmp(emp);
    reset({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || "",
      role: emp.role,
      department: emp.department || "",
      designation: emp.designation || "",
      reporting_manager_id: emp.reporting_manager_id || "",
      reporting_manager_name: emp.reporting_manager_name || "",
    });
    new bootstrap.Offcanvas("#employeeModal").show();
  };

  /* ===============================
     Submit Form
  =============================== */
  const onSubmit = async (data) => {
    try {
      if (isEditing && selectedEmp && Number(data.reporting_manager_id) === selectedEmp.id) {
        alert("An employee cannot report to themselves.");
        return;
      }

      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

      if (isEditing && selectedEmp) {
        await axios.put(`${API_URL}/manage/employees/${selectedEmp.id}`, data, { headers });
        alert("Employee updated successfully");
      } else {
        await axios.post(`${API_URL}/manage/employees`, data, { headers });
        alert("Employee added successfully");
      }

      bootstrap.Offcanvas.getInstance(document.getElementById("employeeModal")).hide();
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving employee");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     Filtered Employees
  =============================== */
  const filteredEmployees = employees.filter((e) =>
    !filter ? true : e.status.toLowerCase() === filter.toLowerCase()
  );

  /* ===============================
     Render
  =============================== */
  return (
    <>
      <Navbar />
      <Sidebar />

      <main>
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h4>Manage Employees</h4>
              <div className={styles.filters}>
                <select
                  className={styles.filterSelect}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={openAddEmployee}
                >
                  + Add Employee
                </button>
                <span>Total: {filteredEmployees.length}</span>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp, idx) => (
                    <tr key={emp.id}>
                      <td>{idx + 1}</td>
                      <td>{emp.id}</td>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.phone || "—"}</td>
                      <td>{emp.role}</td>
                      <td>{emp.department || "—"}</td>
                      <td>{emp.designation || "—"}</td>
                      <td>{emp.reporting_manager_name || "—"}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            emp.status === "active"
                              ? styles.active
                              : styles.inactive
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className={`${styles.toggleBtn} ${
                              emp.status === "active"
                                ? styles.deactivate
                                : styles.activate
                            }`}
                            disabled={loading}
                            onClick={() => handleToggleStatus(emp.id)}
                          >
                            {emp.status === "active" ? "Inactive" : "Active"}
                          </button>

                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openEditEmployee(emp)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className={styles.empty}>
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ===== Offcanvas Form ===== */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="employeeModal"
        aria-labelledby="employeeModalLabel"
      >
        <div className="offcanvas-header bg-light border-bottom">
          <h5 id="employeeModalLabel" className="mb-0 fw-semibold">
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Name</label>
              <input
                type="text"
                className="form-control f_13 shadow-none"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <div className="text-danger small">{errors.name.message}</div>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Email</label>
              <input
                type="email"
                className="form-control f_13 shadow-none"
                {...register("email", { required: "Email is required" })}
                disabled={isEditing}
              />
              {errors.email && (
                <div className="text-danger small">{errors.email.message}</div>
              )}
            </div>

            {/* Password (Add only) */}
            {!isEditing && (
              <div className="mb-3">
                <label className="form-label fw-semibold f_13">Password</label>
                <input
                  type="password"
                  className="form-control f_13 shadow-none"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <div className="text-danger small">
                    {errors.password.message}
                  </div>
                )}
              </div>
            )}

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Phone</label>
              <input
                type="text"
                className="form-control f_13 shadow-none"
                {...register("phone")}
              />
            </div>

            {/* Role */}
            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Role</label>
              <select
                className="form-select f_13 shadow-none"
                {...register("role")}
              >
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
              </select>
            </div>

            {/* Department */}
            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Department</label>
              <select
                className="form-select f_13 shadow-none"
                {...register("department", { required: "Department is required" })}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <div className="text-danger small">
                  {errors.department.message}
                </div>
              )}
            </div>

            {/* Designation */}
            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Designation</label>
              <input
                type="text"
                className="form-control f_13 shadow-none"
                {...register("designation")}
              />
            </div>

            {/* Reporting Manager */}
            <div className="mb-4">
              <label className="form-label fw-semibold f_13">
                Reporting Manager
              </label>
              <select
                className="form-select f_13 shadow-none"
                {...register("reporting_manager_id")}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const selected = employees.find((emp) => emp.id === selectedId);
                  setValue("reporting_manager_name", selected?.name || "");
                }}
              >
                <option value="">Select Manager</option>
                {employees
                  .filter(
                    (emp) =>
                      emp.status === "active" &&
                      (!isEditing || emp.id !== selectedEmp?.id)
                  )
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (ID: {emp.id})
                    </option>
                  ))}
              </select>
              <input type="hidden" {...register("reporting_manager_name")} />
            </div>

            {/* Submit */}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light f_13"
                data-bs-dismiss="offcanvas"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary f_13 fw-semibold"
              >
                {loading
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                  ? "Update"
                  : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
