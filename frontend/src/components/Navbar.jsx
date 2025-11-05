"use client";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className={styles.navbar}>
      {/* Left Brand Section */}
      <div className={styles.leftSection}>
        <div className={styles.brand}>
          {/* <img
            src="/img/keka-logo-white.png"
            alt="logo"
            className={styles.logo}
          /> */}
          <span className={styles.brandText}>SENSE PROJECTS</span>
        </div>
      </div>

      {/* Center Search */}
      {/* <div className={styles.centerSection}>
        <div className={styles.searchWrapper}>
          <i className={`bi bi-search ${styles.searchIcon}`}></i>
          <input
            type="text"
            placeholder="Search employees or actions (Ex: Apply Leave)"
            className={styles.searchInput}
          />
          <span className={styles.shortcut}>Alt + K</span>
        </div>
      </div> */}

      {/* Right User / Notification Section */}
      <div className={styles.rightSection}>
        <i className={`bi bi-bell ${styles.notification}`}></i>
        <div className={styles.avatarWrapper}>
          <img
            src="/img/profile.jpg"
            alt="User"
            className={styles.avatar}
          />
        </div>
      </div>
    </header>
  );
}
