import React, { useState } from "react";
import { Sparkles, RefreshCw, ShieldAlert, Calendar } from "lucide-react";

const T = {
  bg:         "#07100a",
  surface:    "#0e1a10",
  surfaceAlt: "#132016",
  surfaceHov: "#182a1c",
  border:     "#1c2e1f",
  borderBright:"#2a4030",
  accent:     "#4ade80",
  accentDim:  "#166534",
  amber:      "#fbbf24",
  blue:       "#60a5fa",
  red:        "#f87171",
  textDim:    "#7a9e82",
  text:       "#e8f5ec",
  textBright: "#f0fdf4",
};

const translations = {
  en: {
    title: "Price Prediction Engine",
    syncStatus: "Connected to Agriculture Portal Live Feed",
    refreshBtn: "Refresh Engine",
    directive: "Market Directive",
    holdDirective: "HOLD & STORE",
    sellDirective: "STEADY SALE",
    variance: "variance window",
    currentVsPeak: "Current vs. Predicted Peak",
    perBag: "per 90kg bag",
    projectedProfit: "Projected Net Margin",
    ifYouHold: "If you store",
    bagsLabel: "bags",
    maizeLabel: "Maize",
    greenGramsLabel: "Green Grams",
    trendSuffix: "Trend Trajectory",
    hoverPrompt: "Move mouse over points to read price points",
    footnote: "* Dashed line trajectories indicate predicted price targets for upcoming storage season.",
    strategyTitle: "Strategic Storage Protocol",
    maizeStrategy: "Maize Strategy",
    greenGramsStrategy: "Green Grams Strategy",
    maizeDesc: "Prices are expected to gain momentum over the next 6-8 weeks. Holding stock is recommended to maximize value.",
    greenGramsDesc: "Peak valuation thresholds are anticipated mid-season. Prepare your storage facilities early to capture premium windows."
  },
  sw: {
    title: "Mtambo wa Tabiri za Soko",
    syncStatus: "Imeunganishwa na Mfumo wa Kilimo",
    refreshBtn: "Huisha Data",
    directive: "Maagizo ya Soko",
    holdDirective: "WEKA GHALANI",
    sellDirective: "UZA SASA",
    variance: "mabadiliko ya makadirio",
    currentVsPeak: "Bei ya Sasa vs. Lengo la Juu",
    perBag: "kwa gunia la kilo 90",
    projectedProfit: "Faida Safi Inayotarajiwa",
    ifYouHold: "Ukihifadhi magunia",
    bagsLabel: "magunia",
    maizeLabel: "Mahindi",
    greenGramsLabel: "Ndengu",
    trendSuffix: "Mwenendo wa Bei",
    hoverPrompt: "Pitisha panya juu ya vitone kusoma makadirio ya bei",
    footnote: "* Mistari ya vitone inaonyesha makadirio ya bei ya mbele kwa msimu ujao wa uhifadhi.",
    strategyTitle: "Itifaki ya Mkakati wa Uhifadhi",
    maizeStrategy: "Mkakati wa Mahindi",
    greenGramsStrategy: "Mkakati wa Ndengu",
    maizeDesc: "Bei zinatarajiwa kuongezeka katika wiki 6-8 zijazo. Inashauriwa kuhifadhi mazao ili kupata faida kubwa.",
    greenGramsDesc: "Bei ya juu zaidi inatarajiwa kufikiwa katikati ya msimu. Tayarisha maghala yako mapema kuwahi soko zuri."
  }
};

