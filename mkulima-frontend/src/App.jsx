import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend,
} from "recharts";
import {
  LayoutDashboard, TrendingUp, Wallet, CloudSun, Settings,
  Plus, X, ChevronRight, AlertTriangle, CheckCircle, Leaf,
  BarChart2, Menu, Bell, User, ArrowUp, ArrowDown, DollarSign,
  Package, Thermometer, Wind, Droplets, ShoppingCart, Tag,
  RefreshCw, Filter, Search, MapPin, Clock, Star, Zap,
} from "lucide-react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:         "#07100a",
  surface:    "#0e1a10",
  surfaceAlt: "#132016",
  surfaceHov: "#182a1c",
  border:     "#1c2e1f",
  borderBright:"#2a4030",
  accent:     "#4ade80",
  accentDim:  "#166534",
  accentGlow: "rgba(74,222,128,0.12)",
  accentGlow2:"rgba(74,222,128,0.06)",
  amber:      "#fbbf24",
  blue:       "#60a5fa",
  red:        "#f87171",
  muted:      "#4b6b52",
  textDim:    "#7a9e82",
  text:       "#e8f5ec",
  textBright: "#f0fdf4",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const priceHistory = [
  { month:"Oct", maize:3200, greengrams:8800 },
  { month:"Nov", maize:3450, greengrams:9100 },
  { month:"Dec", maize:3100, greengrams:9400 },
  { month:"Jan", maize:2900, greengrams:9000 },
  { month:"Feb", maize:3300, greengrams:8700 },
  { month:"Mar", maize:3600, greengrams:9200 },
  { month:"Apr", maize:3750, greengrams:9600, f:true },
  { month:"May", maize:3900, greengrams:10100, f:true },
  { month:"Jun", maize:4100, greengrams:10500, f:true },
];

const expenseData = [
  { id:1, category:"Seeds",      item:"Maize Seeds (5kg)",       amount:1200, date:"2025-03-02", crop:"Maize" },
  { id:2, category:"Fertilizer", item:"DAP Fertilizer (50kg)",   amount:3800, date:"2025-03-05", crop:"Maize" },
  { id:3, category:"Labor",      item:"Land Preparation",        amount:2500, date:"2025-03-07", crop:"Maize" },
  { id:4, category:"Chemicals",  item:"Herbicide (1L)",          amount:850,  date:"2025-03-10", crop:"Green Grams" },
  { id:5, category:"Labor",      item:"Planting Labor",          amount:1800, date:"2025-03-12", crop:"Green Grams" },
  { id:6, category:"Fertilizer", item:"CAN Fertilizer (50kg)",   amount:3200, date:"2025-03-15", crop:"Maize" },
];

const weatherForecast = [
  { day:"Mon", temp:28, rain:12, humidity:65, desc:"Warm showers" },
  { day:"Tue", temp:30, rain:0,  humidity:58, desc:"Hot & dry" },
  { day:"Wed", temp:26, rain:35, humidity:78, desc:"Heavy rain" },
  { day:"Thu", temp:25, rain:40, humidity:82, desc:"Heavy rain" },
  { day:"Fri", temp:27, rain:8,  humidity:70, desc:"Light showers" },
  { day:"Sat", temp:31, rain:0,  humidity:55, desc:"Hot & dry" },
  { day:"Sun", temp:29, rain:5,  humidity:62, desc:"Mild & clear" },
];

// Market simulation listings
const initialListings = [
  { id:1,  type:"sell", farmer:"John Mutua",    county:"Machakos", crop:"Maize",       qty:15,  price:3750, quality:"Grade A", posted:"2h ago",  verified:true,  bids:3  },
  { id:2,  type:"buy",  farmer:"Grace Mwende",  county:"Kitui",    crop:"Green Grams", qty:8,   price:9800, quality:"Any",     posted:"4h ago",  verified:true,  bids:0  },
  { id:3,  type:"sell", farmer:"Peter Musyoka", county:"Makueni",  crop:"Maize",       qty:30,  price:3600, quality:"Grade B", posted:"6h ago",  verified:false, bids:1  },
  { id:4,  type:"sell", farmer:"Alice Ndeto",   county:"Machakos", crop:"Green Grams", qty:5,   price:9500, quality:"Grade A", posted:"1d ago",  verified:true,  bids:5  },
  { id:5,  type:"buy",  farmer:"Kamau Traders", county:"Nairobi",  crop:"Maize",       qty:200, price:3800, quality:"Grade A", posted:"1d ago",  verified:true,  bids:0  },
  { id:6,  type:"sell", farmer:"Mary Kimanzi",  county:"Kitui",    crop:"Maize",       qty:12,  price:3700, quality:"Grade A", posted:"2d ago",  verified:true,  bids:2  },
  { id:7,  type:"buy",  farmer:"Nairobi Millers",county:"Nairobi", crop:"Maize",       qty:500, price:3850, quality:"Grade A", posted:"3h ago",  verified:true,  bids:0  },
  { id:8,  type:"sell", farmer:"Samuel Muli",   county:"Makueni",  crop:"Green Grams", qty:10,  price:9400, quality:"Grade B", posted:"5h ago",  verified:false, bids:0  },
];

const counties = ["Machakos","Kitui","Makueni"];
const crops    = ["Maize","Green Grams"];
const cats     = ["Seeds","Fertilizer","Labor","Chemicals","Transport","Other"];

// ─── REUSABLE ─────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      ...style,
    }}>{children}</div>
  );
}

function Chip({ label, color = T.accent, bg }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.04em", border: `1px solid ${color}50`,
      background: bg || `${color}14`, color,
    }}>{label}</span>
  );
}

function StatCard({ title, value, sub, icon: Icon, trend, color = T.accent }) {
  return (
    <Card style={{ padding: "18px 22px", position: "relative", overflow: "hidden" }}>
      <div style={{
        position:"absolute", top:0, right:0, width:72, height:72,
        background:`radial-gradient(circle at top right,${color}1a,transparent 70%)`,
      }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <span style={{ fontSize:11, color:T.textDim, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" }}>{title}</span>
        <div style={{ background:`${color}18`, borderRadius:8, padding:7 }}><Icon size={15} color={color}/></div>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color:T.textBright, letterSpacing:"-0.02em", marginBottom:4 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:T.textDim }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:6 }}>
          {trend >= 0
            ? <ArrowUp size={12} color={T.accent}/>
            : <ArrowDown size={12} color={T.red}/>}
          <span style={{ fontSize:11, color: trend >= 0 ? T.accent : T.red, fontWeight:600 }}>
            {Math.abs(trend)}% vs last month
          </span>
        </div>
      )}
    </Card>
  );
}

