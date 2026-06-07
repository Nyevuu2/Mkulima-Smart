import React, { useState, useEffect } from "react";
import { CloudRain, Sun, Wind, Droplets, ShieldAlert, CalendarCheck, Loader, AlertCircle, BookOpen } from "lucide-react";
import { Card, T } from "../App";

export default function WeatherAdvisory({ county, crop, language }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeammateWeatherData = async () => {
      setLoading(true);
      try {
        // Safe string query formulation
        const cleanCounty = county ? county.toLowerCase().trim() : "machakos";
        const response = await fetch(
          `http://127.0.0.1:8000/api/weather-advice?county=${cleanCounty}`
        );
        
        if (!response.ok) throw new Error("Backend server connectivity failure.");
        
        const jsonResponse = await response.json();
        
        // Defensive mapping for her top-level dictionary validation wrapper
        if (jsonResponse && jsonResponse.status === "success" && jsonResponse.data) {
          setWeatherData(jsonResponse.data);
        } else if (jsonResponse) {
          setWeatherData(jsonResponse);
        } else {
          throw new Error("Received an empty payload from the classification engine.");
        }
        setError(null);
      } catch (err) {
        console.error("Unable to query live weather metrics:", err);
        setError("Could not retrieve live agronomic insights. Verify FastAPI is online.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeammateWeatherData();
  }, [county]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, color: T.textDim }}>
        <Loader size={32} className="animate-spin" color={T.accent} />
        <p style={{ fontSize: 14 }}>Streaming live environmental clusters...</p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <Card style={{ padding: 24, textAlign: "center", border: `1px solid ${T.border}`, margin: "20px auto", maxWidth: 600 }}>
        <AlertCircle size={40} color={T.red} style={{ margin: "0 auto 12px auto" }} />
        <h3 style={{ color: T.textBright, marginBottom: 8, fontSize: 16 }}>Connection Interrupted</h3>
        <p style={{ color: T.textDim, fontSize: 13, maxWidth: 400, margin: "0 auto" }}>{error || "No data available."}</p>
      </Card>
    );
  }

  // DYNAMIC FILTER: Clean cross-matching checks to prevent reading undefined objects
  const safeCropStr = (crop || "").toLowerCase();
  const isMaize = safeCropStr.includes("maize") || safeCropStr.includes("mahindi");
  
  // Maps both "Green Grams" and "Ndengu" keys safely from her rules list
  const liveCropRule = isMaize 
    ? weatherData?.crop_specific_rules?.Maize 
    : (weatherData?.crop_specific_rules?.Ndengu || weatherData?.crop_specific_rules?.["Green Grams"]);

  const isCritical = weatherData?.alert_level?.toLowerCase().includes("critical");
  const alertColor = isCritical ? "#ef4444" : T.accent;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800, margin: "0 auto", padding: "20px 16px" }}>
      
      {/* 1. CLUSTER HEADING IDENTIFIER CARD */}
      <Card style={{ padding: 24, borderLeft: `4px solid ${alertColor}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <ShieldAlert size={20} color={alertColor} />
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: alertColor }}>
            {weatherData?.alert_level || "System Advisory"}
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.textBright, margin: "0 0 4px 0" }}>
          {weatherData?.climate_condition || "Analyzing Cluster Status"}
        </h2>
        <p style={{ fontSize: 13, color: T.textDim, margin: 0 }}>
          Assigned Agro-Climate Profile: <strong style={{ color: T.blue }}>Cluster #{weatherData?.cluster_id ?? "N/A"}</strong>
        </p>
      </Card>

      {/* 2. LIVE DYNAMIC CROP DIRECTIVE CARD */}
      <Card style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, borderBottom: `1px solid ${T.border}`, paddingBottom: 16 }}>
          <CalendarCheck size={22} color={T.accent} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.textBright, margin: 0 }}>
            Target Actions for {crop || "Selected Crop"} Growers
          </h3>
        </div>

        <div style={{ display: "flex", gap: 16, background: T.surfaceAlt, padding: 20, borderRadius: 10 }}>
          <div style={{ width: 4, background: alertColor, borderRadius: 2, alignSelf: "stretch" }} />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: alertColor, margin: "0 0 6px 0" }}>
              Field Level Guideline
            </h4>
            <p style={{ fontSize: 14, color: T.text, lineHeight: 1.6, margin: 0 }}>
              {liveCropRule || "No direct guidelines recorded for this specific profile cluster setup."}
            </p>
          </div>
        </div>
      </Card>

      {/* 3. SCIENTIFIC VALIDATION TRACK */}
      {weatherData?.traceability && (
        <Card style={{ padding: 24, background: `${T.surfaceAlt}50` }}>
          <div style={{ display: "flex", alignItems: "start", gap: 14 }}>
            <BookOpen size={18} color={T.blue} style={{ marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h5 style={{ fontSize: 13, fontWeight: 800, color: T.textBright, margin: "0 0 6px 0" }}>
                Agronomic Rationale & Background Validation
              </h5>
              <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.5, margin: "0 0 12px 0", fontStyle: "italic" }}>
                "{weatherData.traceability.agronomic_rationale || "No validation logged."}"
              </p>
              <div style={{ fontSize: 11, color: T.blue, fontWeight: 700 }}>
                Data Source: {weatherData.traceability.source_citation || "Regional Extension Reports"}
              </div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}