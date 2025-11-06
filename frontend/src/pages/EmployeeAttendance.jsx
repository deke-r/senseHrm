"use client";
import React, { useState } from "react";
import styles from "../style/EmployeeAttendance.module.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AttendanceActions from "../components/AttendanceActions";

export default function EmployeeAttendance() {
  const [activeTab, setActiveTab] = useState("attendancelog");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Calendar rendering
  const renderCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const weeks = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < startDay) || day > daysInMonth) {
          week.push(<td key={j}></td>);
        } else {
          const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;
          week.push(
            <td
              key={j}
              className={`${styles.calendarDay} ${isToday ? styles.today : ""}`}
            >
              {day}
            </td>
          );
          day++;
        }
      }
      weeks.push(<tr key={i}>{week}</tr>);
    }
    return weeks;
  };

  const attendanceData = [
    { date: "Fri, 05 Sept", effective: "9h 14m", gross: "9h 14m", arrival: "", log: "checkmark" },
    { date: "Thu, 04 Sept", effective: "5h 13m", gross: "5h 13m", arrival: "On Time", log: "checkmark" },
  ];

  return (
    <>
      <Navbar />
      <Sidebar />
      <main>
        <div className={styles.page}>
          <div className={styles.mainContent}>
            <div className={styles.topSection}>
              {/* Attendance Stats */}
              <div className={styles.card}>
                <h6 className={styles.cardTitle}>Attendance Stats</h6>
                <div className={styles.statsContainer}>
                  <div className={styles.statItem}>
                    <div className={styles.statRow}>
                      <div className={`${styles.iconCircle} ${styles.iconYellow}`}>
                        <i className="bi bi-person"></i>
                      </div>
                      <p className={styles.label}>Me</p>
                    </div>
                    <div className={styles.statsData}>
                      <div>
                        <p className={styles.dataLabel}>AVG HRS / DAY</p>
                        <p className={styles.dataValue}>9h 3m</p>
                      </div>
                      <div>
                        <p className={styles.dataLabel}>ON TIME ARRIVAL</p>
                        <p className={styles.dataValue}>67%</p>
                      </div>
                    </div>
                  </div>
                  <hr className={styles.divider} />
                  <div className={styles.statItem}>
                    <div className={styles.statRow}>
                      <div className={`${styles.iconCircle} ${styles.iconBlue}`}>
                        <i className="bi bi-people"></i>
                      </div>
                      <p className={styles.label}>My Team</p>
                    </div>
                    <div className={styles.statsData}>
                      <div>
                        <p className={styles.dataLabel}>AVG HRS / DAY</p>
                        <p className={styles.dataValue}>3h 42m</p>
                      </div>
                      <div>
                        <p className={styles.dataLabel}>ON TIME ARRIVAL</p>
                        <p className={styles.dataValue}>9%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timings */}
              <div className={styles.card}>
                <h6 className={styles.cardTitle}>Timings</h6>
                <div className={styles.daySelector}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div
                      key={i}
                      className={`${styles.dayCircle} ${
                        i === 5 ? styles.dayActive : ""
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <p className={styles.timeLabel}>Today (9:30 AM - 6:30 PM)</p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill}></div>
                </div>
                <div className={styles.durationBox}>
                  <span>Duration: 9h 0m</span>
                </div>
              </div>

              {/* Actions Component (self-contained with canvas) */}
              <AttendanceActions />
            </div>

            {/* Logs & Requests Section */}
            <div className={styles.card} style={{ marginTop: "24px" }}>
              <h6 className={styles.cardTitle}>Logs & Requests</h6>

              {/* Tabs */}
              <div className={styles.tabs}>
                {["Attendance Log", "Calendar", "Attendance Requests"].map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${
                      activeTab === tab.toLowerCase().replace(/\s+/g, "")
                        ? styles.tabActive
                        : ""
                    }`}
                    onClick={() =>
                      setActiveTab(tab.toLowerCase().replace(/\s+/g, ""))
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "attendancelog" && (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>EFFECTIVE HOURS</th>
                      <th>GROSS HOURS</th>
                      <th>ARRIVAL</th>
                      <th>LOG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td className={styles.hoursCell}>{row.effective}</td>
                        <td className={styles.hoursCell}>{row.gross}</td>
                        <td>{row.arrival}</td>
                        <td>
                          {row.log && (
                            <i className="bi bi-check-circle-fill text-success"></i>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "calendar" && (
                <div className={styles.calendarBox}>
                  <div className={styles.calendarHeader}>
                    <button
                      onClick={() =>
                        setSelectedMonth(
                          new Date(
                            selectedMonth.getFullYear(),
                            selectedMonth.getMonth() - 1,
                            1
                          )
                        )
                      }
                    >
                      ◀
                    </button>
                    <h6>
                      {selectedMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h6>
                    <button
                      onClick={() =>
                        setSelectedMonth(
                          new Date(
                            selectedMonth.getFullYear(),
                            selectedMonth.getMonth() + 1,
                            1
                          )
                        )
                      }
                    >
                      ▶
                    </button>
                  </div>
                  <table className={styles.calendarTable}>
                    <thead>
                      <tr>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                          (d) => (
                            <th key={d}>{d}</th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>{renderCalendar()}</tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
