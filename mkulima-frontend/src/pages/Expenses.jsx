import React, { useState, useMemo, useEffect } from "react";
import {
  Plus, Trash2, PlusCircle,
  ShoppingCart, Calculator, ClipboardList, ChevronDown, ChevronUp, Layers
} from "lucide-react";
import { Card, StatCard, T } from "../App";

const CATEGORIES = ["Seeds", "Fertilizer", "Labour", "Pesticides", "Transport", "Irrigation", "Equipment", "Other"];

export default function Expenses({ crop = "Maize", county = "Machakos" }) {
  
  // ── 1. SEASON TRACKING STATES ──
  // Pre-populate with some standard seasons, but allow them to type a custom one
  const [seasons, setSeasons] = useState(() => {
    const saved = localStorage.getItem("mkulima_seasons");
    return saved ? JSON.parse(saved) : ["Long Rains 2026", "Short Rains 2026", "Irrigation Cycle 01"];
  });
  
  const [activeSeason, setActiveSeason] = useState(() => {
    const saved = localStorage.getItem("mkulima_active_season");
    return saved || "Long Rains 2026";
  });

  const [newSeasonName, setNewSeasonName] = useState("");
  const [showSeasonForm, setShowSeasonForm] = useState(false);

  // ── 2. PERSISTED LEDGER STATES ──
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("mkulima_expenses");
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem("mkulima_sales");
    return saved ? JSON.parse(saved) : [];
  });

  // Calculator states are tracked per season using an object map
  const [seasonCalcs, setSeasonCalcs] = useState(() => {
    const saved = localStorage.getItem("mkulima_season_calcs");
    return saved ? JSON.parse(saved) : {};
  });

  // Get current calculator inputs for the active season, or default them
  const calcBags = seasonCalcs[activeSeason]?.bags || 0;
  const sellingPrice = seasonCalcs[activeSeason]?.price || 3900;

  // ── 3. LOCALSTORAGE SYNCHRONIZATION EFFECTS ──
  useEffect(() => {
    localStorage.setItem("mkulima_seasons", JSON.stringify(seasons));
    localStorage.setItem("mkulima_active_season", activeSeason);
  }, [seasons, activeSeason]);

  useEffect(() => {
    localStorage.setItem("mkulima_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("mkulima_sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("mkulima_season_calcs", JSON.stringify(seasonCalcs));
  }, [seasonCalcs]);

  // Form input states
  const [form, setForm] = useState({ category: "Seeds", amount: "", note: "", date: "" });
  const [showForm, setShowForm] = useState(false);
  const [saleForm, setSaleForm] = useState({ bags: "", pricePerBag: "", date: "", note: "" });
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [showSalesLog, setShowSalesLog] = useState(true);

  // ── 4. CRITICAL DIVISION: Filter metrics exclusively for the active season ──
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => e.season === activeSeason);
  }, [expenses, activeSeason]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => s.season === activeSeason);
  }, [sales, activeSeason]);

  // ── 5. COMPUTED ISOLATED METRICS ──
  const totalExpenses = useMemo(() => filteredExpenses.reduce((s, e) => s + Number(e.amount), 0), [filteredExpenses]);
  const totalRevenueSold = useMemo(() => filteredSales.reduce((s, sl) => s + sl.bags * sl.pricePerBag, 0), [filteredSales]);
  const totalBagsSold = useMemo(() => filteredSales.reduce((s, sl) => s + sl.bags, 0), [filteredSales]);
  const realizedProfit = totalRevenueSold - totalExpenses;

  const projectedRevenue = calcBags * sellingPrice;
  const projectedProfit = projectedRevenue - totalExpenses;
  
  const breakEvenPrice = totalExpenses > 0 && calcBags > 0 ? Math.ceil(totalExpenses / calcBags) : 0;

  // ── 6. TRANSACTION HANDLERS (Injecting season tags automatically) ──
  const addSeason = () => {
    if (!newSeasonName.trim() || seasons.includes(newSeasonName.trim())) return;
    setSeasons(prev => [...prev, newSeasonName.trim()]);
    setActiveSeason(newSeasonName.trim());
    setNewSeasonName("");
    setShowSeasonForm(false);
  };

  const addExpense = () => {
    if (!form.amount || isNaN(form.amount)) return;
    setExpenses(prev => [...prev, { ...form, id: Date.now(), amount: Number(form.amount), season: activeSeason }]);
    setForm({ category: "Seeds", amount: "", note: "", date: "" });
    setShowForm(false);
  };
  const removeExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const addSale = () => {
    if (!saleForm.bags || !saleForm.pricePerBag) return;
    setSales(prev => [...prev, { ...saleForm, id: Date.now(), bags: Number(saleForm.bags), pricePerBag: Number(saleForm.pricePerBag), season: activeSeason }]);
    setSaleForm({ bags: "", pricePerBag: "", date: "", note: "" });
    setShowSaleForm(false);
  };
  const removeSale = (id) => setSales(prev => prev.filter(s => s.id !== id));

  const updateCalculator = (key, val) => {
    setSeasonCalcs(prev => ({
      ...prev,
      [activeSeason]: {
        ...(prev[activeSeason] || { bags: 0, price: 3900 }),
        [key]: val
      }
    }));
  };

  const fmt = (n) => `KSh ${Number(n).toLocaleString()}`;

  // ── 7. RENDER-SAFE STYLES ──
  const inputStyle = {
    background: T?.bg || "#111827", 
    border: `1px solid ${T?.border || "#374151"}`, 
    borderRadius: "8px",
    color: T?.textBright || "#ffffff", 
    padding: "10px 14px", 
    fontSize: "13px", 
    outline: "none", 
    width: "100%",
  };

  const dropdownSelectStyle = {
    ...inputStyle,
    background: T?.surfaceAlt || "#1f2937", 
    color: T?.textBright || "#ffffff",
    cursor: "pointer"
  };

  const btnSubmit = {
    background: T?.accent || "#10b981", 
    color: "#ffffff", 
    border: "none", 
    borderRadius: "8px",
    padding: "10px 16px", 
    fontWeight: 700, 
    cursor: "pointer", 
    fontSize: "13px",
  };

  const btnDelete = {
    background: `${T?.amber || "#f59e0b"}10`, 
    color: T?.amber || "#f59e0b", 
    border: `1px solid ${T?.amber || "#f59e0b"}25`,
    borderRadius: "6px", 
    padding: "6px 10px", 
    cursor: "pointer", 
    display: "flex", 
    alignItems: "center",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── NEW: Season Division Header Panel ── */}
      <Card style={{ padding: "16px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", borderLeft: `4px solid ${T?.accent || "#10b981"}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Layers size={20} color={T?.accent || "#10b981"} />
          <div>
            <div style={{ color: T?.textDim, fontSize: "11px", fontWeight: "600" }}>CURRENT REPORTING SEASON</div>
            <select 
              value={activeSeason} 
              onChange={e => setActiveSeason(e.target.value)} 
              style={{ ...dropdownSelectStyle, width: "auto", padding: "6px 12px", fontSize: "14px", fontWeight: "700", border: "none" }}
            >
              {seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          {!showSeasonForm ? (
            <button onClick={() => setShowSeasonForm(true)} style={{ ...btnSubmit, background: "transparent", border: `1px solid ${T?.border}`, color: T?.text }}>
              + Create New Season Division
            </button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                placeholder="e.g. Year 2027 Crop Cycle" 
                value={newSeasonName} 
                onChange={e => setNewSeasonName(e.target.value)} 
                style={{ ...inputStyle, width: "200px", padding: "6px 12px" }} 
              />
              <button onClick={addSeason} style={{ ...btnSubmit, padding: "6px 12px" }}>Save</button>
              <button onClick={() => setShowSeasonForm(false)} style={{ ...btnSubmit, background: "transparent", color: T?.textDim, padding: "6px 12px" }}>Cancel</button>
            </div>
          )}
        </div>
      </Card>

      {/* Overview Metric Cards (Isolated to active season) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        <StatCard label={`Input Expenses (${activeSeason})`} value={fmt(totalExpenses)} sub="Seasonal cost totals" color={T?.amber} />
        <StatCard label={`Revenue Earned (${activeSeason})`} value={fmt(totalRevenueSold)} sub={`${totalBagsSold} bags sold this season`} color={T?.blue} />
        <StatCard
          label="Seasonal Standing"
          value={fmt(Math.abs(realizedProfit))}
          sub={realizedProfit >= 0 ? "Net Profit on Cycle" : "Net Deficit on Cycle"}
          color={realizedProfit >= 0 ? T?.accent : T?.amber}
        />
      </div>

      {/* Input Expense Logger Section */}
      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ color: T?.textBright, fontSize: "16px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingCart size={18} color={T?.accent} /> Season Input Costs
          </h3>
          <button
            onClick={() => setShowForm(f => !f)}
            style={{
              background: T?.accent, color: "#ffffff", border: "none", borderRadius: "8px",
              padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <Plus size={14} /> Add Receipt Log
          </button>
        </div>

        {showForm && (
          <div style={{
            background: T?.surfaceAlt, border: `1px solid ${T?.border}`, borderRadius: "10px",
            padding: "16px", marginBottom: "16px", display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px",
          }}>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={dropdownSelectStyle}>
              {CATEGORIES.map(c => <option key={c} style={{ background: T?.surfaceAlt, color: T?.textBright }}>{c}</option>)}
            </select>
            <input placeholder="Amount (KSh)" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={inputStyle} />
            <input placeholder="Descriptive details" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} style={inputStyle} />
            <input type="date" value={form.date} style={inputStyle} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            <button onClick={addExpense} style={btnSubmit}>Confirm Entry</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredExpenses.map(e => (
            <div key={e.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: T?.surfaceAlt, border: `1px solid ${T?.border}`, borderRadius: "8px", padding: "12px 16px",
            }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <span style={{ background: `${T?.accent}15`, color: T?.accent, borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>{e.category}</span>
                <span style={{ color: T?.text, fontSize: "13px", fontWeight: "500" }}>{e.note}</span>
                {e.date && <span style={{ color: T?.textDim, fontSize: "12px" }}>{e.date}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ color: T?.textBright, fontWeight: 800, fontSize: "14px" }}>{fmt(e.amount)}</span>
                <button onClick={() => removeExpense(e.id)} style={btnDelete}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div style={{ color: T?.textDim, textAlign: "center", padding: "32px", fontSize: "14px", border: `1px dashed ${T?.border}`, borderRadius: "8px" }}>
              No operating expenses logged for <strong>{activeSeason}</strong> yet.
            </div>
          )}
        </div>

        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${T?.border}`, display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center" }}>
          <span style={{ color: T?.textDim, fontSize: "13px" }}>Seasonal Aggregate:</span>
          <span style={{ color: T?.textBright, fontWeight: 800, fontSize: "20px" }}>{fmt(totalExpenses)}</span>
        </div>
      </Card>

      {/* Post-Harvest Sales Log Section */}
      <Card style={{ padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: showSalesLog ? "20px" : 0 }} onClick={() => setShowSalesLog(v => !v)}>
          <h3 style={{ color: T?.textBright, fontSize: "16px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <ClipboardList size={18} color={T?.blue} /> Post-Harvest Sales Log
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={e => { e.stopPropagation(); setShowSaleForm(f => !f); setShowSalesLog(true); }}
              style={{ ...btnSubmit, background: T?.blue || "#3b82f6", padding: "8px 16px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <PlusCircle size={14} /> Log Seasonal Sale
            </button>
            {showSalesLog ? <ChevronUp size={16} color={T?.textDim} /> : <ChevronDown size={16} color={T?.textDim} />}
          </div>
        </div>

        {showSalesLog && (
          <>
            {showSaleForm && (
              <div style={{
                background: T?.surfaceAlt, border: `1px solid ${T?.border}`, borderRadius: "10px",
                padding: "16px", marginBottom: "16px", display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px",
              }}>
                <input placeholder="Quantity (Bags)" type="number" value={saleForm.bags} onChange={e => setSaleForm(p => ({ ...p, bags: e.target.value }))} style={inputStyle} />
                <input placeholder="Rate per Bag (KSh)" type="number" value={saleForm.pricePerBag} onChange={e => setSaleForm(p => ({ ...p, pricePerBag: e.target.value }))} style={inputStyle} />
                <input type="date" value={saleForm.date} style={inputStyle} onChange={e => setSaleForm(p => ({ ...p, date: e.target.value }))} />
                <input placeholder="Buyer / Transaction ref" value={saleForm.note} onChange={e => setSaleForm(p => ({ ...p, note: e.target.value }))} style={inputStyle} />
                <button onClick={addSale} style={{ ...btnSubmit, background: T?.blue || "#3b82f6" }}>Commit Sale</button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredSales.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: T?.surfaceAlt, border: `1px solid ${T?.border}`, borderRadius: "8px", padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <span style={{ background: `${T?.blue}15`, color: T?.blue, borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>{s.bags} Bags (90kg)</span>
                    <span style={{ color: T?.text, fontSize: "13px" }}>Valued at {fmt(s.pricePerBag)}/bag</span>
                    {s.note && <span style={{ color: T?.textDim, fontSize: "12px" }}>• {s.note}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ color: T?.textBright, fontWeight: 800, fontSize: "14px" }}>{fmt(s.bags * s.pricePerBag)}</span>
                    <button onClick={() => removeSale(s.id)} style={btnDelete}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {filteredSales.length === 0 && (
                <div style={{ color: T?.textDim, textAlign: "center", padding: "32px", fontSize: "14px", border: `1px dashed ${T?.border}`, borderRadius: "8px" }}>
                  No sales entries logged for <strong>{activeSeason}</strong> yet.
                </div>
              )}
            </div>

            {filteredSales.length > 0 && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${T?.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: T?.textDim, fontSize: "13px", fontWeight: "500" }}>Seasonal Aggregate: {totalBagsSold} bags sold</span>
                <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: T?.textDim, fontSize: "11px", marginBottom: "2px" }}>Seasonal Gross Revenue</div>
                    <div style={{ color: T?.blue, fontWeight: 800, fontSize: "15px" }}>{fmt(totalRevenueSold)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: T?.textDim, fontSize: "11px", marginBottom: "2px" }}>Seasonal Net Position</div>
                    <div style={{ color: realizedProfit >= 0 ? T?.accent : T?.amber, fontWeight: 800, fontSize: "15px" }}>
                      {realizedProfit >= 0 ? "+" : "-"}{fmt(Math.abs(realizedProfit))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Predictive Profit Engine Calculator Section */}
      <Card style={{ padding: "24px" }}>
        <h3 style={{ color: T?.textBright, fontSize: "16px", fontWeight: 800, margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <Calculator size={18} color={T?.accent} /> Break-Even & Profit Calculator ({activeSeason})
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", color: T?.text, fontSize: "13px", fontWeight: "600", marginBottom: "10px" }}>
              Total Harvest Weight (90kg Bags)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 45"
              value={calcBags || ""}
              onChange={e => updateCalculator("bags", Math.max(0, Number(e.target.value)))}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", color: T?.text, fontSize: "13px", fontWeight: "600", marginBottom: "10px" }}>
              Target Marketplace Value (KSh per Bag)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 4200"
              value={sellingPrice || ""}
              onChange={e => updateCalculator("price", Math.max(0, Number(e.target.value)))}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Dynamic Matrix View Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <ResultBox label="Projected Gross Income" value={fmt(projectedRevenue)} color={T?.blue || "#3b82f6"} />
          <ResultBox label="Operating Expense Burden" value={fmt(totalExpenses)} color={T?.amber || "#f59e0b"} />
          <ResultBox
            label="Calculated Net Valuation"
            value={(projectedProfit >= 0 ? "+" : "") + fmt(projectedProfit)}
            color={projectedProfit >= 0 ? (T?.accent || "#10b981") : (T?.amber || "#f59e0b")}
            big
          />
          <ResultBox
            label="Your True Break-Even Point"
            value={calcBags > 0 ? `${fmt(breakEvenPrice)} / bag` : "KSh 0 (Input bags weight)"}
            color={calcBags > 0 && sellingPrice >= breakEvenPrice ? (T?.accent || "#10b981") : (T?.amber || "#f59e0b")}
            sub={calcBags === 0 ? "Enter farm yield data above to calculate break-even point" : (sellingPrice >= breakEvenPrice ? "Operation is Profitable ✓" : "Deficit: Selling under cost")}
          />
        </div>
      </Card>
    </div>
  );
}

function ResultBox({ label, value, color, sub, big }) {
  return (
    <div style={{
      background: T?.surfaceAlt || "#1f2937", border: `1px solid ${T?.border || "#374151"}`,
      borderRadius: "10px", padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "center"
    }}>
      <div style={{ color: T?.textDim || "#9ca3af", fontSize: "12px", fontWeight: "500", marginBottom: "6px" }}>{label}</div>
      <div style={{ color, fontWeight: "800", fontSize: big ? "22px" : "16px", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ color: T?.text || "#d1d5db", fontSize: "11px", fontWeight: "600", marginTop: "6px", opacity: 0.8 }}>{sub}</div>}
    </div>
  );
}