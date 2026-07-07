import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API from "../../../api/api";
import environment from "../../../config/environment";
import { useTheme } from "../../../hooks/useTheme";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_CFG = {
  SCHEDULED: { bg: "#DBEAFE", color: "#1E40AF", label: "Scheduled" },
  CONFIRMED: { bg: "#D1FAE5", color: "#065F46", label: "Confirmed" },
  PENDING_APPROVAL: { bg: "#FEF9C3", color: "#854D0E", label: "Pending Approval" },
  IN_PROGRESS: { bg: "#EDE9FE", color: "#5B21B6", label: "In Progress" },
  COMPLETED: { bg: "#F0FDF4", color: "#15803D", label: "Completed" },
  CANCELLED: { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
  NO_SHOW: { bg: "#FEF3C7", color: "#92400E", label: "No Show" },
};

const parseLocalDate = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val.substring(0, 10);
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d] = val;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return "";
};
const parseLocalTime = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val.substring(0, 5);
  if (Array.isArray(val) && val.length >= 2) {
    const [h, m] = val;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return "";
};
const dateStrToArray = (str) => {
  if (!str) return null;
  if (Array.isArray(str)) return str;
  const p = str.split("-");
  if (p.length !== 3) return null;
  return [parseInt(p[0]), parseInt(p[1]), parseInt(p[2])];
};
const timeStrToArray = (str) => {
  if (!str) return null;
  if (Array.isArray(str)) return str;
  const p = str.split(":");
  if (p.length < 2) return null;
  return [parseInt(p[0]), parseInt(p[1])];
};
const fmt = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";
const fmtTime = (t) => t ? t.substring(0, 5) : "-";

const EMPTY_APT = {
  customerId: "", customerName: "", customerPhone: "", customerEmail: "",
  orgId: "", serviceItemId: "", serviceName: "", resourceId: "", resourceName: "",
  appointmentDate: "", startTime: "", endTime: "", durationMinutes: "30",
  status: "SCHEDULED", notes: "", bookingProfileId: "",
};
const EMPTY_PROFILE = {
  name: "", slug: "", description: "", meetingDurationMinutes: 30,
  slotIntervalMinutes: 30, maxBookingsPerSlot: 1, bookingWindowDays: 30,
  minNoticeMinutes: 60, bufferBeforeMinutes: 0, bufferAfterMinutes: 0,
  timezone: "Asia/Kolkata", visibility: "PUBLIC", isActive: true,
  collectName: true, collectEmail: true, collectPhone: true, collectNotes: true,
  confirmationType: "AUTO", serviceName: "", resourceName: "",
};
const DEFAULT_WORKING_HOURS = DAYS.map((_, i) => ({
  dayOfWeek: i, isWorkingDay: i >= 1 && i <= 5, startTimeLocal: "09:00", endTimeLocal: "18:00",
}));

const PUB = axios.create({ baseURL: environment.backendUrl });

