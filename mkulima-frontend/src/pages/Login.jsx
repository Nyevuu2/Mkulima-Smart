import React, { useState } from "react";
import { T, API_BASE } from "../App";
import { Lock, User, ArrowRight, WifiOff, AlertCircle } from "lucide-react";

// Wraps fetch with an AbortController timeout so the button can never hang forever
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export default function LoginPage({ onLogin, onGoToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorType, setErrorType] = useState(""); // "network" | "auth" | ""
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setErrorType("");
    setLoading(true);

    try {
      const response = await fetchWithTimeout(
        `${API_BASE}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "application/json",
          },
          body: JSON.stringify({ username, password }),
        },
        10000 // 10-second timeout
      );

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setErrorType("auth");
        setErrorMsg(data.detail || "Incorrect username or password.");
      }
    } catch (err) {
      setErrorType("network");
      if (err.name === "AbortError") {
        setErrorMsg("Request timed out. The server took too long to respond — check that FastAPI is running.");
      } else {
        setErrorMsg("Cannot reach the server. Make sure FastAPI is running on port 8000.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#070a0e",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: "16px",
        width: "100%",
        maxWidth: "420px",
        padding: "40px",
      }}>

        {/* Branding Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: T.accent, marginBottom: "12px" }} />
          <h2 style={{ color: "#fff", fontSize: "28px", fontWeight: 900, margin: 0, letterSpacing: "0.02em" }}>MkulimaSmart</h2>
          <p style={{ color: T.textDim, fontSize: "14px", marginTop: "6px" }}>Sign in to manage your farm inputs and forecasts</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: "rgba(239, 68, 68, 0.10)",
            border: "1px solid #ef4444",
            color: "#f87171",
            padding: "12px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}>
            {errorType === "network"
              ? <WifiOff size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              : <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            }
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Username / Phone */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="login-username" style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>
              Username / Phone
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={16} color={T.textDim} style={{ position: "absolute", left: "14px", pointerEvents: "none" }} />
              <input
                id="login-username"
                type="text"
                placeholder="e.g. 0789654321"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                style={{ width: "100%", background: "#039464", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label htmlFor="login-password" style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>
              Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock size={16} color={T.textDim} style={{ position: "absolute", left: "14px", pointerEvents: "none" }} />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ width: "100%", background: "#039464", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? T.textDim : T.accent,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
              transition: "background 0.2s",
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "14px", height: "14px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
                Verifying…
              </>
            ) : (
              <> Sign In <ArrowRight size={16} /> </>
            )}
          </button>
        </form>

        {/* Spinner keyframe — injected once */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/* Register link */}
        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: T.textDim }}>
          Don't have an account?{" "}
          <span
            onClick={onGoToRegister}
            style={{ color: T.accent, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          >
            Register here
          </span>
        </div>

      </div>
    </div>
  );
}