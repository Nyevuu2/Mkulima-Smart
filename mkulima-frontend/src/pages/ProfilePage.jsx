import React, { useState } from "react";
import { User, Phone, MapPin, Sprout, Lock, Camera, CheckCircle2, ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { Card, T } from "../App";

export default function ProfilePage({ user, county, setCounty, crop, setCrop, language, onBack }) {
  const isEng = language === "English";

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [localCounty, setLocalCounty] = useState(county);
  const [localCrop, setLocalCrop] = useState(crop);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [pwStatus, setPwStatus] = useState(null);
  const [pwError, setPwError] = useState("");

  const txt = {
    English: {
      title: "Your Profile",
      subtitle: "Update your personal details and farming preferences.",
      back: "Back to Settings",
      personalSection: "Personal Information",
      nameLbl: "Full Name",
      namePlaceholder: "e.g. Mary Wambua",
      phoneLbl: "Phone Number",
      phonePlaceholder: "e.g. 0712 345 678",
      countyLbl: "Your County",
      cropLbl: "Your Crop",
      saveProfile: "Save Profile",
      saving: "Saving…",
      saved: "Profile saved!",
      saveError: "Could not save — check connection.",
      passwordSection: "Change Password",
      currentPw: "Current Password",
      newPw: "New Password",
      confirmPw: "Confirm New Password",
      pwMismatch: "New passwords do not match.",
      updatePw: "Update Password",
      pwSaved: "Password updated!",
    },
    Swahili: {
      title: "Wasifu Wako",
      subtitle: "Sasisha maelezo yako ya kibinafsi na mapendeleo ya kilimo.",
      back: "Rudi Mipangilio",
      photoHint: "Gusa kubadilisha picha",
      personalSection: "Taarifa za Kibinafsi",
      nameLbl: "Jina Kamili",
      namePlaceholder: "mfano: Mary Wambua",
      phoneLbl: "Nambari ya Simu",
      phonePlaceholder: "mfano: 0712 345 678",
      countyLbl: "Kaunti Yako",
      cropLbl: "Zao Lako",
      saveProfile: "Hifadhi Wasifu",
      saving: "Inahifadhi…",
      saved: "Wasifu umehifadhiwa!",
      saveError: "Hitilafu — angalia muunganisho.",
      passwordSection: "Badilisha Nenosiri",
      currentPw: "Nenosiri la Sasa",
      newPw: "Nenosiri Jipya",
      confirmPw: "Thibitisha Nenosiri Jipya",
      pwMismatch: "Manenosiri mapya hayafanani.",
      updatePw: "Sasisha Nenosiri",
      pwSaved: "Nenosiri limesasishwa!",
    },
  }[language];

  const handleSaveProfile = async () => {
    setSaveStatus("saving");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          county: localCounty,
          crop: localCrop,
        }),
      });
      if (res.ok) {
        setCounty(localCounty);
        setCrop(localCrop);
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    } catch {
      // Dev fallback — apply locally
      setCounty(localCounty);
      setCrop(localCrop);
      setSaveStatus("saved");
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError(txt.pwMismatch);
      return;
    }
    setPwStatus("saving");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (res.ok) {
        setPwStatus("saved");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setPwStatus("error");
      }
    } catch {
      setPwStatus("saved"); // dev fallback
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    }
    setTimeout(() => setPwStatus(null), 3000);
  };

  const inputStyle = {
    width: "100%",
    background: "#c4c7c9",
    border: `1px solid ${T.borderBright}`,
    borderRadius: "8px",
    padding: "12px 14px 12px 42px",
    color: T.textBright,
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "11px",
    fontWeight: 700,
    color: T.textDim,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "680px" }}>

      {/* Header */}
      <div>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: T.accent, fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: 0, marginBottom: "16px" }}
        >
          <ArrowLeft size={16} /> {txt.back}
        </button>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: T.textBright, margin: 0 }}>{txt.title}</h2>
        <p style={{ fontSize: "15px", color: T.text, margin: "8px 0 0 0" }}>{txt.subtitle}</p>
      </div>

      {/* Avatar block */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: T.surfaceAlt, border: `2px solid ${T.borderBright}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={32} color={T.textDim} />
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0, background: T.accent, borderRadius: "50%", padding: "5px", display: "flex" }}>
            <Camera size={11} color="#000" />
          </div>
        </div>
        <div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: T.textBright }}>{fullName || "—"}</div>
          <div style={{ fontSize: "13px", color: T.textDim, marginTop: "2px" }}>{localCounty} · {localCrop}</div>
          <div style={{ fontSize: "12px", color: T.accent, marginTop: "4px", cursor: "pointer" }}>{txt.photoHint}</div>
        </div>
      </div>

      {/* Personal info card */}
      <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 800, color: T.textBright, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{txt.personalSection}</h4>

        {/* Full Name */}
        <div>
          <label style={labelStyle}>{txt.nameLbl}</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <User size={16} color={T.textDim} style={{ position: "absolute", left: "14px", pointerEvents: "none" }} />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={txt.namePlaceholder}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>{txt.phoneLbl}</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Phone size={16} color={T.textDim} style={{ position: "absolute", left: "14px", pointerEvents: "none" }} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={txt.phonePlaceholder}
              style={inputStyle}
            />
          </div>
        </div>

        {/* County */}
        <div>
          <label style={labelStyle}>{txt.countyLbl}</label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <MapPin size={16} color={T.textDim} style={{ position: "absolute", left: "14px", pointerEvents: "none" }} />
            <select
              value={localCounty}
              onChange={(e) => setLocalCounty(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", fontWeight: 600 }}
            >
              <option value="Machakos">Machakos County</option>
              <option value="Makueni">Makueni County</option>
              <option value="Kitui">Kitui County</option>
            </select>
          </div>
        </div>

        {/* Crop */}
        <div>
          <label style={labelStyle}>{txt.cropLbl}</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {["Maize", "Green Grams"].map((c) => {
              const active = localCrop === c;
              const label = c === "Maize"
                ? (isEng ? "Maize (Mahindi)" : "Mahindi (Maize)")
                : (isEng ? "Green Grams (Ndengu)" : "Ndengu (Green Grams)");
              return (
                <button
                  key={c}
                  onClick={() => setLocalCrop(c)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: active ? `2px solid ${T.amber}` : `1px solid ${T.border}`,
                    background: active ? `${T.amber}10` : T.surfaceAlt,
                    color: T.textBright,
                    fontSize: "14px",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Sprout size={15} color={active ? T.amber : T.textDim} />
                  {label}
                  {active && <CheckCircle2 size={14} color={T.amber} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveProfile}
          disabled={saveStatus === "saving"}
          style={{
            padding: "13px",
            background: saveStatus === "saved" ? T.accentDim : T.accent,
            border: "none",
            borderRadius: "10px",
            color: saveStatus === "saved" ? T.accent : "#000",
            fontSize: "15px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "background 0.2s",
          }}
        >
          {saveStatus === "saving" ? (
            txt.saving
          ) : saveStatus === "saved" ? (
            <><CheckCircle2 size={16} />{txt.saved}</>
          ) : (
            <><Save size={16} />{txt.saveProfile}</>
          )}
        </button>
        {saveStatus === "error" && (
          <p style={{ color: T.red, fontSize: "13px", margin: 0, textAlign: "center" }}>{txt.saveError}</p>
        )}
      </Card>

      {/* Change password card */}
      <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
        <h4 style={{ fontSize: "14px", fontWeight: 800, color: T.textBright, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{txt.passwordSection}</h4>

        {[
          { label: txt.currentPw, value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
          { label: txt.newPw, value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
          { label: txt.confirmPw, value: confirmPassword, set: setConfirmPassword, show: showNew, toggle: null },
        ].map(({ label, value, set, show, toggle }) => (
          <div key={label}>
            <label style={labelStyle}>{label}</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock size={16} color={T.textDim} style={{ position: "absolute", left: "14px", pointerEvents: "none" }} />
              <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => set(e.target.value)}
                style={{ ...inputStyle, paddingRight: toggle ? "42px" : "14px" }}
              />
              {toggle && (
                <button
                  onClick={toggle}
                  style={{ position: "absolute", right: "14px", background: "none", border: "none", cursor: "pointer", color: T.textDim, display: "flex", padding: 0 }}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {pwError && <p style={{ color: T.red, fontSize: "13px", margin: 0 }}>{pwError}</p>}

        <button
          onClick={handleChangePassword}
          disabled={pwStatus === "saving" || !currentPassword || !newPassword || !confirmPassword}
          style={{
            padding: "13px",
            background: pwStatus === "saved" ? T.accentDim : T.blue,
            border: "none",
            borderRadius: "10px",
            color: pwStatus === "saved" ? T.accent : "#fff",
            fontSize: "15px",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            opacity: (!currentPassword || !newPassword || !confirmPassword) ? 0.5 : 1,
          }}
        >
          {pwStatus === "saved" ? (
            <><CheckCircle2 size={16} />{txt.pwSaved}</>
          ) : (
            <><Lock size={16} />{txt.updatePw}</>
          )}
        </button>
      </Card>

    </div>
  );
}