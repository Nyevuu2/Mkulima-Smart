import React from "react";
import { 
  TrendingUp, Wallet, CloudRain, Target, 
  Sprout, ShieldCheck, CheckCircle, Droplets, Thermometer, Box
} from "lucide-react";
import { StatCard, Chip, T } from "../App";

export default function Dashboard({ county, crop, language, userContext, weatherAdviceData }) {
  const firstName = userContext?.firstName || "Farmer";
  
  // Normalize the crop property safely so capitalization doesn't break logic
  const cleanCrop = (crop || "maize").toLowerCase().trim();
  const isMaize = cleanCrop === "maize" || cleanCrop === "mahindi";
  
  const isEng = language === "en" || language === "English";
  const activeLangKey = isEng ? "English" : "Swahili";
  const activeCounty = county || "machakos";

  // Dynamically map live values from our FastAPI / TimescaleDB data block with solid fallbacks
  const finalAdvisoryText = weatherAdviceData?.advisory_text || 
    (isMaize 
      ? "Rain expected soon! Harvest mature crops quickly or secure storage covers." 
      : "Atmospheric shifts detected. Verify soil dampness before spreading fertilizer.");

  const finalCitationText = weatherAdviceData?.source_citation || "KALRO Reference Libraries";
  const finalClusterProfile = weatherAdviceData?.risk_profile || "Analyzing Regional Vectors...";
  const finalAlertTitle = weatherAdviceData?.advisory_title || "ADVISORY STATUS - MONITORING PHASE";
  const finalTemp = weatherAdviceData?.telemetry?.temperature || 24;
  const finalRain = weatherAdviceData?.telemetry?.precipitation || 12;

  const txt = {
    English: {
      welcome: `Welcome back, ${firstName}!`,
      pageTitle: "My Farm",
      activeSector: `Currently viewing ${isMaize ? "Maize" : "Green Grams"} in ${activeCounty.charAt(0).toUpperCase() + activeCounty.slice(1)}.`,
      systemConnected: !weatherAdviceData ? "Syncing Hub..." : "System Connected",
      weatherHeading: finalAlertTitle,
      alertBody: finalAdvisoryText,
      marketValue: "Market Price Today",
      perBag: "per 90kg bag",
      nextMonth: "Expected Next Month",
      forecastLabel: "Computer calculations estimate this price",
      totalSpent: "Money Spent So Far",
      outOf: "out of your seasonal limit",
      storageProtocolTitle: "Strategic Storage Protocol",
      storageProtocolHeading: isMaize ? "DIRECTIVE: HOLD & STORE" : "DIRECTIVE: STEADY SALE",
      advisoryProtocolTitle: "Storage Advisory Protocol",
      advisoryProtocolHeading: "FACILITY PREPARATION RULES",
      mDirective1: isMaize ? "Strong seasonal uptrend detected (+14.2%)" : "Mid-season valuation is highly stable (+8.7%)",
      mDirective2: isMaize ? "Store inventory for next 6-8 weeks" : "Secure logistics lines for immediate buyers",
      mDirective3: isMaize ? "Target peak window: July Forecast" : "Maintain baseline inventory thresholds",
      fDirective1: isMaize ? "Target moisture level: Below 13.5%" : "Clean bins thoroughly to block weevils",
      fDirective2: isMaize ? "Elevate bags onto wooden pallets" : "Seal containers to maintain hermetic air barrier",
      fDirective3: isMaize ? "Maintain cross-ventilation lines" : "Monitor storage temperature weekly"
    },
    Swahili: {
      welcome: `Karibu tena, ${firstName}!`,
      pageTitle: "Shamba Langu",
      activeSector: `Inaonyesha taarifa za ${isMaize ? "Mahindi" : "Ndengu"} katika Kaunti ya ${activeCounty.charAt(0).toUpperCase() + activeCounty.slice(1)}.`,
      systemConnected: !weatherAdviceData ? "Inasawazisha..." : "Mfumo Umefunguliwa",
      weatherHeading: finalAlertTitle === "ADVISORY STATUS - MONITORING PHASE" ? "Ushauri wa Hali ya Hewa" : finalAlertTitle,
      alertBody: finalAdvisoryText,
      marketValue: "Bei ya Soko Leo",
      perBag: "kwa gunia la kilo 90",
      nextMonth: "Bei Inayotarajiwa Mwezi Ujao",
      forecastLabel: "Utabiri wa mfumo unakadiria bei hii",
      totalSpent: "Pesa Zilizotumika Hadi Sasa",
      outOf: "kati ya kikomo cha msimu huu",
      storageProtocolTitle: "Itifaki ya Mkakati wa Uhifadhi",
      storageProtocolHeading: isMaize ? "MAAGIZO: WEKA GHALANI" : "MAAGIZO: UZA SASA",
      advisoryProtocolTitle: "Itifaki ya Ushauri wa Uhifadhi",
      advisoryProtocolHeading: "SHERIA ZA MATAYARISHO YA GHALA",
      mDirective1: isMaize ? "Mwenendo mkubwa wa bei unakuja (+14.2%)" : "Bei ya soko imetulia kwa sasa (+8.7%)",
      mDirective2: isMaize ? "Hifadhi mazao ghalani kwa wiki 6-8" : "Tayarisha usafiri wa kufuata wanunuzi",
      mDirective3: isMaize ? "Lengo la bei ya juu: Mwezi wa Julai" : "Weka akiba ya msingi ya mazao ghalani",
      fDirective1: isMaize ? "Kiwango cha unyevu: Chini ya 13.5%" : "Safisha maghala vizuri kuzuia wadudu",
      fDirective2: isMaize ? "Weka magunia juu ya mbao (pallets)" : "Funga mifuko vizuri bila kuingiza hewa",
      fDirective3: isMaize ? "Hakikisha mtiririko mzuri wa hewa" : "Kagua joto la ghala kila wiki"
    }
  }[activeLangKey];

  const baselinePrice = isMaize ? 3900 : 10100; 
  const growthRate = isMaize ? "+14.2%" : "+8.7%";
  
  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", background: T.background, color: T.text }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: T.textBright, margin: 0 }}>
          {txt.welcome}
        </h2>
        <Chip label={txt.systemConnected} color={!weatherAdviceData ? T.amber : T.accent} />
      </div>

      {/* 1. SECTOR METADATA BAR */}
      <div style={{ display: "flex", alignItems: "center", background: T.surfaceAlt, padding: "14px 20px", borderRadius: "12px", border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Sprout size={18} color={T.accent} />
          <span style={{ fontSize: "14px", fontWeight: 600, color: T.text }}>
            {txt.activeSector}
          </span>
        </div>
      </div>

      {/* 2. LIVE WEATHER ADVISORY */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", background: `${T.blue}10`, border: `1px solid ${T.blue}25`, padding: "20px", borderRadius: "14px" }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <CloudRain size={22} color={T.blue} style={{ marginTop: "2px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: "800", color: T.textBright, margin: 0 }}>{txt.weatherHeading}</h4>
            <p style={{ fontSize: "14px", color: T.text, margin: 0, lineHeight: 1.4 }}>{txt.alertBody}</p>
            <span style={{ fontSize: "11px", color: T.textDim, fontStyle: "italic", marginTop: "6px" }}>
              Source: {finalCitationText}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center", borderLeft: `1px solid ${T.border}`, paddingLeft: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: T.textDim }}>
            <Droplets size={14} color={T.blue} /> Model: <strong style={{ color: T.textBright }}>{finalClusterProfile}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: T.textDim }}>
            <Thermometer size={14} color={T.amber} /> Temp: <strong style={{ color: T.textBright }}>{finalTemp}°C</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: T.textDim }}>
            <CloudRain size={14} color={T.blue} /> Rain: <strong style={{ color: T.textBright }}>{finalRain}mm</strong>
          </div>
        </div>
      </div>

      {/* 3. CORE FINANCIAL STAT CARDS READOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
        <StatCard title={txt.marketValue} value={`KSh ${baselinePrice.toLocaleString()}`} sub={`${txt.perBag} (${growthRate})`} icon={TrendingUp} color={T.accent} />
        <StatCard title={txt.nextMonth} value={`KSh ${Math.round(baselinePrice * 1.05).toLocaleString()}`} sub={txt.forecastLabel} icon={Target} color={T.blue} />
        <StatCard title={txt.totalSpent} value="KSh 42,800" sub={`${txt.outOf} KSh 60,000`} icon={Wallet} color={T.amber} />
      </div>

      {/* 4. DUAL SCANNABLE STRATEGIC DIRECTIVE BLOCKS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ background: T.surface, padding: "20px", borderRadius: "14px", border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
          <h4 style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} color={T.accent} /> {txt.storageProtocolTitle}
          </h4>
          <div style={{ background: T.surfaceAlt, padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, color: isMaize ? T.amber : T.accent, borderLeft: `3px solid ${isMaize ? T.amber : T.accent}` }}>
            {txt.storageProtocolHeading}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: T.text }}><CheckCircle size={14} color={T.accent} /> {txt.mDirective1}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: T.text }}><CheckCircle size={14} color={T.accent} /> {txt.mDirective2}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: T.text }}><CheckCircle size={14} color={T.accent} /> {txt.mDirective3}</div>
          </div>
        </div>
        <div style={{ background: T.surface, padding: "20px", borderRadius: "14px", border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
          <h4 style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
            <Box size={14} color={T.blue} /> {txt.advisoryProtocolTitle}
          </h4>
          <div style={{ background: T.surfaceAlt, padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, color: T.textBright, borderLeft: `3px solid ${T.blue}` }}>
            {txt.advisoryProtocolHeading}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: T.text }}><CheckCircle size={14} color={T.blue} /> {txt.fDirective1}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: T.text }}><CheckCircle size={14} color={T.blue} /> {txt.fDirective2}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: T.text }}><CheckCircle size={14} color={T.blue} /> {txt.fDirective3}</div>
          </div>
        </div>
      </div>
    </div>
  );
}