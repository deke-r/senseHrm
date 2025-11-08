import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";
import bcrypt from "bcryptjs";

const router = express.Router();

/* ==========================================
   ✅ Fetch All Employees (Excluding Admin)
   ========================================== */
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, name, email, phone, role, department, designation,
        reporting_manager_id, reporting_manager_name, status, created_at
      FROM users
      WHERE role != 'admin'
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching employees:", err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
});

/* ==========================================
   ✅ Add New Employee (auto ID)
   ========================================== */
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      department,
      designation,
      password,
      reporting_manager_id,
      reporting_manager_name,
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email & password are required" });

    // Prevent self reporting
    if (reporting_manager_id && req.user?.id === reporting_manager_id) {
      return res.status(400).json({ message: "An employee cannot report to themselves" });
    }

    // Check duplicate
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users 
      (name, email, phone, role, department, designation, password, 
       reporting_manager_id, reporting_manager_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        name,
        email,
        phone || null,
        role || "employee",
        department || null,
        designation || null,
        hashed,
        reporting_manager_id || null,
        reporting_manager_name || null,
      ]
    );

    res.json({ success: true, message: "Employee added successfully" });
  } catch (err) {
    console.error("❌ Add employee error:", err);
    res.status(500).json({ message: "Error adding employee" });
  }
});

/* ==========================================
   ✅ Update Employee
   ========================================== */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      role,
      department,
      designation,
      reporting_manager_id,
      reporting_manager_name,
    } = req.body;

    // Prevent self reporting
    if (reporting_manager_id && Number(id) === Number(reporting_manager_id)) {
      return res.status(400).json({ message: "An employee cannot report to themselves" });
    }

    const [rows] = await pool.query("SELECT id FROM users WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Employee not found" });

    await pool.query(
      `UPDATE users 
       SET name=?, phone=?, role=?, department=?, designation=?, 
           reporting_manager_id=?, reporting_manager_name=? 
       WHERE id=?`,
      [
        name,
        phone || null,
        role,
        department || null,
        designation || null,
        reporting_manager_id || null,
        reporting_manager_name || null,
        id,
      ]
    );

    res.json({ success: true, message: "Employee updated successfully" });
  } catch (err) {
    console.error("❌ Update employee error:", err);
    res.status(500).json({ message: "Error updating employee" });
  }
});

/* ==========================================
   ✅ Toggle Active / Inactive
   ========================================== */
router.patch("/:id/toggle", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT status FROM users WHERE id = ?", [id]);

    if (!rows.length) return res.status(404).json({ message: "Employee not found" });

    const newStatus = rows[0].status === "active" ? "inactive" : "active";
    await pool.query("UPDATE users SET status = ? WHERE id = ?", [newStatus, id]);

    res.json({ success: true, message: `Employee ${newStatus} successfully` });
  } catch (err) {
    console.error("❌ Toggle error:", err);
    res.status(500).json({ message: "Failed to toggle employee status" });
  }
});

export default router;
