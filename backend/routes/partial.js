import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { sendNotificationEmail } from "../utils/mailer.js";

const router = express.Router();

// 📅 Format date as DD-MM-YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

router.post("/", verifyToken, async (req, res) => {
  try {
    const { request_date, half, note } = req.body;

    if (!request_date || !half || !note)
      return res.status(400).json({ message: "All fields are required" });

    const userId = req.user.id;

    // ✅ Fetch user details
    const [userRows] = await pool.query("SELECT name, email FROM users WHERE id = ?", [userId]);
    if (!userRows.length) return res.status(404).json({ message: "User not found" });

    const { name, email } = userRows[0];

    // ✅ Insert request
    await pool.query(
      `INSERT INTO partial_day_requests (user_id, request_date, half, note, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [userId, request_date, half, note]
    );

    const hrEmail = "hr@senseprojects.in";

    // ✅ Email summary
    const summary = {
      "Request Date": formatDate(request_date),
      "Half Type": half,
      "Note": note,
    };

    // ✅ Send email to Employee
    await sendNotificationEmail({
      to: email,
      subject: "Partial Day Request Submitted Successfully",
      heading: "Partial Day Request Confirmation",
      message: `Hi <strong>${name}</strong>, your partial day request has been submitted successfully.`,
      summaryData: summary,
    });

    // ✅ Send email to HR
    await sendNotificationEmail({
      to: hrEmail,
      subject: `Partial Day Request - ${name}`,
      heading: `New Partial Day Request from ${name}`,
      message: `A new partial day request has been submitted by <strong>${name}</strong>.`,
      summaryData: summary,
    });

    res.json({ success: true, message: "Partial day request submitted successfully" });
  } catch (err) {
    console.error("❌ PARTIAL POST ERROR:", err);
    res.status(500).json({ success: false, message: "Error submitting partial day request" });
  }
});

export default router;
