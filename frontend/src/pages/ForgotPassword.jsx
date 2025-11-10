import React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import styles from "./ForgotPassword.module.css"

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()
  const { forgotPassword, verifyOtp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const email = watch("email")

  const onSubmitEmail = async (data) => {
    setLoading(true)
    const result = await forgotPassword(data.email)
    if (result.success) {
      toast.success("OTP sent to your email")
      setStep(2)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  const onSubmitOtp = async (data) => {
    setLoading(true)
    const result = await verifyOtp(email, data.otp, data.newPassword)
    if (result.success) {
      toast.success("Password reset successfully! Please login.")
      setStep(1)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div className={styles.forgotContainer}>
      <div className={styles.forgotWrapper}>
        <div className={`${styles.forgotBox} card`}>
          {/* Header */}
          <div className={styles.forgotHeader}>
            <div className={styles.iconWrapper}>
              <i className="bi bi-key"></i>
            </div>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Recover your account access</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(step === 1 ? onSubmitEmail : onSubmitOtp)} className={styles.forgotForm}>
            {step === 1 ? (
              <>
                <div className="mb-4">
                  <label className="form-label fw-600">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      {...register("email", { required: "Email is required" })}
                      className="form-control"
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <div className="text-danger small mt-2">{errors.email.message}</div>}
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="form-label fw-600">OTP Code</label>
                  <input
                    type="text"
                    {...register("otp", { required: "OTP is required" })}
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                  {errors.otp && <div className="text-danger small mt-2">{errors.otp.message}</div>}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-600">New Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      {...register("newPassword", { required: "Password is required" })}
                      className="form-control"
                      placeholder="Enter new password"
                    />
                  </div>
                  {errors.newPassword && <div className="text-danger small mt-2">{errors.newPassword.message}</div>}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-100 fw-600 py-2 ${styles.submitBtn}`}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {step === 1 ? "Sending OTP..." : "Resetting..."}
                </>
              ) : (
                <>
                  <i className={`bi ${step === 1 ? "bi-envelope-arrow-right" : "bi-arrow-repeat"} me-2`}></i>
                  {step === 1 ? "Send OTP" : "Reset Password"}
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className={styles.forgotFooter}>
            <Link to="/login" className={styles.backLink}>
              <i className="bi bi-arrow-left me-2"></i>Back to login
            </Link>
          </div>
        </div>

        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>
            <span>1</span>
            <small>Email</small>
          </div>
          <div className={styles.connector}></div>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>
            <span>2</span>
            <small>Verify</small>
          </div>
        </div>
      </div>
    </div>
  )
}
