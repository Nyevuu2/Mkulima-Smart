import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Wallet,
  CloudSun, Settings, Menu, X, User, Lock, ArrowRight, UserPlus, MapPin,
  TrendingUp, Store
} from "lucide-react";

// Import existing view components
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import WeatherAdvisory from "./pages/WeatherAdvisory";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import MarketIntelligence from "./pages/MarketIntelligence";

import MarketSimulation from "./pages/MarketSimulation";
// ============================================================================
// SYSTEM COLOURS - HIGH CONTRAST FOR EASY READING (UNCHANGED FROM ORIGINAL)
// ============================================================================
export const T = {
  background: "#070a0e",
  surface: "#131924",
  surfaceAlt: "#1b2434",
  border: "#26334a",
  borderBright: "#41567c",
  textBright: "#ffffff",
  text: "#cbd5e1",
  textDim: "#94a3b8",
  accent: "#22c55e",        // ← Your original GREEN. Never changed.
  accentDim: "#14532d",
  blue: "#3b82f6",
  amber: "#f59e0b",
  red: "#ef4444",
};

export const priceHistory = [
  { month: "Jan",          maize: 3900, greengrams: 9800,  f: false },
  { month: "Feb",          maize: 4100, greengrams: 10200, f: false },
  { month: "Mar",          maize: 4250, greengrams: 10500, f: false },
  { month: "Apr",          maize: 4000, greengrams: 9900,  f: false },
  { month: "May",          maize: 3850, greengrams: 9400,  f: false },
  { month: "Jun",   maize: 4100, greengrams: 10500, f: true  },
  { month: "Jul",  maize: 4300, greengrams: 11200, f: true  },
  { month: "Aug",  maize: 4500, greengrams: 11800, f: true  },
];

// ============================================================================
// SHARED UI PRIMITIVES (UNCHANGED FROM ORIGINAL)
// ============================================================================
export function Card({ children, style, ...props }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "14px", ...style }} {...props}>
      {children}
    </div>
  );
}

export function StatCard({ title, value, sub, icon: Icon, color }) {
  return (
    <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "13px", color: T.textDim, fontWeight: 700, textTransform: "uppercase" }}>{title}</span>
        {Icon && <Icon size={20} color={color || T.accent} />}
      </div>
      <div>
        <div style={{ fontSize: "32px", fontWeight: 800, color: T.textBright }}>{value}</div>
        <div style={{ fontSize: "14px", color: T.text, marginTop: "4px" }}>{sub}</div>
      </div>
    </Card>
  );
}

