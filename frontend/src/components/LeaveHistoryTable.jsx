"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../style/EmployeeLeave.module.css";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function LeaveHistoryTable() {
  const [leaveHistoryData, setLeaveHistoryData] = useState([]);
  const [filters, setFilters] = useState({ type: "", status: "", search: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelRow, setCancelRow] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  // ✅ Fetch Leave History
  const fetchLeaveHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/leave/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeaveHistoryData(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching leave history:", err);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  // ✅ Filter Logic
  const filteredData = leaveHistoryData.filter((row) => {
    const matchType =
      !filters.type ||
      row.category.toLowerCase() === filters.type.toLowerCase();
    const matchStatus =
      !filters.status ||
      row.status.toLowerCase() === filters.status.toLowerCase();
    const matchSearch =
      !filters.search ||
      row.note?.toLowerCase().includes(filters.search.toLowerCase()) ||
      row.type?.toLowerCase().includes(filters.search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentPageData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ✅ Helpers
  const capitalize = (txt) =>
    txt ? txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase() : "-";

  const openCancelModal = (row) => {
    setCancelRow(row);
    setCancelReason("");
    const modal = new bootstrap.Offcanvas("#cancelOffcanvas");
    modal.show();
  };

  // ✅ Cancel Request API
  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return alert("Please enter a reason.");

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/leave/cancel`,
        {
          id: cancelRow.id,
          type: cancelRow.category,
          reason: cancelReason.trim(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      alert(res.data.message || "Request cancelled successfully.");
      bootstrap.Offcanvas.getInstance(
        document.getElementById("cancelOffcanvas")
      ).hide();
      fetchLeaveHistory();
    } catch (err) {
      console.error("❌ Cancel error:", err);
      alert(err.response?.data?.message || "Error cancelling request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.card}>
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
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <span className={styles.totalCount}>
            Total: {filteredData.length}
          </span>
        </div>

        {/* ===== Table ===== */}
        <table className={styles.leaveTable}>
          <thead>
            <tr>
              <th>LEAVE DATES</th>
              <th>TYPE</th>
              <th>STATUS</th>
              <th>REQUESTED BY</th>
              <th>ACTION TAKEN ON</th>
              <th>LEAVE NOTE</th>
              <th>REJECT/CANCELLATION REASON</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {currentPageData.length > 0 ? (
              currentPageData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>{row.type}</td>
                  <td>
                    <div className={styles.statusBadge}>
                      <span
                        className={`${styles.statusLabel} ${
                          row.status === "approved"
                            ? styles.approved
                            : row.status === "rejected"
                            ? styles.rejected
                            : row.status === "cancelled"
                            ? styles.cancelled
                            : styles.pending
                        }`}
                      >
                        {capitalize(row.status)}
                      </span>
                      <br />
                      <span className={styles.statusBy}>{row.category}</span>
                    </div>
                  </td>
                  <td>{row.requestedBy}</td>
                  <td>{new Date(row.actionOn).toLocaleDateString("en-GB")}</td>
                  <td className={styles.noteCell}>{row.note}</td>
                  <td>{row.reason || "-"}</td>
                  <td className={styles.actionsCell}>
                    {row.status === "pending" ? (
                      <span
                        onClick={() => openCancelModal(row)}
                        className={styles.cancelDots}
                        title="Cancel Request"
                      >
                        •••
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>
                  No records found
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

      {/* ===== Cancel Offcanvas ===== */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="cancelOffcanvas"
        aria-labelledby="cancelOffcanvasLabel"
      >
        <div className="offcanvas-header bg-danger text-white">
          <h5 id="cancelOffcanvasLabel" className="mb-0 f_14 fw-semibold">
            Cancel Request
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
          ></button>
        </div>

        <div className="offcanvas-body">
          {cancelRow ? (
            <>
              <p className="fw-semibold mb-2 f_13">
                <i className="bi bi-info-circle me-1"></i>
                You are cancelling a <b>{cancelRow.category}</b> request for:
              </p>
              <div className="border rounded f_13 p-2 mb-3 bg-light">
                <div>
                  <strong>Type:</strong> {cancelRow.type}
                </div>
                <div>
                  <strong>Date:</strong> {cancelRow.date}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  {capitalize(cancelRow.status || "pending")}
                </div>
              </div>

              <form onSubmit={handleCancel}>
                <label className="form-label f_13">Reason for Cancellation</label>
                <textarea
                  className="form-control f_13 fw-semibold mb-3 shadow-none"
                  rows="4"
                  placeholder="Enter your reason..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                ></textarea>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light f_13"
                    data-bs-dismiss="offcanvas"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger f_13 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p>No request selected.</p>
          )}
        </div>
      </div>
    </>
  );
}