function RecoCard({ crop, action, reason, margin, confidence }) {
  const cfg = {
    SELL:  { color:T.accent, bg:"#14532d", icon:"💰", label:"SELL NOW" },
    STORE: { color:T.amber,  bg:"#451a03", icon:"📦", label:"STORE"    },
    DELAY: { color:T.blue,   bg:"#1e3a5f", icon:"⏳", label:"DELAY"    },
  };
  const c = cfg[action];
  return (
    <Card style={{ padding:20, position:"relative", overflow:"hidden", border:`1px solid ${c.color}30` }}>
      <div style={{ position:"absolute",inset:0, background:`radial-gradient(ellipse at top left,${c.color}08,transparent 60%)` }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:11, color:T.textDim, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{crop}</div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6,
            background:c.bg, border:`1px solid ${c.color}50`, borderRadius:8, padding:"5px 12px" }}>
            <span style={{ fontSize:16 }}>{c.icon}</span>
            <span style={{ color:c.color, fontWeight:800, fontSize:13 }}>{c.label}</span>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:10, color:T.textDim }}>Confidence</div>
          <div style={{ fontSize:20, fontWeight:800, color:c.color }}>{confidence}%</div>
        </div>
      </div>
      <p style={{ color:T.textDim, fontSize:12, lineHeight:1.65, marginBottom:12 }}>{reason}</p>
      <div style={{ background:T.surfaceAlt, borderRadius:8, padding:"8px 12px" }}>
        <div style={{ fontSize:10, color:T.textDim }}>Projected Margin</div>
        <div style={{ fontSize:15, fontWeight:700, color:c.color }}>KSh {margin.toLocaleString()}</div>
      </div>
    </Card>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  const nav = [
    { id:"dashboard",  label:"Dashboard",          icon:LayoutDashboard },
    { id:"expenses",   label:"Expenses",            icon:Wallet          },
    { id:"market-intel",label:"Market Intelligence",icon:TrendingUp      },
    { id:"simulation", label:"Market Simulation",   icon:ShoppingCart    },
    { id:"weather",    label:"Weather Advisory",    icon:CloudSun        },
    { id:"settings",   label:"Settings",            icon:Settings        },
  ];
  return (
    <div style={{
      width: collapsed ? 64 : 232, flexShrink:0,
      background:T.surface, borderRight:`1px solid ${T.border}`,
      height:"100vh", display:"flex", flexDirection:"column",
      transition:"width 0.25s cubic-bezier(.4,0,.2,1)",
      overflow:"hidden", position:"sticky", top:0,
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed?"20px 14px":"20px 18px", borderBottom:`1px solid ${T.border}`,
        display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34,height:34,borderRadius:10,flexShrink:0,
          background:`linear-gradient(135deg,${T.accent},#166534)`,
          display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Leaf size={17} color="#fff"/>
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight:800, fontSize:13, color:T.textBright, letterSpacing:"-0.01em" }}>Mkulima</div>
            <div style={{ fontSize:9, color:T.accent, letterSpacing:"0.14em", textTransform:"uppercase" }}>Smart System</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ padding:"10px 6px", flex:1, display:"flex", flexDirection:"column", gap:2 }}>
        {nav.map(({ id, label, icon:Icon }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => setActive(id)} style={{
              display:"flex", alignItems:"center", gap:10,
              padding: collapsed?"9px 15px":"9px 12px",
              borderRadius:9, border:"none", cursor:"pointer",
              background: on ? T.accentGlow : "transparent",
              color: on ? T.accent : T.textDim,
              width:"100%", textAlign:"left",
              transition:"all 0.15s",
              justifyContent: collapsed?"center":"flex-start",
            }}>
              <Icon size={17} style={{ flexShrink:0 }}/>
              {!collapsed && (
                <span style={{ fontSize:12, fontWeight: on?600:400, whiteSpace:"nowrap", flex:1 }}>{label}</span>
              )}
              {!collapsed && on && <ChevronRight size={13}/>}
            </button>
          );
        })}
      </nav>

      {/* Profile */}
      {!collapsed && (
        <div style={{ margin:"6px", padding:"10px 12px", background:T.surfaceAlt,
          borderRadius:10, border:`1px solid ${T.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:30,height:30,borderRadius:"50%",flexShrink:0,
              background:`linear-gradient(135deg,${T.accent},#166534)`,
              display:"flex",alignItems:"center",justifyContent:"center" }}>
              <User size={13} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize:11,fontWeight:600,color:T.text }}>John Mutua</div>
              <div style={{ fontSize:10,color:T.textDim }}>Machakos County</div>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setCollapsed(!collapsed)} style={{
        margin:6, padding:9, borderRadius:9, border:`1px solid ${T.border}`,
        background:"transparent", cursor:"pointer", color:T.textDim,
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <Menu size={15}/>
      </button>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ page, county, setCounty, crop, setCrop }) {
  const titles = {
    dashboard:    "Overview Dashboard",
    expenses:     "Expense Tracker",
    "market-intel": "Market Intelligence",
    simulation:   "Market Simulation",
    weather:      "Weather Advisory",
    settings:     "Settings",
  };
  return (
    <div style={{ height:60, borderBottom:`1px solid ${T.border}`,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 22px", background:T.bg, flexShrink:0,
      position:"sticky", top:0, zIndex:10 }}>
      <h1 style={{ fontSize:16, fontWeight:700, color:T.textBright, letterSpacing:"-0.01em", margin:0 }}>
        {titles[page]}
      </h1>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {["dashboard","market-intel","weather"].includes(page) && (
          <>
            <select value={county} onChange={e=>setCounty(e.target.value)} style={{
              background:T.surface, border:`1px solid ${T.border}`, color:T.text,
              borderRadius:7, padding:"5px 10px", fontSize:12, cursor:"pointer", outline:"none" }}>
              {counties.map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={crop} onChange={e=>setCrop(e.target.value)} style={{
              background:T.surface, border:`1px solid ${T.border}`, color:T.text,
              borderRadius:7, padding:"5px 10px", fontSize:12, cursor:"pointer", outline:"none" }}>
              {crops.map(c=><option key={c}>{c}</option>)}
            </select>
          </>
        )}
        <div style={{ width:34,height:34,borderRadius:7,background:T.surface,
          border:`1px solid ${T.border}`, display:"flex",alignItems:"center",
          justifyContent:"center", cursor:"pointer", position:"relative" }}>
          <Bell size={14} color={T.textDim}/>
          <div style={{ position:"absolute",top:8,right:8,width:5,height:5,
            borderRadius:"50%",background:T.accent }}/>
        </div>
      </div>
    </div>
  );
}

// ─── EXPENSE MODAL ────────────────────────────────────────────────────────────
function ExpenseModal({ onClose, onSave }) {
  const [form, setForm] = useState({ item:"",category:"Seeds",amount:"",crop:"Maize",date:"" });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)" }}>
      <Card style={{ padding:28, width:420, maxWidth:"90vw" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <h2 style={{ fontSize:16,fontWeight:700,color:T.textBright,margin:0 }}>Log Expense</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:T.textDim }}><X size={18}/></button>
        </div>
        {[
          { label:"Item Description", key:"item",   type:"text",   ph:"e.g. DAP Fertilizer 50kg" },
          { label:"Amount (KSh)",     key:"amount", type:"number", ph:"0" },
          { label:"Date",             key:"date",   type:"date",   ph:"" },
        ].map(({label,key,type,ph})=>(
          <div key={key} style={{ marginBottom:14 }}>
            <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:5,
              textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</label>
            <input type={type} value={form[key]} placeholder={ph} onChange={e=>set(key,e.target.value)}
              style={{ width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,
                borderRadius:7,padding:"9px 12px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box" }}/>
          </div>
        ))}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22 }}>
          {[{label:"Category",key:"category",opts:cats},{label:"Crop",key:"crop",opts:crops}].map(({label,key,opts})=>(
            <div key={key}>
              <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:5,
                textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</label>
              <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{
                width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,
                borderRadius:7,padding:"9px 12px",color:T.text,fontSize:13,outline:"none",cursor:"pointer" }}>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",borderRadius:9,
            border:`1px solid ${T.border}`,background:"transparent",color:T.textDim,cursor:"pointer",fontSize:13 }}>
            Cancel
          </button>
          <button onClick={()=>{onSave(form);onClose();}} style={{ flex:1,padding:"11px",borderRadius:9,
            border:"none",background:T.accent,color:"#000",cursor:"pointer",fontSize:13,fontWeight:700 }}>
            Save Expense
          </button>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD (updated — weather + price reco equal weight)
