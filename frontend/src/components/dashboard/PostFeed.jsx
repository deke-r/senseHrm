"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../../style/DashboardSections.module.css";
import PostPanel from "./PostPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.id);
      } catch {
        console.warn("Invalid token");
      }
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${API_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  // ✅ Called when a post is created successfully
  const handlePostCreated = async (newPostData) => {
    // Option 1: Optimistic update (add immediately)
    if (newPostData) {
      setPosts((prev) => [newPostData, ...prev]);
    } else {
      // Option 2: Force re-fetch if no data returned
      setTimeout(fetchPosts, 500); // small delay to ensure DB commit
    }
  };

  if (loading) {
    return <div className="text-center py-5 text-muted f_13">Loading posts...</div>;
  }

  return (
    <div className={`mt-4 ${styles.postFeed}`}>
      {/* 📝 Create Post */}
      <PostPanel onPostCreated={handlePostCreated} />

      <h5 className={`f_13 ms-1 fw-semibold ${styles.sectionTitle}`}>Latest Posts</h5>

      {!posts.length ? (
        <div className="text-center py-5 text-muted f_13">No posts yet.</div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className={`${styles.postCard} mb-4 p-3 shadow-sm rounded`}>
            {/* 🧍 Author Info */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <p className="mb-0 fw-semibold text-dark f_14">
                  {post.name || "Unknown User"}
                </p>
                <small className="text-muted f_12">
                  {new Date(post.created_at).toLocaleString()}
                </small>
              </div>

              {userId === post.user_id && (
                <button
                  className="btn btn-sm btn-outline-danger rounded-0 f_12"
                  onClick={() => handleDelete(post.id)}
                >
                  Delete
                </button>
              )}
            </div>

            {/* ✍️ Content */}
            {post.content && (
              <p className="mb-3 f_13 text-muted" style={{ whiteSpace: "pre-wrap" }}>
                {highlightMentions(post.content)}
              </p>
            )}

            {/* 🖼️ Image */}
            {post.image_url && (
              <div className="mb-2">
                <img
                  src={`${API_URL.replace("/api", "")}${post.image_url}`}
                  alt="Post"
                  className="img-fluid w-100 rounded"
                  style={{ maxHeight: "450px", objectFit: "cover" }}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// 🔍 Highlight mentions visually
function highlightMentions(text = "") {
  const regex = /@(\w+)/g;
  return text.split(regex).map((part, i) =>
    part.match(/^\w+$/) ? (
      <span key={i} className="text-primary fw-semibold">@{part}</span>
    ) : (
      part
    )
  );
}
