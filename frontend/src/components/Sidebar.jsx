"use client";
import React, { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const location = useLocation();
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (label) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredMenu(label);
    }, 150); // small delay to prevent flicker
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 200); // delay closing
  };

  const menuItems = [
    {
      icon: "bi-person",
      label: "Me",
      subItems: [
        { label: "Attendance", path: "/me/attendance" },
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
        { label: "Leave", path: "/me/leave" },
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
            <div
              className={`${styles.menuItem} ${
                location.pathname === item.path ? styles.active : ""
              }`}
            >
              <i className={`bi ${item.icon} ${styles.icon}`}></i>
              <span className={`f_13 ${styles.label}`}>{item.label}</span>
            </div>

            {/* Hover submenu */}
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
