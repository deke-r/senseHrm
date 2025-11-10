import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/verifyToken.js";
import pool from "../db/config.js";

const router = express.Router();

// ✅ Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/post");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Create Post (text optional if image is uploaded)
router.post("/post", verifyToken, upload.single("image"), async (req, res) => {
  console.log("✅ POST /api/posts/post hit");

  const { type, content, mentions } = req.body;
  const user_id = req.user.id;
  const image_url = req.file ? `/uploads/post/${req.file.filename}` : null;

  // Allow empty text only if an image is uploaded
  if (!content && !image_url) {
    return res.status(400).json({
      success: false,
      message: "Either content or image is required.",
    });
  }

  try {
    await pool.query(
      "INSERT INTO posts (user_id, type, content, mentions, image_url) VALUES (?, ?, ?, ?, ?)",
      [user_id, type || "post", content || "", JSON.stringify(mentions || []), image_url]
    );
    res.json({ success: true, message: "Post created successfully" });
  } catch (err) {
    console.error("❌ DB ERROR:", err);
    res.status(500).json({ success: false, message: "Error creating post" });
  }
});

// ✅ Fetch all posts (latest first)
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.user_id,
        u.name AS author,
        p.type,
        p.content,
        p.mentions,
        p.image_url,
        p.created_at
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    const formatted = rows.map((post) => ({
      ...post,
      mentions: post.mentions ? JSON.parse(post.mentions) : [],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
});

// ✅ Delete post (only author can delete)
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const [rows] = await pool.query("SELECT * FROM posts WHERE id = ?", [id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Post not found" });

    const post = rows[0];
    if (post.user_id !== user_id)
      return res
        .status(403)
        .json({ success: false, message: "You are not authorized to delete this post" });

    await pool.query("DELETE FROM posts WHERE id = ?", [id]);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting post:", err);
    res.status(500).json({ success: false, message: "Error deleting post" });
  }
});

// ✅ Fetch all users (for mentions)
router.get("/users", verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name FROM users ORDER BY name ASC");
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;
