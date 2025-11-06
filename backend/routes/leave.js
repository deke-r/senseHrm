import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import pool from "../db/config.js";

const router = express.Router();

/* ✅ Apply for leave */
router.post("/apply", verifyToken, async (req, res) => {
  try {
    const { leave_type, half_day, from_date, to_date, total_days, reason } = req.body;

    if (!from_date || !to_date || !reason)
      return res.status(400).json({ message: "All fields are required" });

    await pool.query(
      `INSERT INTO employee_leaves 
      (user_id, leave_type, half_day, from_date, to_date, total_days, reason) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, leave_type, half_day || null, from_date, to_date, total_days, reason]
    );

    res.json({ success: true, message: "Leave applied successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error applying for leave" });
  }
});

/* ✅ Fetch all leave requests for the logged-in user */
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM employee_leaves WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch leave records" });
  }
});

/* ✅ HR/Admin can approve/reject (optional) */
router.patch("/:id", verifyToken, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query("UPDATE employee_leaves SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ success: true, message: "Leave status updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating leave status" });
  }
});

export default router;
