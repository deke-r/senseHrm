"use client";
import React from "react";
import styles from "../style/EmployeeLeave.module.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AttendanceActions from "../components/AttendanceActions";
import LeaveHistoryTable from "../components/LeaveHistoryTable"; // ✅ New standalone component
import PendingRequestsSection from "../components/PendingRequestsSection";

export default function LeavePage() {
  return (
    <>
      <Navbar />
      <Sidebar />

      <main>
        <div className={styles.page}>
          <div className={styles.mainContent}>
            {/* ===================== SUMMARY SECTION ===================== */}
            <div className={styles.summarySection}>
              <div className={styles.summaryTab}>Summary</div>

              <div className={styles.twoColumnRow}>
                {/* ====== Left: Pending Leave Requests ====== */}
                {/* <div className={`${styles.card} ${styles.leftColumn}`}>
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
                    <div className={styles.emptyIcon}>✨</div>
                    <h5 className={styles.emptyTitle}>
                      Hurray! No pending leave requests
                    </h5>
                    <p className={styles.emptyText}>
                      Request leave on the right!
                    </p>

                    <div className={styles.actionButtons}>
                      <button className={styles.secondaryBtn}>
                        Leave Policy Explanation
                      </button>
                    </div>
                  </div>
                </div> */}

                {/* ====== Left: Pending Leave Requests ====== */}
<PendingRequestsSection />


                {/* ====== Right: Leave / WFH / Partial Request Actions ====== */}
                <div className={`${styles.rightColumn}`}>
                  <AttendanceActions />
                </div>
              </div>

              {/* ===================== LEAVE STATS ===================== */}
              <h6 className={styles.sectionTitle}>My Leave Stats</h6>
              <div className={styles.statsGrid}>
                {/* Weekly Pattern */}
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <h6 className={styles.statTitle}>Weekly Pattern</h6>
                    <i className="bi bi-info-circle"></i>
                  </div>
                  <div className={styles.weeklyPattern}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div key={day} className={styles.dayPattern}>
                          <span>{day}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Consumed Leave */}
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <h6 className={styles.statTitle}>Consumed Leave Types</h6>
                    <i className="bi bi-info-circle"></i>
                  </div>
                  <div className={styles.noDataMessage}>No data to display.</div>
                </div>

                {/* Monthly Stats */}
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <h6 className={styles.statTitle}>Monthly Stats</h6>
                    <i className="bi bi-info-circle"></i>
                  </div>
                  <div className={styles.monthlyStats}>
                    {[
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===================== LEAVE BALANCES ===================== */}
              <h6 className={styles.sectionTitle} style={{ marginTop: "28px" }}>
                Leave Balances
              </h6>

              <div className={styles.leaveBalancesGrid}>
                {/* Casual Leave */}
                <div className={styles.balanceCard}>
                  <div className={styles.balanceCircle}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#ddd"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#8b7ab8"
                        strokeWidth="8"
                        strokeDasharray="175 314"
                        transform="rotate(-90 60 60)"
                      />
                      <text
                        x="60"
                        y="65"
                        textAnchor="middle"
                        fontSize="16"
                        fontWeight="600"
                        fill="#333"
                      >
                        6 Days
                      </text>
                      <text
                        x="60"
                        y="80"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#666"
                      >
                        Available
                      </text>
                    </svg>
                  </div>

                  <div className={styles.balanceDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>AVAILABLE</span>
                      <span className={styles.detailValue}>6 days</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>CONSUMED</span>
                      <span className={styles.detailValue}>0 day</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ACCRUED SO FAR</span>
                      <span className={styles.detailValue}>5 days</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>CARRYOVER</span>
                      <span className={styles.detailValue}>1 day</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ANNUAL QUOTA</span>
                      <span className={styles.detailValue}>9 days</span>
                    </div>
                  </div>
                </div>

                {/* Sick Leave */}
                <div className={styles.balanceCard}>
                  <div className={styles.balanceCircle}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#ddd"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#e9999a"
                        strokeWidth="8"
                        strokeDasharray="197 314"
                        transform="rotate(-90 60 60)"
                      />
                      <text
                        x="60"
                        y="65"
                        textAnchor="middle"
                        fontSize="16"
                        fontWeight="600"
                        fill="#333"
                      >
                        7.5 Days
                      </text>
                      <text
                        x="60"
                        y="80"
                        textAnchor="middle"
                        fontSize="12"
                        fill="#666"
                      >
                        Available
                      </text>
                    </svg>
                  </div>

                  <div className={styles.balanceDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>AVAILABLE</span>
                      <span className={styles.detailValue}>7.5 days</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>CONSUMED</span>
                      <span className={styles.detailValue}>0 day</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ACCRUED SO FAR</span>
                      <span className={styles.detailValue}>6.25 days</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>CARRYOVER</span>
                      <span className={styles.detailValue}>1.25 days</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>ANNUAL QUOTA</span>
                      <span className={styles.detailValue}>11.25 days</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className={styles.otherLeaveTypes}>
                <strong>Other Leave Types Available :</strong> Optional Leave
              </p>

              {/* ===================== LEAVE HISTORY ===================== */}
              <h6 className={styles.sectionTitle} style={{ marginTop: "32px" }}>
                Leave History
              </h6>

              {/* ✅ The standalone Leave History Component */}
              <LeaveHistoryTable />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
