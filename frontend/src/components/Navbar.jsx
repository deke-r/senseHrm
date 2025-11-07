"use client";
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import styles from "../style/Navbar.module.css";

// 🌍 Dynamic API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const timeoutRef = useRef(null);

  const [userData, setUserData] = useState({
    name: "",
    designation: "",
    photo_url: "",
  });

  // ✅ Fetch Navbar Info
  useEffect(() => {
    const fetchUserBasic = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData({
          name: res.data.name,
          designation: res.data.designation,
          photo_url: res.data.photo_url
            ? `${API_URL.replace("/api", "")}${res.data.photo_url}`
            : "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/9cb5e557490547.59c18082e8a40.gif",
        });
      } catch (err) {
        console.error("Error fetching navbar user info:", err);
        setUserData({
          name: "John Doe",
          designation: "Software Engineer",
          photo_url:
            "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/9cb5e557490547.59c18082e8a40.gif",
        });
      }
    };

    fetchUserBasic();
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsDropdownVisible(false), 200);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.navbar}>
      {/* Left Brand Section */}
      <div className={styles.leftSection}>
        <div className={styles.brand}>
          <Link to="/dashboard" className="text-decoration-none">
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
              src={userData.photo_url}
              alt="User"
              className={styles.avatar}
              onError={(e) => {
                e.target.src =
                  "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/9cb5e557490547.59c18082e8a40.gif";
              }}
            />
          </div>

          {isDropdownVisible && (
            <div
              className={styles.profileDropdown}
              onMouseEnter={() => clearTimeout(timeoutRef.current)}
              onMouseLeave={handleMouseLeave}
            >
              <div className={`pt-3 ${styles.userInfo}`}>
                <strong>{userData.name || ""}</strong>
                <small>{userData.designation || ""}</small>
              </div>
              {/* <hr className={styles.dropdownDivider} /> */}
              <Link to="/profile" className={styles.dropdownItem}>
                <i className="bi bi-person me-2"></i> Edit Profile
              </Link>
              {/* <Link to="/id-card" className={styles.dropdownItem}>
                <i className="bi bi-card-text me-2"></i> View ID Card
              </Link> */}
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
