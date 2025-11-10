import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../style/DashboardSections.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Birthdays() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("birthdays");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/birthdays/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchUsers();
  }, []);

  const getNextDate = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const date = new Date(dateString);
    date.setFullYear(today.getFullYear());
    if (date < today) date.setFullYear(today.getFullYear() + 1);
    return date;
  };

  const birthdays = users
    .map((u) => ({
      ...u,
      nextBirthday: getNextDate(u.dob),
    }))
    .filter((u) => u.nextBirthday)
    .sort((a, b) => a.nextBirthday - b.nextBirthday);

  const anniversaries = users
    .map((u) => ({
      ...u,
      nextAnniversary: getNextDate(u.doj),
    }))
    .filter((u) => u.nextAnniversary)
    .sort((a, b) => a.nextAnniversary - b.nextAnniversary);

  const newJoinees = users.filter((u) => {
    if (!u.doj) return false;
    const diff = (new Date() - new Date(u.doj)) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  const data =
    activeTab === "birthdays"
      ? birthdays
      : activeTab === "anniversaries"
      ? anniversaries
      : newJoinees;

  const renderUserCard = (user, type) => {
    const date =
      type === "birthdays"
        ? user.nextBirthday
        : type === "anniversaries"
        ? user.nextAnniversary
        : new Date(user.doj);
    const dateStr = date
      ? date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        })
      : "—";

    return (
      <div
        key={user.id}
        className="d-flex align-items-center border rounded p-2 mb-2 bg-light"
      >
        <img
          src={
            user.photo_url
              ? `${API_URL.replace("/api", "")}${user.photo_url}`
              : "/placeholder.svg"
          }
          alt={user.first_name}
          className="rounded-circle me-3"
          style={{ width: "45px", height: "45px", objectFit: "cover" }}
        />
        <div>
          <h6 className="mb-0 f_14 fw-semibold">
            {user.first_name} {user.last_name}
          </h6>
          <p className="small text-muted mb-0">
            {user.designation || "Employee"}
          </p>
        </div>
        <span className="ms-auto small fw-semibold text-primary">{dateStr}</span>
      </div>
    );
  };

  return (
    <div className={styles.panel}>
      <ul className={`nav ${styles.customTabs}`} id="eventTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`${styles.tabBtn} ${
              activeTab === "birthdays" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("birthdays")}
          >
            🎂 Birthdays ({birthdays.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`${styles.tabBtn} ${
              activeTab === "anniversaries" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("anniversaries")}
          >
            🏢 Work Anniversaries ({anniversaries.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`${styles.tabBtn} ${
              activeTab === "joinees" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("joinees")}
          >
            👋 New Joinees ({newJoinees.length})
          </button>
        </li>
      </ul>

      <div className={styles.birthdayBody}>
        {data.length > 0 ? (
          data.slice(0, 5).map((u) => renderUserCard(u, activeTab))
        ) : (
          <div className="text-center">
            <p className="text-muted small mb-1">
              No {activeTab.replace("joinees", "new joinees")} found
            </p>
            <img
              src="/img/birthday.png"
              alt="event"
              className={styles.iconImg}
            />
          </div>
        )}
      </div>
    </div>
  );
}
