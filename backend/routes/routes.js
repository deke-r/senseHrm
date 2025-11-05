import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import pool from "../db/config.js"
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router()

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})



// ========== AUTHENTICATION ROUTES ==========

// Signup
router.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role, dob, doj, department } = req.body
    console.log(req.body)

    const conn = await pool.getConnection()
    const [existing] = await conn.execute("SELECT * FROM users WHERE email = ?", [email])

    if (existing.length > 0) {
      conn.release()
      return res.status(400).json({ error: "Email already registered" })
    }
    console.log('2')

    const hashedPassword = await bcrypt.hash(password, 10)
    try {
      await conn.execute(
        "INSERT INTO users (name, email, password, role, dob, doj, department) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          email,
          hashedPassword,
          role || "employee",
          dob || null,
          doj || null,
          department || null,
        ]
      )
      conn.release()
      res.status(201).json({ message: "User registered successfully" })
    } catch (err) {
      console.error("DB Error:", err)
      conn.release()
      return res.status(500).json({ error: err.message })
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🟢 Login attempt with:", email, password);

    const conn = await pool.getConnection();
    const [users] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
    conn.release();

    console.log("🔍 Query result:", users);

    if (users.length === 0) {
      console.log("❌ No user found for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    console.log("🧠 Found user:", user);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("🔑 Password valid?", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.log("⚠️ Missing JWT_SECRET in .env");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("✅ Login successful:", user.email);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("💥 Login Error:", error);
    res.status(500).json({ error: error.message });
  }
});


