"use client";
import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import styles from "../../style/DashboardSections.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PostPanel({ onPostCreated }) {
  const [activeTab, setActiveTab] = useState("post");
  const [content, setContent] = useState("");
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const textareaRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = async (e) => {
    const value = e.target.value;
    setContent(value);

    const lastChar = value.slice(-1);
    if (lastChar === "@") {
      try {
        const res = await axios.get(`${API_URL}/posts/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUsers(res.data);
        setFilteredUsers(res.data);
        setShowDropdown(true);
      } catch {
        toast.error("Failed to fetch users");
      }
    } else {
      const match = value.split("@").pop().toLowerCase();
      if (showDropdown && match) {
        const filtered = users.filter((u) =>
          u.name.toLowerCase().includes(match)
        );
        setFilteredUsers(filtered);
      } else {
        setShowDropdown(false);
      }
    }
  };

  const handleSelectUser = (user) => {
    const newText = content.replace(/@\w*$/, `@${user.name} `);
    setContent(newText);
    setMentions((prev) => [...new Set([...prev, user.id])]);
    setShowDropdown(false);
    textareaRef.current.focus();
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("type", activeTab);
    formData.append("content", content);
    formData.append("mentions", JSON.stringify(mentions));
    if (image) formData.append("image", image);

    try {
      const res = await axios.post(`${API_URL}/posts/post`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Post created successfully");
      setContent("");
      setMentions([]);
      setImage(null);
      setPreview(null);
      setShowDropdown(false);

      // ✅ Inform parent about the new post (instant update)
      const newPost = {
        id: Date.now(),
        author: "You",
        user_id: JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id,
        content,
        image_url: res.data?.image_url || null,
        created_at: new Date().toISOString(),
      };
      if (onPostCreated) onPostCreated(newPost);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create post");
    }
  };

  return (
    <div className={`mt-4 position-relative ${styles.postPanel}`}>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "post" ? styles.active : ""}`}
          onClick={() => setActiveTab("post")}
        >
          <i className="bi bi-pencil-square me-1 text-pink"></i> Post
        </button>
        <button
          className={`${styles.tab} ${activeTab === "poll" ? styles.active : ""}`}
          onClick={() => setActiveTab("poll")}
        >
          <i className="bi bi-bar-chart-fill me-1 text-success"></i> Poll
        </button>
        <button
          className={`${styles.tab} ${activeTab === "praise" ? styles.active : ""}`}
          onClick={() => setActiveTab("praise")}
        >
          <i className="bi bi-award me-1 text-warning"></i> Praise
        </button>
      </div>

      {/* Textarea */}
      <div className="position-relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="Write your post here and mention your peers"
          className={styles.textarea}
        ></textarea>

        {showDropdown && filteredUsers.length > 0 && (
          <ul className={styles.mentionList}>
            {filteredUsers.map((u) => (
              <li key={u.id} onClick={() => handleSelectUser(u)}>
                @{u.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="preview" width="100%" className="rounded" />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <label className="btn btn-light btn-sm border me-2">
            <i className="bi bi-image text-success me-1"></i> Attach Image
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
        </div>

        <button onClick={handleSubmit} className={styles.postButton}>
          +
        </button>
      </div>
    </div>
  );
}
