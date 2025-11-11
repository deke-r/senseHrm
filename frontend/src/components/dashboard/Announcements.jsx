import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../style/DashboardSections.module.css";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${API_URL}/announcements`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // Filter only valid + active announcements
        const today = new Date();
        const active = res.data.filter((a) => {
          const from = new Date(a.valid_from);
          const to = new Date(a.valid_to);
          return a.status === "active" && from <= today && to >= today;
        });

        setAnnouncements(active);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className={styles.panel}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="text-muted mb-0 f_13 ">Announcements</h6>
        <span className="badge bg-light text-dark f_12">
          {announcements.length || 0}
        </span>
      </div>

      {announcements.length === 0 ? (
        <p className="small text-muted mb-0">No active announcements</p>
      ) : (
        <div
          id="announcementCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="4000"
        >
          <div className="carousel-inner">
            {announcements.map((a, idx) => (
              <div
                key={a.id}
                className={`carousel-item ${idx === 0 ? "active" : ""}`}
              >
                <div
                  className="p-3 ps-5 ms-3 "
                  style={{ minHeight: "100px" }}
                >
                  <h6 className="fw-semibold text-primary mb-1">
                    {a.title}
                  </h6>
                  <p className="small mb-1 text-muted">
                    {a.description || "No description"}
                  </p>
                  <p className="small text-secondary mb-0">
                    Valid: {new Date(a.valid_from).toLocaleDateString()} -{" "}
                    {new Date(a.valid_to).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {announcements.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#announcementCarousel"
                data-bs-slide="prev"
              >
                <span
                  className="carousel-control-prev-icon bg-dark rounded-circle"
                  aria-hidden="true"
                  style={{ width: "25px", height: "25px" }}
                ></span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#announcementCarousel"
                data-bs-slide="next"
              >
                <span
                  className="carousel-control-next-icon bg-dark rounded-circle"
                  aria-hidden="true"
                  style={{ width: "25px", height: "25px" }}
                ></span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
