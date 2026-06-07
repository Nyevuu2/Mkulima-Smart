import React, { useState } from "react";
import { ShoppingBag, Plus, MapPin, Phone, Tag, Package, X, ChevronDown } from "lucide-react";
import { Card, Chip, T } from "../App";

// ============================================================================
// MARKETPLACE PAGE
// Farmers post their produce listings. Buyers browse and get contact details.
// Backend: POST /api/marketplace  GET /api/marketplace
// Falls back to local state if backend is offline (so UI always works).
// ============================================================================

const SAMPLE_LISTINGS = [
  { id: 1, farmer_name: "James Mutua",    county: "Machakos", crop: "Maize",       quantity: 50,  unit: "90kg bags", price_per_unit: 4100, phone: "0712 345 678", posted_at: "2 hours ago",   notes: "Freshly harvested. Dry and ready for storage." },
  { id: 2, farmer_name: "Grace Ndunge",   county: "Kitui",    crop: "Green Grams", quantity: 20,  unit: "90kg bags", price_per_unit: 10500, phone: "0723 456 789", posted_at: "5 hours ago",  notes: "Grade A. Cleaned and sorted." },
  { id: 3, farmer_name: "Peter Mwangi",   county: "Makueni",  crop: "Maize",       quantity: 100, unit: "90kg bags", price_per_unit: 3950, phone: "0734 567 890", posted_at: "1 day ago",    notes: "Bulk discount available for 50+ bags." },
  { id: 4, farmer_name: "Mary Wambua",    county: "Meru",     crop: "Green Grams", quantity: 10,  unit: "90kg bags", price_per_unit: 11000, phone: "0745 678 901", posted_at: "2 days ago",  notes: "Organically grown. No pesticides used." },
];

const COUNTIES  = ["Machakos", "Kitui", "Makueni", "Meru"];
const CROPS     = ["Maize", "Green Grams"];
const UNITS     = ["90kg bags", "50kg bags", "Tonnes", "Kgs"];

