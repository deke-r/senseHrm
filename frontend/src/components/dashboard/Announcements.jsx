import React from "react";
import styles from "../../style/DashboardSections.module.css";

export default function Announcements() {
  return (
    <div className={styles.panel}>
      <h6 className="fw-semibold mb-2">Announcements</h6>
      <p className="small text-muted mb-0">No announcements</p>
    </div>
  );
}
