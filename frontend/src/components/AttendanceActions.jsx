import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../style/Attendance.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AttendanceActions() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasType, setCanvasType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dayCount, setDayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", success: true });

  // ⏰ Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🗓️ Calculate total days
  useEffect(() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (to >= from) {
        const diffDays = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
        setDayCount(diffDays);
      } else {
        setDayCount(0);
      }
    }
  }, [fromDate, toDate]);

  const openCanvas = (type) => {
    setCanvasType(type);
    setShowCanvas(true);
    setFromDate("");
    setToDate("");
    setDayCount(0);
  };

  const closeCanvas = () => setShowCanvas(false);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const note = formData.get("note");
    const leaveType = formData.get("leaveType");
    const half = formData.get("half");

    try {
      const token = localStorage.getItem("token");

      let endpoint = "";
      let payload = {};

      if (canvasType === "leave") {
        endpoint = `${API_URL}/leave/apply`;
        payload = {
          leave_category: leaveType,
          leave_type: dayCount === 0.5 ? "half" : "full",
          half_day: dayCount === 0.5 ? half : null,
          from_date: fromDate,
          to_date: toDate,
          total_days: dayCount,
          note,
        };
      } else if (canvasType === "wfh") {
        endpoint = `${API_URL}/wfh/workfromhome`;
        payload = {
          from_date: fromDate,
          to_date: toDate,
          total_days: dayCount,
          note,
        };
      } else if (canvasType === "partial") {
        endpoint = `${API_URL}/partial`;
        payload = {
          request_date: fromDate,
          half,
          note,
        };
      }

      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setToast({
        show: true,
        message: res.data.message || "Request submitted successfully",
        success: true,
      });
      closeCanvas();
    } catch (err) {
      console.error("Submit error:", err);
      setToast({
        show: true,
        message: err.response?.data?.message || "Error submitting request",
        success: false,
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast({ show: false, message: "" }), 4000);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* Toast */}
      {toast.show && (
        <div
          className={`alert ${
            toast.success ? "alert-success" : "alert-danger"
          } position-fixed top-0 end-0 m-3`}
          style={{ zIndex: 2000 }}
        >
          {toast.message}
        </div>
      )}

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

        {/* Buttons */}
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

      {/* Offcanvas */}
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
              {/* Date Fields */}
              {canvasType !== "partial" && (
                <div className={styles.dateBox}>
                  <div>
                    <p className={styles.inputLabel}>From</p>
                    <input
                      name="from"
                      type="date"
                      className={styles.dateInput}
                      min={today}
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        if (toDate && new Date(e.target.value) > new Date(toDate)) {
                          setToDate("");
                        }
                      }}
                      required
                    />
                  </div>
                  <div className={styles.dayCount}>
                    {dayCount > 0
                      ? `${dayCount} ${dayCount === 1 ? "day" : "days"}`
                      : "0 days"}
                  </div>
                  <div>
                    <p className={styles.inputLabel}>To</p>
                    <input
                      name="to"
                      type="date"
                      className={styles.dateInput}
                      min={fromDate || today}
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className={styles.infoBox}>
                <i className="bi bi-info-circle"></i>
                {canvasType === "wfh"
                  ? "As per policy, only Mon–Sat are valid WFH days."
                  : canvasType === "partial"
                  ? "Use for half-day or early departure requests."
                  : "Past-dated leave requests are not allowed."}
              </div>

              {/* Leave Type */}
              {canvasType === "leave" && (
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel}>Leave Type</label>
                  <select name="leaveType" className={styles.input} required>
                    <option value="">Select Leave Type</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Optional Leave">Optional Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>
              )}

              {/* Partial Day */}
              {canvasType === "partial" && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Date</label>
                    <input
                      name="from"
                      type="date"
                      className={styles.input}
                      min={today}
                      required
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.inputLabel}>Select Half</label>
                    <select name="half" className={styles.input}>
                      <option>First Half</option>
                      <option>Second Half</option>
                    </select>
                  </div>
                </>
              )}

              {/* Note */}
              <div className={styles.formGroup}>
                <label className={styles.inputLabel}>Note</label>
                <textarea
                  name="note"
                  placeholder="Type here"
                  className={styles.textarea}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
