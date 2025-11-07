"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../style/EmployeeLeave.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PendingRequestsSection() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch from existing /history endpoint
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(`${API_URL}/leave/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const pending = (res.data || []).filter(
          (r) => r.status?.toLowerCase() === "pending"
        );
        setPendingRequests(pending);
      } catch (err) {
        console.error("❌ Error fetching pending requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const pendingCount = pendingRequests.length;

  return (
    <div className={`${styles.card} ${styles.leftColumn}`}>
      <div className={styles.pendingHeader}>
        <h6 className={`${styles.sectionTitle} fw-semibold`}>
          Pending leave requests
        </h6>
        <div className={styles.dateRangeSelector}>
          <input
            type="text"
            placeholder="Jan 2025 - Dec 2025"
            className={styles.dateRangeInput}
            readOnly
          />
        </div>
      </div>

      <div className={styles.pendingContent}>
        {loading ? (
          <div className={styles.emptyIcon}>⏳</div>
        ) : pendingCount > 0 ? (
          <>
            <div className={styles.emptyIcon}>😔</div>
            <h5 className={styles.emptyTitle}>
              {pendingCount} Pending Leave
              {pendingCount > 1 ? " Requests" : " Request"}
            </h5>
            <p className={styles.emptyText}>
              Your request{pendingCount > 1 ? "s are" : " is"} under review.
            </p>

            {/* ✅ Show preview of top 2 pending requests */}
            <div className={styles.pendingList}>
              {pendingRequests.slice(0, 2).map((req, idx) => (
                <div key={idx} className={styles.pendingItem}>
                  <div>
                    <strong>{req.category}</strong> — {req.type}
                  </div>
                  <div className={styles.pendingDate}>{req.date}</div>
                </div>
              ))}
              {pendingCount > 2 && (
                <p className={styles.moreText}>
                  +{pendingCount - 2} more pending...
                </p>
              )}
            </div>

          
          </>
        ) : (
          <>
            <div className={styles.emptyIcon}>✨</div>
            <h5 className={styles.emptyTitle}>
              Hurray! No pending leave requests
            </h5>
            <p className={styles.emptyText}>Request leave on the right!</p>
            <div className={styles.actionButtons}>
              <button className={styles.secondaryBtn}>
                Leave Policy Explanation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
