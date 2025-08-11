import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { Link } from "react-router-dom";
import { FiMail, FiArrowRight, FiCheckCircle } from "react-icons/fi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const userResetPass = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:3000/login",
        handleCodeInApp: false,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error sending reset email:", err);
      setError(err.message.includes("user-not-found") 
        ? "No account found with this email" 
        : "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await userResetPass();
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-header">
          <h2 className="forgot-title">Reset Password</h2>
          <p className="forgot-subtitle">Enter your email to receive a reset link</p>
        </div>

        {error && (
          <div className="forgot-error">
            {error}
          </div>
        )}

        {success ? (
          <div className="forgot-success">
            <FiCheckCircle className="success-icon" />
            <p>Password reset email sent! Check your inbox.</p>
          </div>
        ) : (
          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon">
                <FiMail />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="forgot-btn" 
              disabled={loading}
            >
              {loading ? (
                <span>Sending Email...</span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>
        )}

        <div className="forgot-footer">
          Remember your password?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;