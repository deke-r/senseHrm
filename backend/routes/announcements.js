import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import pool from "../db/config.js";

const router = express.Router();

/* ===============================
   📢 Get All Announcements
================================ */
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM announcements ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching announcements" });
  }
});

/* ===============================
   ➕ Add Announcement
================================ */
router.post("/anc", verifyToken, async (req, res) => {
  try {
    console.log(req.body)
    const { title, description, valid_from, valid_to } = req.body;
    if (!title || !valid_from || !valid_to)
      return res.status(400).json({ message: "Title and validity dates are required" });

    await pool.query(
      "INSERT INTO announcements (title, description, valid_from, valid_to) VALUES (?, ?, ?, ?)",
      [title, description || "", valid_from, valid_to]
    );
    res.json({ success: true, message: "Announcement added successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding announcement" });
  }
});

/* ===============================
   ✏️ Update Announcement
================================ */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, valid_from, valid_to } = req.body;
    await pool.query(
      "UPDATE announcements SET title=?, description=?, valid_from=?, valid_to=? WHERE id=?",
      [title, description, valid_from, valid_to, req.params.id]
    );
    res.json({ success: true, message: "Announcement updated successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Error updating announcement" });
  }
});

/* ===============================
   🔁 Toggle Status
================================ */
router.patch("/:id/toggle", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT status FROM announcements WHERE id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Announcement not found" });

    const newStatus = rows[0].status === "active" ? "inactive" : "active";
    await pool.query("UPDATE announcements SET status=? WHERE id=?", [newStatus, req.params.id]);
    res.json({ message: `Announcement marked as ${newStatus}` });
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
});

export default router;
