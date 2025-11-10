import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/* ===============================
   🎉 Get All Users (Basic Info)
================================ */
router.get("/all", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, dob, doj, department, designation, photo_url FROM users WHERE status='active'"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;
