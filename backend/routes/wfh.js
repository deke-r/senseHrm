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

router.post("/workfromhome", verifyToken, async (req, res) => {
  try {

    console.log("📦 Incoming body:", req.body);
    console.log("👤 User ID:", req.user);
    const { from_date, to_date, total_days, half_type = "Full Day", note } = req.body;

    if (!from_date || !to_date || !note)
      return res.status(400).json({ message: "All fields are required" });

    const userId = req.user.id;

    // ✅ Fetch user details
    const [userRows] = await pool.query("SELECT name, email FROM users WHERE id = ?", [userId]);
    if (!userRows.length) return res.status(404).json({ message: "User not found" });

    const { name, email } = userRows[0];

    // ✅ Insert WFH request
    await pool.query(
      `INSERT INTO wfh_requests (user_id, from_date, to_date, total_days, half_type, note, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [userId, from_date, to_date, total_days, half_type, note]
    );

    const hrEmail = "hr@senseprojects.in";

    // ✅ Email summary
    const summary = {
      "From Date": formatDate(from_date),
      "To Date": formatDate(to_date),
      "Total Days": `${total_days} day(s)`,
      "Half Type": half_type,
      "Note": note,
    };

    // ✅ Send email to Employee
    await sendNotificationEmail({
      to: email,
      subject: "Work From Home Request Submitted Successfully",
      heading: "Work From Home Request Confirmation",
      message: `Hi <strong>${name}</strong>, your Work From Home request has been submitted successfully.`,
      summaryData: summary,
    });

    // ✅ Send email to HR
    await sendNotificationEmail({
      to: hrEmail,
      subject: `Work From Home Request - ${name}`,
      heading: `New Work From Home Request from ${name}`,
      message: `A new WFH request has been submitted by <strong>${name}</strong>.`,
      summaryData: summary,
    });

    res.json({ success: true, message: "WFH request submitted successfully" });
  } catch (err) {
    console.error("❌ WFH POST ERROR:", err);
    res.status(500).json({ success: false, message: "Error submitting WFH request" });
  }
});

export default router;
