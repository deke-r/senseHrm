"use client";
import React, { useEffect, useState } from "react";
import styles from "../style/EmployeeAttendance.module.css";

export default function AttendanceActions() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasType, setCanvasType] = useState("");
  const [requests, setRequests] = useState([]);

  // ⏰ Live clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openCanvas = (type) => {
    setCanvasType(type);
    setShowCanvas(true);
  };

  const closeCanvas = () => setShowCanvas(false);

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newReq = {
      type: canvasType,
      from: formData.get("from"),
      to: formData.get("to"),
      note: formData.get("note"),
      date: new Date().toLocaleDateString(),
    };
    setRequests((prev) => [...prev, newReq]);
    closeCanvas();
  };

  return (
    <>
      {/* Actions Card */}
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
          <li
            className={`text-decoration-none ${styles.actionItem}`}
            onClick={() => openCanvas("leave")}
          >
            <i className="bi bi-calendar2-check"></i> Apply Leave
          </li>
          <li
            className={`text-decoration-none ${styles.actionItem}`}
            onClick={() => openCanvas("wfh")}
          >
            <i className="bi bi-laptop"></i> Work From Home
          </li>
          <li
            className={`text-decoration-none ${styles.actionItem}`}
            onClick={() => openCanvas("partial")}
          >
            <i className="bi bi-clock-history"></i> Partial Day Request
          </li>
        </ul>
      </div>

      {/* Offcanvas Form */}
      {showCanvas && (
        <div className={styles.canvasOverlay}>
          <div className={styles.canvas}>
            <div className={styles.canvasHeader}>
              <h6>
                {canvasType === "wfh"
                  ? "Request Work From Home"
                  : canvasType === "partial"
                  ? "Partial Day Request"
                  : "Apply Leave"}
              </h6>
              <button onClick={closeCanvas} className={styles.closeBtn}>
                ✕
              </button>
            </div>

            <form className={styles.canvasBody} onSubmit={handleSubmitRequest}>
              <div className={styles.dateBox}>
                <div>
                  <p className={styles.inputLabel}>From</p>
                  <input
                    name="from"
                    type="date"
                    className={styles.dateInput}
                    required
                  />
                </div>
                <div className={styles.dayCount}>0 days</div>
                <div>
                  <p className={styles.inputLabel}>To</p>
                  <input
                    name="to"
                    type="date"
                    className={styles.dateInput}
                    required
                  />
                </div>
              </div>

              <div className={styles.infoBox}>
                <i className="bi bi-info-circle"></i>
                {canvasType === "wfh"
                  ? "As per the policy assigned, only Mon–Sat will be considered for WFH."
                  : "Past-dated requests aren't allowed when clock-in is enabled."}
              </div>

              {canvasType === "partial" && (
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Select Half</label>
                  <select name="half" className={styles.input}>
                    <option>First Half</option>
                    <option>Second Half</option>
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Note</label>
                <textarea
                  name="note"
                  placeholder="Type here"
                  className={styles.textarea}
                  required
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
