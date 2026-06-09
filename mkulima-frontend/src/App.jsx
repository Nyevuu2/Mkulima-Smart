import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Wallet, CloudSun, Settings,
  TrendingUp, Store, User, LogOut, X
} from "lucide-react";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import WeatherAdvisory from "./pages/WeatherAdvisory";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import MarketIntelligence from "./pages/MarketIntelligence";
import MarketSimulation from "./pages/MarketSimulation";
import AdminDashboard from "./pages/AdminDashboard";

// ============================================================================
// DESIGN TOKENS — single source of truth for ALL pages
// ============================================================================
export const T = {
  bg:           "#f0f4f1",   // light sage — page background
  surface:      "#ffffff",   // white — default card background
  surfaceAlt:   "#1e1d1d",   // beige — nested inputs / rows
  surfaceGreen: "#1e5c2a",   // dark field green — weather, nature sections
  surfaceGreenLight: "#eaf4ec", // pale green tint — sales / income sections
  surfaceAmber: "#fff7e6",   // pale amber — expense / cost sections
  border:       "#d6cfc0",
  borderBright: "#b0a48e",
  textBright:   "#111a0e",
  text:         "#2d3b24",
  textDim:      "#7a7260",
  textOnDark:   "#ffffff",   // text on dark green backgrounds
  accent:       "#2d7a3a",   // dark field green
  accentDim:    "#d4edda",
  blue:         "#1d6fa4",
  amber:        "#c07a00",
  amberLight:   "#ffa500",   // brighter amber for text on pale amber bg
  red:          "#c0392b",
  navHeight:    "72px",
  navWidth:     "220px",
  headerHeight: "60px",
};

export const priceHistory = [
  { month: "Jan", maize: 3900, greengrams: 9800,  f: false },
  { month: "Feb", maize: 4100, greengrams: 10200, f: false },
  { month: "Mar", maize: 4250, greengrams: 10500, f: false },
  { month: "Apr", maize: 4000, greengrams: 9900,  f: false },
  { month: "May", maize: 3850, greengrams: 9400,  f: false },
  { month: "Jun", maize: 4100, greengrams: 10500, f: true  },
  { month: "Jul", maize: 4300, greengrams: 11200, f: true  },
  { month: "Aug", maize: 4500, greengrams: 11800, f: true  },
];

