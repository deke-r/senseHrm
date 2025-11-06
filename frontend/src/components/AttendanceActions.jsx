"use client";
import React, { useEffect, useState } from "react";
import styles from "../style/EmployeeAttendance.module.css";

export default function AttendanceActions({ onOpenCanvas }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // ⏰ Live clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.card}>
      <h6 className={styles.cardTitle}>Actions</h6>

      {/* Clock */}
      <div className={styles.timeDisplay}>
        <h5 className={styles.currentTime}>
          {currentTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </h5>
        <p className={styles.dateDisplay}>
          {currentTime.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Action Buttons */}
      <ul className={styles.actionList}>
        <li className={`text-decoration-none ${styles.actionItem}`} onClick={() => onOpenCanvas("leave")}>
          <i className="bi bi-calendar2-check"></i> Apply Leave
        </li>
        <li className={`text-decoration-none ${styles.actionItem}`} onClick={() => onOpenCanvas("wfh")}>
          <i className="bi bi-laptop"></i> Work From Home
        </li>
        <li className={`text-decoration-none ${styles.actionItem}`} onClick={() => onOpenCanvas("partial")}>
          <i className="bi bi-clock-history"></i> Partial Day Request
        </li>
      </ul>
    </div>
  );
}
