import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const NAV_SEARCH = [
  { key: "dashboard", icon: "📊", label: "Dashboard", category: "Overview" },
  { key: "hospitals", icon: "🏥", label: "Hospitals", category: "Management" },
  { key: "departments", icon: "🏢", label: "Departments", category: "Management" },
  { key: "staff", icon: "👥", label: "Staff", category: "People" },
  { key: "doctors", icon: "🩺", label: "Doctors", category: "People" },
  { key: "patients", icon: "🧑‍⚕️", label: "Patients", category: "People" },
  { key: "wards", icon: "🛏️", label: "Wards & Beds", category: "Facilities" },
  { key: "ipd", icon: "🏨", label: "IPD Admissions", category: "Clinical" },
  { key: "opd", icon: "💬", label: "OPD / Consultation", category: "Clinical" },
  { key: "prescription", icon: "💊", label: "Prescriptions", category: "Clinical" },
  { key: "lab", icon: "🔬", label: "Lab Tests", category: "Diagnostics" },
  { key: "pharmacy", icon: "🧪", label: "Pharmacy", category: "Diagnostics" },
  { key: "emergency", icon: "🚨", label: "Emergency", category: "Urgent" },
  { key: "ot", icon: "🫀", label: "OT Schedule", category: "Urgent" },
  { key: "nursing", icon: "💉", label: "Nursing Notes", category: "Clinical" },
  { key: "discharge", icon: "📋", label: "Discharge Summary", category: "Clinical" },
  { key: "billing", icon: "🧾", label: "Billing", category: "Finance" },
  { key: "insurance", icon: "🛡️", label: "Insurance", category: "Finance" },
  { key: "advancepay", icon: "💳", label: "Advance Payment", category: "Finance" },
  { key: "relationship", icon: "🤝", label: "Relationships", category: "Management" },
  { key: "reports", icon: "📈", label: "Reports", category: "Analytics" },
  { key: "admin", icon: "⚙️", label: "Admin", category: "System" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600&display=swap');

  /* ─── CSS Variables ─────────────────────────────────────────────── */
  [data-theme="dark"] {
    --tb-bg:              #060D1A;
    --tb-bg-glass:        rgba(6, 13, 26, 0.92);
    --tb-border:          rgba(255,255,255,0.07);
    --tb-border-strong:   rgba(255,255,255,0.12);
    --tb-text:            #F0F6FF;
    --tb-text-secondary:  #8BA0BE;
    --tb-muted:           #4A607E;
    --tb-hover:           rgba(255,255,255,0.05);
    --tb-hover-strong:    rgba(255,255,255,0.09);
    --tb-input-bg:        rgba(255,255,255,0.04);
    --tb-input-focus:     rgba(255,255,255,0.07);
    --tb-kbd-bg:          rgba(255,255,255,0.06);
    --tb-dropdown-bg:     #0A1628;
    --tb-dropdown-border: rgba(255,255,255,0.1);
    --tb-modal-bg:        #070E1C;
    --tb-modal-body:      #060D1A;
    --tb-modal-section:   #0C1A2E;
    --tb-accent:          #3B82F6;
    --tb-accent-soft:     rgba(59,130,246,0.15);
    --tb-green:           #10B981;
    --tb-green-soft:      rgba(16,185,129,0.15);
    --tb-red:             #F87171;
    --tb-red-soft:        rgba(248,113,113,0.12);
    --tb-amber:           #FBBF24;
    --tb-amber-soft:      rgba(251,191,36,0.15);
    --tb-gradient-header: linear-gradient(135deg, #0F172A 0%, #1E2D45 50%, #172140 100%);
    --tb-gradient-avatar: linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%);
    --tb-gradient-profile-hdr: linear-gradient(135deg, #0F172A 0%, #1E3A5F 40%, #1A2F50 100%);
    --tb-shadow-dropdown: 0 24px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06);
    --tb-shadow-modal:    0 40px 100px rgba(0,0,0,0.8), 0 8px 32px rgba(0,0,0,0.5);
    --tb-search-bg:       #0A111E;
    --tb-search-focus:    #111D32;
  }
  [data-theme="light"] {
    --tb-bg:              #FFFFFF;
    --tb-bg-glass:        rgba(255,255,255,0.94);
    --tb-border:          rgba(15,23,42,0.08);
    --tb-border-strong:   rgba(15,23,42,0.14);
    --tb-text:            #0F172A;
    --tb-text-secondary:  #475569;
    --tb-muted:           #94A3B8;
    --tb-hover:           rgba(15,23,42,0.04);
    --tb-hover-strong:    rgba(59,130,246,0.06);
    --tb-input-bg:        rgba(15,23,42,0.03);
    --tb-input-focus:     #FFFFFF;
    --tb-kbd-bg:          rgba(15,23,42,0.06);
    --tb-dropdown-bg:     #FFFFFF;
    --tb-dropdown-border: rgba(15,23,42,0.1);
    --tb-modal-bg:        #F8FAFC;
    --tb-modal-body:      #F1F5F9;
    --tb-modal-section:   #FFFFFF;
    --tb-accent:          #2563EB;
    --tb-accent-soft:     rgba(37,99,235,0.08);
    --tb-green:           #059669;
    --tb-green-soft:      rgba(5,150,105,0.08);
    --tb-red:             #EF4444;
    --tb-red-soft:        rgba(239,68,68,0.08);
    --tb-amber:           #D97706;
    --tb-amber-soft:      rgba(217,119,6,0.1);
    --tb-gradient-header: linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #2563EB 100%);
    --tb-gradient-avatar: linear-gradient(135deg, #2563EB 0%, #6366F1 50%, #8B5CF6 100%);
    --tb-gradient-profile-hdr: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #2563EB 100%);
    --tb-shadow-dropdown: 0 20px 50px rgba(15,23,42,0.18), 0 4px 12px rgba(15,23,42,0.1), inset 0 0 0 1px rgba(15,23,42,0.06);
    --tb-shadow-modal:    0 32px 80px rgba(15,23,42,0.25), 0 8px 24px rgba(15,23,42,0.12);
    --tb-search-bg:       #F1F5F9;
    --tb-search-focus:    #FFFFFF;
  }

  /* ─── Keyframes ──────────────────────────────────────────────────── */
  @keyframes tb-slide-down {
    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes tb-slide-up {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }
  @keyframes tb-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes tb-scale-in {
    from { opacity: 0; transform: scale(0.94) translateY(12px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  @keyframes tb-pulse-dot {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
    50%       { transform: scale(1.15); box-shadow: 0 0 0 4px rgba(16,185,129,0); }
  }
  @keyframes tb-badge-pop {
    0%   { transform: scale(0); }
    60%  { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  @keyframes tb-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes tb-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes tb-check {
    from { stroke-dashoffset: 24; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes tb-save-success {
    0%   { background: var(--tb-green-soft); border-color: var(--tb-green); }
    100% { background: transparent; border-color: var(--tb-border); }
  }
  @keyframes overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes modal-pop {
    from { opacity: 0; transform: scale(0.94) translateY(16px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
  @keyframes notif-ripple {
    0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
    100% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
  }

  /* ─── Topbar Root ────────────────────────────────────────────────── */
  .topbar-root {
    position: fixed; top: 0; right: 0; z-index: 300;
    height: 56px;
    display: flex; align-items: center;
    background: var(--tb-bg-glass);
    border-bottom: 1px solid var(--tb-border);
    padding: 0 18px;
    font-family: 'Inter', sans-serif;
    backdrop-filter: blur(20px) saturate(1.6);
    -webkit-backdrop-filter: blur(20px) saturate(1.6);
    transition: background 0.3s, border-color 0.3s, left 0.25s ease;
  }
  .topbar-root::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--tb-accent) 30%, var(--tb-accent) 70%, transparent 100%);
    opacity: 0.25;
    pointer-events: none;
  }

  /* ─── Search ─────────────────────────────────────────────────────── */
  .topbar-search-wrap {
    flex: 1;
    max-width: 280px;
    margin-left: 14px;
    position: relative;
    transition: max-width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .topbar-search-wrap:focus-within {
    max-width: 420px;
  }
  .topbar-search-wrap::before {
    content: '';
    position: absolute;
    inset: -1.5px;
    border-radius: 12px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #10b981, #3b82f6);
    background-size: 400% 100%;
    z-index: 0;
    opacity: 0;
    filter: blur(6px);
    transition: opacity 0.35s ease;
    animation: search-glow-flow 4s linear infinite;
    pointer-events: none;
  }
  .topbar-search-wrap:focus-within::before {
    opacity: 0.4;
  }
  .topbar-search-wrap:hover::before {
    opacity: 0.2;
  }
  @keyframes search-glow-flow {
    0% { background-position: 0% 0%; }
    100% { background-position: 400% 0%; }
  }
  .topbar-search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--tb-muted); pointer-events: none; font-size: 13px;
    transition: color 0.2s;
    z-index: 2;
  }
  .topbar-search-wrap:focus-within .topbar-search-icon {
    color: var(--tb-accent);
    animation: search-icon-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }
  @keyframes search-icon-bounce {
    0% { transform: translateY(-50%) scale(1) rotate(0deg); }
    50% { transform: translateY(-50%) scale(1.25) rotate(15deg); }
    100% { transform: translateY(-50%) scale(1.1) rotate(0deg); }
  }
  .topbar-search-input {
    width: 100%; height: 36px;
    background: var(--tb-search-bg);
    border: 1.5px solid transparent;
    background-image: linear-gradient(var(--tb-search-bg), var(--tb-search-bg)), 
                      linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #10b981, #3b82f6);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    background-size: 100% 100%, 400% 100%;
    border-radius: 11px;
    padding: 0 56px 0 34px;
    font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--tb-text);
    outline: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    caret-color: var(--tb-accent);
  }
  .topbar-search-input::placeholder { color: var(--tb-muted); }
  .topbar-search-input:focus {
    background: var(--tb-search-focus);
    background-image: linear-gradient(var(--tb-search-focus), var(--tb-search-focus)), 
                      linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #10b981, #3b82f6);
    background-origin: border-box;
    background-clip: padding-box, border-box;
    background-size: 100% 100%, 400% 100%;
    animation: search-glow-flow 3s linear infinite;
    box-shadow: 0 0 16px rgba(99, 102, 241, 0.18), inset 0 1px 2px rgba(0,0,0,0.05);
  }
  .topbar-search-kbd {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    font-size: 10px; color: var(--tb-muted); font-weight: 600;
    background: var(--tb-kbd-bg); border: 1px solid var(--tb-border);
    border-radius: 5px; padding: 2px 6px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0;
    transition: opacity 0.2s, transform 0.2s;
    pointer-events: none;
    z-index: 2;
  }
  .topbar-search-wrap:focus-within .topbar-search-kbd,
  .topbar-search-wrap.has-text .topbar-search-kbd {
    opacity: 0;
    transform: translateY(-50%) scale(0.85);
  }
  .topbar-search-clear {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: var(--tb-muted);
    font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 50%;
    transition: all 0.15s ease;
    z-index: 3;
  }
  .topbar-search-clear:hover {
    background: var(--tb-hover-strong);
    color: var(--tb-text);
    transform: translateY(-50%) scale(1.1);
  }

  /* ─── Search Results ─────────────────────────────────────────────── */
  .search-results {
    position: absolute; top: calc(100% + 8px); left: 0; right: 0;
    background: var(--tb-dropdown-bg);
    border: 1px solid var(--tb-dropdown-border);
    border-radius: 14px;
    box-shadow: var(--tb-shadow-dropdown);
    overflow: hidden; z-index: 1000;
    animation: tb-slide-down 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-height: 380px; overflow-y: auto;
  }
  .search-results::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #10b981);
    z-index: 10;
  }
  .search-results::-webkit-scrollbar { width: 4px; }
  .search-results::-webkit-scrollbar-track { background: transparent; }
  .search-results::-webkit-scrollbar-thumb { background: var(--tb-border-strong); border-radius: 2px; }

  .search-category-label {
    padding: 10px 16px 4px;
    font-size: 9px; font-weight: 800; color: var(--tb-muted);
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .search-result-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; cursor: pointer;
    font-size: 13px; font-weight: 500; color: var(--tb-text-secondary);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0;
    position: relative;
  }
  .search-result-item::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 0;
    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
    transition: width 0.15s ease;
  }
  .search-result-item:hover, .search-result-item.active-result {
    background: var(--tb-hover);
    color: var(--tb-text);
    padding-left: 20px;
  }
  .search-result-item:hover::before, .search-result-item.active-result::before {
    width: 4px;
  }
  .search-result-item.active-result .sr-icon-wrap {
    background: var(--tb-accent-soft);
    border-color: rgba(59,130,246,0.25);
    transform: scale(1.05);
  }
  .sr-icon-wrap {
    width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
    background: var(--tb-hover); border: 1px solid var(--tb-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; transition: all 0.2s ease;
  }
  .sr-label { flex: 1; }
  .sr-arrow { font-size: 10px; color: var(--tb-muted); opacity: 0; transition: opacity 0.15s, transform 0.15s; }
  .search-result-item:hover .sr-arrow, .search-result-item.active-result .sr-arrow { opacity: 1; transform: translateX(2px); }
  .search-no-result {
    padding: 24px 14px; text-align: center; font-size: 13px; color: var(--tb-muted);
  }
  .search-no-result-emoji { font-size: 28px; display: block; margin-bottom: 6px; }

  /* ─── Spacer ──────────────────────────────────────────────────────── */
  .topbar-spacer { flex: 1; }

  /* ─── Live Clock ─────────────────────────────────────────────────── */
  .tb-clock-chip {
    display: flex; flex-direction: column; align-items: flex-end;
    margin-right: 14px; line-height: 1.25; flex-shrink: 0; user-select: none;
  }
  .tb-clock-time {
    font-size: 12.5px; font-weight: 700; color: var(--tb-text);
    font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
  }
  .tb-clock-date {
    font-size: 9.5px; font-weight: 600; color: var(--tb-muted);
    white-space: nowrap; letter-spacing: 0.02em;
  }

  /* ─── Action Buttons ──────────────────────────────────────────────── */
  .topbar-actions {
    display: flex; align-items: center; gap: 2px;
  }
  .tb-btn {
    width: 36px; height: 36px; border-radius: 10px;
    background: none; border: 1px solid transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    color: var(--tb-text-secondary); position: relative;
    flex-shrink: 0;
  }
  .tb-btn:hover {
    background: var(--tb-hover-strong);
    border-color: var(--tb-border);
    color: var(--tb-text);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  .tb-btn:active { transform: translateY(0); box-shadow: none; }

  /* ─── Notification Badge ──────────────────────────────────────────── */
  .tb-notif-badge {
    position: absolute; top: 5px; right: 5px;
    width: 8px; height: 8px; border-radius: 50%;
    background: #EF4444; border: 2px solid var(--tb-bg);
    animation: tb-badge-pop 0.3s cubic-bezier(0.4,0,0.2,1), notif-ripple 2s ease-out 0.5s infinite;
  }

  /* ─── Divider ─────────────────────────────────────────────────────── */
  .tb-divider {
    width: 1px; height: 20px;
    background: var(--tb-border-strong);
    margin: 0 6px; flex-shrink: 0;
  }

  /* ─── Profile Pill ───────────────────────────────────────────────── */
  .tb-profile-btn {
    display: flex; align-items: center; gap: 9px;
    padding: 4px 10px 4px 4px;
    border-radius: 12px; cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
    background: none; flex-shrink: 0;
  }
  .tb-profile-btn:hover {
    background: var(--tb-hover-strong);
    border-color: var(--tb-border);
    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
  }
  .tb-avatar {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    background: var(--tb-gradient-avatar);
    display: flex; align-items: center; justify-content: center;
    font-size: 11.5px; font-weight: 800; color: #fff;
    box-shadow: 0 3px 8px rgba(59,130,246,0.4);
    letter-spacing: 0.03em;
  }
  .tb-profile-info { text-align: left; }
  .tb-profile-name {
    font-size: 12.5px; font-weight: 700;
    color: var(--tb-text); line-height: 1.25;
    max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .tb-profile-role { font-size: 10px; color: var(--tb-muted); font-weight: 500; }
  .tb-chevron {
    font-size: 9px; color: var(--tb-muted);
    transition: transform 0.2s ease;
  }
  .tb-chevron.open { transform: rotate(180deg); }

  /* ─── Profile Dropdown ───────────────────────────────────────────── */
  .tb-profile-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    min-width: 260px;
    background: var(--tb-dropdown-bg);
    border: 1px solid var(--tb-dropdown-border);
    border-radius: 16px;
    box-shadow: var(--tb-shadow-dropdown);
    z-index: 999; overflow: hidden;
    animation: tb-slide-down 0.18s cubic-bezier(0.4,0,0.2,1);
  }
  .tb-pd-header {
    padding: 16px;
    background: var(--tb-gradient-profile-hdr);
    display: flex; align-items: center; gap: 12px;
    position: relative; overflow: hidden;
  }
  .tb-pd-header::before {
    content: ''; position: absolute; top: -20px; right: -20px;
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(255,255,255,0.05);
    pointer-events: none;
  }
  .tb-pd-avatar {
    width: 46px; height: 46px; border-radius: 13px;
    background: var(--tb-gradient-avatar);
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; font-weight: 800; color: #fff;
    border: 2px solid rgba(255,255,255,0.2);
    box-shadow: 0 6px 20px rgba(59,130,246,0.35);
    flex-shrink: 0; position: relative;
  }
  .tb-pd-avatar-dot {
    position: absolute; bottom: -2px; right: -2px;
    width: 12px; height: 12px; border-radius: 50%;
    background: #10B981; border: 2px solid var(--tb-dropdown-bg);
    animation: tb-pulse-dot 2.5s ease-in-out infinite;
  }
  .tb-pd-info { flex: 1; min-width: 0; }
  .tb-pd-name   { font-size: 14px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tb-pd-email  { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tb-pd-badges { display: flex; gap: 5px; margin-top: 7px; flex-wrap: wrap; }
  .tb-pd-badge  {
    font-size: 9.5px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
    background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9);
    border: 1px solid rgba(255,255,255,0.18);
    white-space: nowrap;
  }
  .tb-pd-badge.role   { background: rgba(251,191,36,0.25);   color: #FDE68A;  border-color: rgba(251,191,36,0.35); }
  .tb-pd-badge.status { background: rgba(16,185,129,0.25);   color: #6EE7B7;  border-color: rgba(16,185,129,0.35); }

  .tb-pd-meta {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    border-bottom: 1px solid var(--tb-border);
  }
  .tb-pd-meta-item {
    padding: 10px 12px; text-align: center;
    border-right: 1px solid var(--tb-border);
  }
  .tb-pd-meta-item:last-child { border-right: none; }
  .tb-pd-meta-label {
    font-size: 8.5px; font-weight: 800; color: var(--tb-muted);
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .tb-pd-meta-val   { font-size: 12.5px; font-weight: 800; color: var(--tb-text); margin-top: 2px; }

  .tb-pd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px; cursor: pointer;
    transition: background 0.14s, color 0.14s;
  }
  .tb-pd-item:hover { background: var(--tb-hover-strong); }
  .tb-pd-item.danger { color: var(--tb-red); }
  .tb-pd-item.danger:hover { background: var(--tb-red-soft); }
  .tb-pd-item-icon {
    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
    background: var(--tb-hover); border: 1px solid var(--tb-border);
    display: flex; align-items: center; justify-content: center; font-size: 15px;
    transition: all 0.15s;
  }
  .tb-pd-item:hover .tb-pd-item-icon { background: var(--tb-accent-soft); border-color: rgba(59,130,246,0.2); }
  .tb-pd-item.danger:hover .tb-pd-item-icon { background: var(--tb-red-soft); border-color: rgba(239,68,68,0.2); }
  .tb-pd-item-info { flex: 1; }
  .tb-pd-item-title { font-size: 13px; font-weight: 600; color: var(--tb-text); }
  .tb-pd-item.danger .tb-pd-item-title { color: var(--tb-red); }
  .tb-pd-item-sub   { font-size: 11px; color: var(--tb-muted); font-weight: 400; margin-top: 1px; }
  .tb-pd-item-arrow { font-size: 11px; color: var(--tb-muted); opacity: 0; transition: opacity 0.12s, transform 0.12s; }
  .tb-pd-item:hover .tb-pd-item-arrow { opacity: 1; transform: translateX(2px); }
  .tb-pd-sep { height: 1px; background: var(--tb-border); margin: 2px 0; }

  /* ─── Notification Dropdown ──────────────────────────────────────── */
  .tb-notif-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    width: 340px;
    background: var(--tb-dropdown-bg);
    border: 1px solid var(--tb-dropdown-border);
    border-radius: 16px;
    box-shadow: var(--tb-shadow-dropdown);
    z-index: 999; overflow: hidden;
    animation: tb-slide-down 0.18s cubic-bezier(0.4,0,0.2,1);
  }
  .tb-notif-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--tb-border);
  }
  .tb-notif-hdr-left { display: flex; align-items: center; gap: 8px; }
  .tb-notif-hdr-icon { font-size: 16px; }
  .tb-notif-hdr-title { font-size: 13.5px; font-weight: 800; color: var(--tb-text); }
  .tb-notif-count {
    font-size: 10px; font-weight: 800; padding: 2px 8px;
    background: var(--tb-red-soft); color: var(--tb-red);
    border: 1px solid rgba(239,68,68,0.2); border-radius: 10px;
  }
  .tb-notif-mark-all {
    font-size: 11px; font-weight: 600; color: var(--tb-accent);
    cursor: pointer; background: none; border: none; padding: 0;
    font-family: 'Inter', sans-serif;
    transition: opacity 0.15s;
  }
  .tb-notif-mark-all:hover { opacity: 0.7; }
  .tb-notif-list { max-height: 340px; overflow-y: auto; }
  .tb-notif-list::-webkit-scrollbar { width: 3px; }
  .tb-notif-list::-webkit-scrollbar-track { background: transparent; }
  .tb-notif-list::-webkit-scrollbar-thumb { background: var(--tb-border-strong); border-radius: 2px; }
  .tb-notif-empty {
    padding: 32px 16px; text-align: center;
    font-size: 13px; color: var(--tb-muted);
  }
  .tb-notif-empty-icon { font-size: 32px; display: block; margin-bottom: 8px; }
  .tb-notif-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 11px 14px;
    border-bottom: 1px solid var(--tb-border);
    cursor: pointer; transition: background 0.12s;
    position: relative;
  }
  .tb-notif-item:last-child { border-bottom: none; }
  .tb-notif-item:hover { background: var(--tb-hover); }
  .tb-notif-item.unread::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--tb-accent); border-radius: 0 2px 2px 0;
  }
  .tb-notif-item-icon {
    width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
    background: var(--tb-green-soft); border: 1px solid rgba(16,185,129,0.15);
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .tb-notif-item-body { flex: 1; min-width: 0; }
  .tb-notif-item-title { font-size: 12.5px; font-weight: 700; color: var(--tb-text); }
  .tb-notif-item-sub   { font-size: 11px; color: var(--tb-muted); margin-top: 2px; line-height: 1.4; }
  .tb-notif-item-time  {
    font-size: 9.5px; color: var(--tb-muted); margin-top: 4px; opacity: 0.75;
    font-family: 'JetBrains Mono', monospace;
  }
  .tb-notif-footer {
    padding: 10px 14px; text-align: center;
    font-size: 12px; font-weight: 700; color: var(--tb-accent);
    border-top: 1px solid var(--tb-border);
    cursor: pointer; transition: background 0.12s;
  }
  .tb-notif-footer:hover { background: var(--tb-accent-soft); }

  /* ─── Profile Modal Overlay ──────────────────────────────────────── */
  .profile-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    z-index: 2000; display: flex; align-items: center; justify-content: center;
    animation: overlay-in 0.2s ease;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* ─── Profile Modal ──────────────────────────────────────────────── */
  .profile-modal {
    width: 900px; max-width: 95vw; max-height: 92vh;
    background: var(--tb-modal-bg);
    border-radius: 22px; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: var(--tb-shadow-modal);
    border: 1px solid var(--tb-border-strong);
    animation: modal-pop 0.22s cubic-bezier(0.4,0,0.2,1);
    font-family: 'Inter', sans-serif;
  }

  .pm-header {
    background: var(--tb-gradient-profile-hdr);
    padding: 26px 28px 0;
    flex-shrink: 0; position: relative; overflow: hidden;
  }
  .pm-header::before {
    content: ''; position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(255,255,255,0.04); pointer-events: none;
  }
  .pm-header::after {
    content: ''; position: absolute;
    bottom: 0; left: 0; right: 0; height: 1px;
    background: rgba(255,255,255,0.1); pointer-events: none;
  }
  .pm-header-top {
    display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;
  }
  .pm-header-left { display: flex; align-items: center; gap: 18px; }
  .pm-avatar-wrap { position: relative; }
  .pm-avatar {
    width: 76px; height: 76px; border-radius: 20px;
    background: var(--tb-gradient-avatar);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 900; color: #fff;
    border: 3px solid rgba(255,255,255,0.2);
    box-shadow: 0 10px 30px rgba(59,130,246,0.5);
    letter-spacing: 0.03em;
  }
  .pm-avatar-dot {
    position: absolute; bottom: 2px; right: 2px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #10B981; border: 2.5px solid #1E3A5F;
    animation: tb-pulse-dot 2.5s ease-in-out infinite;
  }
  .pm-name   { font-size: 24px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
  .pm-meta   { display: flex; align-items: center; gap: 12px; margin-top: 6px; font-size: 12px; color: rgba(255,255,255,0.6); flex-wrap: wrap; }
  .pm-meta-item { display: flex; align-items: center; gap: 5px; }
  .pm-meta-sep   { color: rgba(255,255,255,0.3); }
  .pm-badges { display: flex; gap: 7px; margin-top: 9px; flex-wrap: wrap; }
  .pm-badge  {
    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .pm-badge.admin  { background: rgba(251,191,36,0.2);  color: #FDE68A; border-color: rgba(251,191,36,0.35); }
  .pm-badge.active { background: rgba(16,185,129,0.2);  color: #6EE7B7; border-color: rgba(16,185,129,0.35); }
  .pm-close {
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
    border-radius: 11px; width: 36px; height: 36px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: rgba(255,255,255,0.65);
    transition: all 0.15s; flex-shrink: 0;
  }
  .pm-close:hover { background: rgba(255,255,255,0.18); color: #fff; transform: scale(1.05); }

  /* ─── Modal Tabs ──────────────────────────────────────────────────── */
  .pm-tabs { display: flex; gap: 0; margin-top: 4px; }
  .pm-tab {
    padding: 11px 20px; font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.5); cursor: pointer;
    border-bottom: 2.5px solid transparent;
    transition: all 0.18s; white-space: nowrap; user-select: none;
  }
  .pm-tab:hover { color: rgba(255,255,255,0.8); }
  .pm-tab.active { color: #fff; border-bottom-color: #fff; }

  /* ─── Modal Body ──────────────────────────────────────────────────── */
  .pm-body {
    flex: 1; overflow-y: auto; padding: 24px 28px;
    background: var(--tb-modal-body);
  }
  .pm-body::-webkit-scrollbar { width: 5px; }
  .pm-body::-webkit-scrollbar-track { background: transparent; }
  .pm-body::-webkit-scrollbar-thumb { background: var(--tb-border-strong); border-radius: 3px; }

  /* ─── Section Card ────────────────────────────────────────────────── */
  .pm-section {
    background: var(--tb-modal-section);
    border: 1px solid var(--tb-border);
    border-radius: 16px; margin-bottom: 20px; overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .pm-section:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .pm-section-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid var(--tb-border);
    background: var(--tb-hover);
  }
  .pm-section-hdr-left { display: flex; align-items: center; gap: 10px; }
  .pm-section-icon-badge {
    width: 30px; height: 30px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; font-size: 15px;
    flex-shrink: 0;
  }
  .pm-section-title {
    font-size: 12px; font-weight: 800; color: var(--tb-text);
    text-transform: uppercase; letter-spacing: 0.08em;
  }

  /* ─── Edit / Save / Cancel buttons ──────────────────────────────── */
  .pm-action-btns { display: flex; gap: 7px; align-items: center; }
  .pm-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 13px; border-radius: 9px;
    font-family: 'Inter', sans-serif;
    font-size: 12px; font-weight: 700; cursor: pointer;
    border: 1.5px solid transparent;
    transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    white-space: nowrap; user-select: none;
  }
  .pm-btn-edit {
    background: var(--tb-hover); border-color: var(--tb-border);
    color: var(--tb-accent);
  }
  .pm-btn-edit:hover { background: var(--tb-accent-soft); border-color: var(--tb-accent); transform: translateY(-1px); }
  .pm-btn-save {
    background: var(--tb-green-soft); border-color: var(--tb-green);
    color: var(--tb-green);
  }
  .pm-btn-save:hover { background: rgba(16,185,129,0.25); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.2); }
  .pm-btn-save:disabled {
    opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none;
  }
  .pm-btn-cancel {
    background: var(--tb-red-soft); border-color: rgba(239,68,68,0.3);
    color: var(--tb-red);
  }
  .pm-btn-cancel:hover { background: rgba(239,68,68,0.18); border-color: var(--tb-red); transform: translateY(-1px); }

  /* saving spinner */
  .pm-btn-spinner {
    display: inline-block; width: 12px; height: 12px;
    border: 2px solid rgba(16,185,129,0.3); border-top-color: var(--tb-green);
    border-radius: 50%; animation: tb-spin 0.6s linear infinite;
  }

  /* ─── Save Success Toast ─────────────────────────────────────────── */
  .pm-save-toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: var(--tb-modal-section); border: 1.5px solid var(--tb-green);
    border-radius: 12px; padding: 10px 20px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 32px rgba(16,185,129,0.25);
    z-index: 3000;
    animation: tb-slide-up 0.2s cubic-bezier(0.4,0,0.2,1);
    font-size: 13px; font-weight: 700; color: var(--tb-green);
    font-family: 'Inter', sans-serif;
  }

  /* ─── Fields Grid ─────────────────────────────────────────────────── */
  .pm-fields {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px;
    background: var(--tb-border);
  }
  .pm-field {
    padding: 14px 18px;
    background: var(--tb-modal-section);
    transition: background 0.15s;
  }
  .pm-field:hover { background: var(--tb-hover); }
  .pm-field-label {
    font-size: 9.5px; font-weight: 800; color: var(--tb-muted);
    text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 5px;
  }
  .pm-field-value { font-size: 14px; font-weight: 600; color: var(--tb-text); }
  .pm-field-empty { color: var(--tb-muted); font-weight: 400; }

  /* ─── Edit Inputs ─────────────────────────────────────────────────── */
  .pm-input {
    width: 100%; padding: 7px 11px;
    background: var(--tb-input-bg);
    border: 1.5px solid var(--tb-border);
    border-radius: 9px;
    font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--tb-text); outline: none;
    transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    box-sizing: border-box;
  }
  .pm-input:focus {
    border-color: var(--tb-accent);
    box-shadow: 0 0 0 3px var(--tb-accent-soft);
    background: var(--tb-input-focus);
  }
  .pm-input:read-only { opacity: 0.5; cursor: not-allowed; }
  .pm-input::placeholder { color: var(--tb-muted); }

  /* ─── Language Translate Dropdown ──────────────────────────────────── */
  .tb-lang-btn {
    display:flex; align-items:center; gap:5px;
    padding:5px 10px; border-radius:10px;
    background:none; border:1px solid transparent;
    cursor:pointer; color:var(--tb-text-secondary);
    font-family:'Inter',sans-serif; font-size:12.5px; font-weight:700;
    transition:all 0.18s cubic-bezier(0.4,0,0.2,1);
    flex-shrink:0; height:36px;
  }
  .tb-lang-btn:hover {
    background:var(--tb-hover-strong); border-color:var(--tb-border);
    color:var(--tb-text); transform:translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  .tb-lang-btn.active-lang {
    background:var(--tb-accent-soft); border-color:var(--tb-accent);
    color:var(--tb-accent);
  }
  .tb-lang-btn .tb-lang-flag { font-size:17px; line-height:1; }
  .tb-lang-btn .tb-lang-label { font-size:11px; letter-spacing:0.01em; }
  .tb-lang-btn .tb-lang-chevron {
    font-size:8px; color:var(--tb-muted); transition:transform 0.2s;
  }
  .tb-lang-btn .tb-lang-chevron.open { transform:rotate(180deg); }
  @media (max-width: 768px) { .tb-lang-btn .tb-lang-label { display:none; } }

  .tb-translate-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    min-width: 280px; max-height: 420px;
    background: var(--tb-dropdown-bg);
    border: 1px solid var(--tb-dropdown-border);
    border-radius: 16px;
    box-shadow: var(--tb-shadow-dropdown);
    z-index: 999; overflow: hidden;
    animation: tb-slide-down 0.18s cubic-bezier(0.4,0,0.2,1);
    display:flex; flex-direction:column;
  }
  .tb-translate-dropdown::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #10b981);
    z-index: 10;
  }
  .tb-translate-header {
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--tb-border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .tb-translate-header-left {
    display: flex; align-items: center; gap: 8px;
  }
  .tb-translate-header-icon { font-size: 18px; }
  .tb-translate-header-title {
    font-size: 13.5px; font-weight: 800; color: var(--tb-text);
  }
  .tb-translate-reset {
    font-size: 11px; font-weight: 600; color: var(--tb-accent);
    cursor: pointer; background: none; border: none; padding: 4px 8px;
    border-radius: 6px; font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }
  .tb-translate-reset:hover { background: var(--tb-accent-soft); }

  .tb-translate-search-wrap {
    padding: 8px 12px;
    border-bottom: 1px solid var(--tb-border);
  }
  .tb-translate-search {
    width: 100%; height: 32px; border-radius: 8px;
    background: var(--tb-input-bg); border: 1px solid var(--tb-border);
    padding: 0 10px;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
    color: var(--tb-text); outline: none;
    transition: all 0.2s; box-sizing: border-box;
  }
  .tb-translate-search:focus {
    border-color: var(--tb-accent); background: var(--tb-input-focus);
    box-shadow: 0 0 0 3px var(--tb-accent-soft);
  }
  .tb-translate-search::placeholder { color: var(--tb-muted); }

  .tb-translate-list {
    overflow-y: auto; max-height: 300px; padding: 4px 0;
  }
  .tb-translate-list::-webkit-scrollbar { width: 3px; }
  .tb-translate-list::-webkit-scrollbar-track { background: transparent; }
  .tb-translate-list::-webkit-scrollbar-thumb { background: var(--tb-border-strong); border-radius: 2px; }

  .tb-translate-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; cursor: pointer;
    font-size: 13px; font-weight: 500; color: var(--tb-text-secondary);
    transition: all 0.15s; position: relative;
  }
  .tb-translate-item::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 0;
    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
    transition: width 0.15s ease;
  }
  .tb-translate-item:hover {
    background: var(--tb-hover); color: var(--tb-text);
    padding-left: 18px;
  }
  .tb-translate-item:hover::before { width: 3px; }
  .tb-translate-item.selected {
    background: var(--tb-accent-soft); color: var(--tb-accent); font-weight: 700;
  }
  .tb-translate-item.selected::before { width: 3px; }
  .tb-translate-item-flag { font-size: 18px; flex-shrink: 0; }
  .tb-translate-item-info { flex: 1; display: flex; flex-direction: column; }
  .tb-translate-item-name { font-size: 13px; line-height: 1.3; }
  .tb-translate-item-native { font-size: 10.5px; color: var(--tb-muted); font-weight: 400; }
  .tb-translate-item-check {
    font-size: 14px; color: var(--tb-accent); opacity: 0;
    transition: opacity 0.15s;
  }
  .tb-translate-item.selected .tb-translate-item-check { opacity: 1; }

  .tb-translate-footer {
    padding: 8px 14px; border-top: 1px solid var(--tb-border);
    display: flex; align-items: center; justify-content: center;
    font-size: 10.5px; color: var(--tb-muted); gap: 4px;
  }
  .tb-translate-footer span { font-size: 12px; }
`;

// ── Language Data for Full-Page Translation ──────────────────────
const TRANSLATE_LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "zh-CN", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", native: "اردو", flag: "🇵🇰" },
  { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "th", name: "Thai", native: "ไทย", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "nl", name: "Dutch", native: "Nederlands", flag: "🇳🇱" },
];

// Helper: trigger Google Translate to change the page language
function triggerGoogleTranslate(langCode) {
  // Set the Google Translate cookie (persists on reload)
  const domain = window.location.hostname;
  document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
  document.cookie = `googtrans=/en/${langCode}; path=/`;

  // Retry until .goog-te-combo is available (widget may take ~500ms to init)
  const trySelect = (attempt = 0) => {
    const sel = document.querySelector('.goog-te-combo');
    if (sel) {
      sel.value = langCode;
      sel.dispatchEvent(new Event('change'));
    } else if (attempt < 10) {
      setTimeout(() => trySelect(attempt + 1), 100);
    } else {
      // Last resort if widget never loaded
      window.location.reload();
    }
  };
  trySelect();
}

function resetGoogleTranslate() {
  // Remove Google Translate cookies
  const domain = window.location.hostname;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

  // Try to reset via the select element
  const sel = document.querySelector('.goog-te-combo');
  if (sel) {
    sel.value = 'en';
    sel.dispatchEvent(new Event('change'));
    return; // Don't reload if select worked
  }
  // Try the restore button in the banner frame
  const frame = document.querySelector('.goog-te-banner-frame');
  if (frame) {
    const btn = frame.contentDocument?.querySelector('.goog-close-link');
    if (btn) { btn.click(); return; }
  }
  // Last resort: reload
  setTimeout(() => window.location.reload(), 100);
}

function getCurrentGoogleTranslateLang() {
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? match[1] : 'en';
}

// ── Translate Dropdown (shown inline in topbar) ───────────────────
function TranslateDropdown({ onClose }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentLang, setCurrentLang] = React.useState(() => getCurrentGoogleTranslateLang());
  const searchInputRef = React.useRef(null);

  React.useEffect(() => {
    // Auto-focus search input when dropdown opens
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const filtered = searchTerm.trim()
    ? TRANSLATE_LANGUAGES.filter(l =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.native.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : TRANSLATE_LANGUAGES;

  const handleSelectLang = (lang) => {
    if (lang.code === "en") {
      resetGoogleTranslate();
    } else {
      triggerGoogleTranslate(lang.code);
    }
    setCurrentLang(lang.code);
    onClose();
  };

  const handleReset = () => {
    resetGoogleTranslate();
    setCurrentLang("en");
    onClose();
  };

  return (
    <div className="tb-translate-dropdown">
      {/* Header */}
      <div className="tb-translate-header">
        <div className="tb-translate-header-left">
          <span className="tb-translate-header-icon">🌐</span>
          <span className="tb-translate-header-title">Translate Page</span>
        </div>
        {currentLang !== "en" && (
          <button className="tb-translate-reset" onClick={handleReset}>
            Reset to English
          </button>
        )}
      </div>

      {/* Search */}
      <div className="tb-translate-search-wrap">
        <input
          ref={searchInputRef}
          className="tb-translate-search"
          placeholder="Search languages…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Language List */}
      <div className="tb-translate-list">
        {filtered.length === 0 ? (
          <div style={{ padding: "20px 14px", textAlign: "center", fontSize: "13px", color: "var(--tb-muted)" }}>
            <span style={{ fontSize: "24px", display: "block", marginBottom: "6px" }}>🔭</span>
            No language found for "{searchTerm}"
          </div>
        ) : (
          filtered.map(lang => (
            <div
              key={lang.code}
              className={`tb-translate-item${currentLang === lang.code ? " selected" : ""}`}
              onClick={() => handleSelectLang(lang)}
            >
              <span className="tb-translate-item-flag">{lang.flag}</span>
              <div className="tb-translate-item-info">
                <span className="tb-translate-item-name">{lang.name}</span>
                <span className="tb-translate-item-native">{lang.native}</span>
              </div>
              <span className="tb-translate-item-check">✓</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="tb-translate-footer">
        <span>🌐</span> Powered by Google Translate · {TRANSLATE_LANGUAGES.length} languages
      </div>
    </div>
  );
}


function TextTranslatorModal({ onClose }) {
  const [inputText, setInputText] = React.useState("");
  const [outputText, setOutputText] = React.useState("");
  const [status, setStatus] = React.useState(null); // null | 'loading' | 'ok' | 'error'
  const [errMsg, setErrMsg] = React.useState("");
  const [srcDdOpen, setSrcDdOpen] = React.useState(false);
  const [tgtDdOpen, setTgtDdOpen] = React.useState(false);
  const srcDdRef = React.useRef(null);
  const tgtDdRef = React.useRef(null);
  const debounceRef = React.useRef(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const h = (e) => {
      if (srcDdRef.current && !srcDdRef.current.contains(e.target)) setSrcDdOpen(false);
      if (tgtDdRef.current && !tgtDdRef.current.contains(e.target)) setTgtDdOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Auto-translate with debounce
  React.useEffect(() => {
    if (!inputText.trim()) { setOutputText(""); setStatus(null); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doTranslate(inputText), 700);
    return () => clearTimeout(debounceRef.current);
  }, [inputText, srcLang, tgtLang]);

  const doTranslate = async (text) => {
    if (!text.trim()) return;
    setStatus("loading"); setErrMsg("");
    try {
      const langPair = `${srcLang.code}|${tgtLang.code}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.responseStatus === 200) {
        setOutputText(data.responseData.translatedText);
        setStatus("ok");
      } else {
        setErrMsg(data.responseDetails || "Translation failed");
        setStatus("error");
      }
    } catch (e) {
      setErrMsg("Network error — please check your connection.");
      setStatus("error");
    }
  };

  const swapLangs = () => {
    const tmp = srcLang;
    setSrcLang(tgtLang);
    setTgtLang(tmp);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const copyOutput = () => {
    if (outputText) { navigator.clipboard.writeText(outputText); }
  };

  const clearAll = () => {
    setInputText(""); setOutputText(""); setStatus(null); setErrMsg("");
  };

  return (
    <div className="tl-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tl-modal">

        {/* ── Header ── */}
        <div className="tl-header">
          <div className="tl-header-row">
            <div className="tl-header-left">
              <div className="tl-header-icon">🌐</div>
              <div>
                <div className="tl-header-title">Language Translator</div>
                <div className="tl-header-sub">Powered by MyMemory · {LANGUAGES.length} languages supported</div>
              </div>
            </div>
            <button className="tl-close" onClick={onClose}>✕</button>
          </div>

          {/* Language pills (all supported langs shown as tabs) */}
          <div className="tl-lang-bar">
            {LANGUAGES.map(l => (
              <div
                key={l.code}
                className={`tl-lang-pill${tgtLang.code === l.code ? " active" : ""}`}
                onClick={() => { setTgtLang(l); if (srcLang.code === l.code) setSrcLang(LANGUAGES.find(x => x.code !== l.code)); }}
              >
                <span className="tl-flag">{l.flag}</span>
                {l.name}
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Phrase Chips ── */}
        <div className="tl-quick-chips">
          <span className="tl-chip-label">Quick</span>
          {QUICK_PHRASES.map(p => (
            <div
              key={p}
              className={`tl-chip${inputText === p ? " active" : ""}`}
              onClick={() => setInputText(p)}
            >
              {p}
            </div>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="tl-body">

          {/* Language selector strip */}
          <div className="tl-lang-strip">
            {/* Source language selector */}
            <div className="tl-lang-select-group" ref={srcDdRef} style={{ position: "relative" }}>
              {LANGUAGES.slice(0, 4).map(l => (
                <button
                  key={l.code}
                  className={`tl-lang-select-btn${srcLang.code === l.code ? " active" : ""}`}
                  onClick={() => { setSrcLang(l); setSrcDdOpen(false); }}
                >
                  <span className="tl-flag">{l.flag}</span>
                  {l.name}
                </button>
              ))}
              <button
                className={`tl-lang-select-btn${!LANGUAGES.slice(0, 4).find(l => l.code === srcLang.code) ? " active" : ""}`}
                onClick={() => setSrcDdOpen(o => !o)}
                style={{ gap: 4 }}
              >
                {!LANGUAGES.slice(0, 4).find(l => l.code === srcLang.code)
                  ? <><span className="tl-flag">{srcLang.flag}</span>{srcLang.name}</>
                  : <>More ▾</>}
              </button>
              {srcDdOpen && (
                <div className="tl-lang-dd" style={{ top: "100%", left: 0 }}>
                  {LANGUAGES.map(l => (
                    <div
                      key={l.code}
                      className={`tl-lang-dd-item${srcLang.code === l.code ? " selected" : ""}`}
                      onClick={() => { setSrcLang(l); setSrcDdOpen(false); if (tgtLang.code === l.code) setTgtLang(LANGUAGES.find(x => x.code !== l.code)); }}
                    >
                      <span className="tl-lang-dd-flag">{l.flag}</span>
                      <span>{l.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: "11px", opacity: 0.55 }}>{l.native}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap button */}
            <button className="tl-swap-btn" title="Swap languages" onClick={swapLangs}>⇄</button>

            {/* Target language selector */}
            <div className="tl-lang-select-group" ref={tgtDdRef} style={{ position: "relative" }}>
              {LANGUAGES.slice(0, 4).map(l => (
                <button
                  key={l.code}
                  className={`tl-lang-select-btn${tgtLang.code === l.code ? " active" : ""}`}
                  onClick={() => { setTgtLang(l); setTgtDdOpen(false); }}
                >
                  <span className="tl-flag">{l.flag}</span>
                  {l.name}
                </button>
              ))}
              <button
                className={`tl-lang-select-btn${!LANGUAGES.slice(0, 4).find(l => l.code === tgtLang.code) ? " active" : ""}`}
                onClick={() => setTgtDdOpen(o => !o)}
                style={{ gap: 4 }}
              >
                {!LANGUAGES.slice(0, 4).find(l => l.code === tgtLang.code)
                  ? <><span className="tl-flag">{tgtLang.flag}</span>{tgtLang.name}</>
                  : <>More ▾</>}
              </button>
              {tgtDdOpen && (
                <div className="tl-lang-dd" style={{ top: "100%", right: 0, left: "auto" }}>
                  {LANGUAGES.map(l => (
                    <div
                      key={l.code}
                      className={`tl-lang-dd-item${tgtLang.code === l.code ? " selected" : ""}`}
                      onClick={() => { setTgtLang(l); setTgtDdOpen(false); if (srcLang.code === l.code) setSrcLang(LANGUAGES.find(x => x.code !== l.code)); }}
                    >
                      <span className="tl-lang-dd-flag">{l.flag}</span>
                      <span>{l.name}</span>
                      <span style={{ marginLeft: "auto", fontSize: "11px", opacity: 0.55 }}>{l.native}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Text panels */}
          <div className="tl-panels">
            {/* Input panel */}
            <div className="tl-panel">
              <div className="tl-panel-label">
                <span>{srcLang.flag} {srcLang.name}</span>
                <span className="tl-char-count">{inputText.length} / 500</span>
              </div>
              <textarea
                className="tl-textarea"
                placeholder={`Type or paste text in ${srcLang.name}…`}
                value={inputText}
                maxLength={500}
                onChange={e => setInputText(e.target.value)}
                autoFocus
              />
              <div className="tl-panel-footer">
                <button className="tl-action-btn" onClick={clearAll} title="Clear">🗑 Clear</button>
                <button
                  className="tl-action-btn primary"
                  disabled={!inputText.trim() || status === "loading"}
                  onClick={() => doTranslate(inputText)}
                >
                  {status === "loading" ? <><span className="tl-spinner" /> Translating…</> : <>🌐 Translate</>}
                </button>
              </div>
            </div>

            {/* Output panel */}
            <div className="tl-panel">
              <div className="tl-panel-label">
                <span>{tgtLang.flag} {tgtLang.name}</span>
                {outputText && <span className="tl-char-count">{outputText.length} chars</span>}
              </div>
              <div className="tl-output">
                {status === "loading" ? (
                  <span className="tl-output-placeholder">Translating…</span>
                ) : outputText ? (
                  outputText
                ) : (
                  <span className="tl-output-placeholder">Translation will appear here</span>
                )}
              </div>
              <div className="tl-panel-footer">
                <button className="tl-action-btn" onClick={copyOutput} title="Copy translation" disabled={!outputText}>📋 Copy</button>
                <button className="tl-action-btn" onClick={swapLangs} title="Swap & use translation">⇄ Swap</button>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="tl-status-bar">
            <span>
              {status === null && <span>Ready to translate · MyMemory API</span>}
              {status === "loading" && <span className="tl-status-loading"><span className="tl-spinner" /> Translating from {srcLang.name} → {tgtLang.name}…</span>}
              {status === "ok" && <span className="tl-status-ok">✓ Translation complete · {srcLang.name} → {tgtLang.name}</span>}
              {status === "error" && <span className="tl-status-err">✕ {errMsg}</span>}
            </span>
            <span style={{ display: "flex", gap: 12 }}>
              {LANGUAGES.map(l => (
                <span key={l.code} title={l.name} style={{ fontSize: 16, cursor: "pointer", opacity: tgtLang.code === l.code ? 1 : 0.35, transition: "opacity 0.15s" }}
                  onClick={() => setTgtLang(l)}
                >
                  {l.flag}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Save Toast ─────────────────────────────────────────────────────
function SaveToast({ message }) {
  return (
    <div className="pm-save-toast">
      <span>✅</span>
      <span>{message}</span>
    </div>
  );
}

// ── My Profile Modal ───────────────────────────────────────────────
function ProfileModal({ user, onClose }) {
  const username = user?.username || "User";
  const rawRole = Array.isArray(user?.roles) ? user.roles[0] : user?.roles;
  const roleLabel = rawRole?.replace("ROLE_", "").replace(/_/g, " ") || "Staff";
  const initials = username.slice(0, 2).toUpperCase();

  const [editUser, setEditUser] = React.useState(false);
  const [editAddr, setEditAddr] = React.useState(false);
  const [savingUser, setSavingUser] = React.useState(false);
  const [savingAddr, setSavingAddr] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const [uInfo, setUInfo] = React.useState({
    username, role: roleLabel,
    email: username.toLowerCase() + "@hospital.com",
    title: "", mobile: "", dob: "",
  });
  const [uDraft, setUDraft] = React.useState({ ...uInfo });
  const [addr, setAddr] = React.useState({ street: "", city: "", state: "", zip: "", country: "", region: "" });
  const [addrDraft, setAddrDraft] = React.useState({ ...addr });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const startEditUser = () => { setUDraft({ ...uInfo }); setEditUser(true); };
  const saveUser = async () => {
    setSavingUser(true);
    await new Promise(r => setTimeout(r, 600));
    setUInfo({ ...uDraft }); setEditUser(false); setSavingUser(false);
    showToast("Personal info saved successfully!");
  };
  const cancelUser = () => setEditUser(false);

  const startEditAddr = () => { setAddrDraft({ ...addr }); setEditAddr(true); };
  const saveAddr = async () => {
    setSavingAddr(true);
    await new Promise(r => setTimeout(r, 600));
    setAddr({ ...addrDraft }); setEditAddr(false); setSavingAddr(false);
    showToast("Address information saved!");
  };
  const cancelAddr = () => setEditAddr(false);

  const val = (v) => v || <span className="pm-field-empty">—</span>;

  return (
    <div className="profile-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="profile-modal">

        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-top">
            <div className="pm-header-left">
              <div className="pm-avatar-wrap">
                <div className="pm-avatar">{initials}</div>
                <div className="pm-avatar-dot" />
              </div>
              <div>
                <div className="pm-name">{username}</div>
                <div className="pm-meta">
                  <span className="pm-meta-item">🏥 Hospital Suite</span>
                  <span className="pm-meta-sep">·</span>
                  <span className="pm-meta-item">✉️ {uInfo.email}</span>
                  {uInfo.mobile && <>
                    <span className="pm-meta-sep">·</span>
                    <span className="pm-meta-item">📱 {uInfo.mobile}</span>
                  </>}
                </div>
                <div className="pm-badges">
                  <span className="pm-badge admin">🎖️ {roleLabel}</span>
                  <span className="pm-badge active">🟢 Active</span>
                </div>
              </div>
            </div>
            <button className="pm-close" onClick={onClose}>✕</button>
          </div>
          <div className="pm-tabs">
            <div className="pm-tab active">👤 Profile Settings</div>
          </div>
        </div>

        {/* Body */}
        <div className="pm-body">

          {/* Section 1 — User Information */}
          <div className="pm-section">
            <div className="pm-section-hdr">
              <div className="pm-section-hdr-left">
                <div className="pm-section-icon-badge" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>👤</div>
                <div className="pm-section-title">Personal Information</div>
              </div>
              <div className="pm-action-btns">
                {!editUser
                  ? <button className="pm-btn pm-btn-edit" onClick={startEditUser}>✏️ Edit</button>
                  : <>
                    <button className="pm-btn pm-btn-save" onClick={saveUser} disabled={savingUser}>
                      {savingUser ? <><span className="pm-btn-spinner" />Saving…</> : <>💾 Save Changes</>}
                    </button>
                    <button className="pm-btn pm-btn-cancel" onClick={cancelUser} disabled={savingUser}>✕ Cancel</button>
                  </>
                }
              </div>
            </div>
            {!editUser ? (
              <div className="pm-fields">
                {[
                  ["👤 Username", uInfo.username],
                  ["🎖️ Role", uInfo.role],
                  ["✉️ Email", uInfo.email],
                  ["🏷️ Title", uInfo.title],
                  ["📱 Mobile", uInfo.mobile],
                  ["🎂 Date of Birth", uInfo.dob],
                ].map(([label, v]) => (
                  <div key={label} className="pm-field">
                    <div className="pm-field-label">{label}</div>
                    <div className="pm-field-value">{val(v)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pm-fields">
                <div className="pm-field"><div className="pm-field-label">👤 Username</div><input className="pm-input" value={uDraft.username} onChange={e => setUDraft(d => ({ ...d, username: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">🎖️ Role</div><input className="pm-input" value={uDraft.role} readOnly /></div>
                <div className="pm-field"><div className="pm-field-label">✉️ Email</div><input className="pm-input" type="email" value={uDraft.email} onChange={e => setUDraft(d => ({ ...d, email: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">🏷️ Title</div><input className="pm-input" placeholder="e.g. Dr." value={uDraft.title} onChange={e => setUDraft(d => ({ ...d, title: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">📱 Mobile</div><input className="pm-input" placeholder="+91 XXXXX XXXXX" value={uDraft.mobile} onChange={e => setUDraft(d => ({ ...d, mobile: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">🎂 Date of Birth</div><input className="pm-input" type="date" value={uDraft.dob} onChange={e => setUDraft(d => ({ ...d, dob: e.target.value }))} /></div>
              </div>
            )}
          </div>

          {/* Section 2 — Address Information */}
          <div className="pm-section">
            <div className="pm-section-hdr">
              <div className="pm-section-hdr-left">
                <div className="pm-section-icon-badge" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>📍</div>
                <div className="pm-section-title">Address Information</div>
              </div>
              <div className="pm-action-btns">
                {!editAddr
                  ? <button className="pm-btn pm-btn-edit" onClick={startEditAddr}>✏️ Edit</button>
                  : <>
                    <button className="pm-btn pm-btn-save" onClick={saveAddr} disabled={savingAddr}>
                      {savingAddr ? <><span className="pm-btn-spinner" />Saving…</> : <>💾 Save Changes</>}
                    </button>
                    <button className="pm-btn pm-btn-cancel" onClick={cancelAddr} disabled={savingAddr}>✕ Cancel</button>
                  </>
                }
              </div>
            </div>
            {!editAddr ? (
              <div className="pm-fields">
                {[
                  ["🏠 Street", addr.street], ["🌆 City", addr.city],
                  ["🗺️ State", addr.state], ["📮 Zip Code", addr.zip],
                  ["🌍 Country", addr.country], ["🧭 Region", addr.region],
                ].map(([label, v]) => (
                  <div key={label} className="pm-field">
                    <div className="pm-field-label">{label}</div>
                    <div className="pm-field-value">{val(v)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pm-fields">
                <div className="pm-field"><div className="pm-field-label">🏠 Street</div><input className="pm-input" placeholder="123 Main St" value={addrDraft.street} onChange={e => setAddrDraft(d => ({ ...d, street: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">🌆 City</div><input className="pm-input" placeholder="City" value={addrDraft.city} onChange={e => setAddrDraft(d => ({ ...d, city: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">🗺️ State</div><input className="pm-input" placeholder="State" value={addrDraft.state} onChange={e => setAddrDraft(d => ({ ...d, state: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">📮 Zip Code</div><input className="pm-input" placeholder="000000" value={addrDraft.zip} onChange={e => setAddrDraft(d => ({ ...d, zip: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">🌍 Country</div><input className="pm-input" placeholder="Country" value={addrDraft.country} onChange={e => setAddrDraft(d => ({ ...d, country: e.target.value }))} /></div>
                <div className="pm-field"><div className="pm-field-label">🧭 Region</div><input className="pm-input" placeholder="Region" value={addrDraft.region} onChange={e => setAddrDraft(d => ({ ...d, region: e.target.value }))} /></div>
              </div>
            )}
          </div>

        </div>
      </div>

      {toast && <SaveToast message={toast} />}
    </div>
  );
}

// ── Main Topbar ────────────────────────────────────────────────────
export default function Topbar({ sidebarWidth = 240 }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [search, setSearch] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [activeResult, setActiveResult] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showTranslator, setShowTranslator] = useState(false);
  const translateRef = useRef(null);

  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const inputRef = useRef(null);

  const username = user?.username || "User";
  const initials = username.slice(0, 2).toUpperCase();
  const rawRole = Array.isArray(user?.roles) ? user.roles[0] : user?.roles;
  const roleLabel = rawRole?.replace("ROLE_", "").replace(/_/g, " ") || "Staff";

  const results = search.trim().length > 0
    ? NAV_SEARCH.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  // Group search results by category
  const groupedResults = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault(); inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearch(""); setSearchFocus(false); setProfileOpen(false); setNotifOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSearchKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveResult(r => Math.min(r + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveResult(r => Math.max(r - 1, 0)); }
    if (e.key === "Enter" && results.length > 0) {
      navigate(`/hospital/${results[activeResult].key}`);
      setSearch(""); setSearchFocus(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [profileOpen]);

  useEffect(() => {
    if (!searchFocus) return;
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocus(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [searchFocus]);

  useEffect(() => {
    if (!notifOpen) return;
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  // Close translate dropdown on outside click
  useEffect(() => {
    if (!showTranslator) return;
    const h = (e) => { if (translateRef.current && !translateRef.current.contains(e.target)) setShowTranslator(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showTranslator]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen(); setIsFullscreen(true);
    } else {
      document.exitFullscreen(); setIsFullscreen(false);
    }
  };
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch notifications
  useEffect(() => {
    import("../../api/api").then(mod => {
      const API = mod.default;
      API.get("/hospital/audit/logs").then(r => {
        const logs = (r.data || []).slice(0, 10);
        setNotifications(logs.map(l => ({
          id: l.logId || Math.random(),
          icon: l.action === "CREATE" ? "🆕" : l.action === "UPDATE" ? "✏️" : l.action === "DELETE" ? "🗑️" : "📋",
          title: l.module + " — " + l.action,
          body: l.description || l.details || "System event",
          time: l.actionTime,
          read: false,
        })));
      }).catch(() => {
        setNotifications([{
          id: 1, icon: "🏥", read: false,
          title: "System Online",
          body: "Hospital management system is fully operational.",
          time: new Date().toISOString(),
        }]);
      });
    });
  }, []);

  const doLogout = () => { logout(); navigate("/login"); };
  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <style>{CSS}</style>

      <div
        className="topbar-root"
        style={{ left: sidebarWidth }}
      >
        {/* ── Search ── */}
        <div className={`topbar-search-wrap${search.trim().length > 0 ? " has-text" : ""}`} ref={searchRef}>
          <span className="topbar-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="topbar-search-input"
            placeholder="Search modules, pages…"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveResult(0); }}
            onFocus={() => setSearchFocus(true)}
            onKeyDown={handleSearchKey}
          />
          {search.trim().length > 0 ? (
            <button
              className="topbar-search-clear"
              onClick={() => { setSearch(""); setActiveResult(0); inputRef.current?.focus(); }}
              title="Clear search"
            >
              ✕
            </button>
          ) : (
            <span className="topbar-search-kbd">⌘K</span>
          )}

          {searchFocus && search.trim().length > 0 && (
            <div className="search-results">
              {results.length === 0 ? (
                <div className="search-no-result">
                  <span className="search-no-result-emoji">🔭</span>
                  No results for "{search}"
                </div>
              ) : (
                Object.entries(groupedResults).map(([category, items]) => {
                  const flatIndex = results.indexOf(items[0]);
                  return (
                    <div key={category}>
                      <div className="search-category-label">{category}</div>
                      {items.map((r, ci) => {
                        const globalIdx = results.indexOf(r);
                        return (
                          <div
                            key={r.key}
                            className={`search-result-item${globalIdx === activeResult ? " active-result" : ""}`}
                            onMouseEnter={() => setActiveResult(globalIdx)}
                            onClick={() => { navigate(`/hospital/${r.key}`); setSearch(""); setSearchFocus(false); }}
                          >
                            <div className="sr-icon-wrap">{r.icon}</div>
                            <span className="sr-label">{r.label}</span>
                            <span className="sr-arrow">↗</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="topbar-spacer" />

        {/* ── Live Clock ── */}
        <div className="tb-clock-chip">
          <span className="tb-clock-time">
            {liveTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
          </span>
          <span className="tb-clock-date">
            {liveTime.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>

        {/* ── Action Buttons ── */}
        <div className="topbar-actions">

          {/* Language Translator Dropdown */}
          <div style={{ position: "relative" }} ref={translateRef}>
            <button
              className={`tb-lang-btn${showTranslator ? " active-lang" : ""}`}
              title="Translate Page"
              onClick={() => setShowTranslator(o => !o)}
              id="topbar-translator-btn"
            >
              <span className="tb-lang-flag">🌐</span>
              <span className="tb-lang-label">Translate</span>
              <span className={`tb-lang-chevron${showTranslator ? " open" : ""}`}>▼</span>
            </button>

            {showTranslator && (
              <TranslateDropdown onClose={() => setShowTranslator(false)} />
            )}
          </div>

          {/* Theme toggle */}
          <button className="tb-btn" title={isDark ? "☀️ Light Mode" : "🌙 Dark Mode"} onClick={toggleTheme}>
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Fullscreen */}
          <button className="tb-btn" title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"} onClick={toggleFullscreen}>
            {isFullscreen ? "🗗" : "⛶"}
          </button>

          {/* Notifications */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button className="tb-btn" title="Notifications" onClick={() => setNotifOpen(o => !o)}>
              🔔
              {unreadCount > 0 && <span className="tb-notif-badge" />}
            </button>

            {notifOpen && (
              <div className="tb-notif-dropdown">
                <div className="tb-notif-hdr">
                  <div className="tb-notif-hdr-left">
                    <span className="tb-notif-hdr-icon">🔔</span>
                    <span className="tb-notif-hdr-title">Notifications</span>
                    {unreadCount > 0 && <span className="tb-notif-count">{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button className="tb-notif-mark-all" onClick={markAllRead}>Mark all read ✓</button>
                  )}
                </div>
                <div className="tb-notif-list">
                  {notifications.length === 0 ? (
                    <div className="tb-notif-empty">
                      <span className="tb-notif-empty-icon">🎉</span>
                      All caught up — no notifications!
                    </div>
                  ) : notifications.map((n, i) => (
                    <div
                      key={n.id || i}
                      className={`tb-notif-item${!n.read ? " unread" : ""}`}
                      onClick={() => setNotifications(prev => prev.map((x, j) => j === i ? { ...x, read: true } : x))}
                    >
                      <div className="tb-notif-item-icon">{n.icon}</div>
                      <div className="tb-notif-item-body">
                        <div className="tb-notif-item-title">{n.title}</div>
                        <div className="tb-notif-item-sub">{n.body}</div>
                        {n.time && (
                          <div className="tb-notif-item-time">
                            🕐 {new Date(n.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {new Date(n.time).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tb-notif-footer" onClick={() => setNotifOpen(false)}>
                  View all notifications →
                </div>
              </div>
            )}
          </div>

          <div className="tb-divider" />

          {/* Profile pill */}
          <div style={{ position: "relative" }} ref={profileRef}>
            <button className="tb-profile-btn" onClick={() => setProfileOpen(o => !o)}>
              <div className="tb-avatar">{initials}</div>
              <div className="tb-profile-info">
                <div className="tb-profile-name">{username}</div>
                <div className="tb-profile-role">{roleLabel}</div>
              </div>
              <span className={`tb-chevron${profileOpen ? " open" : ""}`}>▼</span>
            </button>

            {profileOpen && (
              <div className="tb-profile-dropdown">
                {/* Header */}
                <div className="tb-pd-header">
                  <div className="tb-pd-avatar" style={{ position: "relative" }}>
                    {initials}
                    <div className="tb-pd-avatar-dot" />
                  </div>
                  <div className="tb-pd-info">
                    <div className="tb-pd-name">{username}</div>
                    <div className="tb-pd-email">{username.toLowerCase()}@hospital.com</div>
                    <div className="tb-pd-badges">
                      <span className="tb-pd-badge role">🎖️ {roleLabel}</span>
                      <span className="tb-pd-badge status">🟢 Active</span>
                    </div>
                  </div>
                </div>

                {/* Meta strip */}
                <div className="tb-pd-meta">
                  <div className="tb-pd-meta-item">
                    <div className="tb-pd-meta-label">Account ID</div>
                    <div className="tb-pd-meta-val">1</div>
                  </div>
                  <div className="tb-pd-meta-item">
                    <div className="tb-pd-meta-label">Role</div>
                    <div className="tb-pd-meta-val">{roleLabel}</div>
                  </div>
                  <div className="tb-pd-meta-item">
                    <div className="tb-pd-meta-label">Status</div>
                    <div className="tb-pd-meta-val" style={{ color: "var(--tb-green)" }}>● Active</div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="tb-pd-item" onClick={() => { setProfileOpen(false); setShowProfile(true); }}>
                  <div className="tb-pd-item-icon">👤</div>
                  <div className="tb-pd-item-info">
                    <div className="tb-pd-item-title">My Profile</div>
                    <div className="tb-pd-item-sub">Personal info & address settings</div>
                  </div>
                  <span className="tb-pd-item-arrow">→</span>
                </div>

                <div className="tb-pd-sep" />

                <div className="tb-pd-item danger" onClick={doLogout}>
                  <div className="tb-pd-item-icon">🚪</div>
                  <div className="tb-pd-item-info">
                    <div className="tb-pd-item-title">Sign Out</div>
                    <div className="tb-pd-item-sub">End your current session</div>
                  </div>
                  <span className="tb-pd-item-arrow">→</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}

    </>
  );
}