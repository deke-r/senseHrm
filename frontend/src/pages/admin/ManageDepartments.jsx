import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../style/ManageEmployees.module.css"; // reuse same design
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useForm } from "react-hook-form";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [filter, setFilter] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_URL}/departments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDepartments(res.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAdd = () => {
    setIsEditing(false);
    setSelectedDept(null);
    reset({ name: "", description: "" });
    new bootstrap.Offcanvas("#deptModal").show();
  };

  const openEdit = (dept) => {
    setIsEditing(true);
    setSelectedDept(dept);
    reset({ name: dept.name, description: dept.description || "" });
    new bootstrap.Offcanvas("#deptModal").show();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      if (isEditing && selectedDept) {
        await axios.put(`${API_URL}/departments/${selectedDept.id}`, data, { headers });
        alert("Department updated successfully");
      } else {
        await axios.post(`${API_URL}/departments`, data, { headers });
        alert("Department added successfully");
      }
      bootstrap.Offcanvas.getInstance(document.getElementById("deptModal")).hide();
      fetchDepartments();
    } catch (err) {
      alert("Error saving department");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    setLoading(true);
    try {
      const res = await axios.patch(`${API_URL}/departments/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert(res.data.message);
      fetchDepartments();
    } catch {
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepts = departments.filter((d) =>
    !filter ? true : d.status.toLowerCase() === filter.toLowerCase()
  );

  return (
    <>
      <Navbar />
      <Sidebar />

      <main>
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h4>Manage Departments</h4>
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
                <button className="btn btn-primary btn-sm" onClick={openAdd}>
                  + Add Department
                </button>
                <span>Total: {filteredDepts.length}</span>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>NAME</th>
                  <th>DESCRIPTION</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepts.length > 0 ? (
                  filteredDepts.map((dept, idx) => (
                    <tr key={dept.id}>
                      <td>{idx + 1}</td>
                      <td>{dept.name}</td>
                      <td>{dept.description || "—"}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            dept.status === "active"
                              ? styles.active
                              : styles.inactive
                          }`}
                        >
                          {dept.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className={`${styles.toggleBtn} ${
                              dept.status === "active"
                                ? styles.deactivate
                                : styles.activate
                            }`}
                            disabled={loading}
                            onClick={() => toggleStatus(dept.id)}
                          >
                            {dept.status === "active" ? "Inactive" : "Active"}
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openEdit(dept)}
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
                    <td colSpan="5" className={styles.empty}>
                      No departments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ===== Offcanvas ===== */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="deptModal"
        aria-labelledby="deptModalLabel"
      >
        <div className="offcanvas-header bg-light border-bottom">
          <h5 id="deptModalLabel" className="mb-0 fw-semibold">
            {isEditing ? "Edit Department" : "Add Department"}
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Name</label>
              <input
                type="text"
                className="form-control f_13 shadow-none"
                {...register("name", { required: "Department name is required" })}
              />
              {errors.name && (
                <div className="text-danger small">{errors.name.message}</div>
              )}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold f_13">Description</label>
              <textarea
                rows="3"
                className="form-control f_13 shadow-none"
                {...register("description")}
              ></textarea>
            </div>

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
