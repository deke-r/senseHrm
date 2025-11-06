"use client"

import React from "react"
import { useState } from "react"
import styles from "../style/EmployeeLeave.module.css"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

export default function LeavePage() {
    const [activeTab, setActiveTab] = useState("attendancelog")

    const leaveHistoryData = [
        {
            date: "18 Aug 2025 0.5 Day",
            type: "Unpaid Leave Requested on 21 Aug 2025",
            status: "Approved",
            statusBy: "by Attendance Penalisation Policy",
            requestedBy: "Penalisation Policy",
            actionOn: "21 Aug 2025",
            note: "Leave deducted as effective hours on 18-08-...",
            reason: "",
        },
        {
            date: "12 Aug 2025 0.5 Day",
            type: "Unpaid Leave Requested on 15 Aug 2025",
            status: "Approved",
            statusBy: "by Attendance Penalisation Policy",
            requestedBy: "Penalisation Policy",
            actionOn: "15 Aug 2025",
            note: "Leave deducted as effective hours on 12-08-...",
            reason: "",
        },
        {
            date: "11 Aug 2025 0.5 Day",
            type: "Unpaid Leave Requested on 14 Aug 2025",
            status: "Approved",
            statusBy: "by Attendance Penalisation Policy",
            requestedBy: "Penalisation Policy",
            actionOn: "14 Aug 2025",
            note: "Leave deducted as effective hours on 11-08-...",
            reason: "",
        },
        {
            date: "08 Aug 2025 (Second half) 0.5 Day",
            type: "Sick Leave Requested on 08 Aug 2025",
            status: "Approved",
            statusBy: "by A K SRIVASTAYA",
            requestedBy: "BHAVISHYA",
            actionOn: "12 Aug 2025",
            note: "I have a train in the 2nd half, so I need a half-day...",
            reason: "",
        },
        {
            date: "08 Aug 2025 0.5 Day",
            type: "Unpaid Leave Requested on 08 Aug 2025",
            status: "Approved",
            statusBy: "by Attendance Penalisation Policy",
            requestedBy: "Penalisation Policy",
            actionOn: "11 Aug 2025",
            note: "Leave deducted as effective hours on 08-08-...",
            reason: "",
        },
    ]

    return (

        <>

            <Navbar />
            <Sidebar />
            <main>

                <div className={styles.page}>
                    {/* Top Navigation Tabs */}
                    {/* <div className={styles.topNav}>
        {["ATTENDANCE", "TIMESHEET", "LEAVE", "PERFORMANCE", "EXPENSES & TRAVEL", "APPS"].map((item) => (
          <button key={item} className={`${styles.navTab} ${item === "LEAVE" ? styles.active : ""}`}>
            {item}
          </button>
        ))}
      </div> */}

                    {/* Main Content */}
                    <div className={styles.mainContent}>
                        {/* Summary Section */}
                        <div className={styles.summarySection}>
                            <div className={styles.summaryTab}>Summary</div>

                            {/* Pending Leave Requests */}
                            <div className={styles.card}>
                                <div className={styles.pendingHeader}>
                                    <h6 className={styles.sectionTitle}>Pending leave requests</h6>
                                    <div className={styles.dateRangeSelector}>
                                        <input type="text" placeholder="Jan 2025 - Dec 2025" className={styles.dateRangeInput} readOnly />
                                    </div>
                                </div>

                                <div className={styles.pendingContent}>
                                    <div className={styles.emptyIcon}>✨</div>
                                    <h5 className={styles.emptyTitle}>Hurray! No pending leave requests</h5>
                                    <p className={styles.emptyText}>Request leave on the right!</p>

                                    <div className={styles.actionButtons}>
                                        <button className={styles.primaryBtn}>Request Leave</button>
                                        <button className={styles.secondaryBtn}>Leave Policy Explanation</button>
                                    </div>
                                </div>
                            </div>

                            {/* My Leave Stats */}
                            <h6 className={styles.sectionTitle}>My Leave Stats</h6>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <h6 className={styles.statTitle}>Weekly Pattern</h6>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                        </svg>
                                    </div>
                                    <div className={styles.weeklyPattern}>
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                            <div key={day} className={styles.dayPattern}>
                                                <span>{day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <h6 className={styles.statTitle}>Consumed Leave Types</h6>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                        </svg>
                                    </div>
                                    <div className={styles.noDataMessage}>No data to display.</div>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <h6 className={styles.statTitle}>Monthly Stats</h6>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                        </svg>
                                    </div>
                                    <div className={styles.monthlyStats}>
                                        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                                            <span key={month}>{month}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Leave Balances */}
                            <h6 className={styles.sectionTitle} style={{ marginTop: "28px" }}>
                                Leave Balances
                            </h6>
                            <div className={styles.leaveBalancesGrid}>
                                {/* Casual Leave Card */}
                                <div className={styles.balanceCard}>
                                    <div className={styles.balanceCircle}>
                                        <svg width="120" height="120" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="50" fill="none" stroke="#ddd" strokeWidth="8" />
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
                                            <text x="60" y="65" textAnchor="middle" fontSize="16" fontWeight="600" fill="#333">
                                                6 Days
                                            </text>
                                            <text x="60" y="80" textAnchor="middle" fontSize="12" fill="#666">
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

                                {/* Sick Leave Card */}
                                <div className={styles.balanceCard}>
                                    <div className={styles.balanceCircle}>
                                        <svg width="120" height="120" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="50" fill="none" stroke="#ddd" strokeWidth="8" />
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
                                            <text x="60" y="65" textAnchor="middle" fontSize="16" fontWeight="600" fill="#333">
                                                7.5 Days
                                            </text>
                                            <text x="60" y="80" textAnchor="middle" fontSize="12" fill="#666">
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

                            {/* Leave History */}
                            <h6 className={styles.sectionTitle} style={{ marginTop: "32px" }}>
                                Leave History
                            </h6>
                            <div className={styles.card}>
                                <div className={styles.filterRow}>
                                    <select className={styles.filterSelect}>
                                        <option>Leave Type</option>
                                    </select>
                                    <select className={styles.filterSelect}>
                                        <option>Status</option>
                                    </select>
                                    <input type="text" placeholder="Search" className={styles.searchInput} />
                                    <span className={styles.totalCount}>Total: 30</span>
                                </div>

                                {/* Leave History Table */}
                                <table className={styles.leaveTable}>
                                    <thead>
                                        <tr>
                                            <th>LEAVE DATES</th>
                                            <th>LEAVE TYPE</th>
                                            <th>STATUS</th>
                                            <th>REQUESTED BY</th>
                                            <th>ACTION TAKEN ON</th>
                                            <th>LEAVE NOTE</th>
                                            <th>REJECT/CANCELLATION REASON</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaveHistoryData.map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{row.date}</td>
                                                <td>{row.type}</td>
                                                <td>
                                                    <div className={styles.statusBadge}>
                                                        <span className={styles.statusLabel}>{row.status}</span>
                                                        <br />
                                                        <span className={styles.statusBy}>{row.statusBy}</span>
                                                    </div>
                                                </td>
                                                <td>{row.requestedBy}</td>
                                                <td>{row.actionOn}</td>
                                                <td className={styles.noteCell}>{row.note}</td>
                                                <td>{row.reason}</td>
                                                <td className={styles.actionsCell}>•••</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>


            </main>

        </>

    )
}
