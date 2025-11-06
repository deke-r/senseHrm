import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 📨 Configure transporter
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // e.g. info@senseprojects.in
    pass: process.env.SMTP_PASS,
  },
});

// ✉️ Minimal Email Template
export const sendNotificationEmail = async ({ to, subject, heading, message, summaryData = {} }) => {
  try {
    // 🧾 Summary Table
    let summaryTable = "";
    if (summaryData && Object.keys(summaryData).length > 0) {
      summaryTable = `
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:20px;border-collapse:collapse;font-family:'Poppins',Arial,sans-serif;font-size:15px;line-height:24px;color:#202020;">
          ${Object.entries(summaryData)
            .map(
              ([key, value]) => `
              <tr>
                <td width="40%" style="padding:4px 0;font-weight:500;color:#202020;">${key}</td>
                <td style="padding:4px 0;color:#202020;">${value}</td>
              </tr>`
            )
            .join("")}
        </table>
      `;
    }

    // 📄 HTML Template (Keka-style)
    const html = `
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
        </head>
        <body style="margin:0;padding:40px 0;background-color:#f5f5f5;font-family:'Poppins',Arial,sans-serif;">
          <center>
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="border:1px solid #e4e4e4;background-color:#ffffff;">
              <tbody>
                <!-- Header -->
                <tr>
                  <td valign="top" style="padding:20px 30px;text-align:center;border-bottom:2px solid #4390ef;">
                    <h1 style="margin:0;font-size:18px;color:#000;">${heading}</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td valign="top" style="padding:40px 50px;text-align:left;color:#202020;font-size:15px;line-height:24px;">
                    ${message}
                    ${summaryTable}
                    <br><br>
                    <span style="color:#202020;">Thank you,</span><br>
                    <span style="color:#202020;font-weight:600;">Sense Projects HR</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </center>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Sense Projects HR" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📩 Email sent successfully to ${to}`);
  } catch (err) {
    console.error("❌ Email send error:", err);
  }
};
