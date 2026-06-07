import React, { useState } from "react";
import { T } from "../App";
import { User, Phone, MapPin, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage({ onGoToLogin }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("Machakos");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
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
          county: county,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Registration successful! You can now log in.");
        onGoToLogin(); // Send user back to the login screen view layout
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
    <div style={{ background: "#070a0e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", width: "100%", maxWidth: "440px", padding: "40px" }}>
        
        {/* Branding & Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: T.accent, marginBottom: "12px" }} />
          <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 900, margin: 0, letterSpacing: "0.02em" }}>Create Account</h2>
          <p style={{ color: T.textDim, fontSize: "14px", marginTop: "6px" }}>Join MkulimaSmart for data-driven farming insights</p>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#f87171", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Full Name Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Full Name</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input 
                type="text" 
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
                required
              />
            </div>
          </div>

          {/* Phone Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Phone Number</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Phone size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input 
                type="tel" 
                placeholder="e.g. 0789654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }}
                required
              />
            </div>
          </div>

          {/* County Select Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>County Location</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <MapPin size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <select 
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none", cursor: "pointer", appearance: "none" }}
              >
                <option value="Machakos">Machakos</option>
                <option value="Kitui">Kitui</option>
                <option value="Makueni">Makueni</option>
              </select>
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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

          {/* Action Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            style={{ background: T.accent, color: "#000", border: "none", borderRadius: "8px", padding: "14px", fontSize: "15px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "12px", opacity: loading ? 0.7 : 1 }}
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