// ════════════════════════════════════════════════════════════════════════
function Dashboard({ county }) {
  return (
    <div style={{ padding:22, display:"flex", flexDirection:"column", gap:20 }}>

      {/* Alert banner */}
      <div style={{ background:"#1c1400", border:`1px solid ${T.amber}40`, borderRadius:10,
        padding:"10px 18px", display:"flex", alignItems:"center", gap:10 }}>
        <AlertTriangle size={14} color={T.amber}/>
        <span style={{ color:T.amber, fontSize:12 }}>
          Heavy rainfall forecast Wed–Thu in {county}. Avoid pesticide application.
          Maize prices projected to rise <strong>+8.2%</strong> over 6 weeks.
        </span>
      </div>

      {/* Stat row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:14 }}>
        <StatCard title="Total Expenses"     value="KSh 13,350"  sub="This season"          icon={Wallet}   trend={-4.2} color={T.red}  />
        <StatCard title="Projected Revenue"  value="KSh 28,800"  sub="At forecast price"    icon={DollarSign} trend={8.2}             />
        <StatCard title="Net Margin"         value="KSh 15,450"  sub="53.6% margin"         icon={TrendingUp} trend={12.1}            />
        <StatCard title="Break-Even Price"   value="KSh 2,967"   sub="Per 90kg bag"         icon={BarChart2}  color={T.blue}          />
      </div>

      {/* Main 2-col grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>

        {/* Left: Price Trend */}
        <Card style={{ padding:22 }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13,fontWeight:700,color:T.textBright }}>Price Trend & Forecast</div>
            <div style={{ fontSize:11,color:T.textDim }}>KSh per 90kg bag · Shaded = LSTM forecast</div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.accent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={T.accent} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={T.blue} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={T.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="month" tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12}}/>
              <Area type="monotone" dataKey="maize"      stroke={T.accent} fill="url(#mg)" strokeWidth={2} name="Maize"/>
              <Area type="monotone" dataKey="greengrams" stroke={T.blue}   fill="url(#gg)" strokeWidth={2} name="Green Grams"/>
            </AreaChart>
          </ResponsiveContainer>
          {/* mini reco */}
          <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { crop:"Maize", action:"DELAY", confidence:82, margin:17200 },
              { crop:"Green Grams", action:"SELL", confidence:76, margin:12400 },
            ].map(r => {
              const cfg = { SELL:{c:T.accent,icon:"💰"}, STORE:{c:T.amber,icon:"📦"}, DELAY:{c:T.blue,icon:"⏳"} };
              const cc = cfg[r.action];
              return (
                <div key={r.crop} style={{ background:T.surfaceAlt, border:`1px solid ${cc.c}30`,
                  borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:10,color:T.textDim,marginBottom:4 }}>{r.crop}</div>
                  <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:6 }}>
                    <span style={{ fontSize:14 }}>{cc.icon}</span>
                    <span style={{ fontSize:12,fontWeight:800,color:cc.c }}>{r.action}</span>
                    <span style={{ fontSize:10,color:T.textDim,marginLeft:"auto" }}>{r.confidence}%</span>
                  </div>
                  <div style={{ fontSize:11,color:T.textDim }}>
                    Margin: <span style={{ color:cc.c,fontWeight:600 }}>KSh {r.margin.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Weather Advisory */}
        <Card style={{ padding:22 }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:13,fontWeight:700,color:T.textBright }}>Weather Advisory</div>
            <div style={{ fontSize:11,color:T.textDim }}>{county} · 7-day forecast</div>
          </div>

          {/* 7-day strip */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:16 }}>
            {weatherForecast.map(d => (
              <div key={d.day} style={{ background:T.surfaceAlt, borderRadius:8, padding:"8px 4px",
                textAlign:"center", border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:9,color:T.textDim,marginBottom:4,fontWeight:600 }}>{d.day}</div>
                <div style={{ fontSize:13 }}>{d.rain>20?"🌧️":d.rain>5?"🌦️":d.temp>30?"☀️":"⛅"}</div>
                <div style={{ fontSize:10,fontWeight:700,color:T.text,marginTop:3 }}>{d.temp}°</div>
                <div style={{ fontSize:9,color:T.blue,marginTop:1 }}>{d.rain}mm</div>
              </div>
            ))}
          </div>

          {/* Advisory cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { icon:"🌧️", title:"Heavy Rain Wed–Thu", body:"Avoid pesticide/fertilizer application. Ensure field drainage to prevent waterlogging of maize.", color:T.blue, sev:"warning" },
              { icon:"🌡️", title:"Heat Stress Saturday", body:"Temps hitting 31°C. Ensure soil moisture for green grams in pod-filling stage.", color:T.amber, sev:"alert" },
              { icon:"🌱", title:"Planting Window Open", body:"Favourable conditions from Thursday. Optimal for both maize and green gram germination.", color:T.accent, sev:"info" },
            ].map(a => (
              <div key={a.title} style={{ display:"flex",gap:10,padding:"10px 12px",
                background:T.surfaceAlt, borderRadius:9,
                border:`1px solid ${a.color}25` }}>
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,color:a.color,marginBottom:2 }}>{a.title}</div>
                  <div style={{ fontSize:11,color:T.textDim,lineHeight:1.55 }}>{a.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom: Expenses bar */}
      <Card style={{ padding:22 }}>
        <div style={{ fontSize:13,fontWeight:700,color:T.textBright,marginBottom:4 }}>Expense Breakdown</div>
        <div style={{ fontSize:11,color:T.textDim,marginBottom:16 }}>By category · Current season</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={[
            {name:"Seeds",v:1200},{name:"Fertilizer",v:7000},
            {name:"Labor",v:4300},{name:"Chemicals",v:850},{name:"Transport",v:400},
          ]} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false}/>
            <XAxis type="number" tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis type="category" dataKey="name" tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false} width={72}/>
            <Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12}}/>
            <Bar dataKey="v" fill={T.accent} radius={[0,4,4,0]} name="KSh"/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PAGE: EXPENSES
