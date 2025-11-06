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

const upload = multer({ storage });

/* ===============================
   👤 GET Profile
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
   ✏️ Update Personal Details (safe & full name auto-update)
================================ */
router.put("/personal", verifyToken, async (req, res) => {
  try {
    let {
      phone,
      dob,
      gender,
      first_name,
      last_name,
      marital_status,
      physically_handicapped,
      nationality,
      blood_group,
    } = req.body;

    // ✅ Normalize DOB
    if (dob) {
      try {
        const parsed = new Date(dob);
        if (!isNaN(parsed.getTime())) dob = parsed.toISOString().split("T")[0];
        else if (dob.includes("-")) {
          const parts = dob.split("-");
          if (parts[2].length === 4) dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
        } else dob = null;
      } catch {
        dob = null;
      }
    }

    const query = `
      UPDATE users 
      SET 
        phone = COALESCE(?, phone),
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        gender = COALESCE(?, gender),
        marital_status = COALESCE(?, marital_status),
        physically_handicapped = COALESCE(?, physically_handicapped),
        nationality = COALESCE(?, nationality),
        blood_group = COALESCE(?, blood_group),
        dob = COALESCE(?, dob),
        name = TRIM(CONCAT_WS(' ', COALESCE(first_name, ''), COALESCE(last_name, '')))
      WHERE id = ?
    `;

    await pool.query(query, [
      phone || null,
      first_name || null,
      last_name || null,
      gender || null,
      marital_status || null,
      physically_handicapped || null,
      nationality || null,
      blood_group || null,
      dob || null,
      req.user.id,
    ]);

    res.json({ success: true, message: "Personal details updated successfully ✅" });
  } catch (err) {
    console.error("❌ Error updating personal:", err);
    res.status(500).json({ message: "Error updating personal details" });
  }
});

/* ===============================
   🎓 Qualification
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
    res.status(500).json({ message: "Error updating qualification details" });
  }
});

/* ===============================
   🪪 ID Details
================================ */
router.put("/id", verifyToken, async (req, res) => {
  const { aadhar_no, pan_no, emp_id } = req.body;
  try {
    await pool.query(
      "UPDATE users SET aadhar_no = ?, pan_no = ?, emp_id = ? WHERE id = ?",
      [aadhar_no || null, pan_no || null, emp_id || null, req.user.id]
    );
    res.json({ success: true, message: "ID details updated successfully" });
  } catch {
    res.status(500).json({ message: "Error updating ID details" });
  }
});

/* ===============================
   🖼️ Profile Photo
================================ */
router.put("/photo", verifyToken, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  const photo_url = `/uploads/profile/${req.file.filename}`;
  try {
    await pool.query("UPDATE users SET photo_url = ? WHERE id = ?", [photo_url, req.user.id]);
    res.json({ success: true, message: "Profile photo updated successfully", photo_url });
  } catch {
    res.status(500).json({ message: "Error updating profile photo" });
  }
});

/* ===============================
   🧠 About / Interests / Job Pref
================================ */
router.put("/about", verifyToken, async (req, res) => {
  const { about } = req.body;
  try {
    await pool.query("UPDATE users SET about = ? WHERE id = ?", [about, req.user.id]);
    res.json({ success: true, message: "About updated successfully" });
  } catch {
    res.status(500).json({ message: "Error updating about" });
  }
});

router.put("/interests", verifyToken, async (req, res) => {
  const { interests } = req.body;
  try {
    await pool.query("UPDATE users SET interests = ? WHERE id = ?", [interests, req.user.id]);
    res.json({ success: true, message: "Interests updated successfully" });
  } catch {
    res.status(500).json({ message: "Error updating interests" });
  }
});

router.put("/job", verifyToken, async (req, res) => {
  const { job_preference } = req.body;
  try {
    await pool.query("UPDATE users SET job_preference = ? WHERE id = ?", [job_preference, req.user.id]);
    res.json({ success: true, message: "Job preference updated successfully" });
  } catch {
    res.status(500).json({ message: "Error updating job preference" });
  }
});

export default router;
