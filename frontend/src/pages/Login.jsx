
import React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import styles from "./Login.module.css"

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await login(data.email, data.password)
    if (result.success) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    }
     else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <div className={styles.loginContainer}>
      {/* Left Side - Image */}
      <div className={styles.loginImageSection}>
        <div className={styles.imageOverlay}>
          <div className={styles.brandContent}>
            {/* <h2>HRM System</h2>
            <p>Manage your human resources efficiently</p> */}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.loginFormSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1>Login to HRM</h1>
            <p>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label f_13 fw-semibold">Email or Username</label>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="form-control rounded-1 py-3 shadow-none fw-semibold text-muted f_13"
                placeholder="Enter email or username"
                disabled={loading}
              />
              {errors.email && <div className={styles.errorText}>{errors.email.message}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label f_13 fw-semibold">Password</label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="form-control rounded-1 py-3 shadow-none fw-semibold text-muted f_13"
                placeholder="Enter password"
                disabled={loading}
              />
              {errors.password && <div className={styles.errorText}>{errors.password.message}</div>}
            </div>

            <button type="submit" disabled={loading} className={`btn btn-primary w-100 ${styles.submitBtn}`}>
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <div className={styles.formFooter}>
            <Link to="/forgot-password">Forgot password?</Link>
            <div className="mt-3 pt-3 border-top">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className={styles.linkPrimary}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className={styles.bottomFooter}>
          <p>
            By logging in, you agree to our <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}
