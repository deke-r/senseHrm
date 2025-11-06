import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Create WFH request
router.post("/", verifyToken, async (req, res) => {
  try {
    const { from_date, to_date, total_days, half_type = "Full Day", note } = req.body;
    const user_id = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO wfh_requests (user_id, from_date, to_date, total_days, half_type, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, from_date, to_date, total_days, half_type, note]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("WFH POST ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get requests for current user (or admin can fetch all)
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    // if admin you may return all; here return user's requests
    const [rows] = await pool.query(
      `SELECT * FROM wfh_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("WFH GET ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
