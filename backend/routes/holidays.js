import express from "express";
import multer from "multer";
import fs from "fs"; // ✅ Moved import to top (static import)
import path from "path";
import pool from "../db/config.js";

const router = express.Router();



// ✅ Configure Multer storage for holiday images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/holidays");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ----------------------------------------------------
// ✅ Fetch all holidays (sorted by date ascending)
// ----------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM holidays ORDER BY date ASC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching holidays:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// ✅ Add new holiday (with image upload)
// ----------------------------------------------------
router.post("/", upload.single("image"), async (req, res) => {
  const { name, date } = req.body;
  const imagePath = req.file ? `/uploads/holidays/${req.file.filename}` : null;

  if (!name || !date) {
    return res
      .status(400)
      .json({ success: false, message: "Name and date are required" });
  }

  try {
    await pool.query("INSERT INTO holidays (name, date, image) VALUES (?, ?, ?)", [
      name,
      date,
      imagePath,
    ]);
    res.json({ success: true, message: "Holiday added successfully" });
  } catch (err) {
    console.error("❌ DB ERROR (Add Holiday):", err);
    res.status(500).json({ success: false, message: "Error adding holiday" });
  }
});

// ----------------------------------------------------
// ✅ Update holiday (replace image if provided)
// ----------------------------------------------------
router.patch("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, date } = req.body;
  const newImagePath = req.file ? `/uploads/holidays/${req.file.filename}` : null;

  try {
    // Get current holiday
    const [rows] = await pool.query("SELECT image FROM holidays WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    let imagePath = rows[0].image;

    // If new image uploaded, delete old one
    if (newImagePath) {
      const oldImagePath = path.join(".", imagePath || "");
      if (imagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      imagePath = newImagePath;
    }

    await pool.query(
      "UPDATE holidays SET name = ?, date = ?, image = ? WHERE id = ?",
      [name, date, imagePath, id]
    );

    res.json({ success: true, message: "Holiday updated successfully" });
  } catch (err) {
    console.error("❌ DB ERROR (Update Holiday):", err);
    res.status(500).json({ success: false, message: "Error updating holiday" });
  }
});

// ----------------------------------------------------
// ✅ Delete holiday (and its image file)
// ----------------------------------------------------
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT image FROM holidays WHERE id = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Holiday not found" });
    }

    const imagePath = rows[0].image;
    if (imagePath) {
      const filePath = path.join(".", imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // ✅ safely deletes image
      }
    }

    await pool.query("DELETE FROM holidays WHERE id = ?", [id]);
    res.json({ success: true, message: "Holiday deleted successfully" });
  } catch (err) {
    console.error("❌ DB ERROR (Delete Holiday):", err);
    res.status(500).json({ success: false, message: "Error deleting holiday" });
  }
});

export default router;
