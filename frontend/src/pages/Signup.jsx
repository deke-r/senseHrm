"use client"

import React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import styles from "./Signup.module.css"

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setLoading(true)
    const result = await signup({
      name: data.name,
      email: data.email,
      password: data.password,
      department: data.department || "General",
      role: "employee",
    })

    if (result.success) {
      toast.success("Signup successful! Please login.")
      navigate("/login")
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div className={styles.signupContainer}>
      {/* Left Side - Benefits */}
      <div className={styles.signupImageSection}>
        <div className={styles.imageOverlay}>
          <div className={styles.brandContent}>
            <h2>Join Our Team</h2>
            <p>Be part of our growing organization</p>
            <ul className={styles.featureList}>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                <span>Manage leaves easily</span>
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                <span>Track attendance</span>
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                <span>Request work from home</span>
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                <span>Connect with colleagues</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.signupFormSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1>Create Account</h1>
            <p>Sign up to start using HRM system</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="form-control"
                placeholder="Enter your full name"
                disabled={loading}
              />
              {errors.name && <div className={styles.errorText}>{errors.name.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="form-control"
                placeholder="Enter your email"
                disabled={loading}
              />
              {errors.email && <div className={styles.errorText}>{errors.email.message}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Department</label>
              <select {...register("department")} className="form-control" disabled={loading}>
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="form-control"
                placeholder="Enter password"
                disabled={loading}
              />
              {errors.password && <div className={styles.errorText}>{errors.password.message}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                {...register("confirmPassword", { required: "Please confirm password" })}
                className="form-control"
                placeholder="Confirm password"
                disabled={loading}
              />
              {errors.confirmPassword && <div className={styles.errorText}>{errors.confirmPassword.message}</div>}
            </div>

            <button type="submit" disabled={loading} className={`btn btn-primary w-100 ${styles.submitBtn}`}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p>
              Already have an account?{" "}
              <Link to="/login" className={styles.loginLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className={styles.bottomFooter}>
          <p>
            By signing up, you agree to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
