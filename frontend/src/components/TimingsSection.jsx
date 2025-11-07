"use client";
import React, { useState, useEffect } from "react";
import styles from "../style/Attendance.module.css";

export default function TimingsSection() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progressPercent, setProgressPercent] = useState(0);

  // Office timings (9:30 AM - 6:30 PM)
  const officeStart = { hours: 9, minutes: 30 };
  const officeEnd = { hours: 18, minutes: 30 };
  const themeColor = "#5E9C76";

  // Live clock update every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      calculateProgress(now);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate progress percentage
  const calculateProgress = (now) => {
    const start = new Date();
    start.setHours(officeStart.hours, officeStart.minutes, 0, 0);
    const end = new Date();
    end.setHours(officeEnd.hours, officeEnd.minutes, 0, 0);
    const total = end - start;
    const elapsed = now - start;
    let percent = (elapsed / total) * 100;
    percent = Math.max(0, Math.min(100, percent));
    setProgressPercent(percent);
  };

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const currentDayIndex = new Date().getDay(); // 0=Sun, 1=Mon

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className={styles.card}>
      <h6 className={styles.cardTitle}>Timings</h6>

      {/* ===== Day Circles ===== */}
      <div className={styles.daySelector}>
        {days.map((d, i) => {
          const isWeekend = i === 5 || i === 6;
          const isToday = i === (currentDayIndex === 0 ? 6 : currentDayIndex - 1);
          const isPast = i < (currentDayIndex === 0 ? 6 : currentDayIndex - 1);
          return (
            <div
              key={i}
              className={`${styles.dayCircle}`}
              style={{
                background: isWeekend
                  ? "#f1f3f6"
                  : isToday
                  ? themeColor
                  : isPast
                  ? "#B5D4C0"
                  : "#f1f3f6",
                color:
                  isToday || isPast ? "#fff" : isWeekend ? "#999" : "#666",
                fontWeight: isToday ? 700 : 500,
              }}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* ===== Progress Bar ===== */}
      <p className={styles.timeLabel}>
        Today ({formatTime(new Date(2025, 0, 1, 9, 30))} -{" "}
        {formatTime(new Date(2025, 0, 1, 18, 30))})
      </p>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${progressPercent}%`,
            background: themeColor,
            transition: "width 0.6s ease-in-out",
          }}
        ></div>
      </div>

      <div className={styles.durationBox}>
        <span>
          Current Time: <b>{formatTime(currentTime)}</b>
        </span>
        <span>({Math.round(progressPercent)}% of workday complete)</span>
      </div>
    </div>
  );
}
