"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import QuickAccess from "../components/dashboard/QuickAccess";
import PostPanel from "../components/dashboard/PostPanel";
import Announcements from "../components/dashboard/Announcements";
import Birthdays from "../components/dashboard/Birthdays";
import styles from "../style/EmployeeDashboard.module.css";
import PostFeed from "../components/dashboard/PostFeed";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";


export default function EmployeeDashboard() {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found. Redirect to login?");
          return;
        }

        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log(res)
        if (res.data && res.data.name) {
          setUserName(res.data.name);
        } else if (res.data.first_name) {
          // fallback if API sends first_name + last_name
          setUserName(`${res.data.first_name} ${res.data.last_name || ""}`);
        }
      } catch (err) {
        console.error("❌ Failed to load user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
  return (
    <>
      <Navbar />
      <div className={styles.layout}>
        <Sidebar />
        <main className='w-75'>
          <div className={styles.banner}>
          <h3 className="f_14">
              {loading
                ? "Loading..."
                : userName
                ? `Welcome ${userName.trim().split(" ")[0]}!`
                : "Welcome!"}
            </h3>
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
