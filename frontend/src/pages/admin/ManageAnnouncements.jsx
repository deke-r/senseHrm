import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import styles from "../../style/ManageEmployees.module.css"; // reuse same

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openAdd = () => {
    setIsEditing(false);
    setSelected(null);
    reset({ title: "", description: "", valid_from: "", valid_to: "" });
    new bootstrap.Offcanvas("#announcementModal").show();
  };

  const openEdit = (item) => {
    setIsEditing(true);
    setSelected(item);
    reset({
      title: item.title,
      description: item.description,
      valid_from: item.valid_from?.split("T")[0],
      valid_to: item.valid_to?.split("T")[0],
    });
    new bootstrap.Offcanvas("#announcementModal").show();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      if (isEditing && selected) {
        await axios.put(`${API_URL}/announcements/${selected.id}`, data, { headers });
        alert("Announcement updated successfully");
      } else {
        await axios.post(`${API_URL}/announcements/anc`, data, { headers });
        alert("Announcement added successfully");
      }
      bootstrap.Offcanvas.getInstance(document.getElementById("announcementModal")).hide();
      fetchAnnouncements();
    } catch {
      alert("Error saving announcement");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    setLoading(true);
    try {
      const res = await axios.patch(`${API_URL}/announcements/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert(res.data.message);
      fetchAnnouncements();
    } catch {
      alert("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <main>
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h4>Manage Announcements</h4>
              <div className={styles.filters}>
                <button className="btn btn-success btn-sm" onClick={openAdd}>
                  + Add Announcement
                </button>
                <span>Total: {announcements.length}</span>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Valid From</th>
                  <th>Valid To</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {announcements.length > 0 ? (
                  announcements.map((a, idx) => (
                    <tr key={a.id}>
                      <td>{idx + 1}</td>
                      <td>{a.title}</td>
                      <td>{a.description || "—"}</td>
                      <td>{new Date(a.valid_from).toLocaleDateString()}</td>
                      <td>{new Date(a.valid_to).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            a.status === "active" ? styles.active : styles.inactive
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className={`${styles.toggleBtn} ${
                              a.status === "active"
                                ? styles.deactivate
                                : styles.activate
                            }`}
                            onClick={() => toggleStatus(a.id)}
                            disabled={loading}
                          >
                            {a.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => openEdit(a)}
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
                    <td colSpan="7" className={styles.empty}>
                      No announcements found
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
        id="announcementModal"
        aria-labelledby="announcementModalLabel"
      >
        <div className="offcanvas-header bg-light border-bottom">
          <h5 id="announcementModalLabel" className="mb-0 fw-semibold">
            {isEditing ? "Edit Announcement" : "Add Announcement"}
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>

        <div className="offcanvas-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Title</label>
              <input
                type="text"
                className="form-control rounded-1 shadow-none f_13"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-danger small">{errors.title.message}</p>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold f_13">Description</label>
              <textarea
                rows="3"
                className="form-control rounded-1 shadow-none f_13"
                {...register("description")}
              ></textarea>
            </div>

            <div className="row">
              <div className="col-6 mb-3">
                <label className="form-label fw-semibold f_13">Valid From</label>
                <input
                  type="date"
                  className="form-control shadow-none rounded-1 f_13"
                  {...register("valid_from", { required: "Start date is required" })}
                />
                {errors.valid_from && (
                  <p className="text-danger small">{errors.valid_from.message}</p>
                )}
              </div>

              <div className="col-6 mb-4">
                <label className="form-label fw-semibold f_13">Valid To</label>
                <input
                  type="date"
                  className="form-control shadow-none rounded-1 f_13"
                  {...register("valid_to", { required: "End date is required" })}
                />
                {errors.valid_to && (
                  <p className="text-danger small">{errors.valid_to.message}</p>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light f_13" data-bs-dismiss="offcanvas">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary f_13 fw-semibold"
              >
                {loading ? (isEditing ? "Updating..." : "Adding...") : isEditing ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
