import React, { useState } from "react";
import { T } from "../App";
import { User, Phone, MapPin, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage({ onGoToLogin }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [county, setCounty] = useState("Machakos");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone,
          username: username || undefined,
          county: county,
          password: password,
          invite_code: inviteCode || undefined,
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("🎉 Account created! Redirecting to sign in…");
        setTimeout(() => onGoToLogin(), 1800);
      } else {
        setErrorMsg(data.detail || "Registration processing failed.");
      }
    } catch (err) {
      setErrorMsg("Unable to connect to backend server. Make sure FastAPI is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#051122", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", width: "100%", maxWidth: "440px", padding: "40px" }}>
        
        {/* Branding & Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: T.accent, marginBottom: "12px" }} />
          <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 900, margin: 0, letterSpacing: "0.02em" }}>Create Account</h2>
          <p style={{ color: T.textDim, fontSize: "14px", marginTop: "6px" }}>Join MkulimaSmart for data-driven farming insights</p>
        </div>

        {/* Success Notification Banner */}
        {successMsg && (
          <div style={{ background: "rgba(45, 122, 58, 0.15)", border: "1px solid #2d7a3a", color: "#2d7a3a", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
            {successMsg}
          </div>
        )}

        {/* Error Notification Banner */}
        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid #ef4444", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Username Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="reg-username" style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>
              Username <span style={{ color: T.textDim, fontWeight: 400, textTransform: "none" }}>(optional for log in)</span>
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input
                type="text"
                id="reg-username"
                placeholder="e.g. john_mwangi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%", background: "#039464", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          {/* Full Name Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="reg-fullname" style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Full Name</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input 
                type="text" 
                id="reg-fullname"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: "100%", background: "#039464", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
                required
              />
            </div>
          </div>

          {/* Phone Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="reg-phone" style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Phone Number</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Phone size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input 
                type="tel" 
                id="reg-phone"
                placeholder="e.g. 0789654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", background: "#039464", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
                required
              />
            </div>
          </div>

          {/* County Select Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="reg-county" style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>County Location</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <MapPin size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <select 
                id="reg-county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                style={{ width: "100%", background: "#039464", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none", cursor: "pointer", appearance: "none" }}
              >
                <option value="Machakos">Machakos</option>
                <option value="Kitui">Kitui</option>
                <option value="Makueni">Makueni</option>
              </select>
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="reg-password" style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input 
                id="reg-password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", background: "#039464", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
                required
              />
            </div>
          </div>

          {/* Invite Code — optional, for admin registration */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label htmlFor="reg-invite" style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>
              Admin Invite Code <span style={{ color: T.textDim, fontWeight: 400, textTransform: "none" }}>(leave blank for farmer account)</span>
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input
                type="password"
                id="reg-invite"
                placeholder="Team invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                style={{ width: "100%", background: "#039464", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>

          {/* Action Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            style={{ background: T.accent, color: "#ffffff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "15px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "12px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Registering user..." : "Register Account"} <ArrowRight size={16} />
          </button>
        </form>

        {/* Navigation Link Back to Login */}
        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: T.textDim }}>
          Already have an account?{" "}
          <span 
            onClick={onGoToLogin} 
            style={{ color: T.accent, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
          >
            Sign in instead
          </span>
        </div>

      </div>
    </div>
  );
}