"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import QuickAccess from "../components/dashboard/QuickAccess";
import PostPanel from "../components/dashboard/PostPanel";
import Announcements from "../components/dashboard/Announcements";
import Birthdays from "../components/dashboard/Birthdays";
import styles from "../style/EmployeeDashboard.module.css";
import PostFeed from "../components/dashboard/PostFeed";

export default function EmployeeDashboard() {
  return (
    <>
      <Navbar />
      <div className={styles.layout}>
        <Sidebar />
        <main className='w-75'>
          <div className={styles.banner}>
            <h3 className="f_14">Welcome BHAVISHYA!</h3>
          </div>

          <div className="container-fluid px-3 py-4">
            <div className="row">
              <div className="col-md-6">  <QuickAccess /></div>
              <div className="col-md-6">
              <PostPanel />
              <Announcements />
              <Birthdays />
              <PostFeed/>
              </div>
            </div>
          


          </div>
        </main>
      </div>
    </>
  );
}