export default function MarketIntelligence({ crop = "Maize", county = "Machakos", language = "en" }) {
  const [bags, setBags] = useState(20);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentLang = translations[language] || translations.en;

  // Real data baseline history up to June 2026, transitioning to prediction trends
  const timeline = [
    { month: "Oct", maize: 3200, greengrams: 8800, isForecast: false },
    { month: "Nov", maize: 3450, greengrams: 9100, isForecast: false },
    { month: "Dec", maize: 3100, greengrams: 9400, isForecast: false },
    { month: "Jan", maize: 2900, greengrams: 9000, isForecast: false },
    { month: "Feb", maize: 3300, greengrams: 8700, isForecast: false },
    { month: "Mar", maize: 3600, greengrams: 9200, isForecast: false },
    { month: "Apr", maize: 3750, greengrams: 9600, isForecast: false },
    { month: "May", maize: 3900, greengrams: 10100, isForecast: false },
    { month: "Jun", maize: 4100, greengrams: 10500, isForecast: true  },
    { month: "Jul", maize: 4250, greengrams: 10800, isForecast: true  }, // Highlight Target Peak Focus
    { month: "Aug", maize: 4400, greengrams: 11100, isForecast: true  },
  ];

  const isMaize = crop.toLowerCase() === "maize";
  const currentPrice = isMaize ? 3900 : 10100;
  const peakPrice = isMaize ? 4400 : 11100;
  const variancePct = ((peakPrice - currentPrice) / currentPrice) * 100;
  const projectedProfit = (peakPrice - currentPrice) * bags;

  // Render Display Names dynamically based on incoming prop configuration
  const dynamicCropLabel = isMaize ? currentLang.maizeLabel : currentLang.greenGramsLabel;

  // SVG Render Boundaries
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 50;
  const paddingY = 30;

  const activePrices = timeline.map(t => isMaize ? t.maize : t.greengrams);
  const minPrice = Math.min(...activePrices) * 0.95;
  const maxPrice = Math.max(...activePrices) * 1.05;

  const getCoords = (index, price) => {
    const x = paddingX + (index / (timeline.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((price - minPrice) / (maxPrice - minPrice)) * (svgHeight - paddingY * 2);
    return { x, y };
  };

  const points = timeline.map((pt, i) => getCoords(i, isMaize ? pt.maize : pt.greengrams));

  // Split paths into Historical (Solid) and Forecasted (Dashed)
  let solidPath = "";
  let dashedPath = "";

  points.forEach((p, i) => {
    if (i === 0) {
      solidPath += `M ${p.x} ${p.y}`;
    } else if (!timeline[i].isForecast) {
      solidPath += ` L ${p.x} ${p.y}`;
    }

    if (timeline[i].isForecast) {
      if (dashedPath === "") {
        const prevPoint = points[i - 1];
        dashedPath = `M ${prevPoint.x} ${prevPoint.y} L ${p.x} ${p.y}`;
      } else {
        dashedPath += ` L ${p.x} ${p.y}`;
      }
    }
  });

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "20px", background: T.bg, color: T.text }}>
      
      {/* ── PRICE ENGINE TOP LINK STATUS BAR ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface, padding: "12px 20px", borderRadius: "12px", border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={14} color={T.accent} className={isRefreshing ? "animate-spin" : ""} />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>
            {currentLang.title} <span style={{ color: T.textDim, fontWeight: 400 }}>({county} County)</span>
            <span style={{ marginLeft: "12px", fontSize: "11px", color: T.accent, background: `${T.accent}15`, padding: "3px 8px", borderRadius: "20px" }}>
              {currentLang.syncStatus}
            </span>
          </span>
        </div>
        <button onClick={triggerRefresh} style={{ background: "transparent", border: `1px solid ${T.borderBright}`, color: T.textBright, borderRadius: "6px", padding: "6px 12px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <RefreshCw size={12} /> {currentLang.refreshBtn}
        </button>
      </div>

      {/* ── STATS / CARD HORIZON OVERVIEW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        
        {/* Metric Card 1: Admin Directive Box */}
        <div style={{ background: T.surface, padding: "18px", borderRadius: "14px", border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {currentLang.directive}
          </span>
          <div style={{ fontSize: "28px", fontWeight: 900, color: variancePct > 5 ? T.amber : T.accent }}>
            {variancePct > 5 ? currentLang.holdDirective : currentLang.sellDirective}
          </div>
          <span style={{ fontSize: "11px", color: T.textDim }}>
            ▲ {variancePct.toFixed(1)}% {currentLang.variance}
          </span>
        </div>

        {/* Metric Card 2: Targeted Prices */}
        <div style={{ background: T.surface, padding: "18px", borderRadius: "14px", border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {currentLang.currentVsPeak}
          </span>
          <div style={{ fontSize: "20px", fontWeight: 800, color: T.textBright, marginTop: "6px" }}>
            KSh {currentPrice.toLocaleString()} → <span style={{ color: T.accent }}>KSh {peakPrice.toLocaleString()}</span>
          </div>
          <span style={{ fontSize: "11px", color: T.textDim }}>{currentLang.perBag}</span>
        </div>

        {/* Metric Card 3: Storage Calculations Output */}
        <div style={{ background: T.surface, padding: "18px", borderRadius: "14px", border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "11px", color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {currentLang.projectedProfit}
          </span>
          <div style={{ fontSize: "20px", fontWeight: 800, color: T.accent, marginTop: "4px" }}>
            KSh {projectedProfit.toLocaleString()}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
            <span style={{ fontSize: "11px", color: T.textDim }}>{currentLang.ifYouHold}</span>
            <input
              type="number"
              min={1}
              value={bags}
              onChange={(e) => setBags(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: "46px", background: T.surfaceAlt, border: `1px solid ${T.borderBright}`, borderRadius: "4px", padding: "2px", color: T.textBright, fontSize: "11px", fontWeight: 700, outline: "none", textAlign: "center" }}
            />
            <span style={{ fontSize: "11px", color: T.textDim }}>{currentLang.bagsLabel}</span>
          </div>
        </div>
      </div>

      {/* ── CENTRAL HOVER-SENSITIVE INTERACTIVE GRAPH ── */}
      <div style={{ background: T.surface, padding: "20px", borderRadius: "14px", border: `1px solid ${T.border}`, position: "relative" }}>
        
        {/* Dynamic Headers with Larger Highlighted Readout Text */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: T.textBright }}>
            <Calendar size={13} color={T.accent} />
            {dynamicCropLabel} {currentLang.trendSuffix}
          </div>
          <div>
            {hoveredIndex !== null ? (
              <div style={{ fontSize: "16px", fontWeight: 800, color: T.accent, background: `${T.accent}10`, padding: "4px 12px", borderRadius: "8px", border: `1px solid ${T.accent}30` }}>
                <span style={{ color: T.textBright }}>{timeline[hoveredIndex].month}: </span>
                KSh {(isMaize ? timeline[hoveredIndex].maize : timeline[hoveredIndex].greengrams).toLocaleString()}
                <span style={{ fontSize: "11px", fontWeight: 400, color: T.textDim, marginLeft: "6px" }}>
                  {timeline[hoveredIndex].isForecast ? " (Forecast)" : " (Actual)"}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: "11px", color: T.textDim, fontStyle: "italic", opacity: 0.8 }}>
                {currentLang.hoverPrompt}
              </span>
            )}
          </div>
        </div>

        {/* SVG Workspace Frame Area */}
        <div style={{ width: "100%", background: T.surfaceAlt, borderRadius: "8px", padding: "10px 0" }}>
          <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: "visible" }}>
            
            {/* Horizontal Guide Rows */}
            {[0, 0.5, 1].map((ratio, i) => {
              const y = paddingY + ratio * (svgHeight - paddingY * 2);
              const gridVal = Math.round(maxPrice - ratio * (maxPrice - minPrice));
              return (
                <g key={i}>
                  <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke={T.border} strokeDasharray="2 4" />
                  <text x={paddingX - 12} y={y + 4} fill={T.textDim} fontSize="10px" textAnchor="end">KSh {gridVal.toLocaleString()}</text>
                </g>
              );
            })}

            {/* Historical Solid Segment Track Line */}
            {solidPath && (
              <path d={solidPath} fill="none" stroke={isMaize ? T.amber : T.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Forecasted Dashed Segment Track Line */}
            {dashedPath && (
              <path d={dashedPath} fill="none" stroke={isMaize ? T.amber : T.accent} strokeWidth="3" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Coordinate Intersection Circles + Hover Interaction Zones */}
            {timeline.map((pt, i) => {
              const coord = points[i];
              const isHovered = hoveredIndex === i;
              const isJulyForecast = pt.month === "Jul" && pt.isForecast;
              
              // Standard color assignments based on selection parameters
              const baseColor = isMaize ? T.amber : T.accent;
              const pointColor = isJulyForecast ? T.red : baseColor;

              return (
                <g key={i}>
                  {/* Outer custom glowing target ring elements */}
                  {isHovered && (
                    <circle cx={coord.x} cy={coord.y} r="10" fill={pointColor} opacity="0.2" />
                  )}
                  
                  {/* Highlighted special anchor marker structure for July */}
                  {isJulyForecast && !isHovered && (
                    <circle cx={coord.x} cy={coord.y} r="7" fill="none" stroke={T.red} strokeWidth="1.5" opacity="0.6" strokeDasharray="2 2" />
                  )}

                  {/* Core Data Intersection node dot */}
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={isJulyForecast ? "6" : isHovered ? "5" : "3.5"}
                    fill={pt.isForecast ? T.bg : pointColor}
                    stroke={pointColor}
                    strokeWidth={isJulyForecast ? "3" : "2.5"}
                  />

                  {/* Text Axis Label row representing Months */}
                  <text 
                    x={coord.x} 
                    y={svgHeight - 6} 
                    fill={isJulyForecast ? T.red : pt.isForecast ? T.blue : T.textDim} 
                    fontSize={isJulyForecast ? "11px" : "10px"} 
                    fontWeight={isJulyForecast || pt.isForecast ? 700 : 500} 
                    textAnchor="middle"
                  >
                    {pt.month}{pt.isForecast ? "*" : ""}
                  </text>

                  {/* Invisible Vertical Overlay Rectangles optimized for smooth hover capture */}
                  <rect
                    x={coord.x - (svgWidth / timeline.length) / 2}
                    y={0}
                    width={svgWidth / timeline.length}
                    height={svgHeight}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ fontSize: "10px", color: T.textDim, marginTop: "8px" }}>
          {currentLang.footnote}
        </div>
      </div>

      {/* ── DETAILED STRATEGIC DESCRIPTIONS LOWER BOX ROW ── */}
      <div style={{ background: T.surface, padding: "18px", borderRadius: "14px", border: `1px solid ${T.border}` }}>
        <h4 style={{ fontSize: "12px", fontWeight: 700, color: T.textBright, margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldAlert size={14} color={T.amber} /> {currentLang.strategyTitle}
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "12px" }}>
          <div style={{ background: T.surfaceAlt, padding: "12px", borderRadius: "8px", lineHeight: "1.6", borderLeft: `3px solid ${T.amber}` }}>
            <strong style={{ color: T.amber, display: "block", marginBottom: "2px" }}>{currentLang.maizeStrategy}</strong>
            {currentLang.maizeDesc}
          </div>
          <div style={{ background: T.surfaceAlt, padding: "12px", borderRadius: "8px", lineHeight: "1.6", borderLeft: `3px solid ${T.accent}` }}>
            <strong style={{ color: T.accent, display: "block", marginBottom: "2px" }}>{currentLang.greenGramsStrategy}</strong>
            {currentLang.greenGramsDesc}
          </div>
        </div>
      </div>

    </div>
  );
}