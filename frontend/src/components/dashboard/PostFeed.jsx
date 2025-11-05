"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../../style/DashboardSections.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5 text-muted f_13">Loading posts...</div>;
  }

  if (!posts.length) {
    return <div className="text-center py-5 text-muted f_13">No posts yet.</div>;
  }

  return (
    <div className={`mt-4 ${styles.postFeed}`}>
      <h5 className={`f_13 ms-1 fw-semibold ${styles.sectionTitle}`}>Latest Posts</h5>

      {posts.map((post) => (
        <div key={post.id} className={`${styles.postCard} mb-4`}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <p className="mb-0 f_13 fw-semibold text-dark">
                {post.author}
              </p>
              <small className="text-muted f_12">
                {new Date(post.created_at).toLocaleString()}
              </small>
            </div>
            <div>
              {post.type === "praise" && (
                <span className="badge bg-warning text-dark f_12 px-2 py-1">Praise</span>
              )}
              {post.type === "poll" && (
                <span className="badge bg-info text-dark f_12 px-2 py-1">Poll</span>
              )}
              {post.type === "post" && (
                <span className="badge bg-secondary text-light f_12 px-2 py-1">Post</span>
              )}
            </div>
          </div>

          {/* Content */}
          <p className="mb-3 f_13 text-muted" style={{ whiteSpace: "pre-wrap" }}>
            {highlightMentions(post.content)}
          </p>

          {/* Image */}
          {post.image_url && (
            <div className="mb-3">
              <img
                src={`${API_URL.replace("/api", "")}${post.image_url}`}
                alt="Post"
                className="img-fluid w-100"
                style={{
                  maxHeight: "480px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}

          {/* Mentions */}
          {post.mentions && post.mentions.length > 0 && (
            <div className="small text-muted f_12">
              Mentions:{" "}
              {JSON.parse(post.mentions)
                .map((m) => `@User${m}`)
                .join(", ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 🧠 Highlight mentions
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
