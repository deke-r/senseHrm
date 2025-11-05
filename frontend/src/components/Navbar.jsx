"use client";
import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsDropdownVisible(false), 200);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.navbar}>
      {/* Left Brand Section */}
      <div className={styles.leftSection}>
        <div className={styles.brand}>
          <Link to='/employee-dashboard' className="text-decoration-none">
          <span className={styles.brandText}>SENSE PROJECTS</span>
          </Link>
        </div>
      </div>

      {/* Right User Section */}
      <div className={styles.rightSection}>
        <i className={`bi bi-bell ${styles.notification}`}></i>

        {/* Avatar + Dropdown */}
        <div
          className={styles.profileWrapper}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.avatarWrapper}>
            <img
              src="/img/profile.jpg"
              alt="User"
              className={styles.avatar}
            />
          </div>

          {isDropdownVisible && (
            <div
              className={styles.profileDropdown}
              onMouseEnter={() => clearTimeout(timeoutRef.current)}
              onMouseLeave={handleMouseLeave}
            >
              <div className={styles.userInfo}>
                <strong>{user?.name || "John Doe"}</strong>
                <small>{user?.designation || "Software Engineer"}</small>
              </div>
              <hr className={styles.dropdownDivider} />
              <Link to="/profile" className={styles.dropdownItem}>
                <i className="bi bi-person me-2"></i> Edit Profile
              </Link>
              <Link to="/id-card" className={styles.dropdownItem}>
                <i className="bi bi-card-text me-2"></i> View ID Card
              </Link>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
