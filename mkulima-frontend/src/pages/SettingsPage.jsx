import React, { useState } from "react";
import {
  Globe, MapPin, Sprout, CheckCircle2,
  Type, Lock, Trash2, LogOut,
  ChevronRight, Bell, BellOff, User,
} from "lucide-react";
import { Card, T } from "../App";

export default function SettingsPage({
  county, setCounty,
  crop, setCrop,
  language, setLanguage,
  onGoToProfile,
  onLogout,
}) {
  const isEng = language === "English";

  const [fontSize, setFontSize] = useState("medium"); // small | medium | large
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fontSizeMap = { small: "14px", medium: "16px", large: "19px" };
  const fontSizeLabel = { small: isEng ? "Small" : "Ndogo", medium: isEng ? "Medium" : "Wastani", large: isEng ? "Large" : "Kubwa" };

  const txt = {
    English: {
      title: "Settings",
      subtitle: "Manage your app preferences, privacy, and account.",

      // sections
      prefsSection: "App Preferences",
      accountSection: "Account",
      privacySection: "Privacy & Legal",
      supportSection: "Support",

      // preferences
      langTitle: "App Language",
      langSub: "Language used for all panels and advice.",
      locationTitle: "Your County",
      locationSub: "Used to calibrate weather and price advice.",
      cropTitle: "Active Crop",
      cropSub: "Crop tracked for prices and weather this season.",
      fontTitle: "Text Size",
      fontSub: "Adjust how large text appears across the app.",
      notifTitle: "Push Notifications",
      notifSub: "Receive weather alerts and price change notifications.",

      // account
      editProfile: "Edit Profile",
      editProfileSub: "Update name, phone, county and crop.",
      changePassword: "Change Password",
      changePasswordSub: "Update your login password.",
      logout: "Log Out",
      logoutSub: "Sign out of your MkulimaSmart account.",
      deleteAccount: "Close Account",
      deleteAccountSub: "Permanently delete your data and account.",
      deleteConfirm: "Are you sure? This cannot be undone.",
      deleteYes: "Yes, delete my account",
      deleteNo: "Cancel",

      // privacy
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookies: "Cookie Policy",
      accessibility: "Accessibility",

      // support
      helpCenter: "Help Center",
      helpCenterSub: "FAQs and guides for using MkulimaSmart.",
      aboutApp: "About MkulimaSmart",
      version: "Version 1.0.0",

      saveMsg: "All settings apply immediately across the app.",
    },
    Swahili: {
      title: "Mipangilio",
      subtitle: "Simamia mapendeleo ya programu, faragha, na akaunti yako.",

      prefsSection: "Mapendeleo ya Programu",
      accountSection: "Akaunti",
      privacySection: "Faragha na Kisheria",
      supportSection: "Msaada",

      langTitle: "Lugha ya Programu",
      langSub: "Lugha inayotumika kwenye maelezo yote.",
      locationTitle: "Kaunti Yako",
      locationSub: "Inatumika kuboresha ushauri wa hali ya hewa na bei.",
      cropTitle: "Zao Linalofuatiliwa",
      cropSub: "Zao linalofuatiliwa kwa bei na hali ya hewa msimu huu.",
      fontTitle: "Ukubwa wa Maandishi",
      fontSub: "Rekebisha ukubwa wa maandishi kwenye programu.",
      notifTitle: "Arifa za Push",
      notifSub: "Pokea arifa za hali ya hewa na mabadiliko ya bei.",

      editProfile: "Hariri Wasifu",
      editProfileSub: "Sasisha jina, simu, kaunti na zao.",
      changePassword: "Badilisha Nenosiri",
      changePasswordSub: "Sasisha nenosiri lako la kuingia.",
      logout: "Toka",
      logoutSub: "Toka kwenye akaunti yako ya MkulimaSmart.",
      deleteAccount: "Funga Akaunti",
      deleteAccountSub: "Futa kwa kudumu data na akaunti yako.",
      deleteConfirm: "Je, una uhakika? Hii haiwezi kubatilishwa.",
      deleteYes: "Ndiyo, futa akaunti yangu",
      deleteNo: "Ghairi",

      privacy: "Sera ya Faragha",
      terms: "Masharti ya Huduma",
      cookies: "Sera ya Kuki",
      accessibility: "Upatikanaji",

      helpCenter: "Kituo cha Msaada",
      helpCenterSub: "Maswali na miongozo ya kutumia MkulimaSmart.",
      aboutApp: "Kuhusu MkulimaSmart",
      version: "Toleo 1.0.0",

      saveMsg: "Mabadiliko yote yanahifadhiwa mara moja kwenye kurasa zote.",
    },
  }[language];

  const SectionHeader = ({ label }) => (
    <div style={{ fontSize: "11px", fontWeight: 800, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 0 6px 0" }}>
      {label}
    </div>
  );

  const RowButton = ({ icon: Icon, iconColor, title, sub, onClick, danger, chevron = true }) => (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "16px",
        width: "100%", padding: "16px", background: "transparent",
        border: "none", borderRadius: "10px", cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ background: danger ? `${T.red}15` : `${iconColor}15`, padding: "9px", borderRadius: "8px", flexShrink: 0 }}>
        <Icon size={18} color={danger ? T.red : iconColor} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: danger ? T.red : T.textBright }}>{title}</div>
        {sub && <div style={{ fontSize: "13px", color: T.textDim, marginTop: "2px" }}>{sub}</div>}
      </div>
      {chevron && <ChevronRight size={16} color={T.textDim} />}
    </button>
  );

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "8px", width: "100%", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: "12px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: T.textBright, margin: 0 }}>{txt.title}</h2>
        <p style={{ fontSize: "15px", color: T.text, margin: "8px 0 0 0" }}>{txt.subtitle}</p>
      </div>

      {/* ── APP PREFERENCES ─────────────────────────────── */}
      <SectionHeader label={txt.prefsSection} />
      <Card style={{ overflow: "hidden" }}>

        {/* Language */}
        <div style={{ padding: "20px 20px 0 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
            <div style={{ background: `${T.accent}15`, padding: "9px", borderRadius: "8px" }}><Globe size={18} color={T.accent} /></div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: T.textBright }}>{txt.langTitle}</div>
              <div style={{ fontSize: "13px", color: T.textDim, marginTop: "2px" }}>{txt.langSub}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {["English", "Swahili"].map((lang) => (
              <button key={lang}
                onClick={() => setLanguage(lang)}
                style={{ padding: "11px", borderRadius: "8px", border: language === lang ? `2px solid ${T.accent}` : `1px solid ${T.border}`, background: language === lang ? `${T.accent}08` : T.surfaceAlt, color: T.textBright, fontSize: "14px", fontWeight: language === lang ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                {lang === "English" ? "English" : "Kiswahili"} {language === lang && <CheckCircle2 size={14} color={T.accent} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: "1px", background: T.border }} />

        {/* County */}
        <div style={{ padding: "20px 20px 0 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
            <div style={{ background: `${T.blue}15`, padding: "9px", borderRadius: "8px" }}><MapPin size={18} color={T.blue} /></div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: T.textBright }}>{txt.locationTitle}</div>
              <div style={{ fontSize: "13px", color: T.textDim, marginTop: "2px" }}>{txt.locationSub}</div>
            </div>
          </div>
          <select value={county} onChange={(e) => setCounty(e.target.value)}
            style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "11px 14px", fontSize: "14px", color: T.textBright, fontWeight: 600, outline: "none", cursor: "pointer", marginBottom: "20px" }}>
            <option value="Machakos">Machakos County</option>
            <option value="Makueni">Makueni County</option>
            <option value="Kitui">Kitui County</option>
          </select>
        </div>

        <div style={{ height: "1px", background: T.border }} />

        {/* Crop */}
        <div style={{ padding: "20px 20px 0 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "12px" }}>
            <div style={{ background: `${T.amber}15`, padding: "9px", borderRadius: "8px" }}><Sprout size={18} color={T.amber} /></div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: T.textBright }}>{txt.cropTitle}</div>
              <div style={{ fontSize: "13px", color: T.textDim, marginTop: "2px" }}>{txt.cropSub}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {["Maize", "Green Grams"].map((c) => {
              const active = crop === c;
              const label = c === "Maize"
                ? (isEng ? "Maize (Mahindi)" : "Mahindi")
                : (isEng ? "Green Grams (Ndengu)" : "Ndengu");
              return (
                <button key={c} onClick={() => setCrop(c)}
                  style={{ padding: "11px", borderRadius: "8px", border: active ? `2px solid ${T.amber}` : `1px solid ${T.border}`, background: active ? `${T.amber}08` : T.surfaceAlt, color: T.textBright, fontSize: "14px", fontWeight: active ? 700 : 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  {label} {active && <CheckCircle2 size={14} color={T.amber} />}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: "1px", background: T.border }} />

        {/* Font size */}
        <div style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "14px" }}>
            <div style={{ background: `#a855f715`, padding: "9px", borderRadius: "8px" }}><Type size={18} color="#a855f7" /></div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: T.textBright }}>{txt.fontTitle}</div>
              <div style={{ fontSize: "13px", color: T.textDim, marginTop: "2px" }}>{txt.fontSub}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["small", "medium", "large"].map((size) => (
              <button key={size}
                onClick={() => {
                  setFontSize(size);
                  document.documentElement.style.fontSize = fontSizeMap[size];
                }}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", border: fontSize === size ? `2px solid #a855f7` : `1px solid ${T.border}`, background: fontSize === size ? `#a855f710` : T.surfaceAlt, color: T.textBright, fontSize: size === "small" ? "12px" : size === "medium" ? "14px" : "17px", fontWeight: fontSize === size ? 700 : 500, cursor: "pointer" }}>
                {fontSizeLabel[size]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: "1px", background: T.border }} />

        {/* Notifications toggle */}
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: notificationsOn ? `${T.accent}15` : `${T.textDim}20`, padding: "9px", borderRadius: "8px" }}>
            {notificationsOn ? <Bell size={18} color={T.accent} /> : <BellOff size={18} color={T.textDim} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: T.textBright }}>{txt.notifTitle}</div>
            <div style={{ fontSize: "13px", color: T.textDim, marginTop: "2px" }}>{txt.notifSub}</div>
          </div>
          <button
            onClick={() => setNotificationsOn(v => !v)}
            style={{ width: "48px", height: "26px", borderRadius: "13px", background: notificationsOn ? T.accent : T.border, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
          >
            <span style={{ position: "absolute", top: "3px", left: notificationsOn ? "25px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
          </button>
        </div>

      </Card>

      {/* ── ACCOUNT ─────────────────────────────────────── */}
      <SectionHeader label={txt.accountSection} />
      <Card style={{ overflow: "hidden" }}>
        <RowButton icon={User} iconColor={T.blue} title={txt.editProfile} sub={txt.editProfileSub} onClick={onGoToProfile} />
        <div style={{ height: "1px", background: T.border, margin: "0 16px" }} />
        <RowButton icon={Lock} iconColor={T.amber} title={txt.changePassword} sub={txt.changePasswordSub} onClick={onGoToProfile} />
        <div style={{ height: "1px", background: T.border, margin: "0 16px" }} />
        <RowButton icon={LogOut} iconColor={T.textDim} title={txt.logout} sub={txt.logoutSub} onClick={onLogout} />
        <div style={{ height: "1px", background: T.border, margin: "0 16px" }} />
        {!showDeleteConfirm ? (
          <RowButton icon={Trash2} iconColor={T.red} title={txt.deleteAccount} sub={txt.deleteAccountSub} onClick={() => setShowDeleteConfirm(true)} danger />
        ) : (
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ color: T.red, fontSize: "14px", fontWeight: 600, margin: 0 }}>{txt.deleteConfirm}</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, padding: "10px", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "8px", color: T.textBright, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                {txt.deleteNo}
              </button>
              <button
                style={{ flex: 1, padding: "10px", background: T.red, border: "none", borderRadius: "8px", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                {txt.deleteYes}
              </button>
            </div>
          </div>
        )}
      </Card>



    </div>
  );
}