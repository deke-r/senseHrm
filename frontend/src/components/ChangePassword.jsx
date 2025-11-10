"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../style/Profile.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ChangePassword() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword)
      return toast.warn("All fields are required");
    if (form.newPassword !== form.confirmPassword)
      return toast.error("New passwords do not match");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/profile/change-password`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className="card-header  d-flex justify-content-between align-items-center">
        <h6 className="mb-0 f_14 fw-semibold">Change Password</h6>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label f_13">Old Password</label>
            <input
              type="password"
              className="form-control shadow-none rounded-0"
              name="oldPassword"
              value={form.oldPassword}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label f_13">New Password</label>
            <input
              type="password"
              className="form-control shadow-none rounded-0"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label f_13">Confirm New Password</label>
            <input
              type="password"
              className="form-control shadow-none rounded-0"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            
            className={styles.saveBtn}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
