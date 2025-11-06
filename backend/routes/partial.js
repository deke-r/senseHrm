import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Create partial day request (single date)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { date, half, note } = req.body; // date: YYYY-MM-DD, half: 'First Half'|'Second Half'
    const user_id = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO partial_day_requests (user_id, date, half, note)
       VALUES (?, ?, ?, ?)`,
      [user_id, date, half, note]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("PARTIAL POST ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// List partial requests for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await pool.query(
      `SELECT * FROM partial_day_requests WHERE user_id = ? ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("PARTIAL GET ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
