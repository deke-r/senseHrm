"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../../style/DashboardSections.module.css";
import PostPanel from "./PostPanel";
import { Trash } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

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

  // ✅ Open modal before delete
  const confirmDelete = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedPost) return;

    try {
      await axios.delete(`${API_URL}/posts/${selectedPost.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
      toast.success("Post deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete post");
    } finally {
      setShowModal(false);
      setSelectedPost(null);
    }
  };

  const handlePostCreated = async (newPostData) => {
    if (newPostData) {
      setPosts((prev) => [newPostData, ...prev]);
    } else {
      setTimeout(fetchPosts, 500);
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
                  {post.author || post.name || "Unknown User"}
                </p>
                <small className="text-muted f_12">
                  {new Date(post.created_at).toLocaleString()}
                </small>
              </div>

              {userId === post.user_id && (
                <button
                  className="btn border-0 rounded-pill f_12"
                  onClick={() => confirmDelete(post)}
                  style={{backgroundColor:'lightgray'}}
                >
                  <Trash className="text-muted" size={16} />
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

      {/* 🧱 Bootstrap Delete Confirmation Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-2 border-0 shadow-sm">
              <div className="modal-header">
                <h6 className="modal-title fw-semibold text-dark">
                  Confirm Delete
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0 f_14 text-muted">
                  Are you sure you want to delete this post?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary rounded-0"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger rounded-0"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
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
