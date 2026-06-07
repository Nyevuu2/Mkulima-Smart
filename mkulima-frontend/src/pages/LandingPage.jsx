import React, { useState, useEffect } from "react";
import {
  ArrowRight, Leaf, TrendingUp, CloudSun, ShoppingBag,
  BarChart2, Shield, ChevronDown, MapPin, Sprout
} from "lucide-react";

const T = {
  bg: "#070a0e",
  surface: "#0d1117",
  border: "#161b22",
  text: "#e6edf3",
  muted: "#8b949e",
  accent: "#22c55e",
};

const features = [
  {
    icon: <BarChart2 size={22} />,
    title: "AI Price Forecasting",
    desc: "LSTM models trained on local market data forecast maize and ndengu prices up to 30 days ahead — so you know the best time to sell.",
  },
  {
    icon: <CloudSun size={22} />,
    title: "Weather Advisory",
    desc: "Specialised agronomic advice for Machakos, Makueni, and Kitui. Know when to plant, spray, or harvest based on your county's conditions.",
  },
  {
    icon: <ShoppingBag size={22} />,
    title: "Digital Marketplace",
    desc: "Post your maize or ndengu directly. Buyers browse listings by county and contact you — no middlemen, no transport guesswork.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Expense & Profit Tracker",
    desc: "Log every input cost — seeds, fertiliser, labour. Use the profit calculator to decide your selling price before harvest.",
  },
  {
    icon: <Shield size={22} />,
    title: "Buy / Sell / Hold Signals",
    desc: "Our model doesn't just show charts — it gives a clear recommendation based on price direction and market momentum.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Lower Eastern Focus",
    desc: "Every price forecast, weather alert, and market listing is specific to Machakos, Makueni, and Kitui. No irrelevant noise.",
  },
];

const counties = [
  {
    name: "Machakos",
    detail: "Maize and ndengu growing zone with active market activity around Machakos Town.",
  },
  {
    name: "Makueni",
    detail: "Semi-arid region where ndengu is a critical cash crop alongside maize.",
  },
  {
    name: "Kitui",
    detail: "Dryland farming community where timing of sales is essential to profit.",
  },
];

