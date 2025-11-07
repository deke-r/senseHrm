"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import styles from "../../style/ManageRequests.module.css";
import { useForm } from "react-hook-form";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({ type: "", status: "", search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/manage/requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredData = requests.filter((r) => {
    const matchType =
      !filters.type || r.category.toLowerCase() === filters.type.toLowerCase();
    const matchStatus =
      !filters.status ||
      r.status.toLowerCase() === filters.status.toLowerCase();
    const matchSearch =
      !filters.search ||
      r.employee_name.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.type.toLowerCase().includes(filters.search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentPageData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openActionModal = (row) => {
    setSelected(row);
    setAction("");
    reset({ reason: "" });
    const modal = new bootstrap.Offcanvas("#actionModal");
    modal.show();
  };

  const handleSubmitAction = async (data) => {
    if (!selected || !action) return alert("Please select an action.");
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/manage/update-status`,
        {
          id: selected.id,
          type: selected.category,
          status: action,
          reason: data.reason || "",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert(res.data.message);
      bootstrap.Offcanvas.getInstance(
        document.getElementById("actionModal")
      ).hide();
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (txt) =>
    txt ? txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase() : "-";

  return (
    <>
      <Navbar />
      <Sidebar />
      <main>
        <div className={styles.page}>
          <div className={styles.mainContent}>
            <div className={styles.card}>
              <h5 className="fw-semibold mb-3">Manage Employee Requests</h5>

              {/* ===== Filters ===== */}
              <div className={styles.filterRow}>
                <select
                  className={styles.filterSelect}
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="Leave">Leave</option>
                  <option value="Work From Home">Work From Home</option>
                  <option value="Partial Day">Partial Day</option>
                </select>

                <select
                  className={styles.filterSelect}
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <input
                  type="text"
                  placeholder="Search by employee or type"
                  className={styles.searchInput}
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />

                <span className={styles.totalCount}>
                  Total: {filteredData.length}
                </span>
              </div>

              {/* ===== Table ===== */}
              <table className={styles.leaveTable}>
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>TYPE</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>NOTE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.length > 0 ? (
                    currentPageData.map((r) => (
                      <tr key={`${r.category}-${r.id}`}>
                        <td>{r.employee_name}</td>
                        <td>{r.type}</td>
                        <td>{r.date}</td>
                        <td>
                          <span
                            className={`${styles.statusLabel} ${
                              r.status === "approved"
                                ? styles.approved
                                : r.status === "pending"
                                ? styles.pending
                                : r.status === "rejected"
                                ? styles.rejected
                                : styles.cancelled
                            }`}
                          >
                            {capitalize(r.status)}
                          </span>
                        </td>
                        <td className={styles.noteCell}>{r.note || "—"}</td>
                        <td className={styles.actionsCell}>
                          {r.status === "pending" ? (
                            <span
                              onClick={() => openActionModal(r)}
                              className={styles.actionDots}
                              title="Review Request"
                            >
                              ⋯
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.emptyRow}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* ===== Pagination ===== */}
              {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹ Prev
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.pageBtn} ${
                        currentPage === i + 1 ? styles.pageActive : ""
                      }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next ›
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ===== Offcanvas ===== */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="actionModal"
        aria-labelledby="actionModalLabel"
      >
        <div className="offcanvas-header bg-light border-bottom">
          <h5 id="actionModalLabel" className="mb-0 fw-semibold">
            Review Request
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body">
          {selected ? (
            <form onSubmit={handleSubmit(handleSubmitAction)}>
              <div className="mb-3 f_13">
                <strong>Employee:</strong> {selected.employee_name}
                <br />
                <strong>Type:</strong> {selected.type}
                <br />
                <strong>Date:</strong> {selected.date}
                <br />
                <strong>Note:</strong> {selected.note || "—"}
              </div>

              <div className="mb-3">
                <label className="form-label f_13 fw-semibold">Action</label>
                <select
                  className="form-select f_13 shadow-none"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                >
                  <option value="">Select Action</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              {action === "rejected" && (
                <div className="mb-3">
                  <label className="form-label f_13 fw-semibold">Reason</label>
                  <textarea
                    className="form-control f_13 shadow-none"
                    rows="3"
                    placeholder="Enter rejection reason"
                    {...register("reason", {
                      required: "Reason is required for rejection",
                    })}
                  ></textarea>
                  {errors.reason && (
                    <div className="text-danger small mt-1">
                      {errors.reason.message}
                    </div>
                  )}
                </div>
              )}

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
                  className={`btn f_13 fw-semibold ${
                    action === "rejected" ? "btn-danger" : "btn-success"
                  }`}
                >
                  {loading
                    ? action === "rejected"
                      ? "Rejecting..."
                      : "Approving..."
                    : action === "rejected"
                    ? "Reject"
                    : "Approve"}
                </button>
              </div>
            </form>
          ) : (
            <p>No request selected.</p>
          )}
        </div>
      </div>
    </>
  );
}
