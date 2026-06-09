import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Leaf, TrendingUp, CloudSun, ShoppingBag,
  BarChart2, Shield, MapPin, Sprout, MessageCircle, Menu, X
} from "lucide-react";

/* ─── Design Tokens ───────────────────────────────────────────── */
const T = {
  bg:        "#f0fdf4",
  surface:   "#ffffff",
  deepGreen: "#052e16",
  midGreen:  "#16a34a",
  lightGreen:"#dcfce7",
  border:    "#bbf7d0",
  text:      "#0f172a",
  muted:     "#475569",
  amber:     "#d97706",
  amberLight:"#fef3c7",
  amberBorder:"#fcd34d",
};

/* ─── Free Unsplash Images (licence-free) ─────────────────────── */
const HERO_IMG   = "https://images.unsplash.com/photo-1735743106898-09a81f0c02ca?w=1400&q=80&fit=crop"; // Kenya green field
const FIELD_IMG  = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&q=80&fit=crop";  // maize field rows

/* ─── Content ─────────────────────────────────────────────────── */
const features = [
  {
    icon: <BarChart2 size={24} />,
    title: "Price Forecasting",
    desc: "See where maize and ndengu prices are likely to go over the next 30 days — so you can decide whether to sell now or wait a little longer for a better price.",
    highlight: true,
  },
  {
    icon: <Shield size={24} />,
    title: "Clear Sell or Hold Advice",
    desc: "No confusing graphs — just a straightforward recommendation on whether today is a good day to sell, or whether holding your harvest a bit longer makes more sense.",
    highlight: true,
  },
  {
    icon: <CloudSun size={24} />,
    title: "Weather Advisory",
    desc: "Get timely advice on when to plant, spray, or harvest — based on the actual weather patterns in your county, not a general forecast for the whole country.",
    highlight: true,
  },
  {
    icon: <ShoppingBag size={24} />,
    title: "Direct Buyer Marketplace",
    desc: "List your maize or ndengu and let buyers in your county find you. No more depending on brokers or guessing who will buy your produce at harvest time.",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Expense & Profit Tracker",
    desc: "Keep track of what you spent on seeds, fertiliser, and labour. Before you sell, the app shows you exactly what price you need to make a profit.",
  },
  {
    icon: <MapPin size={24} />,
    title: "Built for Lower Eastern Kenya",
    desc: "Everything you see — prices, weather, market listings — is specific to Machakos, Makueni, and Kitui. Nothing from other regions that does not apply to you.",
  },
];

const counties = [
  { name: "Machakos", detail: "A key maize and ndengu growing area, with many farmers selling at Machakos Town market. Prices here move fast — knowing when to sell makes a real difference." },
  { name: "Makueni",  detail: "Ndengu is a lifeline crop in Makueni, especially during dry seasons. Farmers here need reliable information on when prices are at their best." },
  { name: "Kitui",    detail: "Farming in Kitui requires careful timing. With limited rainfall and long distances to market, getting the right information early is what separates a good season from a bad one." },
];

const steps = [
  { step: "01", title: "Create Your Account",   desc: "Sign up with your name, choose your county — Machakos, Makueni, or Kitui — and tell us whether you grow maize, ndengu, or both. It takes less than two minutes.", icon: <Leaf size={20}/> },
  { step: "02", title: "See What Matters to You", desc: "Your dashboard shows the current price trend for your crop, a weather update for your county, and a clear recommendation on whether to sell or hold.", icon: <BarChart2 size={20}/> },
  { step: "03", title: "Track Your Costs & Sell", desc: "Record what you spent on your farm, see the minimum price you need to break even, and when you are ready, post your produce directly to buyers in your area.", icon: <Sprout size={20}/> },
];

