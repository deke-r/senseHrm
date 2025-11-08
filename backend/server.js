import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import dotenv from "dotenv"
import routes from "./routes/routes.js"
import postsRouter from "./routes/posts.js";
import profileRoutes from "./routes/profile.js";
import leaveRoutes from "./routes/leave.js";
import wfhRoutes from "./routes/wfh.js";
import partialRoutes from "./routes/partial.js";
import leaveHistoryRoutes from "./routes/leaveHistory.js";
import path from "path";
import manageRoutes from './routes/manage.js';
import manageEmployeeRoutes from "./routes/manageEmployees.js";
import departmentRoutes from "./routes/departments.js";
import hierarchyRoutes from "./routes/hierarchy.js";

import { fileURLToPath } from "url";

// ✅ Fix __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors());
app.use( bodyParser.json({limit: '50mb'}) );
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit:50000
}));



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api", routes)
app.use("/api/posts", postsRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/wfh", wfhRoutes);
app.use("/api/partial", partialRoutes);
app.use("/api/leave", leaveHistoryRoutes);
app.use("/api/manage", manageRoutes);
app.use("/api/manage/employees", manageEmployeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/hierarchy", hierarchyRoutes);


// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Server is running" })
})

app.use((err, req, res, next) => {
  console.error("\n=== GLOBAL ERROR HANDLER ===");
  console.error("Error:", err);
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Database initialization
// const initializeDatabase = async () => {
//   try {
//     const conn = await pool.getConnection()

//     const tables = [
//       `CREATE TABLE IF NOT EXISTS users (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         role ENUM('employee', 'hr', 'admin') DEFAULT 'employee',
//         dob DATE,
//         doj DATE,
//         department VARCHAR(100),
//         otp VARCHAR(6),
//         otp_expiry DATETIME,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )`,
//       `CREATE TABLE IF NOT EXISTS leaves (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         from_date DATE NOT NULL,
//         to_date DATE NOT NULL,
//         reason TEXT,
//         status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES users(id)
//       )`,
//       `CREATE TABLE IF NOT EXISTS attendance (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         date DATE NOT NULL,
//         check_in DATETIME,
//         check_out DATETIME,
//         status ENUM('present', 'absent') DEFAULT 'present',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES users(id)
//       )`,
//       `CREATE TABLE IF NOT EXISTS wfh_requests (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         date DATE NOT NULL,
//         reason TEXT,
//         status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES users(id)
//       )`,
//       `CREATE TABLE IF NOT EXISTS posts (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         user_id INT NOT NULL,
//         content TEXT NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES users(id)
//       )`,
//       `CREATE TABLE IF NOT EXISTS announcements (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         title VARCHAR(255) NOT NULL,
//         content TEXT NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )`,
//     ]

//     for (const table of tables) {
//       await conn.execute(table)
//     }

//     console.log("Database tables initialized successfully")
//     conn.release()
//   } catch (error) {
//     console.error("Database initialization error:", error)
//     process.exit(1)
//   }
// }

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
