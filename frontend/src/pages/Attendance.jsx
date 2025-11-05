"use client"
import React from "react";

import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { toast } from "react-toastify"
import { Clock, LogIn, LogOut } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function Attendance() {
  const { token, user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setAttendance(data)

      // Check if user checked in today
      const today = new Date().toISOString().split("T")[0]
      const todayRecord = data.find((a) => a.date === today && !a.check_out)
      setCheckedIn(!!todayRecord)
    } catch (error) {
      toast.error("Failed to load attendance")
    }
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ check_in: new Date() }),
      })
      if (!response.ok) throw new Error("Check-in failed")
      toast.success("Checked in successfully")
      setCheckedIn(true)
      fetchAttendance()
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const handleCheckOut = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ check_out: new Date() }),
      })
      if (!response.ok) throw new Error("Check-out failed")
      toast.success("Checked out successfully")
      setCheckedIn(false)
      fetchAttendance()
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const displayAttendance = user?.role === "employee" ? attendance.filter((a) => a.user_id === user.id) : attendance

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-600 p-3 rounded-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        </div>

        {user?.role === "employee" && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <p className="text-gray-600 mb-4">Current Status: {checkedIn ? "Checked In" : "Not Checked In"}</p>
            <div className="flex gap-4">
              <button
                onClick={handleCheckIn}
                disabled={checkedIn || loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" /> Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!checkedIn || loading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" /> Check Out
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Employee</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Check In</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Check Out</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayAttendance.map((record) => (
                <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">Employee #{record.user_id}</td>
                  <td className="px-6 py-4 text-gray-700">{record.date}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {record.check_in ? new Date(record.check_in).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {record.check_out ? new Date(record.check_out).toLocaleTimeString() : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        record.status === "present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
