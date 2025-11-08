import express from "express";
import pool from "../db/config.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { sendNotificationEmail } from "../utils/mailer.js";

const router = express.Router();

/* ==============================================
   ✅ Fetch all requests (Leave + WFH + Partial)
================================================= */
router.get("/requests", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 'Leave' AS category, id, user_id, leave_category AS type,
             CONCAT(
               DATE_FORMAT(from_date, '%d %b %Y'),
               IF(from_date != to_date, CONCAT(' - ', DATE_FORMAT(to_date, '%d %b %Y')), '')
             ) AS duration,
             note, status,
             DATE_FORMAT(created_at, '%d %b %Y %h:%i %p') AS applied_on,
             cancel_reason AS reason
      FROM employee_leaves

      UNION ALL

      SELECT 'Work From Home', id, user_id, 'WFH Request' AS type,
             CONCAT(
               DATE_FORMAT(from_date, '%d %b %Y'),
               IF(from_date != to_date, CONCAT(' - ', DATE_FORMAT(to_date, '%d %b %Y')), '')
             ) AS duration,
             note, status,
             DATE_FORMAT(created_at, '%d %b %Y %h:%i %p') AS applied_on,
             cancel_reason AS reason
      FROM wfh_requests

      UNION ALL

      SELECT 'Partial Day', id, user_id, CONCAT('Partial Day (', half, ')') AS type,
             DATE_FORMAT(request_date, '%d %b %Y') AS duration,
             note, status,
             DATE_FORMAT(created_at, '%d %b %Y %h:%i %p') AS applied_on,
             cancel_reason AS reason
      FROM partial_day_requests

      ORDER BY applied_on DESC
    `);

    const userIds = rows.map((r) => r.user_id);
    if (userIds.length) {
      const [users] = await pool.query(
        "SELECT id, name, email FROM users WHERE id IN (?)",
        [userIds]
      );
      const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
      rows.forEach((r) => {
        r.employee_name = userMap[r.user_id]?.name || "Unknown";
        r.email = userMap[r.user_id]?.email || "—";
      });
    }

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

/* ==============================================
   ✅ Update request status (approve/reject)
================================================= */
router.post("/update-status", verifyToken, async (req, res) => {
  try {
    const { id, type, status, reason } = req.body;
    const hrId = req.user.id;

    if (!id || !type || !status)
      return res.status(400).json({ message: "Missing required fields" });

    let table;
    if (type === "Leave") table = "employee_leaves";
    else if (type === "Work From Home") table = "wfh_requests";
    else if (type === "Partial Day") table = "partial_day_requests";
    else return res.status(400).json({ message: "Invalid type" });

    await pool.query(
      `UPDATE ${table} SET status = ?, cancel_reason = ? WHERE id = ?`,
      [status, reason, id]
    );

    // Get user email
    const [userData] = await pool.query(
      `SELECT u.name, u.email FROM ${table} t JOIN users u ON t.user_id = u.id WHERE t.id = ?`,
      [id]
    );
    const user = userData[0];
    const hrEmail = "hr@senseprojects.in";

    const summary = {
      Type: type,
      Status: status.charAt(0).toUpperCase() + status.slice(1),
      Reason: reason || "—",
    };

    await sendNotificationEmail({
      to: user.email,
      subject: `${type} Request ${status}`,
      heading: `${type} Request ${status}`,
      message: `Hi <strong>${user.name}</strong>, your ${type} request has been <b>${status}</b>.`,
      summaryData: summary,
    });

    await sendNotificationEmail({
      to: hrEmail,
      subject: `${type} Request ${status} - ${user.name}`,
      heading: `${type} Request ${status}`,
      message: `${user.name}'s ${type} request was marked as <b>${status}</b>.`,
      summaryData: summary,
    });

    res.json({ success: true, message: `Request ${status} successfully` });
  } catch (err) {
    console.error("❌ Update Status Error:", err);
    res.status(500).json({ message: "Error updating status" });
  }
});

export default router;
