"use client"
import React from "react";

import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { toast } from "react-toastify"
import { Users, Calendar, FileText, TrendingUp, Cake } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function Dashboard() {
  const { token, user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast.error("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-10 text-xl">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's what's happening in your company today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Employees */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalEmployees || 0}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          {/* Pending Leaves */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Leaves</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingLeaves || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Announcements</p>
                <p className="text-3xl font-bold text-gray-900">{Math.floor(Math.random() * 10) + 1}</p>
              </div>
              <FileText className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Performance</p>
                <p className="text-3xl font-bold text-gray-900">{Math.floor(Math.random() * 30) + 70}%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Upcoming Birthdays & Anniversaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Birthdays */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cake className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-900">Upcoming Birthdays</h2>
            </div>
            <div className="space-y-3">
              {stats?.upcomingBirthdays && stats.upcomingBirthdays.length > 0 ? (
                stats.upcomingBirthdays.map((birthday) => (
                  <div key={birthday.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{birthday.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(birthday.dob).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Cake className="w-5 h-5 text-pink-600" />
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No birthdays coming up</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/employees"
                className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-semibold transition"
              >
                View All Employees
              </a>
              <a
                href="/leaves"
                className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-semibold transition"
              >
                Manage Leaves
              </a>
              <a
                href="/attendance"
                className="block p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-semibold transition"
              >
                View Attendance
              </a>
              <a
                href="/feed"
                className="block p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-700 font-semibold transition"
              >
                Company Feed
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
