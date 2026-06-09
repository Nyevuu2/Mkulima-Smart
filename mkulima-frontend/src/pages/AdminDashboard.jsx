import React, { useState, useEffect } from "react";
import { T } from "../App";
import {
  LayoutDashboard, Users, Store, Activity,
  LogOut, RefreshCw, ShieldCheck, ChevronDown,
  TrendingUp, MapPin, Sprout, Phone
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ─── tiny reusable stat card ───────────────────────────────────────────
function AdminStat({ label, value, icon: Icon, color }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
                  padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ background: `${color}18`, borderRadius: 10, padding: 10 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: T.textBright }}>{value}</div>
        <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── role badge ────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                   background: isAdmin ? `${T.accent}20` : `${T.amber}20`,
                   color: isAdmin ? T.accent : T.amber,
                   border: `1px solid ${isAdmin ? T.accent : T.amber}40` }}>
      {isAdmin ? "ADMIN" : "FARMER"}
    </span>
  );
}

// ─── status badge ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = { active: T.accent, sold: T.blue, removed: T.red };
  const c = colors[status] || T.textDim;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
                   background: `${c}18`, color: c, border: `1px solid ${c}40`,
                   textTransform: "uppercase" }}>
      {status}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const adminId = user?.id;

  // ── data fetchers ────────────────────────────────────────────────
  const loadOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/overview?admin_id=${adminId}`);
      if (res.ok) setOverview(await res.json());
    } catch { /* silently keep previous data */ }
  };

  const loadFarmers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/farmers?admin_id=${adminId}`);
      if (res.ok) setFarmers(await res.json());
      else setError("Could not load farmers.");
    } catch { setError("Network error loading farmers."); }
    finally { setLoading(false); }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/marketplace?admin_id=${adminId}`);
      if (res.ok) setListings(await res.json());
      else setError("Could not load listings.");
    } catch { setError("Network error loading listings."); }
    finally { setLoading(false); }
  };

  const changeRole = async (targetId, newRole) => {
    const res = await fetch(
      `${API_BASE}/api/admin/farmers/${targetId}/role?new_role=${newRole}&admin_id=${adminId}`,
      { method: "PATCH" }
    );
    if (res.ok) loadFarmers();
  };

  const changeListingStatus = async (listingId, newStatus) => {
    const res = await fetch(
      `${API_BASE}/api/marketplace/${listingId}/status?status=${newStatus}`,
      { method: "PATCH" }
    );
    if (res.ok) loadListings();
  };

  // Load data when tab changes
  useEffect(() => {
    setError("");
    if (tab === "overview") loadOverview();
    if (tab === "farmers") loadFarmers();
    if (tab === "marketplace") loadListings();
  }, [tab]);

  // ── shared styles ────────────────────────────────────────────────
  const tableHeader = { fontSize: 11, fontWeight: 800, color: T.textDim,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        padding: "10px 16px", borderBottom: `1px solid ${T.border}`,
                        background: T.surfaceAlt };
  const tableCell  = { fontSize: 13, color: T.textBright, padding: "12px 16px",
                        borderBottom: `1px solid ${T.border}` };

  // ── tab definitions ──────────────────────────────────────────────
  const tabs = [
    { id: "overview",     label: "Overview",     icon: LayoutDashboard },
    { id: "farmers",      label: "Farmers",      icon: Users           },
    { id: "marketplace",  label: "Marketplace",  icon: Store           },
    { id: "system",       label: "System",       icon: Activity        },
  ];

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>

      {/* ── top bar ──────────────────────────────────────────────── */}
      <div style={{ background: T.surfaceGreen, padding: "0 24px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    height: 60, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ShieldCheck size={20} color="#fff" />
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>MkulimaSmart Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
            {user?.full_name}
          </span>
          <button onClick={onLogout}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
                     color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13,
                     cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── tab bar ──────────────────────────────────────────────── */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`,
                    display: "flex", padding: "0 24px", gap: 4 }}>
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{ background: "none", border: "none", padding: "16px 18px",
                       fontSize: 13, fontWeight: active ? 800 : 600,
                       color: active ? T.accent : T.textDim, cursor: "pointer",
                       borderBottom: active ? `3px solid ${T.accent}` : "3px solid transparent",
                       display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
              <Icon size={15} /> {label}
            </button>
          );
        })}
      </div>

      {/* ── error banner ─────────────────────────────────────────── */}
      {error && (
        <div style={{ background: `${T.red}15`, border: `1px solid ${T.red}40`,
                      color: T.red, padding: "12px 24px", fontSize: 13, margin: "16px 24px",
                      borderRadius: 10 }}>
          {error}
        </div>
      )}

      {/* ── content area ─────────────────────────────────────────── */}
      <div style={{ padding: "28px 24px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ════ OVERVIEW ════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                          marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: T.textBright, margin: 0 }}>
                Platform Overview
              </h2>
              <button onClick={loadOverview}
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
                         padding: "8px 16px", fontSize: 13, color: T.accent, cursor: "pointer",
                         display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {overview ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                <AdminStat label="Farmers Registered" value={overview.farmers_registered}
                           icon={Users} color={T.accent} />
                <AdminStat label="Sales Logged" value={overview.sales_logged}
                           icon={TrendingUp} color={T.blue} />
                <AdminStat label="Active Listings" value={overview.active_listings}
                           icon={Store} color={T.amber} />
                <AdminStat label="Counties Covered" value={overview.counties_covered}
                           icon={MapPin} color={T.accent} />
                <AdminStat
                  label="Total Platform Revenue"
                  value={`KSh ${overview.total_platform_revenue_ksh?.toLocaleString()}`}
                  icon={TrendingUp} color={T.accent}
                />
              </div>
            ) : (
              <div style={{ color: T.textDim, fontSize: 14, padding: "40px 0", textAlign: "center" }}>
                Loading overview data…
              </div>
            )}

            {/* Info box explaining the role system */}
            <div style={{ background: `${T.accent}10`, border: `1px solid ${T.accent}30`,
                          borderRadius: 14, padding: "20px 24px", marginTop: 32 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.accent, marginBottom: 8 }}>
                How admin access works
              </div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7 }}>
                Anyone who registers with the <strong>admin invite code</strong> gets the admin role automatically.
                The code is set in your <code style={{ background: T.surfaceAlt, padding: "2px 6px",
                borderRadius: 4 }}>.env</code> file as <code style={{ background: T.surfaceAlt,
                padding: "2px 6px", borderRadius: 4 }}>ADMIN_INVITE_CODE</code>.
                Change it any time — old codes stop working immediately.
                You can also promote/demote users manually in the Farmers tab.
              </div>
            </div>
          </div>
        )}

        {/* ════ FARMERS ═════════════════════════════════════════════ */}
        {tab === "farmers" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                          marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: T.textBright, margin: 0 }}>
                All Users ({farmers.length})
              </h2>
              <button onClick={loadFarmers}
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
                         padding: "8px 16px", fontSize: 13, color: T.accent, cursor: "pointer",
                         display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                <RefreshCw size={14} /> {loading ? "Loading…" : "Refresh"}
              </button>
            </div>

            <div style={{ background: T.surface, border: `1px solid ${T.border}`,
                          borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Username", "Phone", "County", "Crop", "Role", "Joined", "Actions"].map(h => (
                      <th key={h} style={tableHeader}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {farmers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ ...tableCell, textAlign: "center", color: T.textDim, padding: "32px" }}>
                        No users found.
                      </td>
                    </tr>
                  ) : farmers.map(f => (
                    <tr key={f.id} style={{ background: f.id === adminId ? `${T.accent}08` : "transparent" }}>
                      <td style={tableCell}>
                        <div style={{ fontWeight: 700 }}>{f.full_name}</div>
                        {f.id === adminId && (
                          <div style={{ fontSize: 10, color: T.accent, fontWeight: 700 }}>YOU</div>
                        )}
                      </td>
                      <td style={{ ...tableCell, color: T.textDim }}>@{f.username || "—"}</td>
                      <td style={{ ...tableCell, display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={12} color={T.textDim} />{f.phone}
                      </td>
                      <td style={tableCell}>{f.county}</td>
                      <td style={{ ...tableCell }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Sprout size={12} color={T.accent} />{f.crop || "—"}
                        </div>
                      </td>
                      <td style={tableCell}><RoleBadge role={f.role} /></td>
                      <td style={{ ...tableCell, color: T.textDim }}>{f.joined}</td>
                      <td style={tableCell}>
                        {f.id !== adminId && (
                          <select
                            value={f.role}
                            onChange={(e) => changeRole(f.id, e.target.value)}
                            style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`,
                                     borderRadius: 6, padding: "5px 10px", fontSize: 12,
                                     color: T.textBright, cursor: "pointer" }}>
                            <option value="farmer">farmer</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ MARKETPLACE ═════════════════════════════════════════ */}
        {tab === "marketplace" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                          marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: T.textBright, margin: 0 }}>
                All Listings ({listings.length})
              </h2>
              <button onClick={loadListings}
                style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
                         padding: "8px 16px", fontSize: 13, color: T.accent, cursor: "pointer",
                         display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                <RefreshCw size={14} /> {loading ? "Loading…" : "Refresh"}
              </button>
            </div>

            <div style={{ background: T.surface, border: `1px solid ${T.border}`,
                          borderRadius: 14, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Farmer", "Crop", "Qty", "Price/bag", "Phone", "County", "Status", "Posted", "Action"].map(h => (
                      <th key={h} style={tableHeader}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ ...tableCell, textAlign: "center", color: T.textDim, padding: "32px" }}>
                        No listings found.
                      </td>
                    </tr>
                  ) : listings.map(l => (
                    <tr key={l.id}>
                      <td style={{ ...tableCell, fontWeight: 700 }}>{l.farmer_name}</td>
                      <td style={tableCell}>{l.crop}</td>
                      <td style={tableCell}>{l.quantity} bags</td>
                      <td style={tableCell}>KSh {l.price_per_unit?.toLocaleString()}</td>
                      <td style={{ ...tableCell, color: T.textDim }}>{l.phone}</td>
                      <td style={tableCell}>{l.county}</td>
                      <td style={tableCell}><StatusBadge status={l.status} /></td>
                      <td style={{ ...tableCell, color: T.textDim }}>{l.posted_at}</td>
                      <td style={tableCell}>
                        <select
                          value={l.status}
                          onChange={(e) => changeListingStatus(l.id, e.target.value)}
                          style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`,
                                   borderRadius: 6, padding: "5px 10px", fontSize: 12,
                                   color: T.textBright, cursor: "pointer" }}>
                          <option value="active">active</option>
                          <option value="sold">sold</option>
                          <option value="removed">removed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ SYSTEM ══════════════════════════════════════════════ */}
        {tab === "system" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: T.textBright, margin: 0 }}>
              System Information
            </h2>

            {/* Invite code info */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`,
                          borderRadius: 14, padding: "24px" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.textBright, marginBottom: 12 }}>
                Admin Invite Code
              </div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8 }}>
                The invite code is stored in your <code style={{ background: T.surfaceAlt,
                padding: "2px 6px", borderRadius: 4 }}>.env</code> file:
                <br />
                <code style={{ background: T.surfaceAlt, padding: "6px 12px", borderRadius: 6,
                               display: "inline-block", marginTop: 8, fontSize: 13 }}>
                  ADMIN_INVITE_CODE=mkulima-admin-2026
                </code>
                <br /><br />
                To change it: update the value in <code>.env</code> and restart the backend.
                Old codes stop working immediately. Team members use the code at registration — 
                no one needs to manually update the database.
              </div>
            </div>

            {/* API endpoints reference */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`,
                          borderRadius: 14, padding: "24px" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.textBright, marginBottom: 16 }}>
                Backend Endpoints
              </div>
              {[
                { method: "POST", path: "/api/auth/register", note: "Register (pass invite_code for admin)" },
                { method: "POST", path: "/api/auth/login",    note: "Login with phone, username, or full name" },
                { method: "GET",  path: "/api/expenses/:id",  note: "Farmer expenses" },
                { method: "GET",  path: "/api/sales/:id",     note: "Farmer sales log" },
                { method: "GET",  path: "/api/marketplace",   note: "Active listings" },
                { method: "GET",  path: "/api/admin/overview",   note: "Admin: platform stats" },
                { method: "GET",  path: "/api/admin/farmers",    note: "Admin: all users" },
                { method: "GET",  path: "/api/admin/marketplace",note: "Admin: all listings" },
                { method: "GET",  path: "/api/weather-advice",   note: "K-Means weather advisory" },
                { method: "GET",  path: "/api/predictions",      note: "LSTM price timeline" },
              ].map(({ method, path, note }) => {
                const methodColor = method === "GET" ? T.blue : method === "POST" ? T.accent : T.amber;
                return (
                  <div key={path} style={{ display: "flex", alignItems: "center", gap: 12,
                                           padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 5,
                                   background: `${methodColor}18`, color: methodColor,
                                   minWidth: 44, textAlign: "center" }}>
                      {method}
                    </span>
                    <code style={{ fontSize: 13, color: T.textBright, flex: 1 }}>{path}</code>
                    <span style={{ fontSize: 12, color: T.textDim }}>{note}</span>
                  </div>
                );
              })}
            </div>

            {/* Database tables reference */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`,
                          borderRadius: 14, padding: "24px" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.textBright, marginBottom: 16 }}>
                Database Tables
              </div>
              {[
                { db: "postgres",          table: "users",                desc: "All accounts — farmers and admins" },
                { db: "postgres",          table: "expenses",             desc: "Farm input costs" },
                { db: "postgres",          table: "sales",                desc: "Harvest sales log" },
                { db: "postgres",          table: "marketplace_listings", desc: "Farmer-to-farmer listings" },
                { db: "postgres",          table: "user_settings",        desc: "Language, season, calculator state" },
                { db: "mkulima_timescale", table: "weather_clusters",     desc: "K-Means county mappings" },
                { db: "mkulima_timescale", table: "agronomic_knowledge_base", desc: "Farming rules per cluster" },
              ].map(({ db, table, desc }) => (
                <div key={table} style={{ display: "flex", alignItems: "center", gap: 12,
                                          padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 5,
                                 background: db === "postgres" ? `${T.blue}15` : `${T.amber}15`,
                                 color: db === "postgres" ? T.blue : T.amber, minWidth: 60,
                                 textAlign: "center" }}>
                    {db === "postgres" ? "PG" : "TS"}
                  </span>
                  <code style={{ fontSize: 13, color: T.textBright, flex: 1 }}>{table}</code>
                  <span style={{ fontSize: 12, color: T.textDim }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}