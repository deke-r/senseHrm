"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "../style/Profile.module.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // 🧠 Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✏️ Enable editing
  const handleEditClick = (section) => {
    setEditingSection(section);
    setFormData(user);
  };

  // 💾 Save section
  const handleSave = async (section) => {
    try {
      const token = localStorage.getItem("token");
      let endpoint = "";

      switch (section) {
        case "personal":
          endpoint = `${API_URL}/profile/personal`;
          break;
        case "about":
          endpoint = `${API_URL}/profile/about`;
          break;
        case "jobPreference":
          endpoint = `${API_URL}/profile/job`;
          break;
        case "interests":
          endpoint = `${API_URL}/profile/interests`;
          break;
        default:
          return;
      }

      await axios.put(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser((prev) => ({ ...prev, ...formData }));
      setEditingSection(null);
      alert("Profile updated successfully ✅");
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to update profile ❌");
    }
  };

  // 📸 Photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("image", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/profile/photo`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUser((prev) => ({ ...prev, photo_url: res.data.photo_url }));
      alert("Profile photo updated successfully 📸");
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("Photo upload failed ❌");
    }
  };

  const handlePhotoClick = () => fileInputRef.current.click();

  // 🪪 Download ID card (credit card size)
  // 🪪 Export ID Card centered on a full A4 PDF page (no stretch / crop)
  const downloadID = async () => {
    const card = document.getElementById("idCard");
    if (!card) return alert("ID Card not found!");

    // Convert ID card div to canvas
    const canvas = await html2canvas(card, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/png");

    // Create an A4 PDF (landscape or portrait as you like)
    const pdf = new jsPDF({
      orientation: "portrait", // or "landscape"
      unit: "pt",
      format: "a4", // full A4 sheet
    });

    // A4 page dimensions in points
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Keep the card at its natural scale (don’t stretch)
    const imgWidth = canvas.width * 0.6; // control visible size (0.6 = ~60% of A4 width)
    const imgHeight = (canvas.height / canvas.width) * imgWidth;

    // Center the ID card on the A4 page
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, undefined, "FAST");
    pdf.save(`${user.first_name || "Employee"}_ID.pdf`);
  };


  if (!user) return <div className="text-center mt-5">Loading profile...</div>;

  return (
    <>
      <Navbar />
      <Sidebar />

      <main>
        <div className={`mx-md-2 my-md-2 ${styles.profilePage}`}>
          {/* Header */}
          <div className={`rounded-2 ${styles.headerBanner}`}>
            <div className={styles.headerContent}>
              <div className={styles.profilePhotoSection}>
                <div className={styles.profilePhotoWrapper} onClick={handlePhotoClick}>
                  <img
                    src={
                      photoPreview
                        ? photoPreview
                        : user.photo_url
                          ? `${API_URL.replace("/api", "")}${user.photo_url}`
                          : "/placeholder.svg"
                    }
                    alt="Profile"
                    className={styles.profilePhoto}
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.nameSection}>
                  <h1 className={styles.userName}>{user.first_name}</h1>
                  <span className={styles.statusBadge}>{user.status || "Active"}</span>
                </div>
                <p className={styles.designation}>{user.designation}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className={styles.contactBar}>
            <div className={styles.contactItem}>📧 {user.email}</div>
            <div className={styles.contactItem}>📞 {user.phone || "N/A"}</div>
            <div className={styles.contactItem}>🏢 {user.head_office || "N/A"}</div>
            <div className={styles.contactItem}>
              🆔 {user.emp_id}
              <button
                className="btn btn-sm border-0 f_13 fw-semibold text-primary ms-2"
                data-bs-toggle="offcanvas"
                data-bs-target="#idCardCanvas"
              >
                <i className="bi bi-person-badge"></i> View ID
              </button>
            </div>
          </div>

          {/* Department Info */}
          <div className={styles.deptBar}>
            <div className={styles.deptItem}>
              <span className={styles.deptLabel}>DEPARTMENT</span>
              <span className={styles.deptValue}>{user.department}</span>
            </div>
            <div className={styles.deptItem}>
              <span className={styles.deptLabel}>REPORTING MANAGER</span>
              <div className={styles.managerBox}>
                <div className={styles.managerAvatar}>
                  {user.reporting_manager?.slice(0, 2).toUpperCase() || "RM"}
                </div>
                <span>{user.reporting_manager || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            <div className={styles.leftColumn}>
              <ProfileSection
                title="About"
                section="about"
                field="about"
                user={user}
                formData={formData}
                editingSection={editingSection}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                handleEditClick={handleEditClick}
              />

              <ProfileSection
                title="What I love about my job?"
                section="jobPreference"
                field="job_preference"
                user={user}
                formData={formData}
                editingSection={editingSection}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                handleEditClick={handleEditClick}
              />

              <ProfileSection
                title="My Interests & Hobbies"
                section="interests"
                field="interests"
                user={user}
                formData={formData}
                editingSection={editingSection}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                handleEditClick={handleEditClick}
                isList
              />

              <PersonalDetails
                user={user}
                formData={formData}
                editingSection={editingSection}
                handleInputChange={handleInputChange}
                handleSave={handleSave}
                handleEditClick={handleEditClick}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Digital ID Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="idCardCanvas"
        aria-labelledby="idCardLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title f_14 fw-semibold" id="idCardLabel">
            Digital ID Preview
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <hr />

        <div className="offcanvas-body text-center">
          <div
            id="idCard"
            style={{
              width: "320px",
              margin: "0 auto",
              borderRadius: "0px",
              backgroundColor: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              fontFamily: "Arial, sans-serif",
              overflow: "hidden",
            }}
          >
            <div style={{ backgroundColor: "#1976d2", color: "#fff", padding: "40px 0" }}>
              <img
                src={
                  user.photo_url
                    ? `${API_URL.replace("/api", "")}${user.photo_url}`
                    : "/placeholder.svg"
                }
                alt="Profile"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  border: "4px solid white",
                  objectFit: "cover",
                }}
              />
              <h5 className="mt-3 mb-0 text-uppercase fw-semibold">{user.first_name}</h5>
              <p className="text-uppercase mb-0" style={{ fontSize: "0.9rem" }}>
                {user.designation}
              </p>
            </div>

            <div style={{ padding: "15px 25px", textAlign: "left" }}>
              {[
                ["Employee Number", user.emp_id],
                ["Department", user.department],
                ["Phone", user.phone],
                ["Email", user.email],
                ["Location", user.head_office],
                ["Blood Group", user.blood_group],
              ].map(([label, value]) => (


                <div className="row">
                  <div className="col-6 text-start">
                    <span className="f_10 fw-semibold text-muted">{label}</span>
                  </div>
                  <div className="col-6">

                      <span className="text-start w-100 f_10 fw-semibold text-muted">{value || "N/A"}</span>
              
                  </div>
                </div>


              ))}
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <img src="/img/sppl_logo.png" alt="SPPL" style={{ width: "80px", opacity: 0.9 }} />
              </div>
            </div>
          </div>

          <button onClick={downloadID} className="btn btn-success mt-4 px-4">
            Download ID
          </button>
        </div>
      </div>
    </>
  );
}

