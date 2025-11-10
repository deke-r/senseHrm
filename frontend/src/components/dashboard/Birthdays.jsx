import React from "react";
import styles from "../../style/DashboardSections.module.css";

export default function Birthdays() {
  return (
    <div className={styles.panel}>
      <div className={styles.tabHeader}>
        <div className={styles.tabActive}>0 Birthdays</div>
        <div>0 Work Anniversaries</div>
        <div>0 New Joinees</div>
      </div>
      <div className={styles.birthdayBody}>
        <p className="text-muted small">No birthdays today</p>
        <img src="/img/birthday.png" alt="cake" className={styles.iconImg} />
      </div>
    </div>
  );
}
