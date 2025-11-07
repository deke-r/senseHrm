"use client";
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../style/Sidebar.module.css";

export default function Sidebar() {
  const location = useLocation();
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [userRole, setUserRole] = useState("employee"); // default fallback
  const timeoutRef = useRef(null);

  // ✅ Get user role from localStorage or context
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData?.role) setUserRole(userData.role);
    } catch (err) {
      console.error("❌ Failed to parse user data:", err);
    }
  }, []);

  // 🧭 Shared Employee Menu
  const baseMenuItems = [
    { icon: "bi-house", label: "Home", path: "/dashboard" },
    {
      icon: "bi-person",
      label: "Me",
      subItems: [
        { label: "Attendance", path: "/attendance" },
        {
          label: "Timesheet",
          subItems: [
            { label: "All Timesheet", path: "/me/timesheet/all" },
            { label: "Past Due", path: "/me/timesheet/past-due" },
            { label: "Rejected Timesheets", path: "/me/timesheet/rejected" },
            { label: "Project Time", path: "/me/timesheet/project-time" },
            { label: "Time Summary", path: "/me/timesheet/summary" },
            { label: "My Tasks", path: "/me/timesheet/tasks" },
            { label: "Projects Allocated", path: "/me/timesheet/projects" },
          ],
        },
        { label: "Leave", path: "/leave" },
        { label: "Performance", path: "/me/performance" },
        {
          label: "Expenses & Travel",
          subItems: [
            { label: "My Expenses", path: "/me/expenses" },
            { label: "Travel Requests", path: "/me/travel" },
          ],
        },
        { label: "Apps", path: "/me/apps" },
      ],
    },
    { icon: "bi-inbox", label: "Inbox", path: "/inbox" },
    { icon: "bi-people", label: "My Team", path: "/my-team" },
    { icon: "bi-cash-stack", label: "Finances", path: "/finances" },
    { icon: "bi-gear", label: "Settings", path: "/settings" },
  ];

  // 🧠 Additional HR/Admin Menu Items
  const hrMenuItems = [
    {
      icon: "bi-clipboard-check",
      label: "Manage",
      subItems: [
        { label: "Review Requests", path: "/manage/requests" },
        { label: "Employee Reports", path: "/reports" },
        { label: "Manage Employees", path: "/employees" },
        { label: "Department Overview", path: "/departments" },
      ],
    },
  ];

  // 🧠 Optional: Admin-Specific Items (if different from HR)
  const adminMenuItems = [
    {
      icon: "bi-shield-lock",
      label: "Admin Panel",
      subItems: [
        { label: "System Settings", path: "/admin/settings" },
        { label: "Access Control", path: "/admin/roles" },
        { label: "Audit Logs", path: "/admin/logs" },
      ],
    },
  ];

  // ✅ Merge Menus Based on Role
  let menuItems = [...baseMenuItems];
  if (userRole === "hr") menuItems = [...baseMenuItems, ...hrMenuItems];
  if (userRole === "admin") menuItems = [...baseMenuItems, ...hrMenuItems, ...adminMenuItems];

  const handleMouseEnter = (label) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredMenu(label);
    }, 150);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 200);
  };

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.menu}>
        {menuItems.map((item) => (
          <div
            key={item.label}
            className={styles.menuWrapper}
            onMouseEnter={() => handleMouseEnter(item.label)}
            onMouseLeave={handleMouseLeave}
          >
            {item.path ? (
              <Link
                to={item.path}
                className={`${styles.menuItem} ${
                  location.pathname === item.path ? styles.active : ""
                }`}
              >
                <i className={`bi ${item.icon} ${styles.icon}`}></i>
                <span className={`f_13 fw-semibold ${styles.label}`}>
                  {item.label}
                </span>
              </Link>
            ) : (
              <div
                className={`${styles.menuItem} ${
                  location.pathname === item.path ? styles.active : ""
                }`}
              >
                <i className={`bi ${item.icon} ${styles.icon}`}></i>
                <span className={`f_13 fw-semibold ${styles.label}`}>
                  {item.label}
                </span>
              </div>
            )}

            {item.subItems && hoveredMenu === item.label && (
              <div
                className={styles.submenu}
                onMouseEnter={() => clearTimeout(timeoutRef.current)}
                onMouseLeave={handleMouseLeave}
              >
                {item.subItems.map((sub) =>
                  sub.subItems ? (
                    <div key={sub.label} className={styles.submenuGroup}>
                      <div className={styles.submenuTitle}>
                        {sub.label} <i className="bi bi-chevron-right ms-1"></i>
                      </div>
                      <div className={styles.submenuInner}>
                        {sub.subItems.map((deep) => (
                          <Link
                            key={deep.label}
                            to={deep.path}
                            className={`${styles.submenuLink} ${
                              location.pathname === deep.path
                                ? styles.activeSub
                                : ""
                            }`}
                          >
                            {deep.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={sub.label}
                      to={sub.path}
                      className={`${styles.submenuLink} ${
                        location.pathname === sub.path ? styles.activeSub : ""
                      }`}
                    >
                      {sub.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
