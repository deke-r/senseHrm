import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import pool from "../db/config.js";
import { sendNotificationEmail } from "../utils/mailer.js";

const router = express.Router();

// ✅ Helper: Format date as DD-MM-YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

router.post("/apply", verifyToken, async (req, res) => {
  try {
    const { leave_category, leave_type, half_day, from_date, to_date, total_days, note } = req.body;

    if (!from_date || !to_date || !note)
      return res.status(400).json({ message: "All fields are required" });

    const userId = req.user.id;

    // ✅ Fetch user details from USERS table (not employees)
    const [userRows] = await pool.query("SELECT name, email FROM users WHERE id = ?", [userId]);
    if (!userRows.length) return res.status(404).json({ message: "User not found" });

    const { name, email } = userRows[0];

    // ✅ Insert Leave Record
    await pool.query(
      `INSERT INTO employee_leaves 
       (user_id, leave_category, leave_type, half_day, from_date, to_date, total_days, note, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, leave_category, leave_type, half_day || null, from_date, to_date, total_days, note]
    );

    const hrEmail = "bhavishya.sense@gmail.com";

    // ✅ Email Summary
    const summary = {
      "Leave Type": leave_category,
      "Duration": leave_type === "half" ? "Half Day" : "Full Day",
      "From Date": formatDate(from_date),
      "To Date": formatDate(to_date),
      "Total Days": `${total_days} day(s)`,
      "Note": note,
    };

    // ✅ Email to Employee (confirmation)
    await sendNotificationEmail({
      to: email,
      subject: "Leave Request Submitted Successfully",
      heading: "Leave Request Confirmation",
      message: `Hi <strong>${name}</strong>, your leave request has been submitted successfully.`,
      summaryData: summary,
    });

    // ✅ Email to HR (notification)
    await sendNotificationEmail({
      to: hrEmail,
      subject: `Employee Leave Request - ${name}`,
      heading: `New Leave Request from ${name}`,
      message: `A new leave request has been submitted by <strong>${name}</strong>.`,
      summaryData: summary,
    });

    res.json({ success: true, message: "Leave applied and emails sent successfully" });
  } catch (err) {
    console.error("❌ Leave apply error:", err);
    res.status(500).json({ message: "Error applying for leave" });
  }
});

export default router;
