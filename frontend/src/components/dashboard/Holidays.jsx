import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../style/DashboardSections.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/holidays`);
      console.log(data)
      setHolidays(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Convert backend path to full URL
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_URL.replace("/api", "")}${path}`;
  };

  // ✅ Manually extract the date (ignore timezone)
  const formatDate = (rawDate) => {
    if (!rawDate) return "";
    // if it's ISO (contains "T"), split before 'T'
    const datePart = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;

    // now safely create a date for display only (no timezone loss)
    const [y, m, d] = datePart.split("-");
    const localDate = new Date(`${y}-${m}-${d}T00:00:00`);
    return localDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ✅ Determine upcoming holiday using date strings only
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingHolidays = holidays
    .filter((h) => {
      const datePart = h.date.includes("T") ? h.date.split("T")[0] : h.date;
      return datePart >= todayStr;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const nextHoliday = upcomingHolidays.length > 0 ? upcomingHolidays[0] : null;

  return (
    <>
      <div className="col-md-12">
        <div className={`${styles.card}`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="f_13 text-muted mb-0">Upcoming Holiday</h6>
            <button
              type="button"
              className="btn btn-link p-0 f_12 text-decoration-none"
              data-bs-toggle="modal"
              data-bs-target="#allHolidaysModal"
              onClick={() => setShowModal(true)}
            >
              See More
            </button>
          </div>

          {/* ✅ Show next upcoming holiday */}
          {nextHoliday ? (
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="fw-semibold text-success mb-1 f_13">
                  {nextHoliday.name}
                </p>
                <p className="small text-muted mb-0 f_12">
                  {formatDate(nextHoliday.date)}
                </p>
              </div>
              {nextHoliday.image && (
                <img
                  src={getImageUrl(nextHoliday.image)}
                  alt={nextHoliday.name}
                  width={60}
                  className="rounded"
                />
              )}
            </div>
          ) : (
            <p className="text-muted text-center mb-0 f_13">
              No upcoming holidays
            </p>
          )}
        </div>
      </div>

      {/* ✅ Modal with card layout for all holidays */}
      <div
        className="modal fade"
        id="allHolidaysModal"
        tabIndex="-1"
        aria-labelledby="allHolidaysModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title" id="allHolidaysModalLabel">
                All Holidays
              </h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setShowModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              {holidays.length > 0 ? (
                <div className="row g-3">
                  {holidays.map((holiday) => (
                    <div
                      className="col-12 col-sm-6 col-md-4 col-lg-3"
                      key={holiday.id}
                    >
                      <div
                        className="card border-0 shadow-sm text-center p-3 h-100"
                        style={{ borderRadius: "12px" }}
                      >
                        <div
                          className="d-flex justify-content-center align-items-center mb-3"
                          style={{
                            height: "100px",
                            background: "#f8f9fa",
                            borderRadius: "10px",
                          }}
                        >
                          {holiday.image ? (
                            <img
                              src={getImageUrl(holiday.image)}
                              alt={holiday.name}
                              style={{
                                maxWidth: "80px",
                                maxHeight: "80px",
                                borderRadius: "8px",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <div className="text-muted small">No Image</div>
                          )}
                        </div>
                        <div>
                          <h6 className="fw-semibold mb-1 f_13">
                            {holiday.name}
                          </h6>
                          <p className="text-muted f_12 mb-0">
                            {formatDate(holiday.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted f_13 mb-0">
                  No holidays found
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary rounded-0 f_13"
                data-bs-dismiss="modal"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Holidays;
