import React from "react";
import styles from "../../style/DashboardSections.module.css";

export default function QuickAccess() {
  return (
    <div className={styles.quickAccess}>
      <h6 className={`fw-semibold mb-3 ms-1 f_13 ${styles.sectionTitle}`}>Quick Access</h6>

      <div className="container-fluid px-0">
        <div className="row g-3">
          {/* Inbox */}
          <div className="col-md-12">
            <div className={`${styles.card} `}>
              <h6 className="f_13 text-muted mb-3">Inbox</h6>
              <div className="row align-items-center">
                <div className="col-3 m-0 p-0 text-center">
                  <img src="/img/inbox.png" width={75} alt="inbox" />
                </div>
                <div className="col-9 ps-2">
                  <p className="text-muted fw-semibold mb-1 f_13">Good job!</p>
                  <p className="text-muted f_12 mb-0">You have no pending actions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Holidays */}
          <div className="col-md-12">
            <div className={`${styles.card} `}>
              <h6 className="f_13 text-muted mb-3">Holidays</h6>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="fw-semibold text-success mb-1 f_13">Gandhi Jayanti</p>
                  <p className="small text-muted mb-0 f_12">Thu, 02 October, 2025</p>
                </div>
                <img src="/img/mahatma.png" alt="holiday" width={60} />
              </div>
            </div>
          </div>

          {/* On Leave Today */}
          <div className="col-md-12">
            <div className={`${styles.card} `}>
              <h6 className="f_13 text-muted mb-3">On Leave Today</h6>
              <div className="d-flex align-items-center  justify-content-between">
                <div>
                  <p className="text-dark mb-1 f_13">Everyone is working today!</p>
                  <p className="text-muted small mb-0 f_12">No one is on leave today.</p>
                </div>
                <img src="../../../public/img/onLeave.png" alt="leave" width={125} className="me-2" />
              </div>
            </div>
          </div>

          {/* Working Remotely */}
          <div className="col-md-12">
            <div className={`${styles.card} `}>
              <h6 className="f_13 text-muted mb-3">Working Remotely</h6>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-dark mb-1 f_13">Everyone is at office!</p>
                  <p className="text-muted small mb-0 f_12">No one is working remotely today.</p>
                </div>
                <img src="../../../public/img/workingRemotely.png" alt="remote" width={125} className="me-2" />

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
