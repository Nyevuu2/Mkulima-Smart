import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus, Trash2, PlusCircle,
  ShoppingCart, Calculator, ClipboardList, ChevronDown, ChevronUp, Layers,
  RefreshCw, CheckCircle, AlertCircle, TrendingDown, TrendingUp, Scale
} from "lucide-react";
import { Card, StatCard, T } from "../App";

const CATEGORIES = ["Seeds", "Fertilizer", "Labour", "Pesticides", "Transport", "Irrigation", "Equipment", "Other"];
const API_BASE = "http://127.0.0.1:8000/api";

// ── API helpers with localStorage fallback ──────────────────────────────────
async function apiGet(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error("Network error");
    return await res.json();
  } catch {
    return fallback;
  }
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("API error");
  return await res.json();
}

async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error("API error");
}

// ── Sync status badge ────────────────────────────────────────────────────────
function SyncBadge({ status }) {
  // status: "synced" | "local" | "syncing"
  const cfg = {
    synced:  { color: T.accent, icon: <CheckCircle size={12} />, label: "Saved to server" },
    local:   { color: T.amber,  icon: <AlertCircle size={12} />, label: "Saved locally only" },
    syncing: { color: T.textDim, icon: <RefreshCw size={12} />,  label: "Saving…" },
  }[status] || {};
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: cfg.color, fontWeight: 600 }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function Expenses({ crop = "Maize", county = "Machakos" }) {

  // ── 1. SEASON STATES ──
  const [seasons, setSeasons] = useState(() => {
    const saved = localStorage.getItem("mkulima_seasons");
    return saved ? JSON.parse(saved) : ["Long Rains 2026", "Short Rains 2026", "Irrigation Cycle 01"];
  });
  const [activeSeason, setActiveSeason] = useState(() => {
    return localStorage.getItem("mkulima_active_season") || "Long Rains 2026";
  });
  const [newSeasonName, setNewSeasonName] = useState("");
  const [showSeasonForm, setShowSeasonForm] = useState(false);

  // ── 2. LEDGER STATES ──
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("mkulima_expenses");
    return saved ? JSON.parse(saved) : [];
  });
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem("mkulima_sales");
    return saved ? JSON.parse(saved) : [];
  });

  // ── 3. SYNC STATE ──
  // Each record has a `_synced` boolean set after server confirmation
  const [syncStatus, setSyncStatus] = useState("synced"); // "synced" | "local" | "syncing"

  // ── 4. CALCULATOR STATES (per season) ──
  const [seasonCalcs, setSeasonCalcs] = useState(() => {
    const saved = localStorage.getItem("mkulima_season_calcs");
    return saved ? JSON.parse(saved) : {};
  });
  const calcBags = seasonCalcs[activeSeason]?.bags || 0;
  const sellingPrice = seasonCalcs[activeSeason]?.price || 3900;

  // ── 5. UI TOGGLE STATES ──
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "Seeds", amount: "", note: "", date: "" });

  const [showSaleForm, setShowSaleForm] = useState(false);
  const [saleForm, setSaleForm] = useState({ bags: "", pricePerBag: "", date: "", note: "" });
  const [showSalesLog, setShowSalesLog] = useState(true);

  // Calculator is collapsed by default — it's advanced, farmer sees key numbers first
  const [showCalc, setShowCalc] = useState(false);

  // ── 6. LOCALSTORAGE SYNC EFFECTS ──
  useEffect(() => {
    localStorage.setItem("mkulima_seasons", JSON.stringify(seasons));
    localStorage.setItem("mkulima_active_season", activeSeason);
  }, [seasons, activeSeason]);

  useEffect(() => { localStorage.setItem("mkulima_expenses", JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem("mkulima_sales", JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem("mkulima_season_calcs", JSON.stringify(seasonCalcs)); }, [seasonCalcs]);

  // ── 7. LOAD FROM SERVER ON MOUNT ──
  useEffect(() => {
    (async () => {
      const [serverExpenses, serverSales] = await Promise.all([
        apiGet(`/expenses?crop=${crop}&county=${county}`, null),
        apiGet(`/sales?crop=${crop}&county=${county}`, null),
      ]);
      if (serverExpenses) setExpenses(serverExpenses);
      if (serverSales) setSales(serverSales);
    })();
  }, [crop, county]);

  // ── 8. COMPUTED METRICS (scoped to active season) ──
  const filteredExpenses = useMemo(() => expenses.filter(e => e.season === activeSeason), [expenses, activeSeason]);
  const filteredSales    = useMemo(() => sales.filter(s => s.season === activeSeason), [sales, activeSeason]);

  const totalExpenses     = useMemo(() => filteredExpenses.reduce((s, e) => s + Number(e.amount), 0), [filteredExpenses]);
  const totalRevenueSold  = useMemo(() => filteredSales.reduce((s, sl) => s + sl.bags * sl.pricePerBag, 0), [filteredSales]);
  const totalBagsSold     = useMemo(() => filteredSales.reduce((s, sl) => s + sl.bags, 0), [filteredSales]);
  const realizedProfit    = totalRevenueSold - totalExpenses;
  const projectedRevenue  = calcBags * sellingPrice;
  const projectedProfit   = projectedRevenue - totalExpenses;
  const breakEvenPrice    = totalExpenses > 0 && calcBags > 0 ? Math.ceil(totalExpenses / calcBags) : 0;

  // ── 9. HANDLERS ──
  const addSeason = () => {
    if (!newSeasonName.trim() || seasons.includes(newSeasonName.trim())) return;
    setSeasons(prev => [...prev, newSeasonName.trim()]);
    setActiveSeason(newSeasonName.trim());
    setNewSeasonName("");
    setShowSeasonForm(false);
  };

  const addExpense = useCallback(async () => {
    if (!form.amount || isNaN(form.amount)) return;
    const entry = {
      ...form,
      id: Date.now(),
      amount: Number(form.amount),
      season: activeSeason,
      crop,
      county,
      _synced: false,
    };
    // Optimistic local update
    setExpenses(prev => [...prev, entry]);
    setForm({ category: "Seeds", amount: "", note: "", date: "" });
    setShowForm(false);
    setSyncStatus("syncing");

    try {
      const saved = await apiPost("/expenses", entry);
      // Replace local optimistic record with server record (server may assign a real id)
      setExpenses(prev => prev.map(e => e.id === entry.id ? { ...saved, _synced: true } : e));
      setSyncStatus("synced");
    } catch {
      // Mark as local-only — still visible and usable
      setExpenses(prev => prev.map(e => e.id === entry.id ? { ...e, _synced: false } : e));
      setSyncStatus("local");
    }
  }, [form, activeSeason, crop, county]);

  const removeExpense = useCallback(async (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    try { await apiDelete(`/expenses/${id}`); } catch { /* already removed locally */ }
  }, []);

  const addSale = useCallback(async () => {
    if (!saleForm.bags || !saleForm.pricePerBag) return;
    const entry = {
      ...saleForm,
      id: Date.now(),
      bags: Number(saleForm.bags),
      pricePerBag: Number(saleForm.pricePerBag),
      season: activeSeason,
      crop,
      county,
      _synced: false,
    };
    setSales(prev => [...prev, entry]);
    setSaleForm({ bags: "", pricePerBag: "", date: "", note: "" });
    setShowSaleForm(false);
    setSyncStatus("syncing");

    try {
      const saved = await apiPost("/sales", entry);
      setSales(prev => prev.map(s => s.id === entry.id ? { ...saved, _synced: true } : s));
      setSyncStatus("synced");
    } catch {
      setSales(prev => prev.map(s => s.id === entry.id ? { ...s, _synced: false } : s));
      setSyncStatus("local");
    }
  }, [saleForm, activeSeason, crop, county]);

  const removeSale = useCallback(async (id) => {
    setSales(prev => prev.filter(s => s.id !== id));
    try { await apiDelete(`/sales/${id}`); } catch { /* already removed locally */ }
  }, []);

  const updateCalculator = (key, val) => {
    setSeasonCalcs(prev => ({
      ...prev,
      [activeSeason]: { ...(prev[activeSeason] || { bags: 0, price: 3900 }), [key]: val }
    }));
  };

  const fmt = (n) => `KSh ${Number(n).toLocaleString()}`;

  // ── 10. STYLES ──
  const inputStyle = {
    background: T.surfaceAlt,
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    color: T.textBright,
    padding: "10px 14px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
  const dropdownSelectStyle = {
    ...inputStyle,
    background: T.surfaceAlt,
    color: T.textBright,
    cursor: "pointer",
  };
  const btnPrimary = {
    background: T.accent,
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };
  const btnAmber = {
    ...btnPrimary,
    background: T.amber,
  };
  const btnGhost = {
    ...btnPrimary,
    background: "transparent",
    border: `1px solid ${T.border}`,
    color: T.text,
  };
  const btnDelete = {
    background: `${T.red}12`,
    color: T.red,
    border: `1px solid ${T.red}25`,
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "0 0 8px" }}>

      {/* ── SEASON SELECTOR ── */}
      <Card style={{
        padding: "14px 20px",
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: "12px",
        borderLeft: `4px solid ${T.accent}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Layers size={18} color={T.accent} />
          <div>
            <div style={{ color: T.textDim, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Season</div>
            <select
              value={activeSeason}
              onChange={e => setActiveSeason(e.target.value)}
              style={{ ...dropdownSelectStyle, width: "auto", padding: "5px 10px", fontSize: "14px", fontWeight: 700, border: "none", background: "transparent" }}
            >
              {seasons.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <SyncBadge status={syncStatus} />
          {!showSeasonForm ? (
            <button onClick={() => setShowSeasonForm(true)} style={btnGhost}>+ New Season</button>
          ) : (
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                placeholder="e.g. Short Rains 2027"
                value={newSeasonName}
                onChange={e => setNewSeasonName(e.target.value)}
                style={{ ...inputStyle, width: "180px", padding: "6px 10px" }}
              />
              <button onClick={addSeason} style={{ ...btnPrimary, padding: "6px 12px" }}>Save</button>
              <button onClick={() => setShowSeasonForm(false)} style={{ ...btnGhost, padding: "6px 12px" }}>Cancel</button>
            </div>
          )}
        </div>
      </Card>

      {/* ── OVERVIEW STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        {/* Expenses = amber/orange tint — money going OUT, caution */}
        <StatCard
          title="Expenses"
          value={fmt(totalExpenses)}
          sub={`${filteredExpenses.length} entries · ${activeSeason}`}
          color={T.amber}
          bg={T.surfaceAmber}
          icon={TrendingDown}
        />
        {/* Revenue = green — money coming IN, growth */}
        <StatCard
          title="Revenue"
          value={fmt(totalRevenueSold)}
          sub={`${totalBagsSold} bags sold this season`}
          color={T.accent}
          bg={T.surfaceGreenLight}
          icon={TrendingUp}
        />
        {/* Net Position = white — neutral until resolved, uses color for the value itself */}
        <StatCard
          title="Net Position"
          value={fmt(Math.abs(realizedProfit))}
          sub={realizedProfit >= 0 ? "✓ Profit on this season" : "⚠ Deficit this season"}
          color={realizedProfit >= 0 ? T.accent : T.red}
          icon={Scale}
        />
      </div>

      {/* ── EXPENSE LOGGER — white bg, amber left border (costs = caution) ── */}
      <Card style={{ padding: "20px 24px", borderLeft: `4px solid ${T.amber}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showForm ? "16px" : 0 }}>
          <h3 style={{ color: T.textBright, fontSize: "15px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingCart size={16} color={T.accent} /> Farm Input Costs
          </h3>
          <button onClick={() => setShowForm(f => !f)} style={btnPrimary}>
            <Plus size={14} /> {showForm ? "Close" : "Add Expense"}
          </button>
        </div>

        {showForm && (
          <div style={{
            background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: "10px",
            padding: "16px", marginBottom: "16px",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px",
          }}>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={dropdownSelectStyle}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Amount (KSh)" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={inputStyle} />
            <input placeholder="Details / supplier" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} style={inputStyle} />
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
            <button onClick={addExpense} style={btnPrimary}>Save Entry</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filteredExpenses.map(e => (
            <div key={e.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              borderRadius: "8px", padding: "10px 14px",
            }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {/* Category chip — green for inputs (seeds/fert/irrigation), amber for costs */}
                <span style={{
                  background: ["Seeds","Irrigation","Equipment"].includes(e.category) ? `${T.accent}18` : `${T.amber}18`,
                  color: ["Seeds","Irrigation","Equipment"].includes(e.category) ? T.accent : T.amber,
                  borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: 700,
                }}>
                  {e.category}
                </span>
                {e.note && <span style={{ color: T.text, fontSize: "13px" }}>{e.note}</span>}
                {e.date && <span style={{ color: T.textDim, fontSize: "12px" }}>{e.date}</span>}
                {e._synced === false && <span style={{ fontSize: "10px", color: T.amber, fontWeight: 600 }}>local</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <span style={{ color: T.textBright, fontWeight: 800, fontSize: "14px" }}>{fmt(e.amount)}</span>
                <button onClick={() => removeExpense(e.id)} style={btnDelete}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <div style={{ color: T.textDim, textAlign: "center", padding: "28px", fontSize: "14px", border: `1px dashed ${T.border}`, borderRadius: "8px" }}>
              No expenses logged for <strong style={{ color: T.text }}>{activeSeason}</strong> yet. Tap "Add Expense" to start.
            </div>
          )}
        </div>

        {filteredExpenses.length > 0 && (
          <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
            <span style={{ color: T.textDim, fontSize: "13px" }}>Season Total:</span>
            <span style={{ color: T.amber, fontWeight: 800, fontSize: "18px" }}>{fmt(totalExpenses)}</span>
          </div>
        )}
      </Card>

      {/* ── SALES LOG — pale green bg (income = growth) ── */}
      <Card style={{ padding: "20px 24px", background: T.surfaceGreenLight, borderColor: `${T.accent}30` }}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: showSalesLog ? "16px" : 0 }}
          onClick={() => setShowSalesLog(v => !v)}
        >
          <h3 style={{ color: T.textBright, fontSize: "15px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <ClipboardList size={16} color={T.accent} /> Sales Log
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={ev => { ev.stopPropagation(); setShowSaleForm(f => !f); setShowSalesLog(true); }}
              style={btnPrimary}
            >
              <PlusCircle size={14} /> Log Sale
            </button>
            {showSalesLog ? <ChevronUp size={16} color={T.textDim} /> : <ChevronDown size={16} color={T.textDim} />}
          </div>
        </div>

        {showSalesLog && (
          <>
            {showSaleForm && (
              <div style={{
                background: "rgba(255,255,255,0.85)", border: `1px solid ${T.accent}30`, borderRadius: "10px",
                padding: "16px", marginBottom: "14px",
                display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px",
              }}>
                <input placeholder="Bags sold (90kg)" type="number" value={saleForm.bags} onChange={e => setSaleForm(p => ({ ...p, bags: e.target.value }))} style={inputStyle} />
                <input placeholder="Price per bag (KSh)" type="number" value={saleForm.pricePerBag} onChange={e => setSaleForm(p => ({ ...p, pricePerBag: e.target.value }))} style={inputStyle} />
                <input type="date" value={saleForm.date} onChange={e => setSaleForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                <input placeholder="Buyer / reference" value={saleForm.note} onChange={e => setSaleForm(p => ({ ...p, note: e.target.value }))} style={inputStyle} />
                <button onClick={addSale} style={btnPrimary}>Save Sale</button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredSales.map(s => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(255,255,255,0.7)", border: `1px solid ${T.accent}22`,
                  borderRadius: "8px", padding: "10px 14px",
                }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: `${T.accent}22`, color: T.accent, borderRadius: "6px", padding: "3px 9px", fontSize: "11px", fontWeight: 700 }}>
                      {s.bags} bags
                    </span>
                    <span style={{ color: T.text, fontSize: "13px" }}>{fmt(s.pricePerBag)}/bag</span>
                    {s.note && <span style={{ color: T.textDim, fontSize: "12px" }}>· {s.note}</span>}
                    {s.date && <span style={{ color: T.textDim, fontSize: "12px" }}>{s.date}</span>}
                    {s._synced === false && <span style={{ fontSize: "10px", color: T.amber, fontWeight: 600 }}>local</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <span style={{ color: T.accent, fontWeight: 800, fontSize: "14px" }}>{fmt(s.bags * s.pricePerBag)}</span>
                    <button onClick={() => removeSale(s.id)} style={btnDelete}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
              {filteredSales.length === 0 && (
                <div style={{ color: T.accent, textAlign: "center", padding: "28px", fontSize: "14px", border: `1px dashed ${T.accent}40`, borderRadius: "8px", background: "rgba(255,255,255,0.5)" }}>
                  No sales logged for <strong>{activeSeason}</strong> yet. Tap "Log Sale" when you sell.
                </div>
              )}
            </div>

            {filteredSales.length > 0 && (
              <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ color: T.textDim, fontSize: "13px" }}>{totalBagsSold} bags sold this season</span>
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: T.textDim, fontSize: "11px", marginBottom: "2px" }}>Gross Revenue</div>
                    <div style={{ color: T.accent, fontWeight: 800, fontSize: "15px" }}>{fmt(totalRevenueSold)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: T.textDim, fontSize: "11px", marginBottom: "2px" }}>Net Position</div>
                    <div style={{ color: realizedProfit >= 0 ? T.accent : T.red, fontWeight: 800, fontSize: "15px" }}>
                      {realizedProfit >= 0 ? "+" : "-"}{fmt(Math.abs(realizedProfit))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ── BREAK-EVEN CALCULATOR (collapsed by default) ── */}
      <Card style={{ padding: "20px 24px" }}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          onClick={() => setShowCalc(v => !v)}
        >
          <h3 style={{ color: T.textBright, fontSize: "15px", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Calculator size={16} color={T.amber} /> Break-Even Calculator
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: T.textDim }}>
              {showCalc ? "Hide" : `Tap to open · ${activeSeason}`}
            </span>
            {showCalc ? <ChevronUp size={16} color={T.textDim} /> : <ChevronDown size={16} color={T.textDim} />}
          </div>
        </div>

        {showCalc && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", color: T.text, fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                  Expected Harvest (90kg Bags)
                </label>
                <input
                  type="number" min="0" placeholder="e.g. 45"
                  value={calcBags || ""}
                  onChange={e => updateCalculator("bags", Math.max(0, Number(e.target.value)))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: "block", color: T.text, fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                  Target Price (KSh / Bag)
                </label>
                <input
                  type="number" min="0" placeholder="e.g. 4200"
                  value={sellingPrice || ""}
                  onChange={e => updateCalculator("price", Math.max(0, Number(e.target.value)))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
              <ResultBox label="Projected Revenue" value={fmt(projectedRevenue)} color={T.accent} />
              <ResultBox label="Total Expenses" value={fmt(totalExpenses)} color={T.amber} />
              <ResultBox
                label="Projected Net"
                value={(projectedProfit >= 0 ? "+" : "") + fmt(projectedProfit)}
                color={projectedProfit >= 0 ? T.accent : T.red}
                big
              />
              <ResultBox
                label="Break-Even Price / Bag"
                value={calcBags > 0 ? `${fmt(breakEvenPrice)}/bag` : "Enter bags above"}
                color={calcBags > 0 && sellingPrice >= breakEvenPrice ? T.accent : T.amber}
                sub={calcBags === 0 ? "Enter your expected yield" : (sellingPrice >= breakEvenPrice ? "Above break-even ✓" : "Selling under cost")}
              />
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}

function ResultBox({ label, value, color, sub, big }) {
  return (
    <div style={{
      background: T.surfaceAlt,
      border: `1px solid ${T.border}`,
      borderRadius: "10px",
      padding: "14px 18px",
      display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      <div style={{ color: T.textDim, fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>{label}</div>
      <div style={{ color, fontWeight: 800, fontSize: big ? "20px" : "15px", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ color: T.text, fontSize: "11px", fontWeight: 600, marginTop: "5px", opacity: 0.85 }}>{sub}</div>}
    </div>
  );
}