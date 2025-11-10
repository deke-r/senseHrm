import React from "react";
import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { MessageSquare, Send, Bell } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function Feed() {
  const { token, user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const [posts, setPosts] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("feed")

  useEffect(() => {
    fetchFeed()
    fetchAnnouncements()
  }, [])

  const fetchFeed = async () => {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      toast.error("Failed to load feed")
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      toast.error("Failed to load announcements")
    }
  }

  const onSubmitPost = async (data) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: data.content }),
      })
      if (!response.ok) throw new Error("Submit failed")
      toast.success("Post created")
      reset()
      fetchFeed()
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const onSubmitAnnouncement = async (data) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/announcements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: data.title, content: data.content }),
      })
      if (!response.ok) throw new Error("Submit failed")
      toast.success("Announcement posted")
      reset()
      fetchAnnouncements()
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const canPostAnnouncement = user?.role === "admin" || user?.role === "hr"

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Feed</h1>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("feed")}
              className={`px-6 py-2 rounded-lg font-semibold ${
                activeTab === "feed"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Posts
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-6 py-2 rounded-lg font-semibold ${
                activeTab === "announcements"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Bell className="w-5 h-5 inline mr-2" />
              Announcements
            </button>
          </div>
        </div>

        {activeTab === "feed" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Create a Post</h2>
              <form onSubmit={handleSubmit(onSubmitPost)} className="space-y-4">
                <textarea
                  {...register("content", { required: "Content is required" })}
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows="4"
                ></textarea>
                {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" /> Post
                </button>
              </form>
            </div>

            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {post.name?.charAt(0) || "U"}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">{post.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-gray-700">{post.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="space-y-6">
            {canPostAnnouncement && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Post Announcement</h2>
                <form onSubmit={handleSubmit(onSubmitAnnouncement)} className="space-y-4">
                  <div>
                    <input
                      {...register("title", { required: "Title is required" })}
                      placeholder="Announcement Title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                  </div>
                  <textarea
                    {...register("content", { required: "Content is required" })}
                    placeholder="Announcement content..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows="4"
                  ></textarea>
                  {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" /> Post Announcement
                  </button>
                </form>
              </div>
            )}

            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{announcement.title}</h3>
                <p className="text-gray-600 mb-3">{announcement.content}</p>
                <p className="text-sm text-gray-500">{new Date(announcement.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