/* 🔹 Reusable Sections */

const ProfileSection = ({
  title,
  section,
  field,
  user,
  formData,
  editingSection,
  handleInputChange,
  handleSave,
  handleEditClick,
  isList = false,
}) => (
  <div className={`rounded-0 ${styles.card}`}>
    <div className={styles.cardHeader}>
      <h6 className={styles.cardTitle}>{title}</h6>
      <button className={styles.editBtn} onClick={() => handleEditClick(section)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
    </div>
    {editingSection === section ? (
      <textarea
        name={field || section}
        className={styles.textarea}
        value={formData[field || section] || ""}
        onChange={handleInputChange}
      />
    ) : isList ? (
      <ul className={styles.interestsList}>
        {user.interests
          ? user.interests.split(",").map((i, idx) => (
            <li key={idx} className={styles.interestItem}>
              <span className={styles.bullet}>•</span> {i.trim()}
            </li>
          ))
          : "No interests added"}
      </ul>
    ) : (
      <p className={styles.cardContent}>{user[field || section] || "N/A"}</p>
    )}
    {editingSection === section && (
      <div className={styles.buttonGroup}>
        <button className={styles.saveBtn} onClick={() => handleSave(section)}>
          Save
        </button>
        <button className={styles.cancelBtn} onClick={() => handleEditClick(null)}>
          Cancel
        </button>
      </div>
    )}
  </div>
);

const PersonalDetails = ({
  user,
  formData,
  editingSection,
  handleInputChange,
  handleSave,
  handleEditClick,
}) => (
  <div className={`rounded-0 ${styles.card}`}>
    <div className={styles.cardHeader}>
      <h6 className={styles.cardTitle}>Primary Details</h6>
      <button className={styles.editBtn} onClick={() => handleEditClick("personal")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
    </div>

    <div className={styles.detailsGrid}>
      {[
        ["FIRST NAME", "first_name"],
        ["LAST NAME", "last_name"],
        ["MOBILE NO", "phone"],
        ["GENDER", "gender"],
        ["DATE OF BIRTH", "dob"],
        ["MARITAL STATUS", "marital_status"],
        ["PHYSICALLY HANDICAPPED", "physically_handicapped"],
        ["NATIONALITY", "nationality"],
        ["BLOOD GROUP", "blood_group"],
      ].map(([label, name]) => (
        <div key={name} className={styles.detailCol}>
          <p className={styles.detailLabel}>{label}</p>
          {editingSection === "personal" ? (
            name === "dob" ? (
              <input
                type="date"
                name="dob"
                className={styles.input}
                value={
                  formData.dob ? new Date(formData.dob).toISOString().split("T")[0] : ""
                }
                onChange={handleInputChange}
              />
            ) : ["gender", "marital_status", "physically_handicapped"].includes(name) ? (
              <select
                name={name}
                className={styles.input}
                value={formData[name] || ""}
                onChange={handleInputChange}
              >
                <option value="">Select</option>
                {name === "gender" && (
                  <>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </>
                )}
                {name === "marital_status" && (
                  <>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                  </>
                )}
                {name === "physically_handicapped" && (
                  <>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </>
                )}
              </select>
            ) : (
              <input
                type="text"
                name={name}
                className={styles.input}
                value={formData[name] || ""}
                onChange={handleInputChange}
              />
            )
          ) : (
            <p className={styles.detailValue}>
              {name === "dob" && user.dob
                ? new Date(user.dob).toLocaleDateString("en-GB")
                : user[name] || "N/A"}
            </p>
          )}
        </div>
      ))}
    </div>

    {editingSection === "personal" && (
      <div className={styles.buttonGroup}>
        <button className={styles.saveBtn} onClick={() => handleSave("personal")}>
          Save
        </button>
        <button className={styles.cancelBtn} onClick={() => handleEditClick(null)}>
          Cancel
        </button>
      </div>
    )}
  </div>
);
