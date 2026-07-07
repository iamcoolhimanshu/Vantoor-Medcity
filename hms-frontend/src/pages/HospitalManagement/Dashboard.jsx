// Dashboard.jsx — Self-contained HMS Dashboard (fetches own data from backend)
// Exported as default and used as <DashboardPage /> in HospitalRoutes.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

/* ─── helpers ─── */
const inr = v => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;
const fmtD = v => v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";
const avColor = n => ["#0D9488", "#7C3AED", "#2563EB", "#D97706", "#DC2626", "#0891B2", "#DB2777"][(n?.charCodeAt(0) || 0) % 7];

const T = { teal: "#0D9488", blue: "#2563EB", amber: "#D97706", red: "#DC2626", violet: "#7C3AED", green: "#059669", cyan: "#0891B2" };

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

  .dsh { font-family:'Inter',sans-serif; background:#F1F5F9; color:#0F172A; min-height:100vh; }
  [data-theme="dark"] .dsh { background:#0A1220; color:#F0F6FF; }

  @keyframes dsh-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dsh-spin { to{transform:rotate(360deg)} }

  /* ── WELCOME ── */
  .dsh-welcome {
    padding:22px 28px 20px;
    background:linear-gradient(135deg,#0F172A 0%,#1E3A5F 45%,#047857 100%);
    position:relative; overflow:hidden;
  }
  .dsh-welcome::before { content:''; position:absolute; top:-70px; right:-60px; width:230px; height:230px; border-radius:50%; background:rgba(255,255,255,0.04); }
  .dsh-welcome::after  { content:''; position:absolute; bottom:-50px; right:200px; width:160px; height:160px; border-radius:50%; background:rgba(16,185,129,0.08); }
  .dsh-welcome-inner { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap; position:relative; z-index:1; }
  .dsh-greet { font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.4px; }
  .dsh-greet-sub { font-size:13px; color:rgba(255,255,255,0.58); margin-top:4px; font-weight:500; }
  .dsh-chips { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
  .dsh-chip { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:11.5px; font-weight:700; border:1px solid; cursor:pointer; transition:transform 0.14s,opacity 0.14s; }
  .dsh-chip:hover { transform:translateY(-1px); }
  .dsh-chip.ok     { background:rgba(13,148,136,0.2); border-color:rgba(13,148,136,0.4); color:#6EE7B7; }
  .dsh-chip.warn   { background:rgba(217,119,6,0.2);  border-color:rgba(217,119,6,0.4);  color:#FCD34D; }
  .dsh-chip.danger { background:rgba(220,38,38,0.2);  border-color:rgba(220,38,38,0.4);  color:#FCA5A5; }
  .dsh-chip.info   { background:rgba(37,99,235,0.2);  border-color:rgba(37,99,235,0.4);  color:#93C5FD; }
  .dsh-chip-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }

  .dsh-qs-row { display:flex; gap:20px; flex-wrap:wrap; }
  .dsh-qs { text-align:center; cursor:pointer; transition:transform 0.15s; }
  .dsh-qs:hover { transform:translateY(-2px); }
  .dsh-qs-val { font-size:24px; font-weight:900; color:#fff; font-family:'DM Mono',monospace; letter-spacing:-0.5px; }
  .dsh-qs-lbl { font-size:10.5px; font-weight:700; color:rgba(255,255,255,0.55); text-transform:uppercase; letter-spacing:0.06em; margin-top:2px; }
  .dsh-qs-div { width:1px; background:rgba(255,255,255,0.15); align-self:stretch; margin:2px 0; }

  /* ── HERO KPI ── */
  .dsh-hero-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:14px; padding:16px 28px 0; }
  .dsh-kpi {
    position:relative; padding:20px 20px 16px; border-radius:16px; overflow:hidden;
    cursor:pointer; border:1px solid transparent;
    box-shadow:0 2px 12px rgba(0,0,0,0.12);
    animation:dsh-up 0.4s ease both;
    transition:transform 0.2s,box-shadow 0.2s;
  }
  .dsh-kpi:hover { transform:translateY(-4px); box-shadow:0 10px 32px rgba(0,0,0,0.18); }
  .dsh-kpi-glow { position:absolute; inset:0; opacity:0.08; background:radial-gradient(ellipse at 80% 20%,#fff 0%,transparent 65%); }
  .dsh-kpi-badge { position:absolute; top:14px; right:14px; font-size:10px; font-weight:800; padding:3px 9px; border-radius:20px; background:rgba(255,255,255,0.2); color:#fff; letter-spacing:0.04em; }
  .dsh-kpi-icon { width:42px; height:42px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:12px; position:relative; z-index:1; background:rgba(255,255,255,0.15); backdrop-filter:blur(8px); }
  .dsh-kpi-val { font-size:32px; font-weight:900; color:#fff; font-family:'DM Mono',monospace; letter-spacing:-1px; line-height:1; position:relative; z-index:1; margin-bottom:4px; }
  .dsh-kpi-lbl { font-size:12px; font-weight:700; color:rgba(255,255,255,0.8); position:relative; z-index:1; }
  .dsh-kpi-bar { margin-top:12px; height:3px; border-radius:4px; background:rgba(255,255,255,0.18); position:relative; z-index:1; overflow:hidden; }
  .dsh-kpi-fill { height:100%; border-radius:4px; background:rgba(255,255,255,0.7); transition:width 0.8s cubic-bezier(0.4,0,0.2,1); }
  .dsh-kpi-arrow { position:absolute; bottom:14px; right:12px; font-size:13px; color:rgba(255,255,255,0.5); opacity:0; transform:translateX(-4px); transition:all 0.18s; }
  .dsh-kpi:hover .dsh-kpi-arrow { opacity:1; transform:translateX(0); }

  /* ── MINI KPI ROW ── */
  .dsh-mini-row { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; padding:14px 28px 0; }
  @media(max-width:1200px){ .dsh-mini-row{ grid-template-columns:repeat(3,1fr); } }
  @media(max-width:700px)  { .dsh-mini-row{ grid-template-columns:repeat(2,1fr); } }
  .dsh-mini {
    border-radius:12px; padding:14px 16px 12px; cursor:pointer; position:relative; overflow:hidden;
    animation:dsh-up 0.35s ease both; transition:transform 0.18s,box-shadow 0.18s;
  }
  .dsh-mini:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.1); }
  .dsh-mini-bar { position:absolute; top:0; left:0; right:0; height:3px; border-radius:12px 12px 0 0; }
  .dsh-mini-ico { font-size:18px; margin-bottom:6px; }
  .dsh-mini-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; margin-bottom:5px; }
  .dsh-mini-val { font-size:20px; font-weight:900; font-family:'DM Mono',monospace; line-height:1; }
  .dsh-mini-sub { font-size:10px; font-weight:600; margin-top:4px; opacity:0.75; }

  /* ── GRID ── */
  .dsh-grid { display:grid; grid-template-columns:1fr 1fr 1fr 300px; gap:14px; padding:16px 28px; }
  @media(max-width:1280px){ .dsh-grid{ grid-template-columns:1fr 1fr; } }
  @media(max-width:800px)  { .dsh-grid{ grid-template-columns:1fr; padding:14px 16px; } }

  /* ── CARD ── */
  .dsh-card { background:#fff; border:1px solid #E2E8F0; border-radius:16px; overflow:hidden; box-shadow:0 1px 8px rgba(15,23,42,0.07); animation:dsh-up 0.4s ease both; }
  [data-theme="dark"] .dsh-card { background:#0F1F35; border-color:rgba(255,255,255,0.07); }
  .dsh-card-hdr { padding:14px 18px 12px; border-bottom:1px solid #F1F5F9; display:flex; align-items:center; justify-content:space-between; }
  [data-theme="dark"] .dsh-card-hdr { border-color:rgba(255,255,255,0.06); }
  .dsh-card-title { font-size:12px; font-weight:800; color:#0F172A; text-transform:uppercase; letter-spacing:0.07em; display:flex; align-items:center; gap:8px; }
  [data-theme="dark"] .dsh-card-title { color:#F0F6FF; }
  .dsh-card-title::before { content:''; width:3px; height:13px; background:#0D9488; border-radius:2px; }
  .dsh-card-sub { font-size:11px; color:#94A3B8; font-weight:600; }
  .dsh-card-body { padding:16px 18px; }

  /* ── BAR CHART ── */
  .dsh-bars { display:flex; align-items:flex-end; justify-content:space-between; gap:6px; height:108px; padding-bottom:8px; border-bottom:1px solid #F1F5F9; margin-bottom:8px; }
  .dsh-bar-col { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; }
  .dsh-bar-stick { width:100%; border-radius:5px 5px 0 0; min-height:4px; transition:height 0.6s cubic-bezier(0.4,0,0.2,1); }
  .dsh-bar-day { font-size:9px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.05em; }
  .dsh-chart-legend { display:flex; gap:14px; margin-top:10px; }
  .dsh-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:#475569; }
  .dsh-legend-dot { width:8px; height:8px; border-radius:3px; flex-shrink:0; }

  /* ── CALENDAR ── */
  .dsh-cal-nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .dsh-cal-month { font-size:13px; font-weight:800; color:#0F172A; }
  [data-theme="dark"] .dsh-cal-month { color:#F0F6FF; }
  .dsh-cal-btn { width:28px; height:28px; border-radius:8px; border:1px solid #E2E8F0; background:#F8FAFC; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:12px; color:#475569; transition:all 0.14s; }
  .dsh-cal-btn:hover { background:rgba(13,148,136,0.1); color:#0D9488; border-color:rgba(13,148,136,0.3); }
  .dsh-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
  .dsh-cal-dow { font-size:9px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:0.06em; text-align:center; padding:3px 0; }
  .dsh-cal-day { aspect-ratio:1; display:flex; align-items:center; justify-content:center; font-size:11.5px; font-weight:600; color:#475569; border-radius:8px; cursor:pointer; transition:all 0.13s; position:relative; }
  .dsh-cal-day:hover:not(.empty) { background:#F1F5F9; color:#0F172A; }
  .dsh-cal-day.empty { cursor:default; pointer-events:none; }
  .dsh-cal-day.today { background:#0D9488; color:#fff; font-weight:800; box-shadow:0 3px 12px rgba(13,148,136,0.4); }
  .dsh-cal-day.has-admit::after { content:''; position:absolute; bottom:2px; left:50%; transform:translateX(-50%); width:4px; height:4px; border-radius:50%; background:#F59E0B; }
  .dsh-cal-day.today::after { background:#fff; }
  .dsh-cal-day.weekend { color:#94A3B8; }
  .dsh-cal-legend { display:flex; align-items:center; gap:6px; margin-top:10px; font-size:10px; color:#94A3B8; font-weight:600; }

  /* ── DEPT ── */
  .dsh-dept-row { display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid #F1F5F9; }
  .dsh-dept-row:last-child { border-bottom:none; }
  .dsh-dept-name { font-size:11.5px; font-weight:600; color:#475569; width:95px; flex-shrink:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .dsh-dept-track { flex:1; height:7px; border-radius:4px; background:#F8FAFC; overflow:hidden; }
  .dsh-dept-fill { height:100%; border-radius:4px; }
  .dsh-dept-cnt { font-size:11px; font-weight:800; color:#0F172A; width:22px; text-align:right; font-family:'DM Mono',monospace; }

  /* ── RING ── */
  .dsh-ring-row { display:flex; gap:10px; flex-wrap:wrap; justify-content:space-around; padding:4px 0; }
  .dsh-ring-item { display:flex; flex-direction:column; align-items:center; gap:5px; }
  .dsh-ring-lbl { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.06em; text-align:center; max-width:70px; }

  /* ── PATIENT LIST ── */
  .dsh-pat-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid #F1F5F9; }
  .dsh-pat-row:last-child { border-bottom:none; }
  .dsh-av { width:34px; height:34px; border-radius:10px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; }
  .dsh-pat-name { font-size:13px; font-weight:700; color:#0F172A; }
  [data-theme="dark"] .dsh-pat-name { color:#F0F6FF; }
  .dsh-pat-meta { font-size:11px; color:#94A3B8; margin-top:1px; }
  .dsh-pat-badge { font-size:10px; font-weight:800; padding:2px 9px; border-radius:6px; margin-left:auto; flex-shrink:0; }
  .dsh-badge-admitted { background:rgba(13,148,136,0.1); border:1px solid rgba(13,148,136,0.25); color:#0D9488; }
  .dsh-badge-pending  { background:rgba(217,119,6,0.1);  border:1px solid rgba(217,119,6,0.25);  color:#D97706; }
  .dsh-badge-critical { background:rgba(220,38,38,0.1);  border:1px solid rgba(220,38,38,0.25);  color:#DC2626; }
  .dsh-badge-stable   { background:rgba(37,99,235,0.1);  border:1px solid rgba(37,99,235,0.25);  color:#2563EB; }

  /* ── FINANCE ── */
  .dsh-fin-row { display:flex; align-items:center; padding:9px 0; border-bottom:1px solid #F1F5F9; gap:8px; }
  .dsh-fin-row:last-child { border-bottom:none; }
  .dsh-fin-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .dsh-fin-lbl { font-size:12px; font-weight:600; color:#475569; flex:1; }
  .dsh-fin-val { font-size:13px; font-weight:800; font-family:'DM Mono',monospace; }

  /* ── BOTTOM STATS BAR ── */
  .dsh-statsbar { display:flex; border-top:1px solid #E2E8F0; background:#fff; overflow-x:auto; scrollbar-width:none; margin-top:20px; }
  .dsh-statsbar::-webkit-scrollbar { display:none; }
  [data-theme="dark"] .dsh-statsbar { background:#0F1F35; border-color:rgba(255,255,255,0.07); }
  .dsh-stat { flex:1; min-width:110px; padding:16px 12px; border-right:1px solid #E2E8F0; text-align:center; cursor:pointer; transition:background 0.15s; }
  [data-theme="dark"] .dsh-stat { border-color:rgba(255,255,255,0.07); }
  .dsh-stat:last-child { border-right:none; }
  .dsh-stat:hover { background:#F8FAFC; }
  [data-theme="dark"] .dsh-stat:hover { background:rgba(255,255,255,0.04); }
  .dsh-stat-ico { font-size:18px; margin-bottom:4px; }
  .dsh-stat-val { font-size:20px; font-weight:900; font-family:'DM Mono',monospace; line-height:1; display:block; transition:transform 0.15s; }
  .dsh-stat:hover .dsh-stat-val { transform:scale(1.06); }
  .dsh-stat-lbl { font-size:9.5px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.07em; margin-top:3px; }
  .dsh-stat-minibar { height:3px; border-radius:3px; margin-top:6px; background:#F1F5F9; overflow:hidden; }
  .dsh-stat-minifill { height:100%; border-radius:3px; }

  /* ── LOADING ── */
  .dsh-loading { display:flex; align-items:center; justify-content:center; min-height:400px; flex-direction:column; gap:12px; font-size:14px; font-weight:600; color:#0D9488; }
  .dsh-spin { animation:dsh-spin 0.8s linear infinite; display:inline-flex; }

  @media(max-width:600px){
    .dsh-welcome { padding:16px; }
    .dsh-hero-row { padding:14px 16px 0; }
    .dsh-mini-row { padding:14px 16px 0; }
    .dsh-grid { padding:14px 16px; }
    .dsh-stat { min-width:90px; padding:12px 8px; }
  }
`;

/* ─── Calendar Widget ─── */
function CalendarWidget({ admissions = [] }) {
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();
  const firstDay = new Date(cur.y, cur.m, 1).getDay();
  const isThisMonth = cur.y === now.getFullYear() && cur.m === now.getMonth();
  const todayDay = now.getDate();

  const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const admitDays = new Set();
  admissions.forEach(a => {
    const d = a.admissionDate || a.createdAt;
    if (!d) return;
    const dt = new Date(d);
    if (dt.getFullYear() === cur.y && dt.getMonth() === cur.m) admitDays.add(dt.getDate());
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ empty: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  const prev = () => setCur(c => c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 });
  const next = () => setCur(c => c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 });

  return (
    <div>
      <div className="dsh-cal-nav">
        <button className="dsh-cal-btn" onClick={prev}>‹</button>
        <div className="dsh-cal-month">{MONTHS[cur.m]} {cur.y}</div>
        <button className="dsh-cal-btn" onClick={next}>›</button>
      </div>
      <div className="dsh-cal-grid">
        {DAYS.map(d => <div key={d} className="dsh-cal-dow">{d}</div>)}
        {cells.map((c, i) => {
          if (c.empty) return <div key={`e${i}`} className="dsh-cal-day empty" />;
          const isToday = isThisMonth && c.day === todayDay;
          const hasAdmit = admitDays.has(c.day);
          const dayOfWeek = (firstDay + c.day - 1) % 7;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const cls = ["dsh-cal-day", isToday ? "today" : "", hasAdmit ? "has-admit" : "", isWeekend && !isToday ? "weekend" : ""].filter(Boolean).join(" ");
          return <div key={c.day} className={cls} title={hasAdmit ? `Admissions on ${MONTHS[cur.m]} ${c.day}` : ""}>{c.day}</div>;
        })}
      </div>
      {admitDays.size > 0 && (
        <div className="dsh-cal-legend">
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
          Days with admissions
        </div>
      )}
    </div>
  );
}

/* ─── Ring ─── */
function Ring({ pct: p, color, label, size = 62 }) {
  const r = 25, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r, dash = circ * (Math.min(p, 100) / 100);
  return (
    <div className="dsh-ring-item">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="5" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="800"
          fill={color} fontFamily="DM Mono, monospace">{p}%</text>
      </svg>
      <div className="dsh-ring-lbl">{label}</div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [raw, setRaw] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());
  const timerRef = useRef(null);

  /* live clock */
  useEffect(() => {
    timerRef.current = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  /* data fetch */
  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [summary, patients, admissions, doctors, staff, medicines, labTests, emergencies, invoices, beds, insurance] = await Promise.all([
        API.get("/hospital/dashboard/summary").then(r => r.data || {}).catch(() => ({})),
        API.get("/hospital/patient/list").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/admission/list").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/doctor/list").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/staff/list").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/pharmacy/medicines").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/lab/list").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/emergency/list").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/billing/invoices").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/ward/beds").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
        API.get("/hospital/insurance/list").then(r => Array.isArray(r.data) ? r.data : []).catch(() => []),
      ]);
      setRaw({ summary, patients, admissions, doctors, staff, medicines, labTests, emergencies, invoices, beds, insurance });
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* navigate to tab */
  const nav = useCallback((tab) => navigate(`/hospital/${tab}`), [navigate]);

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="dsh">
        <div className="dsh-loading">
          <span className="dsh-spin">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#0D9488" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
          Loading dashboard…
        </div>
      </div>
    </>
  );

  /* ── DERIVED METRICS ── */
  const s = raw.summary || {};
  const patients = raw.patients || [];
  const admissions = raw.admissions || [];
  const doctors = raw.doctors || [];
  const staff = raw.staff || [];
  const medicines = raw.medicines || [];
  const labTests = raw.labTests || [];
  const emergencies = raw.emergencies || [];
  const invoices = raw.invoices || [];
  const beds = raw.beds || [];
  const insurance = raw.insurance || [];

  const today = new Date().toISOString().slice(0, 10);

  const totalPatients = s.totalPatients || patients.length;
  const activeAdmit = s.activeAdmissions || admissions.filter(a => (a.admissionStatus || "").toUpperCase() === "ADMITTED").length;
  const todayAdmit = s.todayAdmissions || admissions.filter(a => a.admissionDate?.startsWith(today)).length;
  const totalDoctors = s.totalDoctors || doctors.length;
  const availDoctors = s.availableDoctors || doctors.filter(d => (d.status || "").toLowerCase() === "active" || d.isActive).length;
  const totalBeds = s.totalBeds || beds.length;
  const occupiedBeds = s.occupiedBeds || beds.filter(b => (b.status || "").toLowerCase() === "occupied").length;
  const occupancyPct2 = pct(occupiedBeds, totalBeds);
  const totalEmergency = s.activeEmergencies || emergencies.filter(e => (e.emergencyStatus || "").toUpperCase() === "ACTIVE").length;
  const criticalEmerg = s.criticalEmergencies || emergencies.filter(e => (e.severityLevel || "").toLowerCase() === "critical").length;
  const pendingLab = s.pendingLabTests || labTests.filter(t => (t.testStatus || "").toLowerCase() === "ordered").length;
  const completedLab = s.completedLabTests || labTests.filter(t => (t.testStatus || "").toLowerCase() === "completed").length;
  const lowStockMeds = s.lowStockMedicines || medicines.filter(m => m.reorderLevel && Number(m.currentStock || 0) <= Number(m.reorderLevel || 0)).length;
  const totalRevenue = s.totalRevenue || invoices.reduce((a, i) => a + Number(i.totalAmount || 0), 0);
  const pendingDues = s.pendingDues || invoices.filter(i => (i.invoiceStatus || "").toLowerCase() === "pending").reduce((a, i) => a + Number(i.totalAmount || 0), 0);
  const paidInvoices = s.paidInvoices || invoices.filter(i => (i.invoiceStatus || "").toLowerCase() === "paid").length;
  const totalStaff = s.totalStaff || staff.length;
  const pendingClaims = s.pendingClaims || insurance.filter(i => (i.claimStatus || "").toLowerCase() === "pending").length;

  const recentPatients = [...patients].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

  const deptMap = {};
  patients.forEach(p => { const k = p.department || p.specialization || "General"; deptMap[k] = (deptMap[k] || 0) + 1; });
  const deptRows = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxD = Math.max(...deptRows.map(d => d[1]), 1);
  const dCols = [T.teal, T.blue, T.amber, T.violet, T.red, T.cyan];

  const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekBars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().slice(0, 10);
    return {
      day: DAYS_SHORT[(d.getDay() + 6) % 7],
      admits: admissions.filter(a => a.admissionDate?.startsWith(ds)).length,
      emerg: emergencies.filter(e => (e.createdAt || "").startsWith(ds)).length,
    };
  });
  const maxBar = Math.max(...weekBars.map(b => b.admits + b.emerg), 1);

  const clockStr = liveTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = liveTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const patBadge = (status) => {
    const s2 = (status || "").toLowerCase();
    const cls = s2.includes("admitted") || s2.includes("active") ? "dsh-badge-admitted"
      : s2.includes("critical") ? "dsh-badge-critical"
        : s2.includes("discharged") || s2.includes("stable") ? "dsh-badge-stable" : "dsh-badge-pending";
    return <span className={`dsh-pat-badge ${cls}`}>{status || "—"}</span>;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="dsh">

        {/* ── WELCOME BANNER ── */}
        <div className="dsh-welcome">
          <div className="dsh-welcome-inner">
            <div>
              <div className="dsh-greet">Welcome back, Administrator 👋</div>
              <div className="dsh-greet-sub">
                {clockStr} · {dateStr}
                {refreshing && <span style={{ marginLeft: 10, opacity: 0.7, fontSize: 11 }}>↻ Refreshing…</span>}
              </div>
              <div className="dsh-chips">
                <span className="dsh-chip ok" onClick={() => nav("ipd")}><span className="dsh-chip-dot" />🛏️ {activeAdmit} Admitted</span>
                {totalEmergency > 0 && <span className="dsh-chip danger" onClick={() => nav("emergency")}><span className="dsh-chip-dot" />🚨 {totalEmergency} Emergency</span>}
                {lowStockMeds > 0 && <span className="dsh-chip warn" onClick={() => nav("pharmacy")}><span className="dsh-chip-dot" />💊 {lowStockMeds} Low Stock</span>}
                {pendingClaims > 0 && <span className="dsh-chip info" onClick={() => nav("insurance")}><span className="dsh-chip-dot" />🛡️ {pendingClaims} Claims</span>}
                <span className="dsh-chip info" onClick={() => nav("lab")}><span className="dsh-chip-dot" />🔬 {pendingLab} Lab Pending</span>
              </div>
            </div>
            <div className="dsh-qs-row">
              {[
                { val: totalPatients, lbl: "Patients", tab: "patients" },
                { val: totalDoctors, lbl: "Doctors", tab: "doctors" },
                { val: totalBeds, lbl: "Beds", tab: "wards" },
                { val: totalStaff, lbl: "Staff", tab: "staff" },
              ].map((q, i, arr) => (
                <React.Fragment key={q.lbl}>
                  <div className="dsh-qs" onClick={() => nav(q.tab)} title={`Go to ${q.lbl}`}>
                    <div className="dsh-qs-val">{q.val.toLocaleString()}</div>
                    <div className="dsh-qs-lbl">{q.lbl}</div>
                  </div>
                  {i < arr.length - 1 && <div className="dsh-qs-div" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* ── HERO KPI CARDS ── */}
        <div className="dsh-hero-row">
          {[
            { val: totalPatients.toLocaleString(), lbl: "Overall Patients", badge: `+${todayAdmit} today`, bar: pct(todayAdmit, Math.max(totalPatients, 1)), grad: "linear-gradient(135deg,#0D9488,#14B8A6)", icon: "👥", tab: "patients" },
            { val: activeAdmit.toLocaleString(), lbl: "Total Admitted", badge: `${occupancyPct2}% capacity`, bar: occupancyPct2, grad: "linear-gradient(135deg,#2563EB,#3B82F6)", icon: "🛏️", tab: "ipd" },
            { val: totalEmergency.toLocaleString(), lbl: "Emergency Cases", badge: `${criticalEmerg} critical`, bar: pct(criticalEmerg, Math.max(totalEmergency, 1)), grad: "linear-gradient(135deg,#DC2626,#EF4444)", icon: "🚨", tab: "emergency" },
            { val: totalDoctors.toLocaleString(), lbl: "Total Doctors", badge: `${availDoctors} available`, bar: pct(availDoctors, Math.max(totalDoctors, 1)), grad: "linear-gradient(135deg,#7C3AED,#8B5CF6)", icon: "🩺", tab: "doctors" },
          ].map((k, i) => (
            <div key={k.lbl} className="dsh-kpi" style={{ background: k.grad, animationDelay: `${i * 0.07}s` }}
              onClick={() => nav(k.tab)} role="button" title={`Open ${k.lbl}`}>
              <div className="dsh-kpi-glow" />
              <div className="dsh-kpi-badge">{k.badge}</div>
              <div className="dsh-kpi-icon">{k.icon}</div>
              <div className="dsh-kpi-val">{k.val}</div>
              <div className="dsh-kpi-lbl">{k.lbl}</div>
              <div className="dsh-kpi-bar"><div className="dsh-kpi-fill" style={{ width: `${k.bar}%` }} /></div>
              <div className="dsh-kpi-arrow">→</div>
            </div>
          ))}
        </div>

        {/* ── MINI KPI ROW (colorful) ── */}
        <div className="dsh-mini-row">
          {[
            { lbl: "Lab Pending", val: pendingLab, sub: "Ordered", ico: "🔬", bg: "rgba(217,119,6,0.09)", accent: T.amber, color: T.amber, tab: "lab" },
            { lbl: "Lab Completed", val: completedLab, sub: "Reports ready", ico: "✅", bg: "rgba(13,148,136,0.09)", accent: T.teal, color: T.teal, tab: "lab" },
            { lbl: "Revenue", val: inr(totalRevenue), sub: "Total collected", ico: "💰", bg: "rgba(5,150,105,0.09)", accent: T.green, color: T.green, tab: "billing" },
            { lbl: "Pending Dues", val: inr(pendingDues), sub: "Unpaid bills", ico: "⚠️", bg: "rgba(220,38,38,0.09)", accent: T.red, color: T.red, tab: "billing" },
            { lbl: "Staff on Duty", val: totalStaff, sub: "All roles", ico: "👥", bg: "rgba(37,99,235,0.09)", accent: T.blue, color: T.blue, tab: "staff" },
            {
              lbl: "Low Stock Meds", val: lowStockMeds, sub: "Below reorder", ico: "💊",
              bg: lowStockMeds > 0 ? "rgba(220,38,38,0.09)" : "rgba(13,148,136,0.09)",
              accent: lowStockMeds > 0 ? T.red : T.teal, color: lowStockMeds > 0 ? T.red : T.teal, tab: "pharmacy"
            },
          ].map((m, i) => (
            <div key={m.lbl} className="dsh-mini"
              style={{ background: m.bg, border: `1px solid ${m.accent}22`, animationDelay: `${0.1 + i * 0.04}s` }}
              onClick={() => nav(m.tab)} role="button" title={m.lbl}>
              <div className="dsh-mini-bar" style={{ background: m.accent }} />
              <div className="dsh-mini-ico">{m.ico}</div>
              <div className="dsh-mini-lbl" style={{ color: m.color }}>{m.lbl}</div>
              <div className="dsh-mini-val" style={{ color: m.color, fontSize: typeof m.val === "string" && m.val.length > 7 ? 15 : 20 }}>{m.val}</div>
              <div className="dsh-mini-sub" style={{ color: m.color }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="dsh-grid">

          {/* 1 — Bar chart */}
          <div className="dsh-card" style={{ gridColumn: "span 2" }}>
            <div className="dsh-card-hdr">
              <div className="dsh-card-title">Patient Statistics</div>
              <span className="dsh-card-sub">Last 7 days</span>
            </div>
            <div className="dsh-card-body">
              <div className="dsh-bars">
                {weekBars.map((b, i) => {
                  const H = 100, aH = maxBar > 0 ? Math.max(b.admits / maxBar * H, 4) : 4, eH = maxBar > 0 ? Math.max(b.emerg / maxBar * H, 4) : 4;
                  const isToday = i === 6;
                  return (
                    <div key={b.day} className="dsh-bar-col" title={`${b.day}: ${b.admits} admissions, ${b.emerg} emergencies`}>
                      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: H }}>
                        <div className="dsh-bar-stick" style={{ height: aH, background: isToday ? "#0D9488" : "rgba(13,148,136,0.4)", width: "clamp(10px,2.5vw,22px)" }} />
                        <div className="dsh-bar-stick" style={{ height: eH, background: isToday ? "#F59E0B" : "rgba(245,158,11,0.4)", width: "clamp(8px,1.8vw,16px)" }} />
                      </div>
                      <div className="dsh-bar-day" style={{ color: isToday ? "#0D9488" : "", fontWeight: isToday ? 800 : 700 }}>{b.day}</div>
                    </div>
                  );
                })}
              </div>
              <div className="dsh-chart-legend">
                <div className="dsh-legend-item"><div className="dsh-legend-dot" style={{ background: "#0D9488" }} />Admissions</div>
                <div className="dsh-legend-item"><div className="dsh-legend-dot" style={{ background: "#F59E0B" }} />Emergencies</div>
              </div>
            </div>
          </div>

          {/* 2 — Dept */}
          <div className="dsh-card">
            <div className="dsh-card-hdr">
              <div className="dsh-card-title">By Department</div>
              <span className="dsh-card-sub">{patients.length} patients</span>
            </div>
            <div className="dsh-card-body">
              {deptRows.length === 0
                ? <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: "24px 0" }}>No data yet</div>
                : deptRows.map(([dept, cnt], i) => (
                  <div key={dept} className="dsh-dept-row">
                    <div className="dsh-dept-name" title={dept}>{dept}</div>
                    <div className="dsh-dept-track"><div className="dsh-dept-fill" style={{ width: `${pct(cnt, maxD)}%`, background: dCols[i % dCols.length] }} /></div>
                    <div className="dsh-dept-cnt" style={{ color: dCols[i % dCols.length] }}>{cnt}</div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* 3 — Calendar with real data */}
          <div className="dsh-card">
            <div className="dsh-card-hdr">
              <div className="dsh-card-title">Calendar</div>
              <span className="dsh-card-sub">{todayAdmit} admitted today</span>
            </div>
            <div className="dsh-card-body">
              <CalendarWidget admissions={admissions} />
            </div>
          </div>

          {/* 4 — Operational Health rings */}
          <div className="dsh-card" style={{ gridColumn: "span 2" }}>
            <div className="dsh-card-hdr">
              <div className="dsh-card-title">Operational Health</div>
              <span className="dsh-card-sub">Live metrics</span>
            </div>
            <div className="dsh-card-body">
              <div className="dsh-ring-row">
                <Ring pct={occupancyPct2} color="#0D9488" label="Bed Occupancy" />
                <Ring pct={totalDoctors > 0 ? pct(availDoctors, totalDoctors) : 0} color="#2563EB" label="Dr Available" />
                <Ring pct={labTests.length > 0 ? pct(completedLab, labTests.length) : 0} color="#7C3AED" label="Lab Done" />
                <Ring pct={invoices.length > 0 ? pct(paidInvoices, invoices.length) : 0} color="#D97706" label="Bills Paid" />
                <Ring pct={medicines.length > 0 ? pct(medicines.length - lowStockMeds, medicines.length) : 100} color="#0891B2" label="Pharma Stock" />
              </div>
            </div>
          </div>

          {/* 5 — Recent Patients */}
          <div className="dsh-card">
            <div className="dsh-card-hdr">
              <div className="dsh-card-title">Recent Patients</div>
              <span className="dsh-card-sub">Latest {recentPatients.length}</span>
            </div>
            <div className="dsh-card-body" style={{ padding: "10px 18px 14px" }}>
              {recentPatients.length === 0
                ? <div style={{ color: "#94A3B8", fontSize: 12, textAlign: "center", padding: "24px 0" }}>No patients yet</div>
                : recentPatients.map((p, i) => {
                  const name = p.patientName || p.name || `Patient #${p.patientId || i}`;
                  return (
                    <div key={i} className="dsh-pat-row">
                      <div className="dsh-av" style={{ background: avColor(name) }}>{name[0]?.toUpperCase()}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="dsh-pat-name">{name}</div>
                        <div className="dsh-pat-meta">{p.department || p.specialization || "General"} · {fmtD(p.createdAt || p.admissionDate)}</div>
                      </div>
                      {patBadge(p.admissionStatus || p.status || "Pending")}
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* 6 — Finance */}
          <div className="dsh-card">
            <div className="dsh-card-hdr">
              <div className="dsh-card-title">Finance Snapshot</div>
              <span className="dsh-card-sub">{invoices.length} invoices</span>
            </div>
            <div className="dsh-card-body">
              {[
                { lbl: "Total Revenue", val: inr(totalRevenue), color: T.green, dot: T.green },
                { lbl: "Pending Dues", val: inr(pendingDues), color: T.amber, dot: T.amber },
                { lbl: "Paid Invoices", val: paidInvoices, color: T.teal, dot: T.teal },
                { lbl: "Unpaid Invoices", val: invoices.length - paidInvoices, color: T.red, dot: T.red },
                { lbl: "Insurance Claims", val: `${pendingClaims} pending`, color: T.blue, dot: T.blue },
              ].map(f => (
                <div key={f.lbl} className="dsh-fin-row">
                  <div className="dsh-fin-dot" style={{ background: f.dot }} />
                  <div className="dsh-fin-lbl">{f.lbl}</div>
                  <div className="dsh-fin-val" style={{ color: f.color }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end grid */}

        {/* ── UNIFIED BOTTOM STATS BAR (colorful, clickable) ── */}
        <div className="dsh-statsbar">
          {[
            { val: totalPatients, lbl: "Total Patients", ico: "👥", color: T.teal, tab: "patients", barPct: pct(todayAdmit, Math.max(totalPatients, 1)) },
            { val: activeAdmit, lbl: "Active Admissions", ico: "🛏️", color: T.blue, tab: "ipd", barPct: occupancyPct2 },
            { val: totalEmergency, lbl: "Emergencies", ico: "🚨", color: T.red, tab: "emergency", barPct: pct(criticalEmerg, Math.max(totalEmergency, 1)) },
            { val: pendingLab, lbl: "Lab Pending", ico: "🔬", color: T.amber, tab: "lab", barPct: pct(pendingLab, Math.max(pendingLab + completedLab, 1)) },
            { val: inr(totalRevenue), lbl: "Total Revenue", ico: "💰", color: T.green, tab: "billing", barPct: 100 },
            { val: lowStockMeds, lbl: "Low Stock Meds", ico: "💊", color: lowStockMeds > 0 ? T.red : T.teal, tab: "pharmacy", barPct: pct(lowStockMeds, Math.max(medicines.length, 1)) },
          ].map(st => (
            <div key={st.lbl} className="dsh-stat" onClick={() => nav(st.tab)} role="button" title={`Go to ${st.lbl}`}>
              <div className="dsh-stat-ico">{st.ico}</div>
              <span className="dsh-stat-val" style={{ color: st.color }}>{typeof st.val === "number" ? st.val.toLocaleString() : st.val}</span>
              <div className="dsh-stat-lbl">{st.lbl}</div>
              <div className="dsh-stat-minibar">
                <div className="dsh-stat-minifill" style={{ width: `${st.barPct}%`, background: st.color }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}