// Forgot Password - Send OTP
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otp_expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    const conn = await pool.getConnection()
    const [users] = await conn.execute("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      conn.release()
      return res.status(404).json({ error: "User not found" })
    }

    await conn.execute("UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?", [otp, otp_expiry, email])
    conn.release()

    await transporter.sendMail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    })

    res.json({ message: "OTP sent to your email" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Verify OTP and Reset Password
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    const conn = await pool.getConnection()
    const [users] = await conn.execute("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      conn.release()
      return res.status(404).json({ error: "User not found" })
    }

    const user = users[0]
    if (user.otp !== otp || new Date() > new Date(user.otp_expiry)) {
      conn.release()
      return res.status(400).json({ error: "Invalid or expired OTP" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await conn.execute("UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?", [
      hashedPassword,
      email,
    ])
    conn.release()

    res.json({ message: "Password reset successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== EMPLOYEE MANAGEMENT ROUTES ==========

// Get all employees
router.get("/employees", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const conn = await pool.getConnection()
    const [employees] = await conn.execute(
      "SELECT id, name, email, role, department, dob, doj FROM users WHERE role = ?",
      ["employee"],
    )
    conn.release()

    res.json(employees)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get employee profile
router.get("/employees/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params

    if (req.user.role === "employee" && req.user.id !== Number.parseInt(id)) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const conn = await pool.getConnection()
    const [employees] = await conn.execute(
      "SELECT id, name, email, role, department, dob, doj FROM users WHERE id = ?",
      [id],
    )
    conn.release()

    if (employees.length === 0) {
      return res.status(404).json({ error: "Employee not found" })
    }

    res.json(employees[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add new employee (Admin/HR only)
router.post("/employees", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { name, email, password, department, dob, doj } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const conn = await pool.getConnection()
    const result = await conn.execute(
      "INSERT INTO users (name, email, password, role, department, dob, doj) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, "employee", department, dob, doj],
    )
    conn.release()

    res.status(201).json({ id: result[0].insertId, message: "Employee added successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update employee (Admin/HR only)
router.put("/employees/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { id } = req.params
    const { name, email, department, dob, doj } = req.body

    const conn = await pool.getConnection()
    await conn.execute("UPDATE users SET name = ?, email = ?, department = ?, dob = ?, doj = ? WHERE id = ?", [
      name,
      email,
      department,
      dob,
      doj,
      id,
    ])
    conn.release()

    res.json({ message: "Employee updated successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete employee (Admin only)
router.delete("/employees/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { id } = req.params
    const conn = await pool.getConnection()
    await conn.execute("DELETE FROM users WHERE id = ?", [id])
    conn.release()

    res.json({ message: "Employee deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== LEAVE MANAGEMENT ROUTES ==========

// Apply for leave
router.post("/leaves", verifyToken, async (req, res) => {
  try {
    const { from_date, to_date, reason } = req.body

    const conn = await pool.getConnection()
    await conn.execute("INSERT INTO leaves (user_id, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, ?)", [
      req.user.id,
      from_date,
      to_date,
      reason,
      "pending",
    ])
    conn.release()

    res.status(201).json({ message: "Leave request submitted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get leaves for employee
router.get("/leaves", verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection()
    let query = "SELECT * FROM leaves"
    let params = []

    if (req.user.role === "employee") {
      query += " WHERE user_id = ?"
      params = [req.user.id]
    }

    const [leaves] = await conn.execute(query, params)
    conn.release()

    res.json(leaves)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Approve/Reject leave (HR/Admin only)
router.put("/leaves/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { id } = req.params
    const { status } = req.body

    const conn = await pool.getConnection()
    await conn.execute("UPDATE leaves SET status = ? WHERE id = ?", [status, id])
    conn.release()

    res.json({ message: "Leave request updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== ATTENDANCE ROUTES ==========

// Mark attendance
router.post("/attendance", verifyToken, async (req, res) => {
  try {
    const { check_in, check_out } = req.body
    const today = new Date().toISOString().split("T")[0]

    const conn = await pool.getConnection()
    const [existing] = await conn.execute("SELECT * FROM attendance WHERE user_id = ? AND date = ?", [
      req.user.id,
      today,
    ])

    if (existing.length > 0) {
      // Update existing attendance
      await conn.execute("UPDATE attendance SET check_out = ?, status = ? WHERE user_id = ? AND date = ?", [
        check_out || new Date(),
        "present",
        req.user.id,
        today,
      ])
    } else {
      // Create new attendance
      await conn.execute("INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, ?)", [
        req.user.id,
        today,
        check_in || new Date(),
        "present",
      ])
    }

    conn.release()
    res.json({ message: "Attendance recorded" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get attendance records
router.get("/attendance", verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection()
    let query = "SELECT * FROM attendance"
    let params = []

    if (req.user.role === "employee") {
      query += " WHERE user_id = ?"
      params = [req.user.id]
    }

    const [attendance] = await conn.execute(query, params)
    conn.release()

    res.json(attendance)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== WFH MANAGEMENT ROUTES ==========

// Submit WFH request
router.post("/wfh", verifyToken, async (req, res) => {
  try {
    const { date, reason } = req.body

    const conn = await pool.getConnection()
    await conn.execute("INSERT INTO wfh_requests (user_id, date, reason, status) VALUES (?, ?, ?, ?)", [
      req.user.id,
      date,
      reason,
      "pending",
    ])
    conn.release()

    res.status(201).json({ message: "WFH request submitted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get WFH requests
router.get("/wfh", verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection()
    let query = "SELECT * FROM wfh_requests"
    let params = []

    if (req.user.role === "employee") {
      query += " WHERE user_id = ?"
      params = [req.user.id]
    }

    const [wfh] = await conn.execute(query, params)
    conn.release()

    res.json(wfh)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update WFH status (HR/Admin only)
router.put("/wfh/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { id } = req.params
    const { status } = req.body

    const conn = await pool.getConnection()
    await conn.execute("UPDATE wfh_requests SET status = ? WHERE id = ?", [status, id])
    conn.release()

    res.json({ message: "WFH request updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== POSTS ROUTES ==========

// Create post
router.post("/posts", verifyToken, async (req, res) => {
  try {
    const { content } = req.body

    const conn = await pool.getConnection()
    const result = await conn.execute("INSERT INTO posts (user_id, content, created_at) VALUES (?, ?, NOW())", [
      req.user.id,
      content,
    ])
    conn.release()

    res.status(201).json({ id: result[0].insertId, message: "Post created" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all posts
router.get("/posts", verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection()
    const [posts] = await conn.execute(
      "SELECT p.*, u.name FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC",
    )
    conn.release()

    res.json(posts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== ANNOUNCEMENTS ROUTES ==========

// Create announcement (HR/Admin only)
router.post("/announcements", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { title, content } = req.body

    const conn = await pool.getConnection()
    const result = await conn.execute("INSERT INTO announcements (title, content, created_at) VALUES (?, ?, NOW())", [
      title,
      content,
    ])
    conn.release()

    res.status(201).json({ id: result[0].insertId, message: "Announcement created" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get announcements
router.get("/announcements", verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection()
    const [announcements] = await conn.execute("SELECT * FROM announcements ORDER BY created_at DESC")
    conn.release()

    res.json(announcements)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== DASHBOARD STATS ==========

// Get dashboard statistics
router.get("/dashboard/stats", verifyToken, async (req, res) => {
  try {
    const conn = await pool.getConnection()

    // Total employees
    const [employeeCount] = await conn.execute("SELECT COUNT(*) as count FROM users WHERE role = ?", ["employee"])

    // Upcoming birthdays (next 7 days)
    const [birthdays] = await conn.execute(
      `SELECT id, name, dob FROM users WHERE role = 'employee' AND MONTH(dob) = MONTH(NOW()) AND DAY(dob) BETWEEN DAY(NOW()) AND DAY(NOW()) + 7`,
    )

    // Pending leave requests
    const [pendingLeaves] = await conn.execute(
      "SELECT COUNT(*) as count FROM leaves WHERE status = ? AND user_id = ?",
      ["pending", req.user.id],
    )

    conn.release()

    res.json({
      totalEmployees: employeeCount[0].count,
      upcomingBirthdays: birthdays,
      pendingLeaves: pendingLeaves[0].count,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
