"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../style/Profile.module.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Profile() {
  const [user, setUser] = useState({});
  const [activeEdit, setActiveEdit] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(res.data);
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.put(`${API_URL}/profile/photo`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile photo updated");
      fetchProfile();
    } catch {
      toast.error("Failed to upload photo");
    }
  };

  const openEdit = (section) => setActiveEdit(section);
  const closeEdit = () => setActiveEdit(null);

  return (

    <>

    <Navbar/>


  
    <Sidebar/>
    

    <main className='w-75'>

    <div className={`container-fluid p-4 ${styles.profilePage}`}>
      {/* Profile Header */}
      <div className={`d-flex align-items-center mb-4 ${styles.header}`}>
        <div className={styles.photoWrapper}>
          <label htmlFor="profilePic" className={styles.photoLabel}>
            <img
              src={user.photo_url || "/img/profile.jpg"}
              alt="Profile"
              className={styles.profilePhoto}
            />
            <div className={styles.photoOverlay}>
              <i className="bi bi-camera"></i>
            </div>
          </label>
          <input
            id="profilePic"
            type="file"
            accept="image/*"
            onChange={handleProfilePhotoChange}
            hidden
          />
        </div>

        <div className="ms-3">
          <h5 className="mb-0">{user.name || "John Doe"}</h5>
          <p className="text-muted mb-0 f_13">
            {user.designation || "Software Engineer"}
          </p>
        </div>
      </div>

      {/* === PERSONAL DETAILS === */}
      <Section
        title="Personal Details"
        fields={{
          "Full Name": user.name,
          "Email": user.email,
          "Phone": user.phone,
          "Date of Birth": user.dob,
          "Gender": user.gender,
        }}
        onEdit={() => openEdit("personal")}
      />

      {/* === QUALIFICATIONS === */}
      <Section
        title="Qualifications"
        fields={{
          "Highest Education": user.education,
          "Specialization": user.specialization,
          "Experience": user.experience + " years",
        }}
        onEdit={() => openEdit("qualification")}
      />

      {/* === ID DETAILS === */}
      <Section
        title="ID Details"
        fields={{
          "Aadhar Number": user.aadhar_no,
          "PAN Number": user.pan_no,
          "Employee ID": user.emp_id,
        }}
        onEdit={() => openEdit("id")}
      />

      {/* === OFFCANVAS === */}
      {activeEdit && (
        <EditOffcanvas
          section={activeEdit}
          close={closeEdit}
          refresh={fetchProfile}
        />
      )}
    </div>



    </main>



    </>
  );
}

/* --- Section Component --- */
function Section({ title, fields, onEdit }) {
  return (
    <div className="card mb-3 shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-semibold text-dark">{title}</h6>
        <button className="btn btn-sm btn-outline-success f_13" onClick={onEdit}>
          <i className="bi bi-pencil me-1"></i> Edit
        </button>
      </div>
      <div className="card-body row">
        {Object.entries(fields).map(([key, val]) => (
          <div key={key} className="col-md-4 mb-3">
            <p className="text-muted mb-1 f_12">{key}</p>
            <p className="f_13 fw-semibold">{val || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Offcanvas Edit --- */
function EditOffcanvas({ section, close, refresh }) {
  const [form, setForm] = useState({});
  const title =
    section === "personal"
      ? "Edit Personal Details"
      : section === "qualification"
      ? "Edit Qualifications"
      : "Edit ID Details";

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await axios.put(`${API_URL}/profile/${section}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Profile updated successfully");
      refresh();
      close();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className={`offcanvas offcanvas-end show ${styles.offcanvasCustom}`}>
      <div className="offcanvas-header border-bottom">
        <h6 className="mb-0 fw-semibold">{title}</h6>
        <button type="button" className="btn-close" onClick={close}></button>
      </div>
      <div className="offcanvas-body">
        {section === "personal" && (
          <>
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control mb-3"
              onChange={handleChange}
            />
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="form-control mb-3"
              onChange={handleChange}
            />
            <label className="form-label">Gender</label>
            <select
              name="gender"
              className="form-select mb-3"
              onChange={handleChange}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </>
        )}

        {section === "qualification" && (
          <>
            <label className="form-label">Highest Education</label>
            <input
              type="text"
              name="education"
              className="form-control mb-3"
              onChange={handleChange}
            />
            <label className="form-label">Specialization</label>
            <input
              type="text"
              name="specialization"
              className="form-control mb-3"
              onChange={handleChange}
            />
          </>
        )}

        {section === "id" && (
          <>
            <label className="form-label">Aadhar Number</label>
            <input
              type="text"
              name="aadhar_no"
              className="form-control mb-3"
              onChange={handleChange}
            />
            <label className="form-label">PAN Number</label>
            <input
              type="text"
              name="pan_no"
              className="form-control mb-3"
              onChange={handleChange}
            />
          </>
        )}

        <button className="btn btn-success w-100" onClick={handleSubmit}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