// ============================================================================
// SHARED UI PRIMITIVES
// ============================================================================
export function Card({ children, style, ...props }) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: "16px",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, sub, icon: Icon, color, bg }) {
  const c = color || T.accent;
  const isDarkBg = bg && (bg === T.surfaceGreen);
  const cardBg   = bg || T.surface;
  const titleCol = isDarkBg ? "rgba(255,255,255,0.7)" : c;
  const valueCol = isDarkBg ? "#ffffff" : T.textBright;
  const subCol   = isDarkBg ? "rgba(255,255,255,0.6)" : T.textDim;
  const iconBg   = isDarkBg ? "rgba(255,255,255,0.15)" : `${c}18`;
  const iconCol  = isDarkBg ? "#ffffff" : c;
  const borderCol = bg ? "transparent" : T.border;

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${borderCol}`,
      borderRadius: "16px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {!bg && <div style={{ height: "4px", background: `linear-gradient(90deg, ${c}, ${c}55)` }} />}
      <div style={{
        background: bg ? "transparent" : `${c}0e`,
        borderBottom: bg ? `1px solid rgba(255,255,255,0.12)` : `1px solid ${c}20`,
        padding: "10px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontSize: "11px", color: titleCol, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
        {Icon && (
          <div style={{ background: iconBg, padding: "6px", borderRadius: "8px" }}>
            <Icon size={15} color={iconCol} />
          </div>
        )}
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ fontSize: "26px", fontWeight: 900, color: valueCol, letterSpacing: "-0.5px" }}>{value}</div>
        <div style={{ fontSize: "12px", color: subCol, marginTop: "5px" }}>{sub}</div>
      </div>
    </div>
  );
}

export function Chip({ label, color, bg }) {
  return (
    <span style={{
      fontSize: "11px", fontWeight: 700,
      padding: "5px 10px", borderRadius: "20px",
      background: bg || `${color}15`,
      color: color,
      border: `1px solid ${color}35`,
    }}>
      {label}
    </span>
  );
}

// ============================================================================
// API BASE URL — reads from Vite env, falls back to localhost for development
// ============================================================================
export const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const ML_BASE = import.meta.env.VITE_ML_API_URL || "http://127.0.0.1:8001";

// ============================================================================
// MAIN APP
// ============================================================================
export default function App() {
  const [viewMode, setViewMode] = useState("website"); // website | login | register | app
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [county, setCounty] = useState("Machakos");
  const [crop, setCrop] = useState("Maize");
  const [cropView, setCropView] = useState("Maize"); // "Maize" | "Green Grams" | "Both"
  const [language, setLanguage] = useState("English");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ── WEATHER ADVISORY DATA ─────────────────────────────────────────────────
  const [weatherAdviceData, setWeatherAdviceData] = useState(null);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [loadingML, setLoadingML] = useState(false);
  const [mlError, setMlError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  // ── RESTORE SESSION ON MOUNT ─────────────────────────────────────────────
  // Only restore a session if BOTH a user record AND a token exist in storage.
  // This prevents a leftover mkulima_user entry (e.g. from a previous test run
  // where the token was already cleared) from bypassing the landing/login flow.
  useEffect(() => {
    const storedUser  = localStorage.getItem("mkulima_user");
    const storedToken = localStorage.getItem("mkulima_token");

    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed?.county) setCounty(parsed.county);
        // Restore to admin dashboard or the main app — never to the website/landing
        setViewMode(parsed?.role === "admin" ? "admin" : "app");
      } catch {
        // Corrupted storage — clear everything and show landing
        localStorage.removeItem("mkulima_user");
        localStorage.removeItem("mkulima_token");
      }
    }
    // No stored session → viewMode stays "website" (landing page)
  }, []);

  // ── COORDINATED DATA FETCH (ML + WEATHER ADVICE) ─────────────────────────
  // Re-runs whenever the user, crop, county, or viewMode changes
  useEffect(() => {
    if (!user || viewMode !== "app") return;

    const fetchAllData = async () => {
      setLoadingML(true);
      setMlError("");

      const targetCounty = (county || user.county || "machakos").toLowerCase().trim();
      const cleanCrop = (crop || "").toLowerCase().replace(/\s+/g, "");
      const cropParam = cleanCrop === "greengrams" ? "greengrams" : "maize";

      try {
        // 1. Machine Learning Prediction Endpoint
        const resML = await fetch(
          `${ML_BASE}/api/predictions?crop=${cropParam}&county=${targetCounty}`
        );
        if (resML.ok) {
          const dataML = await resML.json();
          setIntelligenceData(dataML);
        }

        // 2. TimescaleDB Weather Rule Fetch
        const resWeather = await fetch(
          `${API_BASE}/api/weather-advice?county=${targetCounty}&crop=${cropParam}`
        );
        if (resWeather.ok) {
          const dataWeather = await resWeather.json();
          setWeatherAdviceData(dataWeather);
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setMlError("Prediction API offline. Showing cached configuration data.");
      } finally {
        setLoadingML(false);
      }
    };

    fetchAllData();
  }, [user, crop, county, viewMode, refreshTick]);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    if (userData?.county) setCounty(userData.county);
    // Persist to localStorage so session survives page refresh
    if (userData?.token) localStorage.setItem("mkulima_token", userData.token);
    localStorage.setItem("mkulima_user", JSON.stringify(userData));
    // Admins go to admin dashboard; farmers go to the app
    setViewMode(userData?.role === "admin" ? "admin" : "app");
  };

  const handleSignOut = () => {
    setUser(null);
    setWeatherAdviceData(null);
    setIntelligenceData(null);
    localStorage.removeItem("mkulima_user");
    localStorage.removeItem("mkulima_token");
    setViewMode("website");
    setCurrentTab("dashboard");
    setShowUserMenu(false);
  };

  const isEng = language === "English";

  const navLabels = {
    English: { dashboard: "Home", expenses: "Costs", intelligence: "Prices", marketplace: "Market", advisory: "Weather", settings: "Settings" },
    Swahili: { dashboard: "Nyumbani", expenses: "Gharama", intelligence: "Bei", marketplace: "Soko", advisory: "Hewa", settings: "Mipangilio" },
  }[language];

  const navigationRoutes = [
    { id: "dashboard",    label: navLabels.dashboard,    icon: LayoutDashboard },
    { id: "expenses",     label: navLabels.expenses,     icon: Wallet          },
    { id: "intelligence", label: navLabels.intelligence, icon: TrendingUp      },
    { id: "marketplace",  label: navLabels.marketplace,  icon: Store           },
    { id: "advisory",     label: navLabels.advisory,     icon: CloudSun        },
    { id: "settings",     label: navLabels.settings,     icon: Settings        },
  ];

  const renderPage = () => {
    if (currentTab === "profile") {
      return (
        <ProfilePage
          user={user} county={county} setCounty={setCounty}
          crop={crop} setCrop={setCrop} language={language}
          onBack={() => setCurrentTab("settings")}
        />
      );
    }
    const props = { county, crop, language, userContext: user ? { firstName: user.full_name?.split(" ")[0] } : {} };
    switch (currentTab) {
      case "dashboard":    return <Dashboard {...props} cropView={cropView} weatherAdviceData={weatherAdviceData} intelligenceData={intelligenceData} loadingML={loadingML} mlError={mlError} />;

      case "expenses":     return <Expenses crop={crop} county={county} />;
      // Pass cropView so MarketIntelligence knows if "Both" is selected
      case "intelligence": return (
  <MarketIntelligence
    crop={cropView}
    county={county}
    language={isEng ? "en" : "sw"}
    intelligenceData={intelligenceData}
    loadingML={loadingML}
    mlError={mlError}
    onRefresh={() => {
      // Re-trigger the coordinated fetch in App by flipping a refresh counter
      setRefreshTick(t => t + 1);
    }}
  />
);
      case "marketplace":  return <MarketSimulation crop={crop} county={county} language={language} />;
      case "advisory":     return <WeatherAdvisory county={county} crop={crop} language={language} weatherAdviceData={weatherAdviceData} />;
      case "settings":
        return (
          <SettingsPage
            county={county} setCounty={setCounty}
            crop={crop} setCrop={setCrop}
            language={language} setLanguage={setLanguage}
            onGoToProfile={() => setCurrentTab("profile")}
            onLogout={handleSignOut}
          />
        );
      default: return <Dashboard {...props} />;
    }
  };

  // ── PUBLIC ROUTES ──────────────────────────────────────────────────────────
  if (viewMode === "website") return <LandingPage onGoToApp={() => setViewMode("login")} />;

  if (viewMode === "login") {
    return <LoginPage onLogin={handleAuthSuccess} onGoToRegister={() => setViewMode("register")} />;
  }

  if (viewMode === "register") {
    return (
      <RegisterPage
        onGoToLogin={() => setViewMode("login")}
      />
    );
  }

  // ── ADMIN DASHBOARD ────────────────────────────────────────────────────────
  if (viewMode === "admin") {
    return <AdminDashboard user={user} onLogout={handleSignOut} />;
  }

  // ── AUTHENTICATED APP ──────────────────────────────────────────────────────
  const activeRoute = navigationRoutes.find(r => r.id === currentTab);
  const pageTitle = currentTab === "profile" ? (isEng ? "My Profile" : "Wasifu Wangu") : activeRoute?.label || "";

  return (
    <div style={{
      display: "flex", flexDirection: "row",
      minHeight: "100vh", height: "100dvh",
      background: T.bg, color: T.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
    }}>

      {/* ── LEFT SIDEBAR NAVIGATION ───────────────────────────────────── */}
      <nav style={{
        width: T.navWidth,
        flexShrink: 0,
        background: "#1a4a24",
        borderRight: "none",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100dvh",
        zIndex: 40,
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          height: T.headerHeight,
          display: "flex", alignItems: "center", gap: "11px",
          padding: "0 18px",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          flexShrink: 0,
          background: "#163d1e",
        }}>
          {/* Leaf icon mark */}
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, #4caf72 0%, #1a7a38 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.5 2 3 7 3 12c0 3.5 2 6.5 5 8l1-3c-1.5-1-2.5-2.8-2.5-5 0-3.6 2.5-7 5.5-7s5.5 3.4 5.5 7c0 2.2-1 4-2.5 5l1 3c3-1.5 5-4.5 5-8 0-5-3.5-10-9-10z" fill="white" opacity="0.9"/>
              <path d="M12 22V12M12 12L8 16M12 12L16 16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "14px", color: "#ffffff", letterSpacing: "0.04em", lineHeight: 1.1 }}>
              Mkulima<span style={{ color: "#7ed99a" }}>Smart</span>
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Farm Intelligence
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navigationRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = currentTab === route.id;
            return (
              <button
                key={route.id}
                onClick={() => setCurrentTab(route.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 400,
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.15s",
                }}>
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                <span style={{ letterSpacing: "0.01em" }}>{route.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom: User */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* User row */}
          <button
            onClick={() => setShowUserMenu(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
              width: "100%",
            }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <User size={15} color="#ffffff" />
            </div>
            <div style={{ textAlign: "left", overflow: "hidden" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.full_name || "Farmer"}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>{county}</div>
            </div>
          </button>
        </div>
      </nav>

      {/* ── RIGHT CONTENT AREA ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top header strip — page title + crop switcher */}
        <header style={{
          height: T.headerHeight,
          background: "#ffffff",
          borderBottom: "1px solid #e2ebe4",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky", top: 0, zIndex: 30,
          flexShrink: 0,
        }}>
          {pageTitle && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "4px", height: "20px", borderRadius: "3px", background: "#1a4a24" }} />
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#111a0e", letterSpacing: "-0.01em" }}>{pageTitle}</span>
            </div>
          )}
          {/* Crop view switcher */}
          <div style={{ display: "flex", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "10px", overflow: "hidden" }}>
            {[
              { val: "Maize",       emoji: "🌽", short: isEng ? "Maize"  : "Mahindi" },
              { val: "Green Grams", emoji: "🫘", short: isEng ? "Ndengu" : "Ndengu"  },
              { val: "Both",        emoji: "⚡", short: "Both"                        },
            ].map((opt, i) => {
              const active = cropView === opt.val;
              return (
                <button key={opt.val}
                  onClick={() => {
                    setCropView(opt.val);
                    if (opt.val !== "Both") setCrop(opt.val);
                  }}
                  style={{
                    padding: "7px 11px", border: "none", cursor: "pointer",
                    background: active ? `${T.amber}20` : "transparent",
                    color: active ? T.amber : T.textDim,
                    fontSize: "12px", fontWeight: active ? 800 : 500,
                    display: "flex", alignItems: "center", gap: "4px",
                    borderRight: i < 2 ? `1px solid ${T.border}` : "none",
                    transition: "all 0.15s",
                  }}>
                  {opt.emoji} {opt.short}
                </button>
              );
            })}
          </div>
        </header>

        {/* ── PAGE CONTENT ──────────────────────────────────────────────── */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          background: "#f0f4f1",
        }}>
          {renderPage()}
        </main>

      </div>

      {/* User dropdown menu */}
      {showUserMenu && (
        <>
          <div onClick={() => setShowUserMenu(false)}
            style={{ position: "fixed", inset: 0, zIndex: 49 }} />
          <div style={{
            position: "fixed", bottom: "80px", left: `calc(${T.navWidth} - 10px)`,
            background: T.surface, border: `1px solid ${T.borderBright}`,
            borderRadius: "14px", padding: "8px", zIndex: 50,
            boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
            minWidth: "200px",
          }}>
            <div style={{ padding: "10px 12px", borderBottom: `1px solid ${T.border}`, marginBottom: "4px" }}>
              <div style={{ fontSize: "15px", fontWeight: 800, color: T.textBright }}>{user?.full_name || "Farmer"}</div>
              <div style={{ fontSize: "12px", color: T.textDim, marginTop: "2px" }}>{county} County · {crop}</div>
            </div>
            {/* County quick switch */}
            <div style={{ padding: "8px 12px 4px" }}>
              <div style={{ fontSize: "11px", color: T.textDim, fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                {isEng ? "Your County" : "Kaunti Yako"}
              </div>
              {["Machakos", "Kitui", "Makueni"].map(c => (
                <button key={c} onClick={() => { setCounty(c); setShowUserMenu(false); }}
                  style={{
                    display: "block", width: "100%", padding: "8px 10px",
                    background: county === c ? `${T.accent}15` : "transparent",
                    border: "none", borderRadius: "8px",
                    color: county === c ? T.accent : T.text,
                    fontSize: "14px", fontWeight: county === c ? 700 : 500,
                    textAlign: "left", cursor: "pointer",
                  }}>
                  {c} County {county === c && "✓"}
                </button>
              ))}
            </div>
            <div style={{ height: "1px", background: T.border, margin: "4px 0" }} />
            <button onClick={() => { setCurrentTab("profile"); setShowUserMenu(false); }}
              style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 12px", background: "transparent", border: "none", borderRadius: "8px", color: T.text, fontSize: "14px", cursor: "pointer" }}>
              <User size={15} /> {isEng ? "Edit Profile" : "Hariri Wasifu"}
            </button>
            <button onClick={handleSignOut}
              style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 12px", background: "transparent", border: "none", borderRadius: "8px", color: T.red, fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
              <LogOut size={15} /> {isEng ? "Sign Out" : "Toka"}
            </button>
          </div>
        </>
      )}

    </div>
  );
}