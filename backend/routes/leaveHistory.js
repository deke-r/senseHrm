import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { sendNotificationEmail } from "../utils/mailer.js";

const router = express.Router();

// 📅 Helper
const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ✅ Get all history (leave + wfh + partial)
router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [leaves] = await pool.query(
      `SELECT 
        'Leave' AS category,
        id,
        CONCAT(DATE_FORMAT(from_date, '%d %b %Y'),
          IF(from_date != to_date, CONCAT(' - ', DATE_FORMAT(to_date, '%d %b %Y')), ''),
          IF(half_day IS NOT NULL, CONCAT(' (', half_day, ')'), '')
        ) AS date,
        leave_category AS type,
        status,
        note,
        created_at AS actionOn,
        'Self' AS requestedBy,
        cancel_reason AS reason
       FROM employee_leaves
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const [wfh] = await pool.query(
      `SELECT 
        'Work From Home' AS category,
        id,
        CONCAT(DATE_FORMAT(from_date, '%d %b %Y'),
          IF(from_date != to_date, CONCAT(' - ', DATE_FORMAT(to_date, '%d %b %Y')), '')
        ) AS date,
        'WFH Request' AS type,
        status,
        note,
        created_at AS actionOn,
        'Self' AS requestedBy,
        cancel_reason AS reason
       FROM wfh_requests
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const [partial] = await pool.query(
      `SELECT 
        'Partial Day' AS category,
        id,
        DATE_FORMAT(request_date, '%d %b %Y') AS date,
        CONCAT('Partial Day (', half, ')') AS type,
        status,
        note,
        created_at AS actionOn,
        'Self' AS requestedBy,
        cancel_reason AS reason
       FROM partial_day_requests
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const combined = [...leaves, ...wfh, ...partial].sort(
      (a, b) => new Date(b.actionOn) - new Date(a.actionOn)
    );

    res.json(combined);
  } catch (err) {
    console.error("❌ Leave History Error:", err);
    res.status(500).json({ message: "Failed to fetch leave history" });
  }
});

// ✅ Cancel request
router.post("/cancel", verifyToken, async (req, res) => {
  const { id, type, reason } = req.body;
  const userId = req.user.id;

  if (!id || !type || !reason)
    return res.status(400).json({ message: "All fields are required" });

  let table = "";
  if (type === "Leave") table = "employee_leaves";
  else if (type === "Work From Home") table = "wfh_requests";
  else if (type === "Partial Day") table = "partial_day_requests";
  else return res.status(400).json({ message: "Invalid request type" });

  try {
    // ✅ Verify record
    const [rows] = await pool.query(
      `SELECT * FROM ${table} WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Request not found" });

    const reqData = rows[0];
    if (reqData.status !== "pending")
      return res
        .status(400)
        .json({ message: "Only pending requests can be cancelled" });

    // ✅ Update status to cancelled
    await pool.query(
      `UPDATE ${table} SET status = 'cancelled', cancel_reason = ? WHERE id = ?`,
      [reason, id]
    );

    // ✅ Fetch user details
    const [userRows] = await pool.query(
      "SELECT name, email FROM users WHERE id = ?",
      [userId]
    );
    const { name, email } = userRows[0];
    const hrEmail = "hr@senseprojects.in";

    // ✅ Summary
    const summary = {
      "Request Type": type,
      "Request ID": id,
      "Date Range":
        reqData.from_date && reqData.to_date
          ? `${formatDate(reqData.from_date)} - ${formatDate(reqData.to_date)}`
          : reqData.request_date
          ? formatDate(reqData.request_date)
          : "-",
      "Status": "Cancelled",
      "Reason": reason,
    };

    // ✅ Send mail to user
    await sendNotificationEmail({
      to: email,
      subject: `${type} Request Cancelled`,
      heading: `${type} Request Cancelled`,
      message: `Hi <strong>${name}</strong>, your ${type} request has been successfully cancelled.`,
      summaryData: summary,
    });

    // ✅ Send mail to HR
    await sendNotificationEmail({
      to: hrEmail,
      subject: `${type} Request Cancelled - ${name}`,
      heading: `${type} Request Cancelled by Employee`,
      message: `<strong>${name}</strong> has cancelled their ${type} request.`,
      summaryData: summary,
    });

    res.json({ success: true, message: `${type} request cancelled successfully` });
  } catch (err) {
    console.error("❌ Cancel Error:", err);
    res.status(500).json({ message: "Error cancelling request" });
  }
});

export default router;
