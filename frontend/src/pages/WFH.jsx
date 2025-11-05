"use client"
import React from "react";

import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { Home, Plus, Check, X } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function WFH() {
  const { token, user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const [wfhRequests, setWfhRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchWFHRequests()
  }, [])

  const fetchWFHRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/wfh`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setWfhRequests(data)
    } catch (error) {
      toast.error("Failed to load WFH requests")
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/wfh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Submit failed")
      toast.success("WFH request submitted")
      setShowModal(false)
      reset()
      fetchWFHRequests()
    } catch (error) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  const updateWFHStatus = async (wfhId, status) => {
    try {
      const response = await fetch(`${API_URL}/wfh/${wfhId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Update failed")
      toast.success(`WFH request ${status}`)
      fetchWFHRequests()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const canApprove = user?.role === "admin" || user?.role === "hr"
  const displayRequests = user?.role === "employee" ? wfhRequests.filter((w) => w.user_id === user.id) : wfhRequests

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-3 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Work From Home</h1>
          </div>
          {user?.role === "employee" && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Request WFH
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Employee</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Reason</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                {canApprove && <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayRequests.map((request) => (
                <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">Employee #{request.user_id}</td>
                  <td className="px-6 py-4 text-gray-700">{request.date}</td>
                  <td className="px-6 py-4 text-gray-700">{request.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  {canApprove && request.status === "pending" && (
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => updateWFHStatus(request.id, "approved")}
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateWFHStatus(request.id, "rejected")}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Request Work From Home</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    {...register("date", { required: "Date is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    {...register("reason", { required: "Reason is required" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                    rows="3"
                  ></textarea>
                  {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