export default function Marketplace({ user, language }) {
  const [listings, setListings]   = useState(SAMPLE_LISTINGS);
  const [showForm, setShowForm]   = useState(false);
  const [filterCrop, setFilterCrop]     = useState("All");
  const [filterCounty, setFilterCounty] = useState("All");
  const [submitting, setSubmitting]     = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  // Form state
  const [form, setForm] = useState({
    crop: "Maize",
    quantity: "",
    unit: "90kg bags",
    price_per_unit: "",
    county: user?.county || "Machakos",
    phone: "",
    notes: "",
  });

  const handleFormChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmitListing = async (e) => {
    e.preventDefault();
    if (!form.quantity || !form.price_per_unit || !form.phone) {
      alert("Please fill in quantity, price, and phone number.");
      return;
    }
    setSubmitting(true);

    const newListing = {
      ...form,
      id: Date.now(),
      farmer_name: user?.full_name || "Anonymous Farmer",
      quantity: parseFloat(form.quantity),
      price_per_unit: parseFloat(form.price_per_unit),
      posted_at: "Just now",
    };

    // Try backend first, fall back to local state
    try {
      const res = await fetch("http://127.0.0.1:8000/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newListing, user_id: user?.id }),
      });
      if (res.ok) {
        const saved = await res.json();
        setListings((prev) => [{ ...newListing, id: saved.id ?? newListing.id }, ...prev]);
      } else {
        setListings((prev) => [newListing, ...prev]);
      }
    } catch {
      // Backend offline — still add locally so UI works
      setListings((prev) => [newListing, ...prev]);
    }

    setForm({ crop: "Maize", quantity: "", unit: "90kg bags", price_per_unit: "", county: user?.county || "Machakos", phone: "", notes: "" });
    setShowForm(false);
    setSubmitting(false);
    setSuccessMsg("Listing posted successfully!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Filtered listings
  const visible = listings.filter((l) => {
    if (filterCrop   !== "All" && l.crop   !== filterCrop)   return false;
    if (filterCounty !== "All" && l.county !== filterCounty) return false;
    return true;
  });

  const totalValue = visible.reduce((sum, l) => sum + l.quantity * l.price_per_unit, 0);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── HEADER ROW ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 900, color: T.textBright, margin: 0 }}>
            Farmer Marketplace
          </h2>
          <p style={{ fontSize: "13px", color: T.textDim, margin: "4px 0 0 0" }}>
            Post your produce. Connect directly with buyers.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: T.accent, color: "#000", border: "none", borderRadius: "10px", padding: "12px 20px", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={16} /> Post Listing
        </button>
      </div>

      {/* ── SUCCESS NOTIFICATION ─────────────────────────────────────────── */}
      {successMsg && (
        <div style={{ background: `${T.accent}15`, border: `1px solid ${T.accent}40`, borderRadius: "10px", padding: "14px 18px", color: T.accent, fontSize: "13px", fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* ── POST LISTING FORM ────────────────────────────────────────────── */}
      {showForm && (
        <Card style={{ padding: "24px", border: `1px solid ${T.accent}30` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: T.textBright, margin: 0 }}>New Produce Listing</h3>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", color: T.textDim, cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmitListing}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>

              {/* Crop */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, textTransform: "uppercase" }}>Crop</label>
                <select value={form.crop} onChange={(e) => handleFormChange("crop", e.target.value)}
                  style={{ background: T.background, border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "10px 12px", color: T.textBright, fontSize: "14px", outline: "none" }}>
                  {CROPS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Quantity */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, textTransform: "uppercase" }}>Quantity</label>
                <input type="number" min="1" placeholder="e.g. 20" value={form.quantity} onChange={(e) => handleFormChange("quantity", e.target.value)}
                  style={{ background: T.background, border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "10px 12px", color: T.textBright, fontSize: "14px", outline: "none" }} required />
              </div>

              {/* Unit */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, textTransform: "uppercase" }}>Unit</label>
                <select value={form.unit} onChange={(e) => handleFormChange("unit", e.target.value)}
                  style={{ background: T.background, border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "10px 12px", color: T.textBright, fontSize: "14px", outline: "none" }}>
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>

              {/* Price per unit */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, textTransform: "uppercase" }}>Price per Unit (KES)</label>
                <input type="number" min="1" placeholder="e.g. 4100" value={form.price_per_unit} onChange={(e) => handleFormChange("price_per_unit", e.target.value)}
                  style={{ background: T.background, border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "10px 12px", color: T.textBright, fontSize: "14px", outline: "none" }} required />
              </div>

              {/* County */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, textTransform: "uppercase" }}>County</label>
                <select value={form.county} onChange={(e) => handleFormChange("county", e.target.value)}
                  style={{ background: T.background, border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "10px 12px", color: T.textBright, fontSize: "14px", outline: "none" }}>
                  {COUNTIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Phone */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, textTransform: "uppercase" }}>Contact Phone</label>
                <input type="tel" placeholder="e.g. 0712 345 678" value={form.phone} onChange={(e) => handleFormChange("phone", e.target.value)}
                  style={{ background: T.background, border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "10px 12px", color: T.textBright, fontSize: "14px", outline: "none" }} required />
              </div>

            </div>

            {/* Notes */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: T.textDim, textTransform: "uppercase" }}>Additional Notes (optional)</label>
              <textarea rows={2} placeholder="e.g. Bulk discount available, organically grown, delivery possible..." value={form.notes} onChange={(e) => handleFormChange("notes", e.target.value)}
                style={{ background: T.background, border: `1px solid ${T.borderBright}`, borderRadius: "8px", padding: "10px 12px", color: T.textBright, fontSize: "14px", outline: "none", resize: "vertical" }} />
            </div>

            <button type="submit" disabled={submitting}
              style={{ background: T.accent, color: "#000", border: "none", borderRadius: "8px", padding: "13px 28px", fontSize: "14px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Posting…" : "Publish Listing"}
            </button>
          </form>
        </Card>
      )}

      {/* ── FILTER BAR + SUMMARY ─────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* Crop filter */}
          <select value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "8px 14px", color: T.textBright, fontSize: "13px", outline: "none", cursor: "pointer" }}>
            <option value="All">All Crops</option>
            {CROPS.map((c) => <option key={c}>{c}</option>)}
          </select>

          {/* County filter */}
          <select value={filterCounty} onChange={(e) => setFilterCounty(e.target.value)}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "8px 14px", color: T.textBright, fontSize: "13px", outline: "none", cursor: "pointer" }}>
            <option value="All">All Counties</option>
            {COUNTIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ fontSize: "12px", color: T.textDim }}>
          <strong style={{ color: T.textBright }}>{visible.length}</strong> listings &nbsp;•&nbsp; Total market value:{" "}
          <strong style={{ color: T.accent }}>KSh {totalValue.toLocaleString()}</strong>
        </div>
      </div>

      {/* ── LISTINGS GRID ────────────────────────────────────────────────── */}
      {visible.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }}>
          <ShoppingBag size={32} color={T.textDim} style={{ marginBottom: "12px" }} />
          <div style={{ color: T.textDim, fontSize: "14px" }}>No listings match your filters.</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {visible.map((listing) => (
            <Card key={listing.id} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Top row: crop + posted time */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Chip
                  label={listing.crop}
                  color={listing.crop === "Maize" ? T.accent : T.amber}
                />
                <span style={{ fontSize: "11px", color: T.textDim }}>{listing.posted_at}</span>
              </div>

              {/* Price + quantity */}
              <div>
                <div style={{ fontSize: "26px", fontWeight: 900, color: T.textBright, letterSpacing: "-0.01em" }}>
                  KSh {listing.price_per_unit.toLocaleString()}
                  <span style={{ fontSize: "13px", fontWeight: 500, color: T.textDim }}> / {listing.unit}</span>
                </div>
                <div style={{ fontSize: "13px", color: T.text, marginTop: "2px" }}>
                  <Package size={12} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                  {listing.quantity} {listing.unit} available
                  <span style={{ color: T.textDim }}> · Total: KSh {(listing.quantity * listing.price_per_unit).toLocaleString()}</span>
                </div>
              </div>

              {/* Farmer info */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: T.textBright, fontWeight: 600 }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: T.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: T.accent }}>
                    {listing.farmer_name.charAt(0)}
                  </div>
                  {listing.farmer_name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: T.textDim }}>
                  <MapPin size={12} /> {listing.county} County
                </div>
              </div>

              {/* Notes */}
              {listing.notes && (
                <div style={{ fontSize: "12px", color: T.textDim, fontStyle: "italic", borderTop: `1px solid ${T.border}`, paddingTop: "10px" }}>
                  "{listing.notes}"
                </div>
              )}

              {/* Contact button */}
              <a
                href={`tel:${listing.phone.replace(/\s/g, "")}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: `${T.accent}15`, border: `1px solid ${T.accent}40`, color: T.accent, borderRadius: "8px", padding: "11px", fontSize: "13px", fontWeight: 700, textDecoration: "none", cursor: "pointer" }}
              >
                <Phone size={14} /> Call {listing.phone}
              </a>

            </Card>
          ))}
        </div>
      )}
    </div>
  );
}