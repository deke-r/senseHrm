import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// ✅ Get all departments
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM departments ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

// ✅ Add new department
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Department name is required" });

    await pool.query("INSERT INTO departments (name, description) VALUES (?, ?)", [name, description || null]);
    res.json({ success: true, message: "Department added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to add department" });
  }
});

// ✅ Update department
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    await pool.query("UPDATE departments SET name = ?, description = ? WHERE id = ?", [name, description, id]);
    res.json({ success: true, message: "Department updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update department" });
  }
});

// ✅ Toggle active/inactive
router.patch("/:id/toggle", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT status FROM departments WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Department not found" });

    const newStatus = rows[0].status === "active" ? "inactive" : "active";
    await pool.query("UPDATE departments SET status = ? WHERE id = ?", [newStatus, id]);

    res.json({ success: true, message: `Department ${newStatus} successfully` });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle status" });
  }
});

// ✅ Delete department
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM departments WHERE id = ?", [id]);
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete department" });
  }
});

export default router;