export default function LandingPage({ onGoToApp }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      background: T.bg, color: T.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflowX: "hidden",
    }}>

      {/* Sticky Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(7,10,14,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "none",
        transition: "all 0.3s",
        padding: "14px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: T.accent, borderRadius: 8, padding: "5px 7px", display: "flex" }}>
            <Leaf size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>Mkulima Smart</span>
        </div>
        <button
          onClick={onGoToApp}
          style={{
            background: T.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "9px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          Go to App <ArrowRight size={15} />
        </button>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: "90vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "80px 24px 60px",
        background: `radial-gradient(ellipse 80% 55% at 50% 0%, rgba(34,197,94,0.11) 0%, transparent 70%), ${T.bg}`,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.035,
          backgroundImage: "radial-gradient(#22c55e 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: 999, padding: "6px 16px", marginBottom: 28,
          fontSize: 13, color: T.accent, fontWeight: 500,
        }}>
          <MapPin size={13} /> Lower Eastern Kenya · Machakos · Makueni · Kitui
        </div>

        <h1 style={{
          fontSize: "clamp(34px, 6.5vw, 68px)", fontWeight: 800,
          lineHeight: 1.1, letterSpacing: "-1.5px",
          maxWidth: 720, marginBottom: 22,
        }}>
          Smarter Farming for{" "}
          <span style={{ color: T.accent }}>Maize & Ndengu</span>{" "}
          Farmers
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2.2vw, 18px)", color: T.muted,
          maxWidth: 540, lineHeight: 1.8, marginBottom: 44,
        }}>
          Mkulima Smart uses AI to help smallholder farmers in Lower Eastern Kenya
          forecast prices, track profits, get weather advice, and sell directly to buyers.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={onGoToApp}
            style={{
              background: T.accent, color: "#fff", border: "none", borderRadius: 10,
              padding: "14px 34px", fontWeight: 700, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 0 36px rgba(34,197,94,0.28)",
            }}
          >
            Get Started <ArrowRight size={17} />
          </button>
          <button
            onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
            style={{
              background: "transparent", color: T.text,
              border: `1px solid ${T.border}`, borderRadius: 10,
              padding: "14px 28px", fontWeight: 600, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            See Features <ChevronDown size={17} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 44, justifyContent: "center" }}>
          {[
            { label: "🌽 Maize" },
            { label: "🫘 Ndengu (Green Grams)" },
          ].map(c => (
            <span key={c.label} style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: T.accent,
              borderRadius: 999, padding: "6px 18px", fontSize: 14, fontWeight: 500,
            }}>{c.label}</span>
          ))}
        </div>
      </section>

      {/* Counties */}
      <section style={{
        padding: "64px 24px",
        borderTop: `1px solid ${T.border}`,
        background: T.surface,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ color: T.accent, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
            Our Coverage Area
          </p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, textAlign: "center", marginBottom: 40, letterSpacing: "-0.5px" }}>
            Three Counties. One Mission.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {counties.map((c, i) => (
              <div key={i} style={{
                background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: "26px 24px",
                borderLeft: `3px solid ${T.accent}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <MapPin size={15} color={T.accent} />
                  <h3 style={{ fontWeight: 700, fontSize: 16 }}>{c.name} County</h3>
                </div>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7 }}>{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: T.accent, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
          What the App Does
        </p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, textAlign: "center", marginBottom: 12, letterSpacing: "-0.5px" }}>
          Built Around Real Farming Problems
        </h2>
        <p style={{ color: T.muted, fontSize: 15, textAlign: "center", maxWidth: 500, margin: "0 auto 48px", lineHeight: 1.7 }}>
          Every feature addresses something farmers in Machakos, Makueni, and Kitui actually deal with.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: "26px 24px", transition: "border-color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.accent, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        padding: "80px 24px",
        background: `linear-gradient(180deg, ${T.bg} 0%, ${T.surface} 100%)`,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ color: T.accent, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
            Simple to Use
          </p>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, textAlign: "center", marginBottom: 48, letterSpacing: "-0.5px" }}>
            From Sign-Up to First Insight
          </h2>
          {[
            { step: "01", title: "Create Your Account", desc: "Register with your name and select your county — Machakos, Makueni, or Kitui — and your crop." },
            { step: "02", title: "View Your Dashboard", desc: "See live price forecasts, weather alerts, and buy/sell signals tailored to your county and crop." },
            { step: "03", title: "Track, Plan & Sell", desc: "Log your input costs, calculate your profit margin, and post your produce on the marketplace." },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 24, textAlign: "left",
              padding: "28px 0",
              borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
            }}>
              <span style={{
                fontSize: 40, fontWeight: 900,
                color: "rgba(34,197,94,0.18)", minWidth: 56, lineHeight: 1,
              }}>{item.step}</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "80px 24px", textAlign: "center",
        background: `radial-gradient(ellipse 60% 70% at 50% 50%, rgba(34,197,94,0.09) 0%, transparent 70%), ${T.surface}`,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 22px", color: T.accent,
          }}>
            <Sprout size={26} />
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.8px", marginBottom: 14 }}>
            Ready to Farm Smarter?
          </h2>
          <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>
            Built specifically for maize and ndengu farmers in Lower Eastern Kenya.
            Make better decisions on when to plant, spray, and sell.
          </p>
          <button
            onClick={onGoToApp}
            style={{
              background: T.accent, color: "#fff", border: "none", borderRadius: 12,
              padding: "15px 38px", fontWeight: 700, fontSize: 16, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 0 44px rgba(34,197,94,0.3)",
            }}
          >
            Get Started <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "32px",
        borderTop: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: T.accent, borderRadius: 6, padding: "4px 6px", display: "flex" }}>
            <Leaf size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Mkulima Smart</span>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: T.muted, fontSize: 12, marginBottom: 3 }}>
            Machakos · Makueni · Kitui
          </p>
          <p style={{ color: T.muted, fontSize: 12 }}>
            Maize & Ndengu
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ color: T.muted, fontSize: 12, marginBottom: 2 }}>Built by</p>
          <p style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>Mary & Esther</p>
          <p style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>© 2025 Mkulima Smart</p>
        </div>
      </footer>
    </div>
  );
}