export function Chip({ label, color, bg }) {
  return (
    <span style={{ fontSize: "12px", fontWeight: 700, padding: "6px 12px", borderRadius: "24px", background: bg || `${color}15`, color: color, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

// ============================================================================
// REGISTER PAGE (INLINE — UNCHANGED FROM ORIGINAL)
// ============================================================================
function RegisterPage({ onRegisterSuccess, onGoToLogin, currentCounty, setDefaultCounty }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          password,
          county: currentCounty,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful → go straight into the app
        onRegisterSuccess(data); // data = { id, full_name, county, ... }
      } else {
        setError(data.detail || "Registration failed. Please try again.");
      }
    } catch (err) {
      // Backend offline → still let the user into the prototype (dev mode fallback)
      console.warn("Backend offline — using local fallback for registration.");
      onRegisterSuccess({ id: "local-001", full_name: fullName, county: currentCounty });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#070a0e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "16px", width: "100%", maxWidth: "460px", padding: "40px" }}>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: T.accent, marginBottom: "12px" }} />
          <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: 900, margin: 0, letterSpacing: "0.02em" }}>Create Account</h2>
          <p style={{ color: T.textDim, fontSize: "14px", marginTop: "6px", textAlign: "center" }}>Join MkulimaSmart to start tracking crop metrics</p>
        </div>

        {error && (
          <div style={{ background: `${T.red}15`, border: `1px solid ${T.red}40`, borderRadius: "8px", padding: "12px", marginBottom: "16px", color: T.red, fontSize: "13px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Full Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Full Name</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <User size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input type="text" placeholder="e.g. John Mutua" value={fullName} onChange={(e) => setFullName(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }} required />
            </div>
          </div>

          {/* Phone */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Phone Number</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <UserPlus size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input type="tel" placeholder="e.g. 0712345678" value={phone} onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }} required />
            </div>
          </div>

          {/* County */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Primary Farming County</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <MapPin size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <select value={currentCounty} onChange={(e) => setDefaultCounty(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none", cursor: "pointer" }}>
                <option value="Machakos">Machakos County</option>
                <option value="Kitui">Kitui County</option>
                <option value="Makueni">Makueni County</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: T.textBright, textTransform: "uppercase" }}>Create Password</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Lock size={16} color={T.textDim} style={{ position: "absolute", left: "14px" }} />
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", background: "#070a0e", border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "12px 14px 12px 42px", color: "#fff", fontSize: "14px", outline: "none" }} required />
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ background: T.accent, color: "#000", border: "none", borderRadius: "8px", padding: "14px", fontSize: "15px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating Account..." : <> Create Free Account <ArrowRight size={16} /> </>}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: T.textDim }}>
          Already have an account?{" "}
          <span onClick={onGoToLogin} style={{ color: T.accent, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
            Sign In here
          </span>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// CORE APPLICATION — ORIGINAL STRUCTURE PRESERVED
// Backend state (user, ML data, expenses) added without touching the UI
// ============================================================================
export default function App() {

  // ── ROUTER ──────────────────────────────────────────────────────────────
  // "website" | "login" | "register" | "app"  (same as original)
  const [viewMode, setViewMode] = useState("website");
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileCard, setShowProfileCard] = useState(false);

  // ── GLOBAL CONFIG (original) ────────────────────────────────────────────
  const [county, setCounty] = useState("Machakos");
  const [crop, setCrop] = useState("Maize");
  const [language, setLanguage] = useState("English");

  // ── BACKEND: AUTH USER OBJECT ────────────────────────────────────────────
  // null = not logged in. Set by LoginPage/RegisterPage on success.
  // Shape: { id, full_name, county }
  const [user, setUser] = useState(null);

  // ── BACKEND: ML PREDICTIONS ──────────────────────────────────────────────
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [loadingML, setLoadingML] = useState(false);
  const [mlError, setMlError] = useState("");

  // ── BACKEND: EXPENSES ───────────────────────────────────────────────────
  const [expenses, setExpenses] = useState([]);

  // ── SYNC county selector with logged-in user's county ───────────────────
  useEffect(() => {
    if (user?.county) setCounty(user.county);
  }, [user]);

  // ── FETCH ML PREDICTIONS whenever user logs in or changes crop ───────────
  useEffect(() => {
    if (!user || viewMode !== "app") return;

    const fetchPredictions = async () => {
      setLoadingML(true);
      setMlError("");
      try {
        const targetCounty = (user.county || county).toLowerCase().trim();
        const cropParam = crop === "Maize" ? "maize" : "ndengu";
        const res = await fetch(
          `http://127.0.0.1:8000/api/predictions?crop=${cropParam}&county=${targetCounty}`
        );
        const data = await res.json();
        if (res.ok) {
          setIntelligenceData(data);
        } else {
          setMlError("Prediction API returned an error.");
        }
      } catch {
        setMlError("Prediction API offline. Showing cached data.");
      } finally {
        setLoadingML(false);
      }
    };

    fetchPredictions();
    fetchExpenses();
  }, [user, crop, viewMode]);

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/expenses/${user.id}`);
      const data = await res.json();
      if (res.ok) setExpenses(data);
    } catch {
      console.warn("Expenses API offline.");
    }
  };

  // ── CALLED BY LoginPage / RegisterPage ON SUCCESS ────────────────────────
  // Receives the user object from the backend and transitions to the app.
  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    if (authenticatedUser?.county) setCounty(authenticatedUser.county);
    setViewMode("app");
  };

  // ── SIGN OUT ─────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    setUser(null);
    setIntelligenceData(null);
    setExpenses([]);
    setViewMode("website");
    setShowProfileCard(false);
  };

  // ── TRANSLATIONS (original) ──────────────────────────────────────────────
  const txt = {
    English: {
      logo: "MKULIMA SMART",
      dash: "My Farm",
      exp: "My Farm Expenses",
      intelligence: "Market Intelligence",
      marketplace: "Marketplace",
      sim: "Market Calculator",
      weather: "Weather Advice",
      settings: "System Settings",
      signout: "Exit Application / Return to Website",
    },
    Swahili: {
      logo: "MKULIMA SMART",
      dash: "Muhtasari wa Shamba",
      exp: "Gharama za Shamba",
      intelligence: "Soko",
      marketplace: "Soko la Wakulima",
      sim: "Kikokotoo cha Soko",
      weather: "Ushauri wa Hali ya Chemba",
      settings: "Mipangilio ya Mfumo",
      signout: "Toka kwenye Mfumo / Rudi kwa Tovuti",
    },
  }[language];

  // ── PAGE RENDERER ────────────────────────────────────────────────────────
  // Passes backend data down to child pages as props so they can use it
  const renderWorkspaceView = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <Dashboard
            county={county}
            crop={crop}
            language={language}
            // Backend props — pages can use these if they want, ignore if not ready
            user={user}
            intelligenceData={intelligenceData}
            loadingML={loadingML}
            mlError={mlError}
          />
        );
      case "expenses":
        return (
          <Expenses
            language={language}
            // Backend props
            user={user}
            expenses={expenses}
            onExpenseAdded={fetchExpenses}
          />
        );
      case "intelligence":
        return (
          <MarketIntelligence
            crop={crop}
            county={county}
            language={language}
            user={user}
          />
        );
      case "marketplace":
        return <MarketSimulation user={user} language={language} />;
      case "advisory":
        return <WeatherAdvisory county={county} language={language} />;
      case "profile":
        return (
          <ProfilePage
            user={user}
            county={county} setCounty={setCounty}
            crop={crop} setCrop={setCrop}
            language={language}
            onBack={() => setCurrentTab("settings")}
          />
        );
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
      default:
        return <Dashboard county={county} crop={crop} language={language} user={user} />;
    }
  };

  const navigationRoutes = [
    { id: "dashboard",    label: txt.dash,          icon: LayoutDashboard },
    { id: "expenses",     label: txt.exp,           icon: Wallet          },
    { id: "intelligence", label: txt.intelligence,  icon: TrendingUp      },
    { id: "marketplace",  label: txt.marketplace,   icon: Store           },
    { id: "advisory",     label: txt.weather,       icon: CloudSun        },
    { id: "settings",     label: txt.settings,      icon: Settings        },
  ];

  // ============================================================================
  // ROUTE: 1. PUBLIC LANDING PAGE
  // ============================================================================
  if (viewMode === "website") {
    return <LandingPage onGoToApp={() => setViewMode("login")} />;
  }

  // ============================================================================
  // ROUTE: 2. LOGIN
  // onLogin now receives the user object from the backend
  // ============================================================================
  if (viewMode === "login") {
    return (
      <LoginPage
        onLogin={handleAuthSuccess}
        onGoToRegister={() => setViewMode("register")}
      />
    );
  }

  // ============================================================================
  // ROUTE: 3. REGISTER
  // ============================================================================
  if (viewMode === "register") {
    return (
      <RegisterPage
        currentCounty={county}
        setDefaultCounty={setCounty}
        onRegisterSuccess={handleAuthSuccess}
        onGoToLogin={() => setViewMode("login")}
      />
    );
  }

  // ============================================================================
  // ROUTE: 4. AUTHENTICATED WORKSPACE — ORIGINAL SIDEBAR + HEADER LAYOUT
  // ============================================================================
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.background, color: T.text, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <div style={{
        width: sidebarOpen ? "280px" : "0px",
        background: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width 0.25s ease-out",
        overflow: "hidden",
        zIndex: 50,
        position: "relative",
      }}>
        <div>
          {/* Logo */}
          <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: T.accent }} />
            <span style={{ fontWeight: 900, fontSize: "16px", color: T.textBright, letterSpacing: "0.05em" }}>{txt.logo}</span>
          </div>

          {/* Nav links */}
          <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {navigationRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = currentTab === route.id;
              return (
                <button key={route.id} onClick={() => setCurrentTab(route.id)}
                  style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%", padding: "12px 16px", background: isActive ? `${T.accent}15` : "transparent", border: "none", borderRadius: "10px", color: isActive ? T.accent : T.text, fontSize: "15px", fontWeight: isActive ? 700 : 500, textAlign: "left", cursor: "pointer" }}>
                  <Icon size={18} color={isActive ? T.accent : T.textDim} />
                  {route.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile footer */}
        <div style={{ padding: "16px", borderTop: `1px solid ${T.border}`, position: "relative" }}>
          <div onClick={() => setCurrentTab("profile")}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "10px", cursor: "pointer", background: "transparent" }}>
            <div style={{ background: T.border, padding: 8, borderRadius: "50%", display: "flex" }}>
              <User size={16} color={T.textBright} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {/* Show real name from backend if available, fallback to "John Mutua" */}
              <span style={{ fontSize: "14px", fontWeight: 700, color: T.textBright }}>
                {user?.full_name || "John Mutua"}
              </span>
              <span style={{ fontSize: "12px", color: T.textDim }}>{county}</span>
            </div>
          </div>

          {showProfileCard && (
            <div style={{ position: "absolute", bottom: "76px", left: "16px", width: "244px", background: T.surface, border: `1px solid ${T.borderBright}`, borderRadius: "14px", padding: "16px", zIndex: 99, boxShadow: "0 12px 30px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "13px", color: T.textBright }}>
                <strong>Mkulima ID:</strong> {user?.id || "M-2026"}
              </div>
              <div style={{ fontSize: "13px", color: T.textBright }}>
                <strong>Eneo:</strong> {county}
              </div>
              <button onClick={handleSignOut}
                style={{ width: "100%", padding: "10px", background: T.red, color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                {txt.signout}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Header */}
        <header style={{ height: "72px", borderBottom: `1px solid ${T.border}`, background: T.surface, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "transparent", border: "none", color: T.textBright, cursor: "pointer", display: "flex", alignItems: "center" }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: T.textBright, margin: 0 }}>
              {navigationRoutes.find(r => r.id === currentTab)?.label}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <select value={county} onChange={(e) => setCounty(e.target.value)}
              style={{ background: T.background, border: `1px solid ${T.borderBright}`, color: T.textBright, padding: "8px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, outline: "none", cursor: "pointer" }}>
              <option value="Machakos">Machakos County</option>
              <option value="Makueni">Makueni County</option>
              <option value="Kitui">Kitui County</option>
            </select>

            <select value={crop} onChange={(e) => setCrop(e.target.value)}
              style={{ background: T.background, border: `1px solid ${T.borderBright}`, color: T.textBright, padding: "8px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: 700, outline: "none", cursor: "pointer" }}>
              <option value="Maize">Mahindi (Maize)</option>
              <option value="Green Grams">Ndengu (Green Grams)</option>
            </select>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", background: T.background }}>
          {renderWorkspaceView()}
        </main>

      </div>
    </div>
  );
}