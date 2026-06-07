import React, { useState } from "react";
import { T } from "../App";
import { Lock, User, ArrowRight } from "lucide-react";

export default function LoginPage({ onLogin, onGoToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Pass the authenticated user session dictionary up to App state
        onLogin(data.user);
      } else {
        setErrorMsg(data.detail || "Invalid login credentials");
      }
    } catch (err) {
      setErrorMsg("Unable to connect to backend server. Make sure FastAPI is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#070a0e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", width: "100%", maxWidth: "420px", padding: "40px" }}>
        
        {/* Branding Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: T.accent, marginBottom: "12px" }} />
          <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 900, margin: 0, letterSpacing: "0.02em" }}>MkulimaSmart</h2>
          <p style={{ color: T.textDim, fontSize: "14px", marginTop: "6px" }}>Sign in to manage your farm inputs and forecasts</p>
        </div>

        {/* Local Error Alert Display */}
        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Account Identifier Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Username / Phone</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input 
                type="text" 
                placeholder="e.g. 0789654321"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
                required
              />
            </div>
          </div>

          {/* Secure Credential Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
                required
              />
            </div>
          </div>

          {/* Submission Handler Controls */}
          <button 
            type="submit"
            disabled={loading}
            style={{ background: T.accent, color: "#000", border: "none", borderRadius: "8px", padding: "14px", fontSize: "15px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Verifying Credentials..." : "Sign In to System"} <ArrowRight size={16} />
          </button>
        </form>

        {/* Layout Sub-Navigation Switcher */}
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