// ════════════════════════════════════════════════════════════════════════
function Expenses() {
  const [expenses, setExpenses] = useState(expenseData);
  const [showModal, setShowModal]= useState(false);
  const [filter, setFilter]      = useState("All");

  const total    = expenses.reduce((s,e)=>s+Number(e.amount),0);
  const filtered = filter==="All" ? expenses : expenses.filter(e=>e.crop===filter);

  return (
    <div style={{ padding:22, display:"flex", flexDirection:"column", gap:20 }}>
      {showModal && <ExpenseModal onClose={()=>setShowModal(false)} onSave={f=>setExpenses(p=>[...p,{...f,id:Date.now(),amount:Number(f.amount)}])}/>}

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14 }}>
        <StatCard title="Total Expenses"  value={`KSh ${total.toLocaleString()}`} sub="All crops · This season" icon={Wallet} color={T.red}/>
        <StatCard title="Maize"           value={`KSh ${expenses.filter(e=>e.crop==="Maize").reduce((s,e)=>s+Number(e.amount),0).toLocaleString()}`} sub="Inputs & labor" icon={Package}/>
        <StatCard title="Green Grams"     value={`KSh ${expenses.filter(e=>e.crop==="Green Grams").reduce((s,e)=>s+Number(e.amount),0).toLocaleString()}`} sub="Inputs & labor" icon={ShoppingCart} color={T.blue}/>
      </div>

      <Card style={{ overflow:"hidden" }}>
        <div style={{ padding:"14px 20px",borderBottom:`1px solid ${T.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",gap:8 }}>
            {["All",...crops].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:"5px 12px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",
                border:`1px solid ${filter===f?T.accent:T.border}`,
                background:filter===f?T.accentGlow:"transparent",
                color:filter===f?T.accent:T.textDim }}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowModal(true)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"7px 14px",
            borderRadius:8,border:"none",background:T.accent,color:"#000",
            cursor:"pointer",fontSize:12,fontWeight:700 }}>
            <Plus size={14}/> Log Expense
          </button>
        </div>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.surfaceAlt }}>
              {["Item","Category","Crop","Date","Amount (KSh)"].map(h=>(
                <th key={h} style={{ padding:"11px 20px",textAlign:"left",fontSize:10,
                  color:T.textDim,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e,i)=>(
              <tr key={e.id} style={{ borderTop:`1px solid ${T.border}`,
                background:i%2===0?"transparent":T.surfaceAlt+"30" }}>
                <td style={{ padding:"12px 20px",color:T.text,fontSize:12 }}>{e.item}</td>
                <td style={{ padding:"12px 20px" }}><Chip label={e.category} color={T.textDim}/></td>
                <td style={{ padding:"12px 20px",fontSize:12,color:e.crop==="Maize"?T.accent:T.blue }}>{e.crop}</td>
                <td style={{ padding:"12px 20px",fontSize:12,color:T.textDim }}>{e.date}</td>
                <td style={{ padding:"12px 20px",fontSize:13,fontWeight:700,color:T.textBright }}>
                  {Number(e.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PAGE: MARKET INTELLIGENCE (merged Forecast + Decision Engine)
// ════════════════════════════════════════════════════════════════════════
function MarketIntelligence({ crop, county }) {
  const [chartCrop, setChartCrop] = useState("both");
  const [yield_, setYield]        = useState(20);
  const [price, setPrice]         = useState(3750);
  const expenses = 13350;

  const revenue    = yield_ * price;
  const profit     = revenue - expenses;
  const breakEven  = expenses / yield_;
  const margin     = ((profit / revenue) * 100).toFixed(1);
  const gap        = ((price - breakEven) / breakEven * 100);
  const action     = profit < 0 || gap < 5 ? "STORE" : gap > 20 && price < 3900 ? "DELAY" : "SELL";

  const actionCfg = {
    SELL:  { color:T.accent, icon:"💰", label:"SELL NOW",  bg:"#14532d" },
    STORE: { color:T.amber,  icon:"📦", label:"STORE",     bg:"#451a03" },
    DELAY: { color:T.blue,   icon:"⏳", label:"DELAY",     bg:"#1e3a5f" },
  };
  const ac = actionCfg[action];

  const reasons = {
    SELL:  `Current price of KSh ${price.toLocaleString()}/bag is ${gap.toFixed(0)}% above your break-even. Margins are strong. Lock in KSh ${profit.toLocaleString()} profit now.`,
    STORE: profit < 0
      ? `Selling at KSh ${price.toLocaleString()}/bag would result in a loss of KSh ${Math.abs(profit).toLocaleString()}. Store until prices recover above KSh ${Math.ceil(breakEven).toLocaleString()}.`
      : `Price is only ${gap.toFixed(1)}% above break-even — profit is marginal. Hold for a better entry point.`,
    DELAY: `You're profitable but the LSTM forecast shows a further 8.2% price rise over 6 weeks. Delay 4–6 weeks for significantly better returns.`,
  };

  return (
    <div style={{ padding:22, display:"flex", flexDirection:"column", gap:20 }}>

      {/* Stat row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
        <StatCard title="Maize Current"    value="KSh 3,750"  sub="Per 90kg bag · Machakos" icon={TrendingUp} trend={8.2}/>
        <StatCard title="Green Grams"      value="KSh 9,600"  sub="Per 90kg bag · Machakos" icon={TrendingUp} trend={-3.1} color={T.blue}/>
        <StatCard title="6-Week Forecast"  value="KSh 4,100"  sub="Maize peak projection"   icon={BarChart2}  color={T.amber}/>
        <StatCard title="Your Break-Even"  value="KSh 2,967"  sub="At 20 bags input cost"   icon={DollarSign} color={T.blue}/>
      </div>

      {/* Two column layout */}
      <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:18 }}>

        {/* Left: Forecast Chart */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <Card style={{ padding:22 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <div>
                <div style={{ fontSize:13,fontWeight:700,color:T.textBright }}>LSTM Price Forecast</div>
                <div style={{ fontSize:11,color:T.textDim }}>Historical + 6-week projection · Dashed = forecast</div>
              </div>
              <div style={{ display:"flex",gap:6 }}>
                {[["both","Both"],["maize","Maize"],["gg","Green Grams"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setChartCrop(v)} style={{
                    padding:"4px 11px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",
                    border:`1px solid ${chartCrop===v?T.accent:T.border}`,
                    background:chartCrop===v?T.accentGlow:"transparent",
                    color:chartCrop===v?T.accent:T.textDim }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                <XAxis dataKey="month" tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12}}/>
                <Legend wrapperStyle={{color:T.textDim,fontSize:11}}/>
                {(chartCrop==="both"||chartCrop==="maize") && (
                  <Line type="monotone" dataKey="maize" stroke={T.accent} strokeWidth={2.5}
                    dot={{fill:T.accent,r:3}} name="Maize (KSh)"/>
                )}
                {(chartCrop==="both"||chartCrop==="gg") && (
                  <Line type="monotone" dataKey="greengrams" stroke={T.blue} strokeWidth={2.5}
                    dot={{fill:T.blue,r:3}} name="Green Grams (KSh)"/>
                )}
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Break-even bar */}
          <Card style={{ padding:20 }}>
            <div style={{ fontSize:13,fontWeight:700,color:T.textBright,marginBottom:14 }}>Break-Even Analysis</div>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
              <span style={{ fontSize:11,color:T.textDim }}>Break-even: <strong style={{color:T.textBright}}>KSh {Math.round(breakEven).toLocaleString()}/bag</strong></span>
              <span style={{ fontSize:11,color:T.textDim }}>Market: <strong style={{color:T.textBright}}>KSh {price.toLocaleString()}/bag</strong></span>
            </div>
            <div style={{ height:10,background:T.border,borderRadius:5,overflow:"hidden",marginBottom:8 }}>
              <div style={{
                height:"100%",borderRadius:5,transition:"width 0.4s ease",
                width:`${Math.min((price/(breakEven*2))*100,100)}%`,
                background: price > breakEven*1.3
                  ? `linear-gradient(90deg,${T.accentDim},${T.accent})`
                  : price > breakEven
                  ? `linear-gradient(90deg,#854d0e,${T.amber})`
                  : `linear-gradient(90deg,#7f1d1d,${T.red})`,
              }}/>
            </div>
            <div style={{ fontSize:11,color:T.textDim }}>
              {price > breakEven
                ? `✓ KSh ${(price-Math.round(breakEven)).toLocaleString()} above break-even (${gap.toFixed(1)}% buffer)`
                : `⚠ KSh ${(Math.round(breakEven)-price).toLocaleString()} below break-even — do not sell`}
            </div>
          </Card>
        </div>

        {/* Right: Decision Engine */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

          {/* Sliders */}
          <Card style={{ padding:20 }}>
            <div style={{ fontSize:13,fontWeight:700,color:T.textBright,marginBottom:16 }}>Profit Computation</div>
            {[
              { label:"Expected Yield (bags)", val:yield_, set:setYield, min:1,    max:100,  fmt:v=>`${v} bags` },
              { label:"Market Price (KSh/bag)", val:price, set:setPrice, min:1000, max:8000, fmt:v=>`KSh ${v.toLocaleString()}` },
            ].map(({label,val,set,min,max,fmt})=>(
              <div key={label} style={{ marginBottom:18 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:7 }}>
                  <span style={{ fontSize:11,color:T.textDim,textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</span>
                  <span style={{ fontSize:12,fontWeight:700,color:T.accent }}>{fmt(val)}</span>
                </div>
                <input type="range" min={min} max={max} value={val}
                  onChange={e=>set(Number(e.target.value))}
                  style={{ width:"100%",accentColor:T.accent }}/>
              </div>
            ))}
            {/* Metrics grid */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              {[
                { l:"Expenses",  v:`KSh ${expenses.toLocaleString()}`, c:T.red   },
                { l:"Revenue",   v:`KSh ${revenue.toLocaleString()}`,  c:T.accent},
                { l:"Net Profit",v:`KSh ${profit.toLocaleString()}`,   c:profit>0?T.accent:T.red },
                { l:"Margin",    v:`${margin}%`,                       c:T.amber },
              ].map(({l,v,c})=>(
                <div key={l} style={{ background:T.surfaceAlt,borderRadius:8,padding:"10px 12px",
                  border:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:10,color:T.textDim,textTransform:"uppercase",
                    letterSpacing:"0.06em",marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:14,fontWeight:700,color:c }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendation */}
          <Card style={{ padding:20, border:`1px solid ${ac.color}35`, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse at top left,${ac.color}08,transparent 60%)` }}/>
            <div style={{ fontSize:11,color:T.textDim,textTransform:"uppercase",
              letterSpacing:"0.1em",marginBottom:10 }}>AI Recommendation</div>
            <div style={{ display:"inline-flex",alignItems:"center",gap:8,
              background:ac.bg,border:`1px solid ${ac.color}60`,
              borderRadius:9,padding:"7px 14px",marginBottom:12 }}>
              <span style={{ fontSize:18 }}>{ac.icon}</span>
              <span style={{ color:ac.color,fontWeight:800,fontSize:15 }}>{ac.label}</span>
            </div>
            <p style={{ color:T.textDim,fontSize:12,lineHeight:1.65,marginBottom:14 }}>
              {reasons[action]}
            </p>
            <div style={{ background:T.surfaceAlt,borderRadius:8,padding:"8px 12px",
              border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:10,color:T.textDim }}>Projected Profit</div>
              <div style={{ fontSize:16,fontWeight:800,color:ac.color }}>
                KSh {profit.toLocaleString()}
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PAGE: MARKET SIMULATION (new)
// ════════════════════════════════════════════════════════════════════════
function MarketSimulation() {
  const [listings, setListings]   = useState(initialListings);
  const [filter, setFilter]       = useState({ type:"all", crop:"all", county:"all" });
  const [showPost, setShowPost]   = useState(false);
  const [search, setSearch]       = useState("");
  const [sortBy, setSortBy]       = useState("newest");
  const [bidding, setBidding]     = useState(null); // listing id being bid on
  const [bidPrice, setBidPrice]   = useState("");

  // Live bid simulation — random bid count increments
  useEffect(() => {
    const timer = setInterval(() => {
      setListings(prev => prev.map(l =>
        l.type === "sell" && Math.random() > 0.85
          ? { ...l, bids: l.bids + 1 }
          : l
      ));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filtered = listings.filter(l => {
    if (filter.type !== "all" && l.type !== filter.type) return false;
    if (filter.crop !== "all" && l.crop !== filter.crop) return false;
    if (filter.county !== "all" && l.county !== filter.county) return false;
    if (search && !l.farmer.toLowerCase().includes(search.toLowerCase()) &&
        !l.crop.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a,b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "qty") return b.qty - a.qty;
    return b.id - a.id; // newest
  });

  const totalSellVol = listings.filter(l=>l.type==="sell").reduce((s,l)=>s+l.qty,0);
  const totalBuyVol  = listings.filter(l=>l.type==="buy").reduce((s,l)=>s+l.qty,0);
  const avgSellPrice = Math.round(listings.filter(l=>l.type==="sell").reduce((s,l)=>s+l.price,0)/listings.filter(l=>l.type==="sell").length);

  return (
    <div style={{ padding:22, display:"flex", flexDirection:"column", gap:20 }}>

      {/* Post listing modal */}
      {showPost && <PostListingModal onClose={()=>setShowPost(false)} onPost={data=>{
        setListings(p=>[{...data,id:Date.now(),posted:"Just now",bids:0},...p]);
        setShowPost(false);
      }}/>}

      {/* Bid modal */}
      {bidding && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)" }}>
          <Card style={{ padding:28,width:380,maxWidth:"90vw" }}>
            {(() => {
              const listing = listings.find(l=>l.id===bidding);
              return <>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <div style={{ fontSize:15,fontWeight:700,color:T.textBright }}>Place a Bid</div>
                  <button onClick={()=>setBidding(null)} style={{ background:"none",border:"none",cursor:"pointer",color:T.textDim }}><X size={18}/></button>
                </div>
                <div style={{ background:T.surfaceAlt,borderRadius:10,padding:14,marginBottom:18,border:`1px solid ${T.border}` }}>
                  <div style={{ fontSize:12,color:T.textDim,marginBottom:2 }}>{listing?.farmer} · {listing?.county}</div>
                  <div style={{ fontSize:14,fontWeight:700,color:T.textBright }}>{listing?.crop} — {listing?.qty} bags</div>
                  <div style={{ fontSize:13,color:T.accent }}>Listed at KSh {listing?.price.toLocaleString()}/bag</div>
                </div>
                <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:6,
                  textTransform:"uppercase",letterSpacing:"0.06em" }}>Your Bid Price (KSh/bag)</label>
                <input type="number" value={bidPrice} onChange={e=>setBidPrice(e.target.value)}
                  placeholder={listing?.price}
                  style={{ width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,
                    borderRadius:7,padding:"10px 12px",color:T.text,fontSize:14,outline:"none",
                    boxSizing:"border-box",marginBottom:18 }}/>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={()=>setBidding(null)} style={{ flex:1,padding:"10px",borderRadius:8,
                    border:`1px solid ${T.border}`,background:"transparent",color:T.textDim,cursor:"pointer",fontSize:12 }}>
                    Cancel
                  </button>
                  <button onClick={()=>{
                    setListings(p=>p.map(l=>l.id===bidding?{...l,bids:l.bids+1}:l));
                    setBidding(null); setBidPrice("");
                  }} style={{ flex:1,padding:"10px",borderRadius:8,border:"none",
                    background:T.accent,color:"#000",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                    Submit Bid
                  </button>
                </div>
              </>;
            })()}
          </Card>
        </div>
      )}

      {/* Market stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14 }}>
        <StatCard title="Active Sell Listings" value={listings.filter(l=>l.type==="sell").length}  sub={`${totalSellVol} bags total`}  icon={Tag}         color={T.accent}/>
        <StatCard title="Active Buy Orders"    value={listings.filter(l=>l.type==="buy").length}   sub={`${totalBuyVol} bags wanted`}  icon={ShoppingCart} color={T.blue}  />
        <StatCard title="Avg Sell Price"       value={`KSh ${avgSellPrice.toLocaleString()}`}     sub="Per 90kg bag · All crops"      icon={DollarSign}   trend={2.1}     />
        <StatCard title="Live Bids"            value={listings.reduce((s,l)=>s+l.bids,0)}         sub="Across all listings"           icon={Zap}          color={T.amber} />
      </div>

      {/* Controls bar */}
      <div style={{ display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
        {/* Search */}
        <div style={{ position:"relative",flex:1,minWidth:180 }}>
          <Search size={13} color={T.textDim} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)" }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search farmer or crop..."
            style={{ width:"100%",background:T.surface,border:`1px solid ${T.border}`,
              borderRadius:8,padding:"8px 10px 8px 30px",color:T.text,fontSize:12,
              outline:"none",boxSizing:"border-box" }}/>
        </div>

        {/* Filters */}
        {[
          { key:"type",   opts:[["all","All"],["sell","Sellers"],["buy","Buyers"]] },
          { key:"crop",   opts:[["all","All Crops"],...crops.map(c=>[c,c])] },
          { key:"county", opts:[["all","All Counties"],...counties.map(c=>[c,c])] },
        ].map(({key,opts})=>(
          <select key={key} value={filter[key]} onChange={e=>setFilter(p=>({...p,[key]:e.target.value}))}
            style={{ background:T.surface,border:`1px solid ${T.border}`,color:T.text,
              borderRadius:8,padding:"7px 10px",fontSize:12,cursor:"pointer",outline:"none" }}>
            {opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        ))}

        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{ background:T.surface,border:`1px solid ${T.border}`,color:T.text,
            borderRadius:8,padding:"7px 10px",fontSize:12,cursor:"pointer",outline:"none" }}>
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="qty">Largest lots first</option>
        </select>

        <button onClick={()=>setShowPost(true)} style={{
          display:"flex",alignItems:"center",gap:6,padding:"7px 16px",
          borderRadius:8,border:"none",background:T.accent,color:"#000",
          cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap" }}>
          <Plus size={14}/> Post Listing
        </button>
      </div>

      {/* Listings grid */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>
        {sorted.map(l => (
          <ListingCard key={l.id} listing={l} onBid={()=>setBidding(l.id)}/>
        ))}
        {sorted.length === 0 && (
          <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"48px 0",color:T.textDim }}>
            <Package size={32} style={{ margin:"0 auto 12px",display:"block",opacity:0.4 }}/>
            <div style={{ fontSize:14 }}>No listings match your filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing: l, onBid }) {
  const isSell = l.type === "sell";
  const color  = isSell ? T.accent : T.blue;
  return (
    <Card style={{ padding:18, border:`1px solid ${color}25`, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,right:0,width:60,height:60,
        background:`radial-gradient(circle at top right,${color}12,transparent 70%)` }}/>

      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <Chip label={isSell?"SELLING":"BUYING"} color={color}/>
          {l.verified && <Chip label="✓ Verified" color={T.accent}/>}
        </div>
        {l.bids > 0 && isSell && (
          <div style={{ display:"flex",alignItems:"center",gap:4 }}>
            <Zap size={11} color={T.amber}/>
            <span style={{ fontSize:11,color:T.amber,fontWeight:700 }}>{l.bids} bid{l.bids>1?"s":""}</span>
          </div>
        )}
      </div>

      {/* Crop & Farmer */}
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:16,fontWeight:800,color:T.textBright,marginBottom:2 }}>{l.crop}</div>
        <div style={{ fontSize:12,color:T.textDim,display:"flex",alignItems:"center",gap:4 }}>
          <User size={11}/>{l.farmer}
        </div>
        <div style={{ fontSize:11,color:T.textDim,display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
          <MapPin size={11}/>{l.county} County
        </div>
      </div>

      {/* Details grid */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14 }}>
        {[
          { label:"Price",   value:`KSh ${l.price.toLocaleString()}`, color },
          { label:"Quantity",value:`${l.qty} bags`,                   color:T.textBright },
          { label:"Quality", value:l.quality,                         color:T.textDim },
        ].map(({label,value,color:c})=>(
          <div key={label} style={{ background:T.surfaceAlt,borderRadius:7,padding:"7px 10px",
            border:`1px solid ${T.border}` }}>
            <div style={{ fontSize:9,color:T.textDim,textTransform:"uppercase",
              letterSpacing:"0.06em",marginBottom:2 }}>{label}</div>
            <div style={{ fontSize:12,fontWeight:700,color:c }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ fontSize:10,color:T.muted,display:"flex",alignItems:"center",gap:3 }}>
          <Clock size={10}/>{l.posted}
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button style={{ padding:"6px 12px",borderRadius:7,border:`1px solid ${T.border}`,
            background:"transparent",color:T.textDim,cursor:"pointer",fontSize:11 }}>
            Contact
          </button>
          {isSell && (
            <button onClick={onBid} style={{ padding:"6px 12px",borderRadius:7,border:"none",
              background:T.accent,color:"#000",cursor:"pointer",fontSize:11,fontWeight:700 }}>
              Place Bid
            </button>
          )}
          {!isSell && (
            <button style={{ padding:"6px 12px",borderRadius:7,border:`1px solid ${T.blue}50`,
              background:`${T.blue}15`,color:T.blue,cursor:"pointer",fontSize:11,fontWeight:700 }}>
              Respond
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

function PostListingModal({ onClose, onPost }) {
  const [form, setForm] = useState({ type:"sell",crop:"Maize",county:"Machakos",
    qty:"",price:"",quality:"Grade A",farmer:"John Mutua" });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",
      display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,backdropFilter:"blur(4px)" }}>
      <Card style={{ padding:28,width:460,maxWidth:"90vw",maxHeight:"90vh",overflowY:"auto" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <h2 style={{ fontSize:16,fontWeight:700,color:T.textBright,margin:0 }}>Post a Listing</h2>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:T.textDim }}><X size={18}/></button>
        </div>

        {/* Type toggle */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18 }}>
          {[["sell","🌽 I'm Selling"],["buy","🛒 I'm Buying"]].map(([v,l])=>(
            <button key={v} onClick={()=>set("type",v)} style={{
              padding:"10px",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:13,
              border:`1px solid ${form.type===v?(v==="sell"?T.accent:T.blue):T.border}`,
              background:form.type===v?(v==="sell"?T.accentGlow:`${T.blue}12`):"transparent",
              color:form.type===v?(v==="sell"?T.accent:T.blue):T.textDim }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
          {[
            {label:"Crop",    key:"crop",    opts:crops},
            {label:"County",  key:"county",  opts:counties},
            {label:"Quality", key:"quality", opts:["Grade A","Grade B","Any"]},
          ].map(({label,key,opts})=>(
            <div key={key}>
              <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:5,
                textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</label>
              <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{
                width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,
                borderRadius:7,padding:"9px 12px",color:T.text,fontSize:13,outline:"none",cursor:"pointer" }}>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {[
            {label:"Quantity (bags)",    key:"qty",   ph:"e.g. 20"},
            {label:"Price per bag (KSh)",key:"price", ph:"e.g. 3750"},
          ].map(({label,key,ph})=>(
            <div key={key}>
              <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:5,
                textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</label>
              <input type="number" value={form[key]} placeholder={ph} onChange={e=>set(key,e.target.value)}
                style={{ width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,
                  borderRadius:7,padding:"9px 12px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box" }}/>
            </div>
          ))}
        </div>

        <div style={{ display:"flex",gap:10,marginTop:8 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",borderRadius:9,
            border:`1px solid ${T.border}`,background:"transparent",color:T.textDim,cursor:"pointer",fontSize:13 }}>
            Cancel
          </button>
          <button onClick={()=>onPost({ ...form, qty:Number(form.qty), price:Number(form.price),
            verified:false, type:form.type })}
            style={{ flex:1,padding:"11px",borderRadius:9,border:"none",
              background:T.accent,color:"#000",cursor:"pointer",fontSize:13,fontWeight:700 }}>
            Post Listing
          </button>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PAGE: WEATHER (full)
// ════════════════════════════════════════════════════════════════════════
function Weather({ county }) {
  return (
    <div style={{ padding:22, display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14 }}>
        <StatCard title="Temperature" value="28°C"    sub={`${county} · Today`}          icon={Thermometer} color={T.amber}/>
        <StatCard title="Rainfall"    value="12mm"    sub="Expected this week"            icon={Droplets}    color={T.blue}/>
        <StatCard title="Wind Speed"  value="14 km/h" sub="NE direction"                 icon={Wind}        color={T.textDim}/>
        <StatCard title="Humidity"    value="65%"     sub="Today's average"               icon={Droplets}    color={T.blue}/>
      </div>

      <Card style={{ padding:22 }}>
        <div style={{ fontSize:14,fontWeight:700,color:T.textBright,marginBottom:4 }}>7-Day Forecast</div>
        <div style={{ fontSize:11,color:T.textDim,marginBottom:22 }}>{county} County · Temperature & Rainfall</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weatherForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
            <XAxis dataKey="day" tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="left"  tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="right" orientation="right" tick={{fill:T.textDim,fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:12}}/>
            <Legend wrapperStyle={{color:T.textDim,fontSize:11}}/>
            <Bar yAxisId="left"  dataKey="temp" fill={T.amber} radius={[4,4,0,0]} name="Temp (°C)"/>
            <Bar yAxisId="right" dataKey="rain" fill={T.blue}  radius={[4,4,0,0]} name="Rain (mm)"/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14 }}>
        {[
          { icon:"🌧️", title:"Heavy Rain Advisory",  body:"Moderate–heavy rainfall expected Wed–Thu (35–40mm). Ideal for maize top-dressing if you apply 24h before. Avoid pesticide or fungicide application. Check field drainage channels.",         color:T.blue,  sev:"warning" },
          { icon:"🌡️", title:"Heat Stress Alert",     body:"Temperatures reaching 31°C on Saturday. High risk of heat stress for green grams in pod-filling stage. Irrigate early morning if possible and consider mulching to reduce soil temp.",      color:T.amber, sev:"alert"   },
          { icon:"🌱", title:"Planting Window",        body:"Favourable planting conditions from Thursday based on rainfall forecast and soil temperature modelling. Both maize and green grams suitable. Plant within 3 days of first rain onset.",      color:T.accent,sev:"info"    },
          { icon:"💨", title:"Wind Advisory",          body:"Winds of 18–20 km/h expected Wednesday. Avoid aerial spraying or foliar applications. Maize at vegetative stage is resilient but staking may be needed for tall varieties in exposed fields.", color:T.textDim,sev:"info"   },
        ].map(({ icon,title,body,color }) => (
          <Card key={title} style={{ padding:20, border:`1px solid ${color}25` }}>
            <div style={{ fontSize:24,marginBottom:10 }}>{icon}</div>
            <div style={{ fontSize:13,fontWeight:700,color,marginBottom:8 }}>{title}</div>
            <div style={{ fontSize:12,color:T.textDim,lineHeight:1.7 }}>{body}</div>
          </Card>
        ))}
      </div>

      <div style={{ padding:14,borderRadius:10,border:`1px dashed ${T.border}`,
        background:T.surfaceAlt,display:"flex",alignItems:"center",gap:10 }}>
        <CheckCircle size={14} color={T.accent}/>
        <span style={{ fontSize:11,color:T.textDim }}>
          <span style={{ color:T.accent,fontWeight:600 }}>Integration ready:</span> This module connects to your teammate's climate ML model via <code style={{ color:T.accent }}>/api/weather/advisory</code>. Live Open-Meteo data is already wired in the backend.
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// PAGE: SETTINGS
// ════════════════════════════════════════════════════════════════════════
function SettingsPage() {
  const [form,setForm] = useState({ name:"John Mutua",county:"Machakos",phone:"+254 712 345 678",maize:true,gg:true });
  return (
    <div style={{ padding:22,maxWidth:560 }}>
      <Card style={{ padding:26,display:"flex",flexDirection:"column",gap:18 }}>
        <div style={{ fontSize:14,fontWeight:700,color:T.textBright }}>Farmer Profile</div>
        {[{label:"Full Name",key:"name"},{label:"Phone",key:"phone"}].map(({label,key})=>(
          <div key={key}>
            <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:5,
              textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</label>
            <input value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
              style={{ width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,
                borderRadius:7,padding:"9px 12px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box" }}/>
          </div>
        ))}
        <div>
          <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:5,
            textTransform:"uppercase",letterSpacing:"0.06em" }}>County</label>
          <select value={form.county} onChange={e=>setForm(p=>({...p,county:e.target.value}))} style={{
            width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,
            borderRadius:7,padding:"9px 12px",color:T.text,fontSize:13,outline:"none",cursor:"pointer" }}>
            {counties.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:8,
            textTransform:"uppercase",letterSpacing:"0.06em" }}>Active Crops</label>
          <div style={{ display:"flex",gap:10 }}>
            {[["maize","Maize"],["gg","Green Grams"]].map(([k,label])=>(
              <button key={k} onClick={()=>setForm(p=>({...p,[k]:!p[k]}))} style={{
                padding:"7px 16px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:500,
                border:`1px solid ${form[k]?T.accent:T.border}`,
                background:form[k]?T.accentGlow:"transparent",
                color:form[k]?T.accent:T.textDim }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button style={{ padding:"11px",borderRadius:9,border:"none",
          background:T.accent,color:"#000",cursor:"pointer",fontSize:13,fontWeight:700,marginTop:4 }}>
          Save Settings
        </button>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════════════════
function Login({ onLogin }) {
  const [phone,setPhone] = useState("");
  const [pin,setPin]     = useState("");
  return (
    <div style={{ minHeight:"100vh",background:T.bg,display:"flex",
      alignItems:"center",justifyContent:"center",
      fontFamily:"'DM Mono','Space Mono',monospace" }}>
      <div style={{ width:380,maxWidth:"90vw" }}>
        <div style={{ textAlign:"center",marginBottom:36 }}>
          <div style={{ width:60,height:60,borderRadius:16,margin:"0 auto 14px",
            background:`linear-gradient(135deg,${T.accent},#166534)`,
            display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Leaf size={28} color="#fff"/>
          </div>
          <h1 style={{ fontSize:26,fontWeight:800,color:T.textBright,margin:0,letterSpacing:"-0.02em" }}>
            Mkulima Smart
          </h1>
          <p style={{ color:T.textDim,fontSize:13,marginTop:6 }}>
            Data-driven decisions for smallholder farmers
          </p>
        </div>
        <Card style={{ padding:28 }}>
          {[{label:"Phone Number",val:phone,set:setPhone,type:"tel",ph:"+254 7XX XXX XXX"},
            {label:"PIN",val:pin,set:setPin,type:"password",ph:"••••"}].map(({label,val,set,type,ph})=>(
            <div key={label} style={{ marginBottom:16 }}>
              <label style={{ fontSize:11,color:T.textDim,display:"block",marginBottom:5,
                textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</label>
              <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph}
                style={{ width:"100%",background:T.surfaceAlt,border:`1px solid ${T.border}`,
                  borderRadius:7,padding:"11px 12px",color:T.text,fontSize:14,
                  outline:"none",boxSizing:"border-box" }}/>
            </div>
          ))}
          <button onClick={onLogin} style={{ width:"100%",padding:"13px",borderRadius:10,border:"none",
            background:`linear-gradient(135deg,${T.accent},#22c55e)`,color:"#000",cursor:"pointer",
            fontSize:14,fontWeight:800,letterSpacing:"0.02em",marginTop:8 }}>
            Sign In →
          </button>
          <div style={{ textAlign:"center",marginTop:14 }}>
            <span style={{ fontSize:11,color:T.textDim }}>No account? </span>
            <span style={{ fontSize:11,color:T.accent,cursor:"pointer",fontWeight:600 }}>Register here</span>
          </div>
        </Card>
        <div style={{ textAlign:"center",marginTop:18 }}>
          <span style={{ fontSize:10,color:T.muted }}>Machakos · Kitui · Makueni</span>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage]         = useState("dashboard");
  const [collapsed, setCollapsed]= useState(false);
  const [county, setCounty]     = useState("Machakos");
  const [crop, setCrop]         = useState("Maize");

  const pages = {
    dashboard:      () => <Dashboard county={county}/>,
    expenses:       () => <Expenses/>,
    "market-intel": () => <MarketIntelligence crop={crop} county={county}/>,
    simulation:     () => <MarketSimulation/>,
    weather:        () => <Weather county={county}/>,
    settings:       () => <SettingsPage/>,
  };

  if (!loggedIn) return <Login onLogin={()=>setLoggedIn(true)}/>;

  const PageComp = pages[page];

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:T.bg,color:T.text,
      fontFamily:"'DM Mono','Space Mono','Courier New',monospace" }}>
      <Sidebar active={page} setActive={setPage} collapsed={collapsed} setCollapsed={setCollapsed}/>
      <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
        <Topbar page={page} county={county} setCounty={setCounty} crop={crop} setCrop={setCrop}/>
        <main style={{ flex:1,overflowY:"auto" }}>
          <PageComp/>
        </main>
      </div>
    </div>
  );
}