/* ─── Scroll-reveal hook ──────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── Reveal wrapper ──────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function LandingPage({ onGoToApp }) {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileNav, setMobileNav]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNav(false);
  };

  const navLinks = [
    { label: "Features",    id: "features" },
    { label: "Counties",    id: "counties" },
    { label: "How It Works",id: "how-it-works" },
  ];

  return (
    <div style={{
      background: T.bg,
      color: T.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflowX: "hidden",
    }}>

      {/* ── Sticky Nav ─────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${T.border}`,
        transition: "box-shadow 0.3s",
        boxShadow: scrolled ? "0 2px 16px rgba(5,46,22,0.08)" : "none",
        padding: "13px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: T.midGreen, borderRadius: 8, padding: "5px 7px", display: "flex" }}>
            <Leaf size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.4px", color: T.deepGreen }}>Mkulima Smart</span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }} className="desktop-nav">
          {navLinks.map(n => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600, color: T.muted,
                padding: 0, transition: "color 0.2s",
              }}
              onMouseEnter={e => e.target.style.color = T.midGreen}
              onMouseLeave={e => e.target.style.color = T.muted}
            >
              {n.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onGoToApp}
            style={{
              background: T.amber, color: "#fff", border: "none", borderRadius: 8,
              padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 2px 12px rgba(217,119,6,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(217,119,6,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(217,119,6,0.3)"; }}
          >
            Get Started <ArrowRight size={15} />
          </button>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNav(!mobileNav)}
            aria-label={mobileNav ? "Close navigation" : "Open navigation"}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}
            className="hamburger"
          >
            {mobileNav ? <X size={22} color={T.deepGreen}/> : <Menu size={22} color={T.deepGreen}/>}
          </button>
        </div>
      </nav>

      {/* ── Mobile nav drawer ──────────────────────────────────── */}
      {mobileNav && (
        <div style={{
          position: "fixed", top: 56, left: 0, right: 0, zIndex: 99,
          background: "#fff", borderBottom: `1px solid ${T.border}`,
          padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}>
          {navLinks.map(n => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, color: T.deepGreen, textAlign: "left", padding: "4px 0" }}
            >
              {n.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{
        minHeight: "92vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "80px 24px 60px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background photo */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: "cover", backgroundPosition: "center 40%",
          filter: "brightness(0.38) saturate(1.1)",
        }} />
        {/* Green overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(180deg, rgba(5,46,22,0.45) 0%, rgba(5,46,22,0.7) 100%)",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <Reveal>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 999, padding: "6px 16px", marginBottom: 28,
              fontSize: 13, color: "#ffffff", fontWeight: 500, backdropFilter: "blur(6px)",
            }}>
              <MapPin size={13} /> Lower Eastern Kenya · Machakos · Makueni · Kitui
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 style={{
              fontSize: "clamp(36px, 6.5vw, 70px)", fontWeight: 900,
              lineHeight: 1.08, letterSpacing: "-1.5px",
              maxWidth: 760, marginBottom: 22, color: "#ffffff",
            }}>
              Smarter Farming for{" "}
              <span style={{ color: "#fbbf24" }}>Maize & Ndengu</span>{" "}
              Farmers
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p style={{
              fontSize: "clamp(15px, 2.2vw, 19px)", color: "rgba(255,255,255,0.85)",
              maxWidth: 540, lineHeight: 1.85, marginBottom: 44, margin: "0 auto 44px",
            }}>
              Mkulima Smart helps smallholder farmers in Lower Eastern Kenya
              forecast prices, track profits, get weather advice, and make more informed farming decisions.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={onGoToApp}
                style={{
                  background: T.amber, color: "#fff", border: "none", borderRadius: 10,
                  padding: "15px 36px", fontWeight: 800, fontSize: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 0 40px rgba(217,119,6,0.5)",
                  transition: "transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 32px rgba(217,119,6,0.6)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 0 40px rgba(217,119,6,0.5)"; }}
              >
                Get Started <ArrowRight size={17} />
              </button>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── Counties ───────────────────────────────────────────── */}
      <section id="counties" style={{
        padding: "72px 24px",
        borderTop: `1px solid ${T.border}`,
        background: T.surface,
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <p style={{ color: T.midGreen, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
              Our Coverage Area
            </p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, textAlign: "center", marginBottom: 12, letterSpacing: "-0.5px", color: T.deepGreen }}>
              Three Counties. One Mission.
            </h2>
            <p style={{ color: T.muted, fontSize: 15, textAlign: "center", maxWidth: 480, margin: "0 auto 44px", lineHeight: 1.75 }}>
              Mkulima Smart focuses entirely on Lower Eastern Kenya. Everything on the platform — prices, weather, marketplace listings — is relevant to your county and your crops.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {counties.map((c, i) => (
              <Reveal key={i} delay={i * 80}>
                <div
                  style={{
                    background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: 16, padding: "28px 26px",
                    borderLeft: `4px solid ${T.midGreen}`,
                    transition: "transform 0.22s, box-shadow 0.22s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(22,163,74,0.14)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <MapPin size={15} color={T.midGreen} />
                    <h3 style={{ fontWeight: 800, fontSize: 16, color: T.deepGreen }}>{c.name} County</h3>
                  </div>
                  <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.75 }}>{c.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: "80px 24px", background: T.bg }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Reveal>
            <p style={{ color: T.midGreen, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
              What the App Does
            </p>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, textAlign: "center", marginBottom: 12, letterSpacing: "-0.6px", color: T.deepGreen }}>
              Built Around Real Farming Problems
            </h2>
            <p style={{ color: T.muted, fontSize: 15, textAlign: "center", maxWidth: 500, margin: "0 auto 52px", lineHeight: 1.75 }}>
              Each feature was designed around the questions and challenges that come up most for farmers in Machakos, Makueni, and Kitui.
            </p>
          </Reveal>

          {/* Hero features — 3 wide */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 20 }}>
            {features.filter(f => f.highlight).map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div
                  style={{
                    background: T.deepGreen, color: "#fff",
                    borderRadius: 18, padding: "32px 30px",
                    transition: "transform 0.22s, box-shadow 0.22s",
                    cursor: "default",
                    border: "1px solid rgba(251,191,36,0.2)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-6px) scale(1.01)"; e.currentTarget.style.boxShadow="0 16px 40px rgba(5,46,22,0.28)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow="none"; }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: "rgba(251,191,36,0.18)", border: "1px solid rgba(251,191,36,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fbbf24", marginBottom: 18,
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ display: "inline-flex", marginBottom: 10 }}>
                    <span style={{ background: T.amber, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "3px 10px", letterSpacing: 0.5 }}>KEY FEATURE</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: "#fff" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.75)" }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Supporting features — 4 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
            {features.filter(f => !f.highlight).map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <div
                  style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 16, padding: "26px 24px",
                    transition: "transform 0.22s, box-shadow 0.22s, border-color 0.22s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow="0 12px 28px rgba(22,163,74,0.12)"; e.currentTarget.style.borderColor=T.midGreen; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor=T.border; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 11,
                    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.midGreen, marginBottom: 16,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: T.deepGreen }}>{f.title}</h3>
                  <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.8 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Field photo break ──────────────────────────────────── */}
      <div style={{
        height: 260, overflow: "hidden", position: "relative",
      }}>
        <img
          src={FIELD_IMG}
          alt="Maize field rows"
          style={{
            width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 60%",
            filter: "brightness(0.75) saturate(1.1)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(5,46,22,0.65), rgba(5,46,22,0.2), rgba(5,46,22,0.65))",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <p style={{ color: "#fff", fontSize: "clamp(18px, 3vw, 28px)", fontWeight: 800, textAlign: "center", maxWidth: 560, lineHeight: 1.4, padding: "0 24px" }}>
            "The right information at the right time is the difference between profit and loss."
          </p>
        </div>
      </div>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section id="how-it-works" style={{
        padding: "80px 24px",
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <p style={{ color: T.midGreen, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>
              Simple to Use
            </p>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, textAlign: "center", marginBottom: 12, letterSpacing: "-0.5px", color: T.deepGreen }}>
              From Sign-Up to First Insight
            </h2>
            <p style={{ color: T.muted, fontSize: 15, textAlign: "center", maxWidth: 440, margin: "0 auto 56px", lineHeight: 1.75 }}>
              Three steps. No tech experience needed.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, position: "relative" }}>
            {steps.map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div
                  style={{
                    background: T.bg, border: `1px solid ${T.border}`,
                    borderRadius: 18, padding: "32px 26px",
                    textAlign: "center",
                    transition: "transform 0.22s, box-shadow 0.22s",
                    cursor: "default",
                    position: "relative",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow="0 14px 36px rgba(22,163,74,0.14)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                >
                  {/* Step number circle */}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: T.deepGreen, color: "#fbbf24",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: 20, fontWeight: 900,
                    boxShadow: "0 4px 14px rgba(5,46,22,0.25)",
                  }}>
                    {item.step}
                  </div>
                  {/* Icon chip */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                    color: T.midGreen, marginBottom: 14,
                  }}>
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10, color: T.deepGreen }}>{item.title}</h3>
                  <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8 }}>{item.desc}</p>

                  {/* Connector arrow (not on last) */}
                  {i < steps.length - 1 && (
                    <div style={{
                      position: "absolute", right: -14, top: "50%",
                      transform: "translateY(-50%)",
                      color: T.midGreen, fontSize: 22, fontWeight: 900,
                      display: "flex", alignItems: "center",
                      pointerEvents: "none",
                    }}>→</div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section style={{
        padding: "80px 24px", textAlign: "center",
        background: T.bg,
        borderTop: `1px solid ${T.border}`,
      }}>
        <Reveal>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{
              width: 62, height: 62, borderRadius: 16,
              background: T.lightGreen, border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", color: T.midGreen,
            }}>
              <Sprout size={28} />
            </div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 900, letterSpacing: "-0.8px", marginBottom: 14, color: T.deepGreen }}>
              Ready to Farm Smarter?
            </h2>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.85, marginBottom: 36 }}>
              Built specifically for maize and ndengu farmers in Lower Eastern Kenya.
              Make better decisions on when to plant, spray, and sell.
            </p>
            <button
              onClick={onGoToApp}
              style={{
                background: T.amber, color: "#fff", border: "none", borderRadius: 12,
                padding: "15px 40px", fontWeight: 800, fontSize: 16, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: "0 0 44px rgba(217,119,6,0.3)",
                transition: "transform 0.18s, box-shadow 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(217,119,6,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 0 44px rgba(217,119,6,0.3)"; }}
            >
              Get Started <ArrowRight size={17} />
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        background: T.deepGreen, color: "rgba(255,255,255,0.7)",
        padding: "40px 32px 28px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 32,
            justifyContent: "space-between", alignItems: "flex-start",
            paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: T.midGreen, borderRadius: 6, padding: "4px 6px", display: "flex" }}>
                  <Leaf size={14} color="#fff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>Mkulima Smart</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>
                AI-powered farming decisions for smallholder farmers in Lower Eastern Kenya.
              </p>
            </div>

            {/* Nav links */}
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Sections</p>
              {navLinks.map(n => (
                <button
                  key={n.id}
                  onClick={() => scrollTo(n.id)}
                  style={{ display: "block", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.65)", fontSize: 14, padding: "4px 0", textAlign: "left", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color="#fff"}
                  onMouseLeave={e => e.target.style.color="rgba(255,255,255,0.65)"}
                >
                  {n.label}
                </button>
              ))}
            </div>

            {/* Coverage */}
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Coverage</p>
              {["Machakos County", "Makueni County", "Kitui County"].map(c => (
                <p key={c} style={{ fontSize: 14, padding: "4px 0", color: "rgba(255,255,255,0.65)" }}>{c}</p>
              ))}
            </div>

            {/* Contact */}
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Get in Touch</p>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.65)", marginBottom: 14 }}>
                For enquiries or support, you are welcome to reach us on WhatsApp during business hours.
              </p>
              <a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 8,
                  padding: "9px 18px", fontWeight: 600, fontSize: 13,
                  textDecoration: "none", transition: "border-color 0.18s, color 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#25D366"; e.currentTarget.style.color="#25D366"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.3)"; e.currentTarget.style.color="#fff"; }}
              >
                <MessageCircle size={15} />
                WhatsApp: +254 700 000 000
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, paddingTop: 20, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            <span>© 2025 Mkulima Smart · Built by <strong style={{ color: "rgba(255,255,255,0.7)" }}>Mary & Esther</strong></span>
            <span>Maize & Ndengu · Lower Eastern Kenya</span>
          </div>
        </div>
      </footer>

      {/* ── Global Keyframes ───────────────────────────────────── */}
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
        @media (max-width: 680px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
      `}</style>
    </div>
  );
}