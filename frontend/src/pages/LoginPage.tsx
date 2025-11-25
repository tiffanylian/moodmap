import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/submit");
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginWithEmail(email);
      setEmailSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send login email"
      );
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">📧 Check your email</h1>
          <p className="auth-subtitle">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
          <p className="auth-subtitle">
            Click the link in your email to continue. The link will bring you
            back here and automatically sign you in.
          </p>
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #0ea5e9",
              padding: 12,
              borderRadius: 6,
              marginTop: 16,
              fontSize: 14,
            }}
          >
            💡 <strong>First time?</strong> You'll get a "Confirm your signup"
            email.
            <br />
            <strong>Returning?</strong> You'll get a "Magic link" email.
          </div>
          <button
            onClick={() => setEmailSent(false)}
            className="auth-button"
            style={{ marginTop: 16 }}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Sign in to MoodMap</h1>
        <p className="auth-subtitle">Enter your Penn email to get started.</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div>
            <label className="auth-label">Penn email</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              placeholder="name@upenn.edu"
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ color: "#ef4444", fontSize: 14, marginTop: -8 }}>
              {error}
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Sending..." : "Continue"}
          </button>
        </form>

        <div className="auth-footer">
          MoodMap @ Penn · anonymous mood pins, one campus
        </div>
      </div>
    </div>
  );
}
