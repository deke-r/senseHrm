import express from "express";
import multer from "multer";
import path from "path";
import { verifyToken } from "../middleware/verifyToken.js";
import pool from "../db/config.js";

const router = express.Router();

/* ===============================
   📸 Multer setup for profile photos
================================ */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, "profile-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

/* ===============================
   👤 GET Profile (fetch current user details)
================================ */
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

/* ===============================
   ✏️ Update Personal Details
================================ */
router.put("/personal", verifyToken, async (req, res) => {
  const { phone, dob, gender } = req.body;
  try {
    await pool.query(
      "UPDATE users SET phone = ?, dob = ?, gender = ? WHERE id = ?",
      [phone || null, dob || null, gender || null, req.user.id]
    );
    res.json({ success: true, message: "Personal details updated successfully" });
  } catch (err) {
    console.error("Error updating personal:", err);
    res.status(500).json({ message: "Error updating personal details" });
  }
});

/* ===============================
   🎓 Update Qualification Details
================================ */
router.put("/qualification", verifyToken, async (req, res) => {
  const { education, specialization, experience } = req.body;
  try {
    await pool.query(
      "UPDATE users SET education = ?, specialization = ?, experience = ? WHERE id = ?",
      [education || null, specialization || null, experience || null, req.user.id]
    );
    res.json({ success: true, message: "Qualification details updated successfully" });
  } catch (err) {
    console.error("Error updating qualification:", err);
    res.status(500).json({ message: "Error updating qualification details" });
  }
});

/* ===============================
   🪪 Update ID Details (Aadhar, PAN, Employee ID)
================================ */
router.put("/id", verifyToken, async (req, res) => {
  const { aadhar_no, pan_no, emp_id } = req.body;
  try {
    await pool.query(
      "UPDATE users SET aadhar_no = ?, pan_no = ?, emp_id = ? WHERE id = ?",
      [aadhar_no || null, pan_no || null, emp_id || null, req.user.id]
    );
    res.json({ success: true, message: "ID details updated successfully" });
  } catch (err) {
    console.error("Error updating ID details:", err);
    res.status(500).json({ message: "Error updating ID details" });
  }
});

/* ===============================
   🖼️ Update Profile Photo
================================ */
router.put("/photo", verifyToken, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  const photo_url = `/uploads/profile/${req.file.filename}`;

  try {
    await pool.query("UPDATE users SET photo_url = ? WHERE id = ?", [photo_url, req.user.id]);
    res.json({ success: true, message: "Profile photo updated successfully", photo_url });
  } catch (err) {
    console.error("Error updating photo:", err);
    res.status(500).json({ message: "Error updating profile photo" });
  }
});

export default router;
