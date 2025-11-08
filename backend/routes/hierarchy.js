import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/* Recursive function to build tree */
const buildTree = (users, managerId = null) => {
  return users
    .filter((u) => u.reporting_manager_id === managerId)
    .map((u) => ({
      id: u.id,
      name: u.name,
      designation: u.designation,
      department: u.department,
      photo_url: u.photo_url,
      role: u.role,
      subordinates: buildTree(users, u.id),
    }));
};

/* GET Hierarchy Tree */
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, designation, department, photo_url, role, reporting_manager_id 
      FROM users WHERE status='active'
    `);

    const cmd = rows.find((u) => u.role === "admin");
    let roots;

    if (cmd) {
      roots = [
        {
          id: cmd.id,
          name: cmd.name,
          designation: cmd.designation || "CMD",
          department: cmd.department,
          photo_url: cmd.photo_url,
          role: cmd.role,
          subordinates: buildTree(rows, cmd.id),
        },
      ];
    } else {
      roots = rows
        .filter((u) => u.reporting_manager_id === null)
        .map((u) => ({
          id: u.id,
          name: u.name,
          designation: u.designation,
          department: u.department,
          photo_url: u.photo_url,
          role: u.role,
          subordinates: buildTree(rows, u.id),
        }));
    }

    res.json(roots);
  } catch (err) {
    console.error("❌ Hierarchy error:", err);
    res.status(500).json({ message: "Error fetching hierarchy" });
  }
});

export default router;