const buildCss = (isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root { font-family: 'DM Sans', sans-serif; background: ${isDark ? '#0F172A' : '#EEF2F7'}; min-height: 100vh; color: ${isDark ? '#E2E8F0' : '#0F172A'}; }

  .ap-app { padding: 28px; width: 100%; }

  /* ── HEADER ── */
  .ap-header {
    background: linear-gradient(135deg, #0D6B45 0%, #16A064 45%, #22C77A 80%, #5EE6A8 100%);
    border-radius: 16px; padding: 22px 28px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden; margin-bottom: 22px;
    box-shadow: 0 8px 32px rgba(13,107,69,0.28);
  }
  .ap-header::before { content:''; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.06); }
  .ap-header::after  { content:''; position:absolute; bottom:-40px; right:160px; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.04); }
  .hdr-left  { display:flex; align-items:center; gap:14px; position:relative; z-index:1; }
  .hdr-icon  { width:44px; height:44px; background:rgba(255,255,255,0.18); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid rgba(255,255,255,0.25); }
  .hdr-title { font-size:20px; font-weight:800; color:#fff; line-height:1.2; }
  .hdr-sub   { font-size:12px; color:rgba(255,255,255,0.68); margin-top:3px; }
  .hdr-right { display:flex; align-items:center; gap:8px; position:relative; z-index:1; }

  /* ── KPI ROW ── */
  .kpi-row { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:22px; }
  .kpi-card {
    border-radius:13px; padding:22px 24px;
    display:flex; align-items:center; justify-content:space-between;
    position:relative; overflow:hidden; cursor:default;
    transition:transform 0.18s, box-shadow 0.18s;
  }
  .kpi-card:hover { transform:translateY(-2px); }
  .kpi-card::after { content:''; position:absolute; right:-16px; bottom:-16px; width:72px; height:72px; border-radius:50%; background:rgba(255,255,255,0.08); }
  .kpi-green  { background:linear-gradient(135deg,#0D6B45,#16A064); box-shadow:0 4px 16px rgba(22,160,100,0.30); }
  .kpi-amber  { background:linear-gradient(135deg,#B45309,#D97706); box-shadow:0 4px 16px rgba(217,119,6,0.28); }
  .kpi-teal   { background:linear-gradient(135deg,#065F46,#059669); box-shadow:0 4px 16px rgba(5,150,105,0.28); }
  .kpi-purple { background:linear-gradient(135deg,#5B21B6,#7C3AED); box-shadow:0 4px 16px rgba(124,58,237,0.28); }
  .kpi-cyan   { background:linear-gradient(135deg,#0E7490,#0891B2); box-shadow:0 4px 16px rgba(8,145,178,0.28); }
  .kpi-icon { width:38px; height:38px; background:rgba(255,255,255,0.16); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; position:relative; z-index:1; border:1px solid rgba(255,255,255,0.2); }
  .kpi-label { font-size:11px; font-weight:700; color:rgba(255,255,255,0.72); text-transform:uppercase; letter-spacing:0.07em; margin-bottom:8px; }
  .kpi-value { font-size:36px; font-weight:800; color:#fff; line-height:1; }

  /* ── MAIN CARD ── */
  .main-card { background:${isDark?'#1E293B':'#fff'}; border-radius:16px; border:1px solid ${isDark?'#334155':'#E2E8F0'}; box-shadow:0 2px 8px rgba(0,0,0,${isDark?'0.30':'0.05'}); overflow:hidden; }

  /* ── TABS ── */
  .tab-bar { display:flex; border-bottom:1px solid ${isDark?'#334155':'#E8EDF5'}; padding:0 4px; background:${isDark?'#0F172A':'#FAFBFD'}; flex-shrink:0; }
  .tab-btn { padding:13px 20px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; color:${isDark?'#94A3B8':'#64748B'}; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.15s; margin-bottom:-1px; white-space:nowrap; }
  .tab-btn:hover { color:#16A064; }
  .tab-btn.active { color:#16A064; border-bottom-color:#16A064; }

  /* ── TOOLBAR ── */
  .toolbar { padding:14px 20px; border-bottom:1px solid ${isDark?'#334155':'#F1F5F9'}; display:flex; align-items:center; gap:10px; flex-wrap:wrap; background:${isDark?'#1E293B':'#fff'}; }
  .search-wrap { position:relative; flex:1; min-width:220px; }
  .search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#94A3B8; pointer-events:none; display:flex; }
  .search-input { font-family:'DM Sans',sans-serif; font-size:13px; color:${isDark?'#E2E8F0':'#0F172A'}; background:${isDark?'#0F172A':'#F8FAFC'}; border:1.5px solid ${isDark?'#334155':'#E2E8F0'}; border-radius:9px; padding:8px 12px 8px 34px; outline:none; width:100%; transition:all 0.15s; }
  .search-input:focus { background:${isDark?'#1E293B':'#fff'}; border-color:#16A064; box-shadow:0 0 0 3px rgba(22,160,100,0.10); }
  .filter-select { font-family:'DM Sans',sans-serif; font-size:13px; color:${isDark?'#CBD5E1':'#475569'}; height:36px; padding:0 30px 0 12px; border:1.5px solid ${isDark?'#334155':'#E2E8F0'}; border-radius:8px; background:${isDark?'#0F172A':'#fff'}; cursor:pointer; outline:none; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; min-width:150px; }
  .filter-select:focus { border-color:#16A064; }

  /* ── TABLE ── */
  .tbl-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead { background:${isDark?'#0F172A':'#F8FAFC'}; }
  th { font-size:10px; font-weight:700; color:${isDark?'#94A3B8':'#64748B'}; text-transform:uppercase; letter-spacing:0.07em; padding:10px 14px; text-align:left; border-bottom:1px solid ${isDark?'#334155':'#E8EDF5'}; white-space:nowrap; }
  td { font-size:13px; color:${isDark?'#CBD5E1':'#1E293B'}; padding:11px 14px; border-bottom:1px solid ${isDark?'#1E293B':'#F1F5F9'}; vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:${isDark?'rgba(22,160,100,0.08)':'#F0FDF4'}; }
  .mono { font-family:'DM Mono',monospace; font-size:11px; }

  /* ── STATUS BADGE ── */
  .status-badge { display:inline-flex; align-items:center; font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:6px; white-space:nowrap; }
  .source-badge { display:inline-flex; font-size:10px; font-weight:700; padding:2px 8px; border-radius:5px; }

  /* ── ACTION BUTTONS ── */
  .act-btn { background:none; border:none; cursor:pointer; padding:5px; border-radius:6px; display:flex; align-items:center; transition:all 0.12s; color:${isDark?'#64748B':'#94A3B8'}; }
  .act-btn:hover { background:${isDark?'rgba(22,160,100,0.15)':'#F0FDF4'}; color:#16A064; }
  .act-btn.danger:hover { background:${isDark?'rgba(220,38,38,0.15)':'#FEF2F2'}; color:#DC2626; }
  .act-btn.warn:hover  { background:${isDark?'rgba(217,119,6,0.15)':'#FFFBEB'}; color:#D97706; }
  .act-btn.confirm:hover { background:${isDark?'rgba(5,150,105,0.15)':'#D1FAE5'}; color:#059669; }
  .act-btns { display:flex; gap:2px; }

  /* ── SPINNER ── */
  .spinner-wrap { display:flex; align-items:center; justify-content:center; padding:52px; }
  .spinner { width:28px; height:28px; border:3px solid ${isDark?'#334155':'#E2E8F0'}; border-top-color:#16A064; border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  /* ── EMPTY ── */
  .empty-state { text-align:center; padding:60px 20px; color:${isDark?'#64748B':'#94A3B8'}; font-size:13px; }
  .empty-icon  { font-size:44px; margin-bottom:12px; }

  /* ── PROFILE CARDS GRID ── */
  .profiles-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:20px; padding:20px; }
  .profile-card {
    border-radius:14px; border:1px solid ${isDark?'#334155':'#E2E8F0'}; overflow:hidden;
    background:${isDark?'#1E293B':'#fff'}; transition:all 0.22s;
    display:flex; flex-direction:column;
    box-shadow: 0 2px 8px rgba(0,0,0,${isDark?'0.30':'0.05'});
  }
  .profile-card:hover { transform:translateY(-3px); box-shadow:0 10px 28px rgba(22,160,100,0.18); border-color:#BBF7D0; }
  .profile-card.inactive { opacity:0.65; }
  .profile-card-hdr {
    padding:18px 20px; color:#fff;
    background:linear-gradient(135deg, #0D6B45 0%, #16A064 45%, #22C77A 80%, #5EE6A8 100%);
  }
  .profile-card-hdr.inactive-hdr { background:linear-gradient(135deg,#94A3B8,#CBD5E1); }
  .profile-card-name { font-size:16px; font-weight:800; color:#fff; flex:1; }
  .profile-card-desc { font-size:12px; color:rgba(255,255,255,0.80); margin-top:4px; }
  .active-badge { display:inline-flex; font-size:10px; font-weight:700; background:rgba(255,255,255,0.22); color:#fff; border:1px solid rgba(255,255,255,0.35); padding:2px 10px; border-radius:20px; }
  .profile-card-body { padding:16px 18px; flex:1; }
  .meta-pills { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:14px; }
  .meta-pill { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; padding:3px 10px; border-radius:6px; }
  .pill-green  { background:${isDark?'rgba(13,107,69,0.25)':'#F0FDF4'}; color:${isDark?'#4ADE80':'#0D6B45'}; }
  .pill-blue   { background:${isDark?'rgba(30,64,175,0.25)':'#EFF6FF'}; color:${isDark?'#93C5FD':'#1E40AF'}; }
  .pill-amber  { background:${isDark?'rgba(133,77,14,0.25)':'#FFFBEB'}; color:${isDark?'#FCD34D':'#854D0E'}; }
  .slug-row { display:flex; align-items:center; gap:6px; background:${isDark?'#0F172A':'#F8FAFC'}; border:1px solid ${isDark?'#334155':'#E2E8F0'}; border-radius:8px; padding:8px 12px; }
  .slug-text { font-family:'DM Mono',monospace; font-size:11.5px; font-weight:600; color:${isDark?'#4ADE80':'#0D6B45'}; }
  .profile-card-footer { padding:10px 14px; border-top:1px solid ${isDark?'#334155':'#F1F5F9'}; display:flex; align-items:center; justify-content:flex-end; gap:4px; }

  /* ── CALENDAR FILTER BAR ── */
  .cal-filter-bar { padding:10px 20px 0; display:flex; align-items:center; gap:8px; flex-wrap:wrap; border-bottom:1px solid ${isDark?'#334155':'#F1F5F9'}; background:${isDark?'#1E293B':'#fff'}; }
  .cal-filter-label { font-size:11px; font-weight:700; color:${isDark?'#94A3B8':'#64748B'}; text-transform:uppercase; letter-spacing:0.06em; white-space:nowrap; }
  .cal-chip { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:600; padding:5px 13px; border-radius:20px; border:1.5px solid ${isDark?'#334155':'#E2E8F0'}; background:${isDark?'#0F172A':'#F8FAFC'}; color:${isDark?'#CBD5E1':'#475569'}; cursor:pointer; transition:all 0.15s; white-space:nowrap; margin-bottom:10px; }
  .cal-chip:hover { border-color:#16A064; color:#16A064; background:${isDark?'rgba(22,160,100,0.10)':'#F0FDF4'}; }
  .cal-chip.active { background:#16A064; border-color:#16A064; color:#fff; }
  .cal-chip-dot { width:7px; height:7px; border-radius:50%; background:currentColor; opacity:0.7; flex-shrink:0; }

  /* ── TOAST ── */
  .ap-toast { position:fixed; bottom:24px; right:24px; z-index:3000; padding:12px 18px; border-radius:10px; font-size:13px; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.15); display:flex; align-items:center; gap:8px; animation:toastIn 0.2s ease; font-family:'DM Sans',sans-serif; }
  .toast-success { background:#16A064; color:#fff; }
  .toast-warning { background:#D97706; color:#fff; }
  .toast-error   { background:#DC2626; color:#fff; }
  @keyframes toastIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }

  /* ── MODAL OVERLAY ── */
  .modal-overlay { position:fixed; top:64px; left:0; right:0; bottom:0; background:rgba(${isDark?'0,0,0,0.65':'15,23,42,0.48'}); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(3px); padding:20px; }
  .modal-box { background:${isDark?'#1E293B':'#fff'}; border-radius:16px; width:100%; max-width:680px; max-height:calc(100vh - 64px - 40px); box-shadow:0 24px 60px rgba(0,0,0,${isDark?'0.50':'0.20'}); overflow:hidden; animation:modalIn 0.18s ease; display:flex; flex-direction:column; }
  .modal-box.wide { max-width:760px; }
  .modal-box.narrow { max-width:460px; }
  @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)} }
  .modal-hdr { background:linear-gradient(135deg,#0D6B45 0%,#16A064 50%,#22C77A 100%); padding:18px 24px; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; }
  .modal-hdr-left { display:flex; align-items:center; gap:12px; }
  .modal-hdr-icon { width:38px; height:38px; background:rgba(255,255,255,0.15); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; border:1px solid rgba(255,255,255,0.22); }
  .modal-hdr-title { font-size:15px; font-weight:700; color:#fff; }
  .modal-hdr-sub   { font-size:11px; color:rgba(255,255,255,0.62); margin-top:2px; }
  .modal-close { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.70); display:flex; padding:5px; border-radius:7px; transition:all 0.12s; }
  .modal-close:hover { background:rgba(255,255,255,0.14); color:#fff; }
  .modal-body  { padding:20px 24px; overflow-y:auto; background:${isDark?'#0F172A':'#F8FAFC'}; flex:1; }
  .modal-footer { padding:14px 24px; border-top:1px solid ${isDark?'#334155':'#E2E8F0'}; display:flex; justify-content:flex-end; gap:10px; background:${isDark?'#1E293B':'#fff'}; flex-shrink:0; }

  /* ── PROFILE MODAL TABS ── */
  .ptab-bar { display:flex; border-bottom:1px solid ${isDark?'#334155':'#E8EDF5'}; background:${isDark?'#1E293B':'#fff'}; flex-shrink:0; padding:0 4px; }
  .ptab-btn { padding:12px 18px; font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:600; color:${isDark?'#94A3B8':'#64748B'}; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; transition:all 0.15s; margin-bottom:-1px; }
  .ptab-btn:hover { color:#16A064; }
  .ptab-btn.active { color:#16A064; border-bottom-color:#16A064; }

  /* ── FORM ── */
  .sec-divider { font-size:10px; font-weight:700; color:#16A064; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
  .sec-divider::after { content:''; flex:1; height:1px; background:${isDark?'#334155':'#E2E8F0'}; }
  .sec-block { margin-bottom:18px; }
  .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-grid-1 { margin-bottom:14px; }
  .form-group { display:flex; flex-direction:column; gap:5px; }
  .form-label { font-size:10.5px; font-weight:700; color:${isDark?'#94A3B8':'#64748B'}; text-transform:uppercase; letter-spacing:0.06em; }
  .form-label .req { color:#EF4444; margin-left:3px; }
  .form-input, .form-select, .form-textarea {
    font-family:'DM Sans',sans-serif; font-size:13px; color:${isDark?'#E2E8F0':'#0F172A'};
    background:${isDark?'#0F172A':'#fff'}; border:1.5px solid ${isDark?'#334155':'#E2E8F0'}; border-radius:9px;
    padding:10px 13px; width:100%; outline:none;
    transition:border 0.15s, box-shadow 0.15s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color:#16A064; box-shadow:0 0 0 3px rgba(22,160,100,0.10); }
  .form-textarea { resize:vertical; min-height:80px; }
  select.form-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 10px center; padding-right:30px; }

  /* ── TOGGLE ── */
  .toggle-row { display:flex; gap:20px; flex-wrap:wrap; margin-bottom:14px; }
  .toggle-item { display:flex; align-items:center; gap:8px; font-size:13px; color:${isDark?'#CBD5E1':'#334155'}; cursor:pointer; user-select:none; }
  .toggle-input { width:36px; height:20px; appearance:none; background:${isDark?'#334155':'#CBD5E1'}; border-radius:20px; position:relative; cursor:pointer; transition:background 0.2s; outline:none; flex-shrink:0; }
  .toggle-input:checked { background:#16A064; }
  .toggle-input::after { content:''; position:absolute; top:3px; left:3px; width:14px; height:14px; background:#fff; border-radius:50%; transition:transform 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
  .toggle-input:checked::after { transform:translateX(16px); }

  /* ── WORKING HOURS ROW ── */
  .wh-row { display:flex; align-items:center; gap:12px; padding:10px 14px; background:${isDark?'#1E293B':'#fff'}; border:1px solid ${isDark?'#334155':'#E2E8F0'}; border-radius:10px; margin-bottom:8px; }
  .wh-day { width:32px; font-size:13px; font-weight:700; color:${isDark?'#E2E8F0':'#0F172A'}; flex-shrink:0; }
  .wh-time-wrap { display:flex; gap:10px; flex:1; }
  .wh-time { font-family:'DM Sans',sans-serif; font-size:13px; color:${isDark?'#E2E8F0':'#0F172A'}; background:${isDark?'#0F172A':'#F8FAFC'}; border:1.5px solid ${isDark?'#334155':'#E2E8F0'}; border-radius:8px; padding:7px 10px; outline:none; transition:border 0.15s; flex:1; min-width:0; }
  .wh-time:focus { border-color:#16A064; }
  .wh-off { font-size:12px; color:#94A3B8; margin-left:8px; }

  /* ── RESCHEDULE ── */
  .slot-pill { display:inline-flex; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; padding:6px 14px; border-radius:8px; border:1.5px solid #16A064; color:${isDark?'#4ADE80':'#0D6B45'}; background:${isDark?'transparent':'#fff'}; cursor:pointer; transition:all 0.15s; margin:4px; }
  .slot-pill:hover, .slot-pill.selected { background:#16A064; color:#fff; }
  .slot-pill.unavailable { border-color:${isDark?'#334155':'#E2E8F0'}; color:#94A3B8; cursor:not-allowed; background:${isDark?'rgba(255,255,255,0.03)':'#F8FAFC'}; }

  /* ── CONFIRM / DELETE MODAL ── */
  .confirm-box { background:${isDark?'#1E293B':'#fff'}; border-radius:16px; width:100%; max-width:400px; box-shadow:0 24px 60px rgba(0,0,0,${isDark?'0.50':'0.18'}); overflow:hidden; animation:modalIn 0.18s ease; }
  .confirm-body { padding:28px 26px 18px; text-align:center; }
  .confirm-icon { width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px; margin:0 auto 14px; }
  .confirm-icon.red   { background:${isDark?'rgba(220,38,38,0.2)':'#FEE2E2'}; }
  .confirm-icon.amber { background:${isDark?'rgba(217,119,6,0.2)':'#FEF3C7'}; }
  .confirm-title { font-size:16px; font-weight:700; color:${isDark?'#F1F5F9':'#0F172A'}; margin-bottom:6px; }
  .confirm-desc  { font-size:13px; color:${isDark?'#94A3B8':'#64748B'}; }
  .confirm-footer { padding:14px 24px 22px; display:flex; gap:10px; }
  .confirm-footer button { flex:1; }

  /* ── BTNS ── */
  .btn-primary { background:#16A064; color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:9px 18px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.15s; }
  .btn-primary:hover { background:#0D6B45; transform:translateY(-1px); }
  .btn-primary:disabled { background:#86EFAC; cursor:not-allowed; transform:none; }
  .btn-primary.red { background:#DC2626; }
  .btn-primary.red:hover { background:#B91C1C; }
  .btn-outline { background:${isDark?'transparent':'#fff'}; color:${isDark?'#CBD5E1':'#475569'}; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:8px 16px; border-radius:8px; border:1.5px solid ${isDark?'#475569':'#CBD5E1'}; cursor:pointer; transition:all 0.15s; }
  .btn-outline:hover { border-color:${isDark?'#94A3B8':'#94A3B8'}; background:${isDark?'rgba(255,255,255,0.06)':'#F8FAFC'}; }
  .btn-ghost { background:rgba(255,255,255,0.18); color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; padding:9px 18px; border-radius:9px; border:1px solid rgba(255,255,255,0.32); cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.15s; position:relative; z-index:1; }
  .btn-ghost:hover { background:rgba(255,255,255,0.28); }

  /* ── ALERT ── */
  .alert-info  { padding:10px 14px; background:${isDark?'rgba(30,64,175,0.18)':'#EFF6FF'}; border:1px solid ${isDark?'#1D4ED8':'#BFDBFE'}; border-radius:8px; font-size:12.5px; color:${isDark?'#93C5FD':'#1E40AF'}; margin-bottom:14px; }
  .alert-error { padding:10px 14px; background:${isDark?'rgba(220,38,38,0.15)':'#FEF2F2'}; border:1px solid ${isDark?'#DC2626':'#FECACA'}; border-radius:8px; font-size:12.5px; color:${isDark?'#FCA5A5':'#DC2626'}; margin-bottom:14px; }

  .form-input.error, .form-select.error, .form-textarea.error { border-color:#EF4444 !important; box-shadow:0 0 0 3px rgba(239,68,68,0.10) !important; }
  .field-err { font-size:11px; color:#EF4444; font-weight:600; margin-top:2px; }
  .btn-spin { width:13px; height:13px; border:2px solid rgba(255,255,255,0.4); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; display:inline-block; flex-shrink:0; }

  @media (max-width:700px) {
    .kpi-row { grid-template-columns:1fr 1fr; }
    .form-grid-2,.form-grid-3 { grid-template-columns:1fr; }
  }
`;

const Ico = {
  cal: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>,
  cancel: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
  swap: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  copy: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
  globe: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  toggle: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="5" width="22" height="14" rx="7" ry="7" /><circle cx="8" cy="12" r="3" /></svg>,
  link: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  x: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  trend: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
};

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return <div className={`ap-toast toast-${type}`}>{type === "success" ? "✓" : type === "warning" ? "⚠" : "✕"} {msg}</div>;
}
function useToast() {
  const [toast, setToast] = useState(null);
  const notify = (msg, type = "success") => setToast({ msg, type, key: Date.now() });
  return { toast, notify, clearToast: () => setToast(null) };
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { bg: "#F1F5F9", color: "#475569", label: status };
  return <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function PublicBookingPageInline({ slug, onClose }) {
  const [profile, setProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [holdToken, setHoldToken] = useState(null);
  const [holdExpiry, setHoldExpiry] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", visitorMessage: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [visitorSession] = useState(() => crypto.randomUUID?.() || Math.random().toString(36));
  const [calendarDates, setCalendarDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    PUB.get(`/public/book/${slug}`).then(r => setProfile(r.data)).catch(() => setError("Booking page not found.")).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!profile) return;
    setDatesLoading(true);
    const today = new Date().toISOString().substring(0, 10);
    const to = new Date(); to.setDate(to.getDate() + (profile.bookingWindowDays || 30));
    PUB.get(`/public/book/${slug}/available-dates?from=${today}&to=${to.toISOString().substring(0, 10)}`)
      .then(r => {
        const raw = r.data || [];
        setCalendarDates(raw.map(d => Array.isArray(d) ? `${d[0]}-${String(d[1]).padStart(2, "0")}-${String(d[2]).padStart(2, "0")}` : String(d).substring(0, 10)));
      }).catch(() => setError("Could not load available dates.")).finally(() => setDatesLoading(false));
  }, [profile, slug]);

  useEffect(() => {
    if (!selectedDate || !profile) return;
    setLoading(true); setError("");
    PUB.get(`/public/book/${slug}/slots?date=${selectedDate}`)
      .then(r => setSlots(r.data?.slots || [])).catch(() => setError("Could not load time slots.")).finally(() => setLoading(false));
  }, [selectedDate, profile, slug]);

  useEffect(() => {
    if (!holdExpiry) return;
    const iv = setInterval(() => { const rem = Math.max(0, Math.floor((new Date(holdExpiry) - Date.now()) / 1000)); setCountdown(rem); if (rem === 0) clearInterval(iv); }, 1000);
    return () => clearInterval(iv);
  }, [holdExpiry]);

  const handleSelectSlot = async (slot) => {
    if (!slot.available) return;
    setLoading(true); setError("");
    try {
      const r = await PUB.post("/public/book/hold", { bookingProfileId: profile.id, slotDate: selectedDate, slotStart: slot.startTime, visitorSession });
      setSelectedSlot(slot); setHoldToken(r.data.holdToken); setHoldExpiry(r.data.expiresAt); setStep(2);
    } catch (e) { setError(e.response?.data?.error || "Could not hold slot."); } finally { setLoading(false); }
  };

  const handleConfirm = async () => {
    setLoading(true); setError("");
    try { const r = await PUB.post("/public/book/confirm", { holdToken, ...form }); setSuccess(r.data); setStep(3); }
    catch (e) { setError(e.response?.data?.error || "Booking failed."); } finally { setLoading(false); }
  };

  const getNextDates = () => { const dates = []; const today = new Date(); const wDays = profile?.bookingWindowDays || 30; for (let i = 0; i < wDays; i++) { const d = new Date(today); d.setDate(today.getDate() + i); dates.push(d.toISOString().substring(0, 10)); } return dates; };
  const availableDateSet = new Set(calendarDates);
  const isDateAvailable = (ds) => { if (calendarDates.length > 0) return availableDateSet.has(ds); if (datesLoading) return false; const dow = new Date(ds + "T00:00:00").getDay(); return dow !== 0 && dow !== 6; };
  const fmtD = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

  if (loading && !profile) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error && !profile) return <div className="alert-error" style={{ margin: 24 }}>{error}</div>;
  if (!profile) return null;

  const STEPS = ["Choose Date", "Pick Time", "Your Details", "Confirmed"];

  return (
    <div>
      {/* Public booking page header */}
      <div style={{ background: "linear-gradient(135deg,#0D6B45,#16A064,#22C77A)", padding: "20px 24px", borderRadius: "12px 12px 0 0" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{profile.name}</div>
        {profile.description && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.80)", marginTop: 4 }}>{profile.description}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <span style={{ background: "rgba(255,255,255,0.22)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>⏱ {profile.meetingDurationMinutes} min</span>
          <span style={{ background: "rgba(255,255,255,0.22)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>🌐 {profile.timezone}</span>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: step > i ? "#16A064" : step === i ? "#16A064" : "#E2E8F0", color: step >= i ? "#fff" : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {step > i ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: step === i ? 700 : 500, color: step === i ? "#16A064" : step > i ? "#059669" : "#94A3B8" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > i ? "#16A064" : "#E2E8F0", margin: "0 8px", minWidth: 20 }} />}
            </React.Fragment>
          ))}
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Step 0 — Date */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>Select a Date</div>
            {datesLoading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 260, overflowY: "auto" }}>
                {getNextDates().map(ds => {
                  const avail = isDateAvailable(ds); const d = new Date(ds + "T00:00:00"); const isSel = selectedDate === ds;
                  return (
                    <button key={ds} disabled={!avail} onClick={() => { setSelectedDate(ds); setStep(1); }}
                      style={{ minWidth: 64, flexDirection: "column", display: "flex", alignItems: "center", padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${avail ? "#16A064" : "#E2E8F0"}`, background: isSel ? "#16A064" : avail ? "#F0FDF4" : "#F8FAFC", color: isSel ? "#fff" : avail ? "#0D6B45" : "#94A3B8", cursor: avail ? "pointer" : "not-allowed", font: "600 11px 'DM Sans',sans-serif", transition: "all 0.15s" }}>
                      <span>{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                      <span style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, margin: "2px 0" }}>{d.getDate()}</span>
                      <span>{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 1 — Slots */}
        {step === 1 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <button className="btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setStep(0)}>← Back</button>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Available Times — {fmtD(selectedDate)}</span>
            </div>
            {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {slots.length === 0 && <div style={{ color: "#94A3B8", fontSize: 13 }}>No slots available for this date.</div>}
                {slots.map(s => (
                  <button key={s.startTime} disabled={!s.available} onClick={() => handleSelectSlot(s)}
                    className={`slot-pill${!s.available ? " unavailable" : ""}`}>
                    {fmtTime(s.startTime)}{s.remainingCapacity > 1 && <span style={{ marginLeft: 4, opacity: 0.6 }}>({s.remainingCapacity})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <button className="btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setStep(1)}>← Back</button>
              <span style={{ fontSize: 14, fontWeight: 700 }}>Your Details</span>
            </div>
            <div className="alert-info">
              <strong>{fmtD(selectedDate)}</strong> at <strong>{fmtTime(selectedSlot?.startTime)}</strong>
              {countdown != null && countdown > 0 && <> — held for {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}</>}
              {countdown === 0 && <> — <strong>Reservation expired.</strong></>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {profile.collectName !== false && <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Your full name" /></div>}
              {profile.collectEmail !== false && <div className="form-group"><label className="form-label">Email Address *</label><input className="form-input" type="email" value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="your@email.com" /></div>}
              {profile.collectPhone !== false && <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="+91 98765..." /></div>}
              {profile.collectNotes !== false && <div className="form-group"><label className="form-label">Message (optional)</label><textarea className="form-textarea" rows={3} value={form.visitorMessage} onChange={e => setForm(f => ({ ...f, visitorMessage: e.target.value }))} placeholder="Anything you'd like us to know?" /></div>}
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}
                disabled={loading || countdown === 0 || !form.customerName || !form.customerEmail}
                onClick={handleConfirm}>
                {loading ? "Booking…" : "Book Appointment"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Success */}
        {step === 3 && success && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>You're Booked!</div>
            <div style={{ fontSize: 13, color: "#64748B", marginBottom: 18 }}>{success.message}</div>
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "14px 18px", textAlign: "left", marginBottom: 18 }}>
              {[["Reference", success.appointmentNumber], ["Date", success.date], ["Time", `${success.startTime} – ${success.endTime}`], ["Name", success.customerName], ["Status", success.status]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: "#0D6B45", width: 80, flexShrink: 0 }}>{k}:</span>
                  <span style={{ color: "#1E293B" }}>{v}</span>
                </div>
              ))}
            </div>
            {onClose && <button className="btn-outline" onClick={onClose}>Close</button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Booking Profile Dialog — logic UNCHANGED ─────────────────────────────────
function BookingProfileDialog({ open, onClose, onSaved, profile, allProfiles = [] }) {
  const [form, setForm] = useState({ ...EMPTY_PROFILE });
  const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS.map(h => ({ ...h })));
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setForm({ ...EMPTY_PROFILE, ...profile });
      API.get(`/booking-profile/${profile.id}/working-hours`).then(r => {
        if (r.data?.length > 0) {
          const merged = DEFAULT_WORKING_HOURS.map(def => { const found = r.data.find(h => h.dayOfWeek === def.dayOfWeek); return found || { ...def }; });
          setWorkingHours(merged);
        }
      }).catch(() => { });
    } else {
      setForm({ ...EMPTY_PROFILE });
      setWorkingHours(DEFAULT_WORKING_HOURS.map(h => ({ ...h })));
    }
    setTab(0); setError(""); setFieldErrors({});
  }, [profile, open]);

  const setF = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (fieldErrors[k]) setFieldErrors(p => { const n = { ...p }; delete n[k]; return n; }); };

  const handleSave = async () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Profile name is required";
    // duplicate name check (exclude current record when editing)
    const dupName = allProfiles.find(p =>
      p.name?.trim().toLowerCase() === form.name?.trim().toLowerCase() &&
      (!profile || p.id !== profile.id)
    );
    if (dupName) errs.name = "A booking profile with this name already exists";
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); setTab(0); return; }
    setFieldErrors({});
    setLoading(true); setError("");
    try {
      let saved;
      if (profile?.id) saved = await API.put(`/booking-profile/update/${profile.id}`, form);
      else saved = await API.post("/booking-profile/add", form);
      await API.post(`/booking-profile/${saved.data.id}/working-hours`, workingHours);
      onClose(); onSaved();
    } catch (e) { setError(e.response?.data?.message || "Save failed."); } finally { setLoading(false); }
  };

  const updateHours = (idx, key, val) => setWorkingHours(wh => { const u = [...wh]; u[idx] = { ...u[idx], [key]: val }; return u; });

  if (!open) return null;

  const TIMEZONES = ["Asia/Kolkata", "America/New_York", "America/Los_Angeles", "Europe/London", "UTC"];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box wide">
        <div className="modal-hdr">
          <div className="modal-hdr-left">
            <div className="modal-hdr-icon">🔗</div>
            <div>
              <div className="modal-hdr-title">{profile ? "Edit Booking Profile" : "New Booking Profile"}</div>
              <div className="modal-hdr-sub">{profile ? "Update profile settings" : "Configure a new booking profile"}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>{Ico.x}</button>
        </div>

        {/* Profile tabs */}
        <div className="ptab-bar">
          {["Basic Info", "Slot Rules", "Working Hours"].map((t, i) => (
            <button key={t} className={`ptab-btn${tab === i ? " active" : ""}`} onClick={() => setTab(i)}>{t}</button>
          ))}
        </div>

        <div className="modal-body">
          {error && <div className="alert-error">{error}</div>}

          {/* Tab 0: Basic Info */}
          {tab === 0 && (
            <>
              <div className="sec-block">
                <div className="sec-divider">Profile Info <span /></div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Profile Name <span className="req">*</span></label>
                    <input className={`form-input${fieldErrors.name ? " error" : ""}`} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="e.g. 30-Min Consultation" />
                    {fieldErrors.name && <span className="field-err">{fieldErrors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">URL Slug</label>
                    <input className="form-input" value={form.slug} onChange={e => setF("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="auto-generated if blank" />
                    {form.slug && <div style={{ fontSize: 11, color: "#16A064", marginTop: 3 }}>Booking URL: /book/{form.slug}</div>}
                  </div>
                </div>
                <div className="form-grid-1">
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setF("description", e.target.value)} placeholder="Brief description of this booking type" />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Service Name</label>
                    <input className="form-input" value={form.serviceName || ""} onChange={e => setF("serviceName", e.target.value)} placeholder="e.g. Sales Call" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resource / Host</label>
                    <input className="form-input" value={form.resourceName || ""} onChange={e => setF("resourceName", e.target.value)} placeholder="e.g. John Doe" />
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select className="form-select" value={form.timezone} onChange={e => setF("timezone", e.target.value)}>
                      {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmation Type</label>
                    <select className="form-select" value={form.confirmationType} onChange={e => setF("confirmationType", e.target.value)}>
                      <option value="AUTO">Auto Confirm</option>
                      <option value="MANUAL">Manual Approval</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sec-block">
                <div className="sec-divider">Settings <span /></div>
                <div className="toggle-row">
                  {[["collectName", "Collect Name"], ["collectEmail", "Collect Email"], ["collectPhone", "Collect Phone"], ["collectNotes", "Collect Notes"], ["cancelAllowed", "Allow Cancellation"], ["rescheduleAllowed", "Allow Reschedule"], ["isActive", "Published"]].map(([k, l]) => (
                    <label key={k} className="toggle-item">
                      <input type="checkbox" className="toggle-input" checked={!!form[k]} onChange={e => setF(k, e.target.checked)} />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab 1: Slot Rules */}
          {tab === 1 && (
            <div className="sec-block">
              <div className="sec-divider">Slot Configuration <span /></div>
              <div className="form-grid-2">
                {[["meetingDurationMinutes", "Meeting Duration (min)"], ["slotIntervalMinutes", "Slot Interval (min)"], ["maxBookingsPerSlot", "Max Bookings per Slot"], ["bookingWindowDays", "Booking Window (days)"], ["minNoticeMinutes", "Min Notice (min)"], ["bufferBeforeMinutes", "Buffer Before (min)"], ["bufferAfterMinutes", "Buffer After (min)"], ["maxBookingsPerDay", "Max Bookings / Day"]].map(([k, l]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" type="number" min={0} value={form[k] || ""} onChange={e => setF(k, e.target.value === "" ? null : parseInt(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Working Hours */}
          {tab === 2 && (
            <div className="sec-block">
              <div className="sec-divider">Working Hours <span /></div>
              {workingHours.map((wh, idx) => (
                <div key={idx} className="wh-row">
                  <div className="wh-day">{DAYS[wh.dayOfWeek]}</div>
                  <label className="toggle-item" style={{ flexShrink: 0 }}>
                    <input type="checkbox" className="toggle-input" checked={!!wh.isWorkingDay} onChange={e => updateHours(idx, "isWorkingDay", e.target.checked)} />
                    <span style={{ fontSize: 12, color: "#64748B" }}>Working</span>
                  </label>
                  {wh.isWorkingDay ? (
                    <div className="wh-time-wrap">
                      <input className="wh-time" type="time" value={wh.startTimeLocal || "09:00"} onChange={e => updateHours(idx, "startTimeLocal", e.target.value)} />
                      <span style={{ color: "#94A3B8", alignSelf: "center", fontSize: 12 }}>—</span>
                      <input className="wh-time" type="time" value={wh.endTimeLocal || "18:00"} onChange={e => updateHours(idx, "endTimeLocal", e.target.value)} />
                    </div>
                  ) : <span className="wh-off">Day off</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? <><span className="btn-spin" /> Saving…</> : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reschedule Dialog — logic UNCHANGED ─────────────────────────────────────
function RescheduleDialog({ open, onClose, appointment, onSaved }) {
  const [newDate, setNewDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [newStart, setNewStart] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!open) { setNewDate(""); setSlots([]); setNewStart(""); setReason(""); setError(""); } }, [open]);

  useEffect(() => {
    if (!newDate || !appointment?.bookingProfileId) return;
    API.get(`/booking-profile/${appointment.bookingProfileId}/slots?date=${newDate}`)
      .then(r => setSlots(r.data?.slots || []));
  }, [newDate, appointment]);

  const handleSave = async () => {
    if (!newDate || !newStart) { setError("Please select a date and time."); return; }
    setLoading(true); setError("");
    try { await API.post(`/appointment/${appointment.id}/reschedule`, { newDate, newStart, reason }); onSaved(); onClose(); }
    catch (e) { setError(e.response?.data?.error || "Reschedule failed."); } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box narrow">
        <div className="modal-hdr">
          <div className="modal-hdr-left">
            <div className="modal-hdr-icon">🔄</div>
            <div>
              <div className="modal-hdr-title">Reschedule Appointment</div>
              <div className="modal-hdr-sub">Pick a new date and time slot</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>{Ico.x}</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">New Date</label>
            <input className="form-input" type="date" value={newDate} onChange={e => { setNewDate(e.target.value); setNewStart(""); }} />
          </div>
          {slots.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div className="form-label" style={{ marginBottom: 8 }}>Select Time Slot</div>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {slots.filter(s => s.available).map(s => (
                  <button key={s.startTime} className={`slot-pill${newStart === s.startTime ? " selected" : ""}`} onClick={() => setNewStart(s.startTime)}>
                    {s.startTime} – {s.endTime}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Reason (optional)</label>
            <input className="form-input" value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for reschedule" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Rescheduling…" : "Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AppointmentManagement() {
  const { isDark } = useTheme();
  const css = buildCss(isDark);
  const [tab, setTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptSearch, setApptSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [apptDialog, setApptDialog] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [apptForm, setApptForm] = useState({ ...EMPTY_APT });
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleDialog, setRescheduleDialog] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [profileDialog, setProfileDialog] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [publicBookingSlug, setPublicBookingSlug] = useState(null);
  const [resources, setResources] = useState([]);
  const [apptSaving, setApptSaving] = useState(false);
  const [apptErrors, setApptErrors] = useState({});
  const [calendarFilter, setCalendarFilter] = useState("ALL");
  const { toast, notify, clearToast } = useToast();

  // ── API calls (unchanged) ──
  const loadAppointments = useCallback(() => {
    setApptLoading(true);
    API.get("/appointment/getAll").then(r => setAppointments(r.data || [])).catch(() => notify("Failed to load appointments", "error")).finally(() => setApptLoading(false));
  }, []);
  const loadProfiles = useCallback(() => {
    API.get("/booking-profile/getAll").then(r => setProfiles(r.data || [])).catch(() => { });
  }, []);
  const loadResources = useCallback(() => {
    API.get("/appointment/resource/getAll").then(r => setResources(r.data || [])).catch(() => { });
  }, []);
  useEffect(() => { loadAppointments(); loadProfiles(); loadResources(); }, [loadAppointments, loadProfiles, loadResources]);

  const filteredAppts = appointments.filter(a => {
    const matchSearch = !apptSearch || (a.customerName || "").toLowerCase().includes(apptSearch.toLowerCase()) || (a.appointmentNumber || "").toLowerCase().includes(apptSearch.toLowerCase()) || (a.serviceName || "").toLowerCase().includes(apptSearch.toLowerCase());
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    const matchCalendar = calendarFilter === "ALL" || String(a.bookingProfileId) === calendarFilter || (!a.bookingProfileId && calendarFilter === "NONE");
    return matchSearch && matchStatus && matchCalendar;
  });

  const openApptEdit = (a) => { setEditAppt(a); setApptForm({ ...EMPTY_APT, ...a, appointmentDate: parseLocalDate(a.appointmentDate), startTime: parseLocalTime(a.startTime), endTime: parseLocalTime(a.endTime) }); setApptErrors({}); setApptDialog(true); };
  const openApptNew = () => { setEditAppt(null); setApptForm({ ...EMPTY_APT, bookingProfileId: calendarFilter !== "ALL" && calendarFilter !== "NONE" ? calendarFilter : "" }); setApptErrors({}); setApptDialog(true); };

  const saveAppt = async () => {
    const errs = {};
    if (!apptForm.customerName?.trim()) errs.customerName = "Customer name is required";
    if (!apptForm.appointmentDate) errs.appointmentDate = "Appointment date is required";
    if (!apptForm.startTime) errs.startTime = "Start time is required";
    if (Object.keys(errs).length > 0) { setApptErrors(errs); return; }
    setApptErrors({});
    const payload = { ...apptForm, appointmentDate: dateStrToArray(apptForm.appointmentDate), startTime: timeStrToArray(apptForm.startTime), endTime: timeStrToArray(apptForm.endTime), durationMinutes: parseInt(apptForm.durationMinutes) || 30 };
    setApptSaving(true);
    try {
      if (editAppt?.id) { await API.put(`/appointment/update/${editAppt.id}`, payload); notify("Appointment updated"); }
      else { await API.post("/appointment/add", payload); notify("Appointment created"); }
      setApptDialog(false); loadAppointments();
    } catch { notify("Save failed", "error"); }
    finally { setApptSaving(false); }
  };

  const handleCancel = async () => {
    try { await API.post(`/appointment/${cancelDialog.id}/cancel`, { reason: cancelReason }); notify("Appointment cancelled"); setCancelDialog(null); setCancelReason(""); loadAppointments(); }
    catch (e) { notify(e.response?.data?.error || "Cancel failed", "error"); }
  };

  const handleStatusChange = async (id, status) => {
    try { await API.put(`/appointment/updateStatus/${id}`, { status }); notify("Status updated"); loadAppointments(); }
    catch { notify("Update failed", "error"); }
  };

  const handleDeleteAppt = (id) => setDeleteDialog({ type: "appointment", id, label: "appointment" });
  const handleDeleteApptConfirmed = async (id) => {
    try { await API.delete(`/appointment/delete/${id}`); notify("Deleted"); loadAppointments(); }
    catch { notify("Delete failed", "error"); }
  };

  const handleToggleProfile = async (profile) => {
    try { await API.put(`/booking-profile/toggleActive/${profile.id}`); notify(profile.isActive ? "Profile deactivated" : "Profile activated"); loadProfiles(); }
    catch { notify("Toggle failed", "error"); }
  };

  const handleDeleteProfile = (id) => setDeleteDialog({ type: "profile", id, label: "booking profile" });
  const handleDeleteProfileConfirmed = async (id) => {
    try { await API.delete(`/booking-profile/delete/${id}`); notify("Profile deleted"); loadProfiles(); }
    catch { notify("Delete failed", "error"); }
  };

  const fallbackCopy = (text) => {
    const el = document.createElement("textarea"); el.value = text; el.style.position = "fixed"; el.style.opacity = "0";
    document.body.appendChild(el); el.focus(); el.select();
    try { document.execCommand("copy"); notify("Booking link copied!"); } catch { notify("Copy failed: " + text, "warning"); }
    document.body.removeChild(el);
  };

  const copyBookingLink = (slug) => {
    const isHash = window.location.href.includes("/#/");
    const url = isHash ? `${window.location.origin}/#/book/${slug}` : `${window.location.origin}/book/${slug}`;
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(() => notify("Booking link copied!")).catch(() => fallbackCopy(url));
    else fallbackCopy(url);
  };

  // ── KPI values — from live API data ──
  const kpi = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "PENDING_APPROVAL").length,
    confirmed: appointments.filter(a => a.status === "CONFIRMED").length,
    cancelled: appointments.filter(a => a.status === "CANCELLED").length,
    profiles: profiles.length,
  };

  return (
    <>
      <style>{css}</style>
      <div className="ap-app">

        {/* ── Header Banner ── */}
        <div className="ap-header">
          <div className="hdr-left">
            <div className="hdr-icon">📅</div>
            <div>
              <div className="hdr-title">Appointment Scheduling</div>
              <div className="hdr-sub">Manage profiles, availability &amp; appointments</div>
            </div>
          </div>
          <div className="hdr-right">
            {tab === 0 && <button className="btn-ghost" onClick={openApptNew}>{Ico.plus} New Appointment</button>}
            {tab === 1 && <button className="btn-ghost" onClick={() => { setEditProfile(null); setProfileDialog(true); }}>{Ico.plus} New Profile</button>}
          </div>
        </div>

        {/* ── KPI Cards — all live from API ── */}
        <div className="kpi-row">
          <div className="kpi-card kpi-green">
            <div><div className="kpi-label">Total Appointments</div><div className="kpi-value">{kpi.total}</div></div>
            <div className="kpi-icon">📋</div>
          </div>
          <div className="kpi-card kpi-amber">
            <div><div className="kpi-label">Pending Approval</div><div className="kpi-value">{kpi.pending}</div></div>
            <div className="kpi-icon">⏳</div>
          </div>
          <div className="kpi-card kpi-teal">
            <div><div className="kpi-label">Confirmed</div><div className="kpi-value">{kpi.confirmed}</div></div>
            <div className="kpi-icon">✅</div>
          </div>
          <div className="kpi-card kpi-purple">
            <div><div className="kpi-label">Cancelled</div><div className="kpi-value">{kpi.cancelled}</div></div>
            <div className="kpi-icon">❌</div>
          </div>
          <div className="kpi-card kpi-cyan">
            <div><div className="kpi-label">Booking Profiles</div><div className="kpi-value">{kpi.profiles}</div></div>
            <div className="kpi-icon">🔗</div>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="main-card">
          <div className="tab-bar">
            <button className={`tab-btn${tab === 0 ? " active" : ""}`} onClick={() => setTab(0)}>📅 Appointments</button>
            <button className={`tab-btn${tab === 1 ? " active" : ""}`} onClick={() => setTab(1)}>🔗 Booking Profiles</button>
          </div>

          {/* ── Tab 0: Appointments ── */}
          {tab === 0 && (
            <>
              {profiles.length > 0 && (
                <div className="cal-filter-bar">
                  <span className="cal-filter-label">📅 Calendar:</span>
                  <button className={`cal-chip${calendarFilter === "ALL" ? " active" : ""}`} onClick={() => setCalendarFilter("ALL")}>
                    <span className="cal-chip-dot" />All Calendars
                    <span style={{ fontSize: 10, opacity: 0.75, marginLeft: 2 }}>({appointments.length})</span>
                  </button>
                  {profiles.map(p => {
                    const cnt = appointments.filter(a => String(a.bookingProfileId) === String(p.id)).length;
                    return (
                      <button key={p.id} className={`cal-chip${calendarFilter === String(p.id) ? " active" : ""}`} onClick={() => setCalendarFilter(String(p.id))}>
                        <span className="cal-chip-dot" />{p.name}
                        <span style={{ fontSize: 10, opacity: 0.75, marginLeft: 2 }}>({cnt})</span>
                      </button>
                    );
                  })}
                  {appointments.some(a => !a.bookingProfileId) && (
                    <button className={`cal-chip${calendarFilter === "NONE" ? " active" : ""}`} onClick={() => setCalendarFilter("NONE")}>
                      <span className="cal-chip-dot" />Unassigned
                      <span style={{ fontSize: 10, opacity: 0.75, marginLeft: 2 }}>({appointments.filter(a => !a.bookingProfileId).length})</span>
                    </button>
                  )}
                </div>
              )}
              <div className="toolbar">
                <div className="search-wrap">
                  <span className="search-icon">{Ico.search}</span>
                  <input className="search-input" placeholder="Search by name, number, service…" value={apptSearch} onChange={e => setApptSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                </select>
              </div>

              {apptLoading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>{["Ref #", "Customer", "Service", "Calendar", "Date", "Time", "Status", "Source", "Actions"].map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {filteredAppts.length === 0 ? (
                        <tr><td colSpan={9}><div className="empty-state"><div className="empty-icon">📭</div>No appointments found</div></td></tr>
                      ) : filteredAppts.map(a => (
                        <tr key={a.id}>
                          <td><span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{a.appointmentNumber || "-"}</span></td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{a.customerName || "-"}</div>
                            <div style={{ fontSize: 11, color: "#94A3B8" }}>{a.customerPhone || a.customerEmail || ""}</div>
                          </td>
                          <td style={{ color: "#475569" }}>{a.serviceName || "-"}</td>
                          <td>{a.bookingProfileId ? (() => { const p = profiles.find(x => String(x.id) === String(a.bookingProfileId)); return p ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 5, background: "#F0FDF4", color: "#0D6B45", border: "1px solid #BBF7D0" }}>{p.name}</span> : <span style={{ color: "#94A3B8", fontSize: 12 }}>#{a.bookingProfileId}</span>; })() : <span style={{ color: "#CBD5E1", fontSize: 12 }}>—</span>}</td>
                          <td style={{ color: "#475569" }}>{fmt(parseLocalDate(a.appointmentDate))}</td>
                          <td style={{ color: "#475569" }}><span className="mono">{fmtTime(parseLocalTime(a.startTime))} – {fmtTime(parseLocalTime(a.endTime))}</span></td>
                          <td><StatusBadge status={a.status} /></td>
                          <td>
                            <span className="source-badge" style={{ background: a.source === "PUBLIC_LINK" ? "#EDE9FE" : "#F1F5F9", color: a.source === "PUBLIC_LINK" ? "#6D28D9" : "#475569" }}>
                              {a.source === "PUBLIC_LINK" ? "Public" : "Internal"}
                            </span>
                          </td>
                          <td>
                            <div className="act-btns">
                              <button className="act-btn" title="Edit" onClick={() => openApptEdit(a)}>{Ico.edit}</button>
                              {a.status !== "CANCELLED" && <>
                                <button className="act-btn danger" title="Cancel" onClick={() => { setCancelDialog(a); setCancelReason(""); }}>{Ico.cancel}</button>
                                {a.bookingProfileId && <button className="act-btn warn" title="Reschedule" onClick={() => setRescheduleDialog(a)}>{Ico.swap}</button>}
                              </>}
                              <button className="act-btn danger" title="Delete" onClick={() => handleDeleteAppt(a.id)}>{Ico.trash}</button>
                              {a.status === "SCHEDULED" && <button className="act-btn confirm" title="Confirm" onClick={() => handleStatusChange(a.id, "CONFIRMED")}>{Ico.check}</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── Tab 1: Booking Profiles ── */}
          {tab === 1 && (
            profiles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔗</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>No booking profiles yet</div>
                <div style={{ fontSize: 13, marginBottom: 18 }}>Create a booking profile to generate a public scheduling link</div>
                <button className="btn-primary" style={{ margin: "0 auto" }} onClick={() => { setEditProfile(null); setProfileDialog(true); }}>
                  {Ico.plus} Create First Profile
                </button>
              </div>
            ) : (
              <div className="profiles-grid">
                {profiles.map(p => (
                  <div key={p.id} className={`profile-card${p.isActive ? "" : " inactive"}`}>
                    <div className={`profile-card-hdr${p.isActive ? "" : " inactive-hdr"}`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div className="profile-card-name">{p.name}</div>
                        <span className="active-badge">{p.isActive ? "Active" : "Inactive"}</span>
                      </div>
                      {p.description && <div className="profile-card-desc">{p.description}</div>}
                    </div>
                    <div className="profile-card-body">
                      <div className="meta-pills">
                        <span className="meta-pill pill-green">⏱ {p.meetingDurationMinutes} min</span>
                        <span className="meta-pill pill-blue">Slot: {p.slotIntervalMinutes} min</span>
                        <span className="meta-pill pill-amber">Cap: {p.maxBookingsPerSlot}</span>
                      </div>
                      <div className="slug-row">
                        <span style={{ color: "#16A064" }}>{Ico.link}</span>
                        <span className="slug-text">/book/{p.slug}</span>
                      </div>
                    </div>
                    <div className="profile-card-footer">
                      <button className="act-btn" title="Copy booking link" onClick={() => copyBookingLink(p.slug)}>{Ico.copy}</button>
                      <button className="act-btn" title="Preview booking page" onClick={() => setPublicBookingSlug(p.slug)}>{Ico.globe}</button>
                      <button className="act-btn warn" title={p.isActive ? "Deactivate" : "Activate"} onClick={() => handleToggleProfile(p)}>{Ico.toggle}</button>
                      <button className="act-btn" title="Edit profile" onClick={() => { setEditProfile(p); setProfileDialog(true); }}>{Ico.edit}</button>
                      <button className="act-btn danger" title="Delete profile" onClick={() => handleDeleteProfile(p.id)}>{Ico.trash}</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* ─────────────────── MODALS ─────────────────── */}

        {/* Appointment Form */}
        {apptDialog && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setApptDialog(false)}>
            <div className="modal-box wide">
              <div className="modal-hdr">
                <div className="modal-hdr-left">
                  <div className="modal-hdr-icon">📅</div>
                  <div>
                    <div className="modal-hdr-title">{editAppt ? "Edit Appointment" : "New Appointment"}</div>
                    <div className="modal-hdr-sub">{editAppt ? "Update appointment details" : "Create a new appointment record"}</div>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setApptDialog(false)}>{Ico.x}</button>
              </div>
              <div className="modal-body">
                <div className="sec-block">
                  <div className="sec-divider">Customer Info <span /></div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Customer Name <span className="req">*</span></label>
                      <input className={`form-input${apptErrors.customerName ? " error" : ""}`} value={apptForm.customerName || ""} onChange={e => { setApptForm(f => ({ ...f, customerName: e.target.value })); if (apptErrors.customerName) setApptErrors(p => { const n = { ...p }; delete n.customerName; return n; }); }} placeholder="Customer Name" />
                      {apptErrors.customerName && <span className="field-err">{apptErrors.customerName}</span>}
                    </div>
                    <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={apptForm.customerLastName || ""} onChange={e => setApptForm(f => ({ ...f, customerLastName: e.target.value }))} placeholder="Last Name" /></div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={apptForm.customerEmail || ""} onChange={e => setApptForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="Email address" /></div>
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={apptForm.customerPhone || ""} onChange={e => setApptForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="Phone number" /></div>
                  </div>
                  <div className="form-grid-1">
                    <div className="form-group"><label className="form-label">Notes</label><input className="form-input" value={apptForm.notes || ""} onChange={e => setApptForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" /></div>
                  </div>
                </div>

                <div className="sec-block">
                  <div className="sec-divider">Service Details <span /></div>
                  <div className="form-grid-2">
                    <div className="form-group"><label className="form-label">Service Name</label><input className="form-input" value={apptForm.serviceName || ""} onChange={e => setApptForm(f => ({ ...f, serviceName: e.target.value }))} placeholder="Service Name" /></div>
                    <div className="form-group"><label className="form-label">Resource Name</label><input className="form-input" value={apptForm.resourceName || ""} onChange={e => setApptForm(f => ({ ...f, resourceName: e.target.value }))} placeholder="Resource Name" /></div>
                  </div>
                </div>

                <div className="sec-block">
                  <div className="sec-divider">Schedule <span /></div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Date <span className="req">*</span></label>
                      <input className={`form-input${apptErrors.appointmentDate ? " error" : ""}`} type="date" value={apptForm.appointmentDate || ""} onChange={e => { setApptForm(f => ({ ...f, appointmentDate: e.target.value })); if (apptErrors.appointmentDate) setApptErrors(p => { const n = { ...p }; delete n.appointmentDate; return n; }); }} />
                      {apptErrors.appointmentDate && <span className="field-err">{apptErrors.appointmentDate}</span>}
                    </div>
                    <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-input" type="number" value={apptForm.durationMinutes} onChange={e => setApptForm(f => ({ ...f, durationMinutes: e.target.value }))} /></div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Start Time <span className="req">*</span></label>
                      <input className={`form-input${apptErrors.startTime ? " error" : ""}`} type="time" value={apptForm.startTime || ""} onChange={e => { setApptForm(f => ({ ...f, startTime: e.target.value })); if (apptErrors.startTime) setApptErrors(p => { const n = { ...p }; delete n.startTime; return n; }); }} />
                      {apptErrors.startTime && <span className="field-err">{apptErrors.startTime}</span>}
                    </div>
                    <div className="form-group"><label className="form-label">End Time</label><input className="form-input" type="time" value={apptForm.endTime || ""} onChange={e => setApptForm(f => ({ ...f, endTime: e.target.value }))} /></div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={apptForm.status} onChange={e => setApptForm(f => ({ ...f, status: e.target.value }))}>
                        {Object.keys(STATUS_CFG).map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                      </select>
                    </div>
                    {profiles.length > 0 && (
                      <div className="form-group">
                        <label className="form-label">Booking Profile</label>
                        <select className="form-select" value={apptForm.bookingProfileId || ""} onChange={e => setApptForm(f => ({ ...f, bookingProfileId: e.target.value }))}>
                          <option value="">None</option>
                          {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-outline" onClick={() => setApptDialog(false)}>Cancel</button>
                <button className="btn-primary" onClick={saveAppt} disabled={apptSaving}>
                  {apptSaving ? <><span className="btn-spin" /> {editAppt ? "Updating…" : "Creating…"}</> : editAppt ? "Update Appointment" : "Create Appointment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Appointment */}
        {cancelDialog && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setCancelDialog(null)}>
            <div className="confirm-box">
              <div className="confirm-body">
                <div className="confirm-icon red">❌</div>
                <div className="confirm-title">Cancel Appointment?</div>
                <div className="confirm-desc" style={{ marginBottom: 14 }}>Cancel <strong>{cancelDialog?.appointmentNumber}</strong> for <strong>{cancelDialog?.customerName}</strong>?</div>
                <div className="form-group">
                  <label className="form-label">Reason (optional)</label>
                  <textarea className="form-textarea" rows={2} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation" />
                </div>
              </div>
              <div className="confirm-footer">
                <button className="btn-outline" onClick={() => setCancelDialog(null)}>Back</button>
                <button className="btn-primary red" onClick={handleCancel}>Confirm Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteDialog && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteDialog(null)}>
            <div className="confirm-box">
              <div className="confirm-body">
                <div className="confirm-icon red">🗑️</div>
                <div className="confirm-title">Confirm Delete?</div>
                <div className="confirm-desc">Delete this <strong>{deleteDialog?.label}</strong>? This cannot be undone.</div>
              </div>
              <div className="confirm-footer">
                <button className="btn-outline" onClick={() => setDeleteDialog(null)}>Cancel</button>
                <button className="btn-primary red" onClick={() => { if (deleteDialog?.type === "appointment") handleDeleteApptConfirmed(deleteDialog.id); else if (deleteDialog?.type === "profile") handleDeleteProfileConfirmed(deleteDialog.id); setDeleteDialog(null); }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Public Booking Preview */}
        {publicBookingSlug && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPublicBookingSlug(null)}>
            <div className="modal-box" style={{ maxWidth: 580, overflow: "auto" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px", background: "#fff", borderBottom: "1px solid #E2E8F0", flexShrink: 0 }}>
                <button className="modal-close" style={{ color: "#64748B" }} onClick={() => setPublicBookingSlug(null)}>{Ico.x}</button>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                <PublicBookingPageInline slug={publicBookingSlug} onClose={() => setPublicBookingSlug(null)} />
              </div>
            </div>
          </div>
        )}

        {/* Booking Profile Dialog */}
        <BookingProfileDialog open={profileDialog} onClose={() => { setProfileDialog(false); setEditProfile(null); }} onSaved={() => { loadProfiles(); notify("Profile saved!"); }} profile={editProfile} allProfiles={profiles} />

        {/* Reschedule Dialog */}
        <RescheduleDialog open={!!rescheduleDialog} onClose={() => setRescheduleDialog(null)} appointment={rescheduleDialog} onSaved={() => { loadAppointments(); notify("Appointment rescheduled!"); }} />

        {/* Toast */}
        {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={clearToast} />}
      </div>
    </>
  );
}