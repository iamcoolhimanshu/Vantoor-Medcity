import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import API from "../../api/api";
import { useLookup } from "../../hooks/useLookup";
import { useTheme } from "../../hooks/useTheme";
import AIMedicineRecommendation from "./AIMedicineRecommendation";

const fmt   = v => v ? new Date(v).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtT  = v => v ? new Date(v).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "—";
const inr   = v => v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
const avCol = s => ["#0369A1","#7C3AED","#059669","#D97706","#0891B2","#DB2777","#DC2626","#0F766E"][(s?.charCodeAt(0)||0)%8];
const av    = (s,sz=34) => {
  const c=avCol(s); const init=(s||"?")[0].toUpperCase();
  return <span style={{width:sz,height:sz,borderRadius:sz/3,background:c,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:sz*0.38,flexShrink:0}}>{init}</span>;
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── CSS Variables: Light (default) ── */
  :root, [data-theme="light"] {
    --hm-bg:           #F0F4FA;
    --hm-text:         #0F172A;
    --hm-text-muted:   #64748B;
    --hm-text-faint:   #94A3B8;
    --hm-card:         #FFFFFF;
    --hm-card-border:  #E2E8F0;
    --hm-input:        #FFFFFF;
    --hm-input-bg:     #F8FAFC;
    --hm-input-border: #E2E8F0;
    --hm-input-text:   #0F172A;
    --hm-thead:        #F8FAFC;
    --hm-thead-text:   #64748B;
    --hm-row-hover:    #F0FDF4;
    --hm-row-border:   #F1F5F9;
    --hm-divider:      #E2E8F0;
    --hm-content:      #FFFFFF;
    --hm-modal:        #FFFFFF;
    --hm-modal-body:   #F8FAFC;
    --hm-preview:      #FFFFFF;
    --hm-preview-row:  #F8FAFC;
    --hm-sec-hdr:      #F1F5F9;
    --hm-filter-bg:    #FFFFFF;
    --hm-filter-text:  #64748B;
    --hm-pill-bg:      #FFFFFF;
    --hm-shadow:       rgba(0,0,0,0.06);
  }

  /* ── CSS Variables: Dark ── */
  [data-theme="dark"] {
    --hm-bg:           #0A1628;
    --hm-text:         #E2E8F0;
    --hm-text-muted:   #94A3B8;
    --hm-text-faint:   #64748B;
    --hm-card:         #0F1D33;
    --hm-card-border:  #1A2E4A;
    --hm-input:        #0F1D33;
    --hm-input-bg:     #0C1A2E;
    --hm-input-border: #1A2E4A;
    --hm-input-text:   #E2E8F0;
    --hm-thead:        #0D1A2D;
    --hm-thead-text:   #7A93AE;
    --hm-row-hover:    #122033;
    --hm-row-border:   #152540;
    --hm-divider:      #1A2E4A;
    --hm-content:      #0A1628;
    --hm-modal:        #0F1D33;
    --hm-modal-body:   #0C1A2E;
    --hm-preview:      #0F1D33;
    --hm-preview-row:  #0C1A2E;
    --hm-sec-hdr:      #0D1A2D;
    --hm-filter-bg:    #0F1D33;
    --hm-filter-text:  #94A3B8;
    --hm-pill-bg:      #0F1D33;
    --hm-shadow:       rgba(0,0,0,0.3);
  }

  .hm-app {
    padding: 0; margin: 0; width: 100%; max-width: 100%;
    font-family: 'DM Sans', sans-serif; color: var(--hm-text);
    background: var(--hm-bg); min-height: 100vh;
    transition: background 0.25s, color 0.25s;
    overflow-x: hidden;
  }

  /* ── Module Header (like Service Management) ── */
  .mod-header {
    background: linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%);
    padding: 14px 24px;
    display: flex; align-items: center; justify-content: space-between;
    border-radius: 0;
    box-shadow: 0 2px 12px rgba(4,120,87,0.2);
    position: sticky; top: 0; z-index: 100;
    flex-wrap: wrap; gap: 10px;
  }
  .mod-header-left { display:flex; align-items:center; gap:14px; }
  .mod-header-icon {
    width: 44px; height: 44px;
    background: rgba(255,255,255,0.15);
    border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 22px;
  }
  .mod-header-title { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
  .mod-header-sub   { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 2px; }
  .mod-header-right { display:flex; align-items:center; gap:10px; }
  .mod-header-date  {
    background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
    border-radius: 8px; padding: 6px 14px;
    font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.95);
  }
  .mod-header-actions { display:flex; gap:8px; }
  .mod-hdr-btn {
    background: rgba(255,255,255,0.18); border: 1.5px solid rgba(255,255,255,0.3);
    color: #fff; font-family: 'DM Sans',sans-serif;
    font-size: 12px; font-weight: 700; padding: 6px 14px;
    border-radius: 8px; cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  .mod-hdr-btn:hover { background: rgba(255,255,255,0.28); }

  /* ── KPI Section header ── */
  .kpi-section-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px 10px;
    background: var(--hm-content);
  }
  .kpi-section-title {
    font-size: 12px; font-weight: 800; color: var(--hm-text-muted);
    text-transform: uppercase; letter-spacing: 0.08em;
    display: flex; align-items: center; gap: 8px;
  }
  .kpi-section-title::before { content:''; width:3px; height:14px; background:#047857; border-radius:2px; }

  /* ── Tab content wrapper ── */
  .tab-content-wrap { padding: 0; }

  /* ── Banner ── */
  .hm-banner {
    background: linear-gradient(135deg, #0A1628 0%, #0C2244 30%, #047857 65%, #065F46 100%);
    border-radius: 14px; padding: 22px 28px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden; margin-bottom: 12px;
    box-shadow: 0 10px 36px rgba(4,120,87,0.32);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .hm-banner-deco { position:absolute; inset:0; border-radius:14px; overflow:hidden; pointer-events:none; }
  .hm-banner-deco::before { content:''; position:absolute; top:-50px; right:-50px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05); }
  .hm-banner-deco::after  { content:''; position:absolute; bottom:-30px; right:200px; width:120px; height:120px; border-radius:50%; background:rgba(16,185,129,0.12); }
  .hm-banner-left  { display:flex; align-items:center; gap:18px; position:relative; z-index:1; }
  .hm-banner-icon  { width:52px; height:52px; background:rgba(255,255,255,0.12); border-radius:14px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.18); font-size:26px; }
  .hm-banner-title { font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.4px; }
  .hm-banner-sub   { font-size:13px; color:rgba(255,255,255,0.6); margin-top:3px; }
  .hm-banner-right { display:flex; align-items:center; gap:10px; position:relative; z-index:2; }
  .hm-banner-date  { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:10px; padding:8px 16px; font-size:12px; font-weight:600; color:rgba(255,255,255,0.9); }
  .create-btn { background:rgba(255,255,255,0.18); color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; padding:8px 18px; border-radius:10px; border:1.5px solid rgba(255,255,255,0.3); cursor:pointer; display:flex; align-items:center; gap:7px; transition:all 0.15s; }
  .create-btn:hover { background:rgba(255,255,255,0.26); }

  /* ── Top Nav ── */
  .hm-topnav {
    display: flex; align-items: center; gap: 2px;
    background: var(--hm-card); border-radius: 14px;
    border: 1px solid var(--hm-card-border);
    padding: 6px 10px;
    margin-bottom: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    overflow-x: auto;
    scrollbar-width: none;
    flex-wrap: nowrap;
  }
  .hm-topnav::-webkit-scrollbar { display: none; }

  .hm-topnav-divider {
    width: 1px; height: 28px; background: var(--hm-divider);
    flex-shrink: 0; margin: 0 4px;
  }

  .topnav-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12.5px; font-weight: 600; color: var(--hm-text-muted);
    background: none; border: none; cursor: pointer;
    transition: all 0.14s; white-space: nowrap; flex-shrink: 0;
    position: relative;
  }
  .topnav-btn:hover { background: #F1F5F9; color: #047857; }
  .topnav-btn.active { background: linear-gradient(135deg,#F0FDF4,#DCFCE7); color: #047857; }

  .topnav-btn.dash-tab:hover { background: #ECFDF5; color: #047857; }
  .topnav-btn.dash-tab.active { background: linear-gradient(135deg,#ECFDF5,#D1FAE5); color: #065F46; }

  .topnav-btn.red-tab:hover { background: #FEF2F2; color: #DC2626; }
  .topnav-btn.red-tab.active { background: linear-gradient(135deg,#FEF2F2,#FEE2E2); color: #DC2626; }

  .topnav-btn.blue-tab:hover { background: #EFF6FF; color: #2563EB; }
  .topnav-btn.blue-tab.active { background: linear-gradient(135deg,#EFF6FF,#DBEAFE); color: #1D4ED8; }

  .topnav-btn.amber-tab:hover { background: #FFFBEB; color: #D97706; }
  .topnav-btn.amber-tab.active { background: linear-gradient(135deg,#FFFBEB,#FEF3C7); color: #D97706; }

  .topnav-btn.green-tab:hover { background: #F0FDF4; color: #047857; }
  .topnav-btn.green-tab.active { background: linear-gradient(135deg,#F0FDF4,#DCFCE7); color: #065F46; }

  .topnav-btn .topnav-emoji { font-size: 15px; }
  .topnav-btn .tab-badge {
    background: #DCFCE7; color: #047857;
    font-size: 10px; font-weight: 700;
    padding: 1px 6px; border-radius: 20px; line-height: 1.5;
  }
  .tab-badge {
    display: inline-block;
    background: #DCFCE7; color: #047857;
    font-size: 10px; font-weight: 700;
    padding: 1px 7px; border-radius: 20px; line-height: 1.5;
    margin-left: 4px;
  }
  .topnav-btn.active .tab-badge { background: #047857; color: #fff; }
  .topnav-btn.red-tab .tab-badge { background: #FEE2E2; color: #DC2626; }
  .topnav-btn.red-tab.active .tab-badge { background: #DC2626; color: #fff; }
  .topnav-btn.blue-tab .tab-badge { background: #DBEAFE; color: #2563EB; }
  .topnav-btn.blue-tab.active .tab-badge { background: #2563EB; color: #fff; }
  .topnav-btn.amber-tab .tab-badge { background: #FEF3C7; color: #D97706; }
  .topnav-btn.amber-tab.active .tab-badge { background: #D97706; color: #fff; }

  .topnav-section-label {
    font-size: 9.5px; font-weight: 800; color: var(--hm-text-faint);
    text-transform: uppercase; letter-spacing: 0.1em;
    padding: 0 6px; flex-shrink: 0;
  }

  /* ── KPI ── */
  .kpi-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:22px; }
  .kpi-grid.cols-4 { grid-template-columns:repeat(4,1fr); }
  .kpi-grid.cols-6 { grid-template-columns:repeat(6,1fr); }
  .kpi { border-radius:14px; padding:18px 20px; display:flex; align-items:center; justify-content:space-between; position:relative; overflow:hidden; cursor:default; transition:transform 0.18s,box-shadow 0.18s; }
  .kpi:hover { transform:translateY(-2px); }
  .kpi.teal   { background:linear-gradient(135deg,#065F46,#047857); box-shadow:0 4px 20px rgba(4,120,87,0.28); }
  .kpi.blue   { background:linear-gradient(135deg,#1E3A8A,#2563EB); box-shadow:0 4px 20px rgba(37,99,235,0.28); }
  .kpi.green  { background:linear-gradient(135deg,#065F46,#059669); box-shadow:0 4px 20px rgba(5,150,105,0.28); }
  .kpi.red    { background:linear-gradient(135deg,#7F1D1D,#DC2626); box-shadow:0 4px 20px rgba(220,38,38,0.28); }
  .kpi.amber  { background:linear-gradient(135deg,#92400E,#D97706); box-shadow:0 4px 20px rgba(217,119,6,0.28); }
  .kpi.violet { background:linear-gradient(135deg,#4C1D95,#7C3AED); box-shadow:0 4px 20px rgba(124,58,237,0.28); }
  .kpi.cyan   { background:linear-gradient(135deg,#164E63,#0891B2); box-shadow:0 4px 20px rgba(8,145,178,0.28); }
  .kpi.slate  { background:linear-gradient(135deg,#334155,#475569); box-shadow:0 4px 20px rgba(71,85,105,0.24); }
  .kpi::after { content:''; position:absolute; right:-18px; bottom:-18px; width:80px; height:80px; border-radius:50%; background:rgba(255,255,255,0.08); }
  .kpi-label  { font-size:10px; font-weight:700; color:rgba(255,255,255,0.68); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; }
  .kpi-value  { font-size:30px; font-weight:800; color:#fff; line-height:1; }
  .kpi-sub    { font-size:11px; color:rgba(255,255,255,0.55); margin-top:5px; }
  .kpi-icon   { width:42px; height:42px; background:rgba(255,255,255,0.16); border-radius:12px; display:flex; align-items:center; justify-content:center; position:relative; z-index:1; border:1px solid rgba(255,255,255,0.2); flex-shrink:0; }

  /* ── Content card ── */
  .hm-content {
    background: var(--hm-content); border-radius: 0;
    border: none;
    overflow-x: hidden; min-height: 100vh;
  }
  .card { background:var(--hm-card); border-radius:16px; border:1px solid var(--hm-card-border); box-shadow:0 2px 12px rgba(0,0,0,0.06); overflow:hidden; }

  /* ── Section header ── */
  .sec-hdr { display:flex; justify-content:space-between; align-items:center; padding:14px 20px; border-bottom:1px solid var(--hm-row-border); background:var(--hm-card); flex-wrap:wrap; gap:10px; }
  .sec-title { font-size:14px; font-weight:700; color:var(--hm-text); display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .sec-title-icon { width:30px; height:30px; background:linear-gradient(135deg,#ECFDF5,#D1FAE5); border-radius:8px; display:flex; align-items:center; justify-content:center; color:#047857; }
  .sec-right { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

  /* ── Search ── */
  .search-wrap { position:relative; }
  .search-wrap svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#94A3B8; }
  .search-input { font-family:'DM Sans',sans-serif; font-size:13px; color:var(--hm-text); background:var(--hm-input-bg); border:1.5px solid var(--hm-input-border); border-radius:9px; padding:7px 12px 7px 34px; outline:none; width:200px; transition:border 0.15s; }
  .search-input:focus { border-color:#047857; background:var(--hm-input); box-shadow:0 0 0 3px rgba(4,120,87,0.08); }
  .search-input::placeholder { color:#94A3B8; }

  /* ── Filter pills ── */
  .filter-row { display:flex; gap:6px; padding:10px 20px; border-bottom:1px solid var(--hm-row-border); flex-wrap:wrap; }
  .filter-pill { font-size:11.5px; font-weight:600; padding:4px 12px; border-radius:20px; border:1.5px solid var(--hm-input-border); background:var(--hm-pill-bg); color:var(--hm-filter-text); cursor:pointer; transition:all 0.13s; }
  .filter-pill:hover { border-color:#047857; color:#047857; }
  .filter-pill.active { background:#047857; color:#fff; border-color:#047857; }

  /* ── Buttons ── */
  .btn-primary { background:#047857; color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.15s; white-space:nowrap; }
  .btn-primary:hover { background:#065F46; transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
  .btn-outline { background:var(--hm-card); color:var(--hm-text-muted); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:7px 14px; border-radius:8px; border:1.5px solid #CBD5E1; cursor:pointer; transition:all 0.15s; }
  .btn-outline:hover { border-color:#047857; color:#047857; background:#F0FDF4; }
  .btn-danger-sm { background:#FEE2E2; color:#DC2626; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; padding:6px 12px; border-radius:7px; border:none; cursor:pointer; transition:all 0.15s; }
  .btn-danger-sm:hover { background:#DC2626; color:#fff; }
  .btn-icon-sm { background:none; border:none; cursor:pointer; display:flex; align-items:center; padding:5px; border-radius:7px; transition:background 0.12s; }
  .btn-icon-sm:hover { background:#F1F5F9; }
  .btn-icon-sm.edit:hover  { background:#ECFDF5; }
  .btn-icon-sm.del:hover   { background:#FEF2F2; }

  /* ── Table ── */
  .tbl-wrap { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; }
  thead { background:var(--hm-thead); }
  th { font-size:10px; font-weight:700; color:var(--hm-thead-text); text-transform:uppercase; letter-spacing:0.07em; padding:10px 16px; text-align:left; border-bottom:1px solid var(--hm-divider); white-space:nowrap; }
  td { font-size:13px; color:var(--hm-text); padding:11px 16px; border-bottom:1px solid var(--hm-row-border); vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:var(--hm-row-hover); }
  .mono { font-family:'DM Mono',monospace; font-size:11.5px; }
  .actions-cell { display:flex; gap:4px; align-items:center; }
  .name-cell { display:flex; align-items:center; gap:10px; }
  .name-text  { font-weight:700; font-size:13px; color:var(--hm-text); }
  .name-sub   { font-size:11px; color:#94A3B8; }

  /* ── Badges ── */
  .badge { display:inline-flex; align-items:center; gap:4px; font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:20px; white-space:nowrap; }
  .badge-green  { background:#ECFDF5; color:#059669; border:1px solid #A7F3D0; }
  .badge-red    { background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; }
  .badge-blue   { background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; }
  .badge-amber  { background:#FFFBEB; color:#D97706; border:1px solid #FDE68A; }
  .badge-violet { background:#F5F3FF; color:#7C3AED; border:1px solid #DDD6FE; }
  .badge-cyan   { background:#ECFEFF; color:#0891B2; border:1px solid #A5F3FC; }
  .badge-slate  { background:#F1F5F9; color:#475569; border:1px solid #CBD5E1; }
  .badge-teal   { background:#F0FDF4; color:#047857; border:1px solid #6EE7B7; }
  .badge-dot    { width:5px; height:5px; border-radius:50%; }

  /* ── Empty / Loading ── */
  .empty-state { text-align:center; padding:52px 20px; }
  .empty-icon-wrap { width:60px; height:60px; border-radius:14px; background:#F0FDF4; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; font-size:28px; }
  .empty-title { font-size:14px; font-weight:600; color:#94A3B8; margin-bottom:4px; }
  .loading-state { display:flex; align-items:center; justify-content:center; gap:8px; padding:48px 20px; color:#94A3B8; font-size:13px; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .spin-anim { animation:spin 0.8s linear infinite; display:inline-flex; }

  /* ── Modal ── */
  .modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.55); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(4px); padding:80px 20px 20px; overflow-y:auto; }
  .modal-box { background:var(--hm-modal); border-radius:18px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,0.22); overflow:hidden; animation:modalIn 0.18s ease; display:flex; flex-direction:column; max-height:calc(100vh - 100px); }
  .modal-box.sm { max-width:460px; }
  .modal-box.md { max-width:620px; }
  .modal-box.lg { max-width:820px; }
  .modal-box.xl { max-width:960px; }
  @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .modal-header { background:linear-gradient(135deg,#0A1628 0%,#065F46 60%,#047857 100%); padding:18px 22px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .modal-hdr-left  { display:flex; align-items:center; gap:12px; }
  .modal-hdr-icon  { width:38px; height:38px; background:rgba(255,255,255,0.14); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; border:1px solid rgba(255,255,255,0.2); font-size:18px; }
  .modal-hdr-title { font-size:14px; font-weight:700; color:#fff; }
  .modal-hdr-sub   { font-size:11px; color:rgba(255,255,255,0.55); margin-top:2px; }
  .modal-close { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.6); display:flex; padding:5px; border-radius:7px; transition:all 0.12s; font-size:18px; font-weight:700; }
  .modal-close:hover { background:rgba(255,255,255,0.12); color:#fff; }
  .modal-body   { padding:20px 24px; overflow-y:auto; background:var(--hm-modal-body); flex:1; }
  .modal-footer { padding:14px 22px; border-top:1px solid var(--hm-divider); display:flex; justify-content:flex-end; gap:10px; background:var(--hm-modal); flex-shrink:0; }

  /* ── Form ── */
  .form-group { display:flex; flex-direction:column; gap:5px; }
  .form-label { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.05em; }
  .form-label span { color:#EF4444; margin-left:3px; }
  .form-input, .form-select, .form-textarea {
    font-family:'DM Sans',sans-serif; font-size:13px; color:var(--hm-text); background:var(--hm-input);
    border:1.5px solid var(--hm-input-border); border-radius:9px; padding:9px 12px; width:100%; outline:none;
    transition:border 0.15s,box-shadow 0.15s;
  }
  .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:#047857; box-shadow:0 0 0 3px rgba(4,120,87,0.09); }
  .form-input::placeholder,.form-textarea::placeholder { color:#94A3B8; }
  .form-input.error,.form-select.error { border-color:#EF4444!important; }
  .form-textarea { resize:vertical; min-height:80px; }
  .field-error { font-size:10px; color:#EF4444; font-weight:600; margin-top:2px; }
  select.form-select {
    appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 10px center; padding-right:30px; cursor:pointer;
  }
  .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin-bottom:14px; }
  .form-full   { margin-bottom:14px; }
  .sec-divider { font-size:10px; font-weight:700; color:var(--hm-text-faint); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .sec-divider::after { content:''; flex:1; height:1px; background:var(--hm-divider); }

  /* ── Delete dialog ── */
  .del-header { background:#FEF2F2; padding:24px; text-align:center; }
  .del-icon-wrap { width:52px; height:52px; border-radius:50%; background:#FEE2E2; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px; }
  .del-title { font-size:15px; font-weight:700; color:#1E293B; margin-bottom:4px; }
  .del-desc  { font-size:13px; color:#64748B; line-height:1.5; }
  .del-footer { padding:14px 20px; display:flex; gap:12px; border-top:1px solid #FEE2E2; }
  .btn-cancel { flex:1; background:var(--hm-card); color:var(--hm-text-muted); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:9px; border-radius:9px; border:1.5px solid #E2E8F0; cursor:pointer; transition:all 0.15s; }
  .btn-cancel:hover { background:var(--hm-input-bg); }
  .btn-del { flex:1; background:linear-gradient(135deg,#DC2626,#EF4444); color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; padding:9px; border-radius:9px; border:none; cursor:pointer; transition:all 0.15s; }
  .btn-del:hover { background:linear-gradient(135deg,#B91C1C,#DC2626); }

  /* ── Progress bar ── */
  .prog-bar { height:2px; background:linear-gradient(90deg,#047857,#059669); animation:progAnim 1.2s ease-in-out infinite; }
  @keyframes progAnim { 0%{width:0%;margin-left:0} 50%{width:70%;margin-left:15%} 100%{width:0%;margin-left:100%} }

  /* ── Dashboard specific ── */
  .db-wrap { padding:22px; }
  .db-top-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:20px; }
  .db-bottom-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .db-card { background:var(--hm-card); border-radius:14px; border:1px solid var(--hm-card-border); padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.05); }
  .db-card-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .db-card-title { font-size:13px; font-weight:700; color:var(--hm-text); display:flex; align-items:center; gap:8px; }
  .db-card-badge { font-size:10px; font-weight:700; background:#ECFDF5; color:#047857; padding:3px 8px; border-radius:20px; }

  /* Bed status visual */
  .bed-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  .bed-item { border-radius:8px; padding:10px; text-align:center; }
  .bed-item.occupied { background:linear-gradient(135deg,#FEE2E2,#FECACA); border:1px solid #FECACA; }
  .bed-item.available { background:linear-gradient(135deg,#ECFDF5,#D1FAE5); border:1px solid #BBF7D0; }
  .bed-item.maintenance { background:linear-gradient(135deg,#FEF3C7,#FDE68A); border:1px solid #FDE68A; }
  .bed-item.reserved { background:linear-gradient(135deg,#EFF6FF,#DBEAFE); border:1px solid #BFDBFE; }
  .bed-num { font-size:20px; font-weight:800; }
  .bed-lbl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; margin-top:2px; opacity:0.75; }

  /* Bar row */
  .bar-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--hm-row-border); }
  .bar-row:last-child { border-bottom:none; }
  .bar-label { font-size:12px; color:var(--hm-text-muted); flex:1.2; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bar-track { flex:2; height:7px; background:var(--hm-sec-hdr); border-radius:10px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:10px; transition:width 0.6s ease; }
  .bar-val   { font-size:12px; font-weight:700; color:var(--hm-text); min-width:30px; text-align:right; }
  .bar-pct   { font-size:10px; color:#94A3B8; min-width:34px; text-align:right; }

  /* Staff availability */
  .staff-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #F8FAFC; }
  .staff-row:last-child { border-bottom:none; }
  .staff-av { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0; }
  .staff-name { font-size:13px; font-weight:600; color:var(--hm-text); flex:1; }
  .staff-role { font-size:11px; color:#94A3B8; }
  .staff-status { font-size:11px; font-weight:700; padding:3px 9px; border-radius:20px; }

  /* Activity feed */
  .activity-item { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid #F8FAFC; }
  .activity-item:last-child { border-bottom:none; }
  .act-icon { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
  .act-body { flex:1; min-width:0; }
  .act-title { font-size:12.5px; font-weight:600; color:var(--hm-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .act-meta  { font-size:11px; color:#94A3B8; margin-top:2px; }

  /* Donut */
  .donut-wrap { display:flex; align-items:center; gap:16px; }
  .donut-legend { display:flex; flex-direction:column; gap:10px; flex:1; }
  .donut-legend-item { display:flex; align-items:center; gap:8px; }
  .donut-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .donut-lbl { font-size:12px; color:#64748B; flex:1; }
  .donut-val { font-size:13px; font-weight:700; color:var(--hm-text); }
  .donut-pct { font-size:10px; color:#94A3B8; }

  /* Upcoming appointments */
  .appt-item { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #F8FAFC; }
  .appt-item:last-child { border-bottom:none; }
  .appt-time { background:#ECFDF5; border-radius:8px; padding:4px 8px; text-align:center; flex-shrink:0; min-width:50px; }
  .appt-hr   { font-size:14px; font-weight:800; color:#047857; line-height:1; }
  .appt-min  { font-size:9px; font-weight:700; color:#6EE7B7; text-transform:uppercase; }
  .appt-body { flex:1; min-width:0; }
  .appt-name { font-size:12.5px; font-weight:600; color:var(--hm-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .appt-meta { font-size:11px; color:#94A3B8; margin-top:2px; }

  /* KPI mini trend sparkline */
  .sparkline { stroke-dasharray:1000; stroke-dashoffset:1000; animation:dash 1.2s ease forwards; }
  @keyframes dash { to{stroke-dashoffset:0;} }

  /* Preview panel */
  .preview-panel {
    position:fixed; top:60px; right:0; height:calc(100vh - 60px); width:360px;
    background:var(--hm-preview); border-left:1px solid var(--hm-card-border);
    box-shadow:-8px 0 40px rgba(0,0,0,0.12);
    display:flex; flex-direction:column; z-index:600;
    transform:translateX(100%); transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);
    overflow:hidden;
  }
  .preview-panel.open { transform:translateX(0); }
  .preview-header {
    background:linear-gradient(135deg,#0A1628 0%,#065F46 55%,#047857 100%);
    padding:16px 18px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  }
  .preview-hdr-left { display:flex; align-items:center; gap:12px; }
  .preview-name { font-size:14px; font-weight:700; color:#fff; line-height:1.3; }
  .preview-code { font-size:11px; color:rgba(255,255,255,0.55); margin-top:2px; font-family:'DM Mono',monospace; }
  .preview-close { width:34px; height:34px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.15); border:1.5px solid rgba(255,255,255,0.3); color:#fff; border-radius:10px; cursor:pointer; font-size:18px; font-weight:700; transition:all 0.15s; }
  .preview-close:hover { background:rgba(239,68,68,0.7); }
  .preview-actions { display:flex; gap:8px; padding:12px 16px; border-bottom:1px solid #F1F5F9; background:#FAFBFD; }
  .preview-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; padding:8px 10px; border-radius:8px; cursor:pointer; transition:all 0.15s; border:none; }
  .preview-btn.edit { background:#ECFDF5; color:#047857; }
  .preview-btn.edit:hover { background:#047857; color:#fff; }
  .preview-btn.del  { background:#FEF2F2; color:#DC2626; }
  .preview-btn.del:hover { background:#DC2626; color:#fff; }
  .preview-body { flex:1; overflow-y:auto; padding:0 0 24px; }
  .preview-section { padding:14px 18px 0; }
  .preview-section-title { font-size:10px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .preview-section-title::after { content:''; flex:1; height:1px; background:#F1F5F9; }
  .preview-row { display:flex; align-items:flex-start; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--hm-preview-row); gap:12px; }
  .preview-row:last-child { border-bottom:none; }
  .preview-label { font-size:11.5px; color:var(--hm-text-faint); font-weight:500; flex-shrink:0; min-width:110px; }
  .preview-val { font-size:12.5px; color:var(--hm-text); font-weight:600; text-align:right; line-height:1.4; }

  @media (max-width:1200px) {
    .hm-topnav { flex-wrap: wrap; }
    .db-top-row { grid-template-columns:1fr 1fr; }
    .kpi-grid { grid-template-columns:repeat(3,1fr); }
    .kpi-grid.cols-6 { grid-template-columns:repeat(3,1fr); }
    .hm-grid { grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); }
  }
  @media (max-width:900px) {
    .kpi-grid { grid-template-columns:repeat(2,1fr); }
    .kpi-grid.cols-6 { grid-template-columns:repeat(2,1fr); }
    .form-grid-2,.form-grid-3 { grid-template-columns:1fr; }
    .db-top-row { grid-template-columns:1fr; }
    .db-bottom-row { grid-template-columns:1fr; }
    .hm-grid { grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:14px; }
    .hm-grid-wrap { padding:0 14px; }
    .mod-header { padding:12px 16px; }
    .mod-header-date { display:none; }
    .sec-hdr { padding:12px 14px; }
    .search-input { width:160px; }
  }
  @media (max-width:700px) {
    .topnav-section-label { display: none; }
    .hm-topnav-divider { display: none; }
    .hm-grid { grid-template-columns:1fr; gap:12px; }
    .hm-grid-wrap { padding:0 10px; }
    .kpi-grid { grid-template-columns:1fr; }
    .kpi-grid.cols-4,.kpi-grid.cols-6 { grid-template-columns:1fr; }
    .mod-header-actions { display:none; }
    .sec-right { width:100%; }
    .search-input { width:100%; }
    .view-toggle-group { flex:0 0 auto; }
  }

  /* ── View Toggle Segment Control ── */
  .view-toggle-group {
    display: flex;
    background: var(--hm-sec-hdr);
    border-radius: 8px;
    padding: 2px;
    border: 1px solid var(--hm-card-border);
  }
  .view-toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: var(--hm-text-muted);
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .view-toggle-btn:hover {
    color: var(--hm-text);
  }
  .view-toggle-btn.active {
    background: var(--hm-card);
    color: #047857;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }

  /* ── Grid View Layout ── */
  .hm-grid-wrap {
    padding: 0 20px;
    overflow-x: hidden;
  }
  .hm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 20px 0;
  }
  .hm-card {
    background: var(--hm-card);
    border: 1px solid var(--hm-card-border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px var(--hm-shadow);
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
  }
  .hm-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(4,120,87,0.15);
    border-color: #A7F3D0;
  }
  .hm-card-header {
    padding: 16px 20px;
    color: #fff;
    background: linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%);
    position: relative;
  }
  .hm-card-header.inactive {
    background: linear-gradient(135deg, #475569 0%, #64748B 100%);
  }
  .hm-card-title {
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
  }
  .hm-card-subtitle {
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    margin-top: 4px;
    font-family: 'DM Mono', monospace;
  }
  .hm-card-body {
    padding: 18px 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .hm-card-desc {
    font-size: 12.5px;
    color: var(--hm-text-muted);
    line-height: 1.5;
  }
  .hm-card-info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .hm-card-info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--hm-text);
  }
  .hm-card-info-icon {
    font-size: 14px;
    width: 20px;
    display: flex;
    justify-content: center;
    opacity: 0.8;
  }
  .hm-card-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--hm-divider);
  }
  .hm-card-badge {
    font-size: 10.5px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 6px;
  }
  .hm-card-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--hm-divider);
    background: var(--hm-thead);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 6px;
  }
`;

/* ═══════════════════════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════════════════════ */
const IcSearch = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcPlus   = <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcX      = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcWarn   = <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcSpin   = <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

/* ═══════════════════════════════════════════════════════════════════════
   SMALL SHARED COMPONENTS
═══════════════════════════════════════════════════════════════════════ */
function Badge({ children, color = "slate" }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

function StatusBadge({ value }) {
  const v = (value || "").toLowerCase();
  if (["active","admitted","available","completed","discharged"].some(k=>v.includes(k)))
    return <Badge color="green"><span className="badge-dot" style={{background:"#059669"}}/>{value}</Badge>;
  if (["critical","emergency","occupied","urgent"].some(k=>v.includes(k)))
    return <Badge color="red"><span className="badge-dot" style={{background:"#DC2626"}}/>{value}</Badge>;
  if (["pending","in_progress","scheduled","waiting"].some(k=>v.includes(k)))
    return <Badge color="amber">{value}</Badge>;
  if (["maintenance","reserved"].some(k=>v.includes(k)))
    return <Badge color="blue">{value}</Badge>;
  if (!value) return <Badge color="slate">—</Badge>;
  return <Badge color="slate">{value}</Badge>;
}

function KpiCard({ label, value, color, icon, sub }) {
  return (
    <div className={`kpi ${color}`}>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value ?? "—"}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
      <div className="kpi-icon" style={{fontSize:20}}>{icon}</div>
    </div>
  );
}

function EmptyState({ msg, icon }) {
  return (
    <tr><td colSpan={20}>
      <div className="empty-state">
        <div className="empty-icon-wrap">{icon || "🏥"}</div>
        <div className="empty-title">{msg || "No records found"}</div>
      </div>
    </td></tr>
  );
}
function Loading() {
  return (
    <tr><td colSpan={20}>
      <div className="loading-state"><span className="spin-anim">{IcSpin}</span> Loading…</div>
    </td></tr>
  );
}

/* Form helpers */
function FG({ label, req, children, error }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{req && <span>*</span>}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
function FI({ name, value, onChange, placeholder, error, type, maxLength }) {
  return <input className={`form-input${error?" error":""}`} type={type||"text"} name={name} value={value||""} onChange={onChange} placeholder={placeholder||""} maxLength={maxLength}/>;
}
function FT({ value, onChange, placeholder, rows }) {
  return <textarea className="form-textarea" value={value||""} onChange={onChange} placeholder={placeholder||""} rows={rows||3}/>;
}
function FS({ value, onChange, options, placeholder, error }) {
  return (
    <select className={`form-select${error?" error":""}`} value={value||""} onChange={onChange}>
      <option value="">{placeholder||"Select…"}</option>
      {(options||[]).map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
    </select>
  );
}

function Modal({ open, size="md", onClose, iconEmoji, title, subtitle, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`modal-box ${size}`}>
        <div className="modal-header">
          <div className="modal-hdr-left">
            <div className="modal-hdr-icon">{iconEmoji}</div>
            <div>
              <div className="modal-hdr-title">{title}</div>
              {subtitle && <div className="modal-hdr-sub">{subtitle}</div>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>{IcX}</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function DeleteDialog({ open, onClose, onConfirm, itemName }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box sm">
        <div className="del-header">
          <div className="del-icon-wrap">{IcWarn}</div>
          <div className="del-title">Delete Record?</div>
          <div className="del-desc"><strong>"{itemName}"</strong> will be permanently removed.</div>
        </div>
        <div className="del-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-del" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════════════════════════ */
function DashboardTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summary, patients, admissions, staff] = await Promise.all([
          API.get("/hospital/dashboard/summary").then(r=>r.data).catch(()=>null),
          API.get("/hospital/patient/list").then(r=>r.data||[]).catch(()=>[]),
          API.get("/hospital/admission/list").then(r=>r.data||[]).catch(()=>[]),
          API.get("/hospital/staff/list").then(r=>r.data||[]).catch(()=>[]),
        ]);
        setData({ summary, patients, admissions, beds:[], staff });
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <><style>{CSS}</style>
    <div className="hm-app">
    <div className="db-wrap" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:400}}>
      <div className="loading-state"><span className="spin-anim">{IcSpin}</span> Loading dashboard…</div>
    </div>
    </div></>
  );

  const s         = data?.summary || {};
  const patients  = data?.patients || [];
  const appts     = data?.appointments || [];
  const beds      = data?.beds || [];
  const staff     = data?.staff || [];

  const totalPatients  = s.totalPatients  || patients.length || 0;
  const todayAdmit     = s.todayAdmissions|| patients.filter(p=>p.admissionDate?.startsWith(new Date().toISOString().slice(0,10))).length || 0;
  const totalBeds      = s.totalBeds      || beds.length || 0;
  const occupiedBeds   = s.occupiedBeds   || beds.filter(b=>(b.status||"").toLowerCase()==="occupied").length || 0;
  const availBeds      = totalBeds - occupiedBeds;
  const todayAppts     = s.todayAppointments || appts.filter(a=>a.appointmentDate?.startsWith(new Date().toISOString().slice(0,10))).length || 0;
  const emergencyCases = s.emergencyCases || 0;
  const discharged     = s.dischargedToday|| 0;
  const occupancyPct   = totalBeds>0 ? Math.round(occupiedBeds/totalBeds*100) : 0;

  const deptMap = {};
  patients.forEach(p=>{ const k=p.department||p.specialization||"General"; deptMap[k]=(deptMap[k]||0)+1; });
  const deptData = Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxDept  = Math.max(...deptData.map(d=>d[1]),1);
  const deptColors = ["#047857","#2563EB","#D97706","#7C3AED","#DC2626","#0891B2"];

  const bedTypes = ["ICU","General","Private","Ward","NICU"];
  const bedTypeData = bedTypes.map((t,i)=>({
    label:t,
    total: beds.filter(b=>(b.bedType||b.type||"General")===t).length || Math.round(totalBeds/5*(i===1?2.2:i===2?1.5:0.8)) || 0,
    occupied: Math.round((s[`${t.toLowerCase()}Occupied`]||occupiedBeds/5)),
    color: ["#DC2626","#2563EB","#7C3AED","#059669","#0891B2"][i],
  }));

  const todayStr = new Date().toISOString().slice(0,10);
  const upcomingAppts = [...appts]
    .filter(a=>a.appointmentDate>=todayStr && a.status!=="completed")
    .sort((a,b)=>a.appointmentTime?.localeCompare(b.appointmentTime)||0)
    .slice(0,5);

  const recentPatients = [...patients].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,5);

  const staffRoles = ["Doctors","Nurses","Technicians","ER Staff"];
  const staffData  = staffRoles.map((r,i)=>{
    const cnt = staff.filter(m=>(m.role||m.department||"").toLowerCase().includes(r.slice(0,-1).toLowerCase())).length;
    const total = staff.length > 0 ? Math.max(cnt, 1) : 0;
    const pct = s[r.toLowerCase()+"Pct"] || (total > 0 ? Math.round(cnt/total*100) : 0);
    return { label:r, count:cnt, total, pct, color:deptColors[i] };
  });

  function Donut({ data: slices, cx=50, cy=50, r=42, inner=22 }) {
    let cum=-90;
    const paths = slices.map(d=>{
      const frac=d.pct/100; const start=cum; cum+=frac*360; const end=cum;
      const s2=(a)=>({x:cx+r*Math.cos(a*Math.PI/180), y:cy+r*Math.sin(a*Math.PI/180)});
      const p1=s2(start),p2=s2(end);
      const large=frac>0.5?1:0;
      const path=frac>=0.999
        ? `M${cx} ${cy-r} A${r} ${r} 0 1 1 ${cx-0.001} ${cy-r}Z`
        : `M${cx} ${cy} L${p1.x} ${p1.y} A${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}Z`;
      return {...d,path};
    });
    return (
      <svg width="100" height="100" viewBox="0 0 100 100">
        {paths.map((d,i)=><path key={i} d={d.path} fill={d.color} opacity={0.9}/>)}
        <circle cx={cx} cy={cy} r={inner} fill="#fff"/>
        <text x={cx} y={cy-5} textAnchor="middle" fontSize="13" fontWeight="800" fill="#0F172A">{occupancyPct}%</text>
        <text x={cx} y={cy+9} textAnchor="middle" fontSize="7" fill="#94A3B8">OCCUPANCY</text>
      </svg>
    );
  }

  const todayStr2 = new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"});
  return (
    <>
    <style>{CSS}</style>
    <div className="hm-app">
    <div className="db-wrap" style={{padding:0}}>
      {/* Dashboard Header */}
      <div className="mod-header">
        <div className="mod-header-left">
          <div className="mod-header-icon">🏥</div>
          <div>
            <div className="mod-header-title">Hospital Management</div>
            <div className="mod-header-sub">Dashboard · Overview · Analytics</div>
          </div>
        </div>
        <div className="mod-header-right">
          <div className="mod-header-date">📅 {todayStr2}</div>
          <div className="mod-header-actions">
            <button className="mod-hdr-btn">📋 Overview</button>
            <button className="mod-hdr-btn">📊 Reports</button>
          </div>
        </div>
      </div>

      <div className="kpi-section-hdr" style={{padding:"12px 20px 10px"}}>
        <div className="kpi-section-title">Live Overview</div>
      </div>
      <div style={{padding:"0 20px"}}>
      <div className="kpi-grid cols-6" style={{marginBottom:20}}>
        <KpiCard label="Total Patients"    value={totalPatients}  color="teal"   icon="🏥" sub="All registered"/>
        <KpiCard label="Today Admissions"  value={todayAdmit}     color="blue"   icon="🛏️" sub="New today"/>
        <KpiCard label="Bed Occupancy"     value={`${occupancyPct}%`} color={occupancyPct>85?"red":"green"} icon="📊" sub={`${occupiedBeds}/${totalBeds} beds`}/>
        <KpiCard label="Today Appts"       value={todayAppts}     color="amber"  icon="📅" sub="Scheduled"/>
        <KpiCard label="Emergency Cases"   value={emergencyCases} color="red"    icon="🚨" sub="Active"/>
        <KpiCard label="Discharged Today"  value={discharged}     color="violet" icon="✅" sub="Cleared"/>
      </div>
      </div>

      <div className="db-top-row">
        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">🛏️ Bed Status</div>
            <span className="db-card-badge">{totalBeds} Total</span>
          </div>
          <div className="bed-grid">
            <div className="bed-item occupied">
              <div className="bed-num" style={{color:"#DC2626"}}>{occupiedBeds}</div>
              <div className="bed-lbl" style={{color:"#DC2626"}}>Occupied</div>
            </div>
            <div className="bed-item available">
              <div className="bed-num" style={{color:"#059669"}}>{availBeds}</div>
              <div className="bed-lbl" style={{color:"#059669"}}>Available</div>
            </div>
            <div className="bed-item maintenance">
              <div className="bed-num" style={{color:"#D97706"}}>{s.maintenanceBeds||beds.filter(b=>(b.status||"").toLowerCase()==="maintenance").length||2}</div>
              <div className="bed-lbl" style={{color:"#D97706"}}>Maintenance</div>
            </div>
            <div className="bed-item reserved">
              <div className="bed-num" style={{color:"#2563EB"}}>{s.reservedBeds||beds.filter(b=>(b.status||"").toLowerCase()==="reserved").length||4}</div>
              <div className="bed-lbl" style={{color:"#2563EB"}}>Reserved</div>
            </div>
          </div>
          <div style={{marginTop:14}}>
            {bedTypeData.map((bt,i)=>(
              <div className="bar-row" key={i}>
                <div className="bar-label">{bt.label}</div>
                <div className="bar-track"><div className="bar-fill" style={{width:`${bt.total>0?Math.round(bt.occupied/bt.total*100):0}%`,background:bt.color}}/></div>
                <div className="bar-val" style={{color:bt.color}}>{bt.occupied}</div>
                <div className="bar-pct">/{bt.total}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">📊 Occupancy & Staff</div>
          </div>
          <div className="donut-wrap" style={{marginBottom:14}}>
            <Donut data={[
              {pct:occupancyPct,color:"#047857"},
              {pct:100-occupancyPct,color:"#F1F5F9"},
            ]}/>
            <div className="donut-legend">
              {[["#047857","Occupied",occupiedBeds],["#059669","Available",availBeds],["#D97706","Maintenance",s.maintenanceBeds||2],["#2563EB","Reserved",s.reservedBeds||4]].map(([c,l,v])=>(
                <div className="donut-legend-item" key={l}>
                  <div className="donut-dot" style={{background:c}}/>
                  <div className="donut-lbl">{l}</div>
                  <div className="donut-val">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{borderTop:"1px solid #F1F5F9",paddingTop:12}}>
            <div style={{fontSize:11,fontWeight:800,color:"var(--hm-text-faint)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Staff Availability</div>
            {staffData.slice(0,4).map((sd,i)=>(
              <div className="bar-row" key={i}>
                <div className="bar-label">{sd.label}</div>
                <div className="bar-track"><div className="bar-fill" style={{width:`${sd.pct}%`,background:sd.color}}/></div>
                <div className="bar-val" style={{color:sd.color,fontSize:11}}>{sd.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">📅 Today's Appointments</div>
            <span className="db-card-badge">{todayAppts}</span>
          </div>
          {upcomingAppts.length===0 ? (
            <div style={{textAlign:"center",padding:"30px 0",color:"var(--hm-text-faint)",fontSize:13}}>No appointments today</div>
          ) : upcomingAppts.map((a,i)=>{
            const t=(a.appointmentTime||"").split(":"); const hr=t[0]||"--"; const mn=t[1]||"00";
            return (
              <div className="appt-item" key={i}>
                <div className="appt-time"><div className="appt-hr">{hr}:{mn}</div><div className="appt-min">{Number(hr)<12?"AM":"PM"}</div></div>
                <div className="appt-body">
                  <div className="appt-name">{a.patientName||a.name||"Patient"}</div>
                  <div className="appt-meta">{a.doctorName||"—"} · {a.department||"General"}</div>
                </div>
                <StatusBadge value={a.status||"Scheduled"}/>
              </div>
            );
          })}
        </div>
      </div>

      <div className="db-bottom-row">
        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">🏨 Patient by Department</div>
            <span className="db-card-badge">{deptData.length} Depts</span>
          </div>
          {deptData.length===0 ? (
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--hm-text-faint)",fontSize:13}}>No data</div>
          ) : deptData.map(([name,count],i)=>(
            <div className="bar-row" key={i}>
              <div className="bar-label">{name}</div>
              <div className="bar-track"><div className="bar-fill" style={{width:`${Math.round(count/maxDept*100)}%`,background:deptColors[i%deptColors.length]}}/></div>
              <div className="bar-val" style={{color:deptColors[i%deptColors.length]}}>{count}</div>
              <div className="bar-pct">{Math.round(count/totalPatients*100)||0}%</div>
            </div>
          ))}
        </div>

        <div className="db-card">
          <div className="db-card-hdr">
            <div className="db-card-title">🔔 Recent Admissions</div>
          </div>
          {recentPatients.length===0 ? (
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--hm-text-faint)",fontSize:13}}>No recent patients</div>
          ) : recentPatients.map((p,i)=>{
            const icons=["🧑‍⚕️","🏥","🚑","💊","🩺"];
            const bgs=["#ECFDF5","#EFF6FF","#FEF2F2","#FFFBEB","#F5F3FF"];
            return (
              <div className="activity-item" key={i}>
                <div className="act-icon" style={{background:bgs[i%5],fontSize:16}}>{icons[i%5]}</div>
                <div className="act-body">
                  <div className="act-title">{p.patientName||p.userName||"Patient"}</div>
                  <div className="act-meta">{p.department||p.problem||"General"} · {fmt(p.createdAt||p.admissionDate)}</div>
                </div>
                <StatusBadge value={p.status||"Active"}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   INSURANCE PRINT MODAL
═══════════════════════════════════════════════════════════════════════ */
function InsurancePrintModal({ claim, onClose }) {
  if (!claim) return null;

  const fmtDate = v => v ? new Date(v).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}) : "—";
  const fmtInr  = v => v ? `₹${Number(v).toLocaleString("en-IN")}` : "—";
  const today   = new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});

  const statusColors = {
    APPROVED:"#059669", PENDING:"#D97706", SUBMITTED:"#2563EB",
    UNDER_REVIEW:"#7C3AED", REJECTED:"#DC2626", SETTLED:"#047857",
    PARTIALLY_APPROVED:"#0891B2",
  };
  const statusColor = statusColors[(claim.claimStatus||"").toUpperCase()] || "#64748B";

  const handlePrint = () => {
    const el = document.getElementById("insurance-print-content");
    const win = window.open("","_blank","width=900,height=700");
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Insurance Claim — ${claim.claimNumber||claim.claimId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter',sans-serif; background:#fff; color:#0F172A; }
        @media print {
          body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
          .no-print { display:none!important; }
        }
      </style>
    </head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(()=>{ win.focus(); win.print(); }, 400);
  };

  const PRINT_CSS = `
    .ip-wrap { max-width:820px; margin:0 auto; padding:32px; background:#fff; font-family:'Inter',sans-serif; }
    .ip-header { background:linear-gradient(135deg,#0A1628 0%,#1E3A8A 45%,#2563EB 100%); border-radius:16px; padding:28px 32px; display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
    .ip-header-left { color:#fff; }
    .ip-logo-row { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
    .ip-logo-box { width:48px; height:48px; background:rgba(255,255,255,0.15); border:2px solid rgba(255,255,255,0.3); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:24px; }
    .ip-hospital-name { font-size:20px; font-weight:800; color:#fff; }
    .ip-hospital-sub { font-size:12px; color:rgba(255,255,255,0.6); margin-top:2px; }
    .ip-header-right { text-align:right; color:#fff; }
    .ip-doc-title { font-size:24px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
    .ip-doc-sub { font-size:12px; color:rgba(255,255,255,0.65); margin-top:4px; }
    .ip-claim-num { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); border-radius:8px; padding:6px 14px; font-size:13px; font-weight:700; color:#fff; margin-top:10px; display:inline-block; font-family:monospace; letter-spacing:0.5px; }

    .ip-status-banner { display:flex; align-items:center; justify-content:space-between; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:14px 20px; margin-bottom:20px; }
    .ip-status-left { display:flex; align-items:center; gap:12px; }
    .ip-status-dot { width:12px; height:12px; border-radius:50%; flex-shrink:0; }
    .ip-status-label { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.07em; }
    .ip-status-value { font-size:16px; font-weight:800; }
    .ip-issued-date { font-size:12px; color:#94A3B8; text-align:right; }
    .ip-issued-val { font-size:13px; font-weight:600; color:#475569; }

    .ip-section { margin-bottom:20px; }
    .ip-section-title { font-size:10px; font-weight:800; color:#94A3B8; text-transform:uppercase; letter-spacing:0.1em; padding-bottom:8px; border-bottom:2px solid #E2E8F0; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
    .ip-section-title::before { content:''; width:4px; height:14px; background:#2563EB; border-radius:2px; display:inline-block; }

    .ip-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .ip-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
    .ip-field { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px 14px; }
    .ip-field-label { font-size:9.5px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:5px; }
    .ip-field-value { font-size:13px; font-weight:600; color:#0F172A; line-height:1.4; word-break:break-word; }
    .ip-field-value.mono { font-family:monospace; font-size:12px; }
    .ip-field-value.big { font-size:20px; font-weight:800; }
    .ip-field-value.green { color:#059669; }
    .ip-field-value.amber { color:#D97706; }
    .ip-field-value.blue { color:#2563EB; }

    .ip-amount-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px; }
    .ip-amount-card { border-radius:12px; padding:16px 18px; text-align:center; }
    .ip-amount-card.claimed { background:linear-gradient(135deg,#EFF6FF,#DBEAFE); border:1px solid #BFDBFE; }
    .ip-amount-card.approved { background:linear-gradient(135deg,#F0FDF4,#DCFCE7); border:1px solid #BBF7D0; }
    .ip-amount-card.coverage { background:linear-gradient(135deg,#F5F3FF,#EDE9FE); border:1px solid #DDD6FE; }
    .ip-amount-label { font-size:9px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; }
    .ip-amount-value { font-size:22px; font-weight:800; }
    .ip-amount-card.claimed .ip-amount-value { color:#1D4ED8; }
    .ip-amount-card.approved .ip-amount-value { color:#059669; }
    .ip-amount-card.coverage .ip-amount-value { color:#7C3AED; }

    .ip-remarks { background:#FFFBEB; border:1px solid #FDE68A; border-radius:10px; padding:14px 16px; }
    .ip-remarks-label { font-size:10px; font-weight:700; color:#92400E; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px; }
    .ip-remarks-text { font-size:13px; color:#78350F; line-height:1.6; }

    .ip-footer { margin-top:28px; padding-top:16px; border-top:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:flex-end; }
    .ip-footer-note { font-size:10px; color:#94A3B8; line-height:1.6; max-width:340px; }
    .ip-sig-area { text-align:center; }
    .ip-sig-line { width:180px; border-top:1px solid #475569; margin:0 auto 6px; }
    .ip-sig-label { font-size:10px; color:#64748B; font-weight:600; }
    .ip-watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-35deg); font-size:80px; font-weight:900; color:rgba(37,99,235,0.04); pointer-events:none; white-space:nowrap; letter-spacing:8px; }
  `;

  const claimStatus = (claim.claimStatus||"PENDING").toUpperCase();

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box xl" style={{maxWidth:900}}>
        <div className="modal-header">
          <div className="modal-hdr-left">
            <div className="modal-hdr-icon">🖨️</div>
            <div>
              <div className="modal-hdr-title">Insurance Claim Document</div>
              <div className="modal-hdr-sub">Preview & Print / Download</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={handlePrint} style={{background:"#2563EB",color:"#fff",border:"none",borderRadius:9,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"'DM Sans',sans-serif"}}>
              🖨️ Print / Download PDF
            </button>
            <button className="modal-close" onClick={onClose}>{IcX}</button>
          </div>
        </div>
        <div className="modal-body" style={{padding:0,background:"#F1F5F9"}}>
          <div style={{padding:16}}>
            <div id="insurance-print-content">
              <style>{PRINT_CSS}</style>
              <div className="ip-wrap" style={{position:"relative"}}>
                <div className="ip-watermark">INSURANCE</div>

                {/* Header */}
                <div className="ip-header">
                  <div className="ip-header-left">
                    <div className="ip-logo-row">
                      <div className="ip-logo-box">🏥</div>
                      <div>
                        <div className="ip-hospital-name">Vantoor MedCity</div>
                        <div className="ip-hospital-sub">Insurance Claims Department</div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",marginTop:8}}>
                      Generated on: {today}
                    </div>
                  </div>
                  <div className="ip-header-right">
                    <div className="ip-doc-title">INSURANCE CLAIM</div>
                    <div className="ip-doc-sub">Official Claim Document</div>
                    <div className="ip-claim-num">{claim.claimNumber || `CLM-${claim.claimId}`}</div>
                  </div>
                </div>

                {/* Status Banner */}
                <div className="ip-status-banner">
                  <div className="ip-status-left">
                    <div className="ip-status-dot" style={{background:statusColor}}/>
                    <div>
                      <div className="ip-status-label">Claim Status</div>
                      <div className="ip-status-value" style={{color:statusColor}}>{claimStatus.replace(/_/g," ")}</div>
                    </div>
                  </div>
                  <div className="ip-issued-date">
                    <div style={{fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3}}>Submission Date</div>
                    <div className="ip-issued-val">{fmtDate(claim.claimSubmissionDate) || today}</div>
                  </div>
                </div>

                {/* Amount Cards */}
                <div className="ip-amount-row">
                  <div className="ip-amount-card claimed">
                    <div className="ip-amount-label">Claim Amount</div>
                    <div className="ip-amount-value">{fmtInr(claim.claimAmount)}</div>
                  </div>
                  <div className="ip-amount-card approved">
                    <div className="ip-amount-label">Approved Amount</div>
                    <div className="ip-amount-value">{fmtInr(claim.approvedAmount) !== "—" ? fmtInr(claim.approvedAmount) : "Pending"}</div>
                  </div>
                  <div className="ip-amount-card coverage">
                    <div className="ip-amount-label">Coverage Limit</div>
                    <div className="ip-amount-value">{fmtInr(claim.coverageAmount) !== "—" ? fmtInr(claim.coverageAmount) : "—"}</div>
                  </div>
                </div>

                {/* Patient & Policy Info */}
                <div className="ip-section">
                  <div className="ip-section-title">Patient & Policy Information</div>
                  <div className="ip-grid-3" style={{marginBottom:12}}>
                    <div className="ip-field">
                      <div className="ip-field-label">Patient ID</div>
                      <div className="ip-field-value mono">{claim.patientId || "—"}</div>
                    </div>
                    <div className="ip-field">
                      <div className="ip-field-label">Policy Number</div>
                      <div className="ip-field-value mono blue">{claim.policyNumber || "—"}</div>
                    </div>
                    <div className="ip-field">
                      <div className="ip-field-label">Policy Expiry</div>
                      <div className="ip-field-value">{fmtDate(claim.policyExpiry)}</div>
                    </div>
                  </div>
                  <div className="ip-grid-3">
                    <div className="ip-field">
                      <div className="ip-field-label">Insurance Company</div>
                      <div className="ip-field-value" style={{color:"#1D4ED8",fontWeight:700}}>{claim.insuranceProvider || "—"}</div>
                    </div>
                    <div className="ip-field">
                      <div className="ip-field-label">TPA Name</div>
                      <div className="ip-field-value">{claim.tpaName || "—"}</div>
                    </div>
                    <div className="ip-field">
                      <div className="ip-field-label">Authorization Code</div>
                      <div className="ip-field-value mono">{claim.authorizationCode || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Claim Reference */}
                <div className="ip-section">
                  <div className="ip-section-title">Claim Reference</div>
                  <div className="ip-grid-3">
                    <div className="ip-field">
                      <div className="ip-field-label">Claim ID</div>
                      <div className="ip-field-value mono">{claim.claimId || "—"}</div>
                    </div>
                    <div className="ip-field">
                      <div className="ip-field-label">Admission ID</div>
                      <div className="ip-field-value mono">{claim.admissionId || "—"}</div>
                    </div>
                    <div className="ip-field">
                      <div className="ip-field-label">Invoice ID</div>
                      <div className="ip-field-value mono">{claim.invoiceId || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                {claim.remarks && (
                  <div className="ip-section">
                    <div className="ip-section-title">Remarks / Notes</div>
                    <div className="ip-remarks">
                      <div className="ip-remarks-label">📝 Additional Notes</div>
                      <div className="ip-remarks-text">{claim.remarks}</div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="ip-footer">
                  <div className="ip-footer-note">
                    This is a computer-generated insurance claim document.<br/>
                    Claim Number: <strong>{claim.claimNumber || `CLM-${claim.claimId}`}</strong><br/>
                    Generated: {today} | Vantoor MedCity — Hospital Management System
                  </div>
                  <div className="ip-sig-area">
                    <div className="ip-sig-line"/>
                    <div className="ip-sig-label">Himanshu Vishwakarma</div>
                    <div style={{fontSize:9,color:"#94A3B8",marginTop:3}}>Authorized Signatory — Insurance Department</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GENERIC CRUD TABLE TAB
═══════════════════════════════════════════════════════════════════════ */
export function CrudTab({ config }) {
  const { title, icon, endpoint, columns, formFields, statusField, kpiCards, filterOptions, emptyIcon } = config;
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [delItem, setDelItem] = useState(null);
  const [form, setForm]       = useState({});
  const [saving, setSaving]   = useState(false);

  const [viewMode, setViewMode] = useState(config.defaultView || "table");
  const [snack, setSnack]     = useState({open:false,msg:"",sev:"success"});
  const [printClaim, setPrintClaim] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [activeAdmissions, setActiveAdmissions] = useState([]);

  const { getValues } = useLookup([]);

  // Load hospital list for dropdowns (used in all forms that have hospitalSelect or hospitalId)
  useEffect(()=>{
    const needsHospital = (formFields||[]).some(s=>s.fields?.some(f=>
      f.type==="hospitalSelect" || (f.key==="hospitalId")
    ));
    if (needsHospital) {
      API.get("/hospital/list").then(r=>{
        setHospitals((r.data||[]).map(h=>({value:h.hospitalId, label:`${h.hospitalName} (ID:${h.hospitalId})`})));
      }).catch(()=>{});
    }
  },[formFields]);

  // Load wards for wardSelect dropdown
  useEffect(()=>{
    const needsWard = (formFields||[]).some(s=>s.fields?.some(f=>f.type==="wardSelect"));
    if (needsWard) {
      API.get("/hospital/ward/list").then(r=>{
        setWards((r.data||[]).map(w=>({value:w.wardId, label:`${w.wardName} (${w.wardType||"General"}) — Floor ${w.floor||"-"}`})));
      }).catch(()=>{});
    }
  },[formFields]);

  // Load all beds for bedSelect dropdown (filtered by wardId in render)
  useEffect(()=>{
    const needsBed = (formFields||[]).some(s=>s.fields?.some(f=>f.type==="bedSelect"));
    if (needsBed) {
      API.get("/hospital/bed/list").then(r=>{
        setAvailableBeds((r.data||[])
          .filter(b=>b.bedStatus==="AVAILABLE")
          .map(b=>({value:b.bedId, wardId:b.wardId, label:`Bed ${b.bedNumber} (${b.bedType||"General"})`})));
      }).catch(()=>{});
    }
  },[formFields]);

  // Load active admissions for admissionId dropdown (nursing notes, discharge, etc)
  useEffect(()=>{
    const needsAdmission = (formFields||[]).some(s=>s.fields?.some(f=>f.type==="admissionSelect"));
    if (needsAdmission) {
      API.get("/hospital/admission/active").then(r=>{
        setActiveAdmissions((r.data||[]).map(a=>({value:a.admissionId, label:`${a.admissionNumber||"ADM-"+a.admissionId} — Patient ${a.patientId}`})));
      }).catch(()=>{});
    }
  },[formFields]);

  const load = useCallback(async()=>{
    setLoading(true);
    try { const r=await API.get(endpoint); setRows(r.data||[]); }
    catch { setSnack({open:true,msg:"Failed to load data",sev:"error"}); }
    finally { setLoading(false); }
  },[endpoint]);

  useEffect(()=>{ load(); },[load]);

  const openAdd  = ()=>{ setEditing(null); setForm({}); setModal(true); };
  const openEdit = (row)=>{ setEditing(row); setForm({...row}); setModal(true); };

  const { createEndpoint, updateEndpoint, deleteEndpoint, idField } = config;
  const isInsurance = title === "Insurance";
  // Helper: get the primary key value from a row using idField or common fallbacks
  const getRowId = (row) => {
    if (!row) return null;
    if (idField) return row[idField];
    // Auto-detect common entity ID fields
    const idKeys = ['hospitalId','deptId','wardId','bedId','doctorId','patientId',
      'admissionId','consultationId','staffId','labTestId','invoiceId','paymentId',
      'claimId','otScheduleId','dischargeSummaryId','emergencyId','prescriptionId',
      'noteId','medicineId','advancePaymentId','refundId','id'];
    for (const k of idKeys) { if (row[k] != null) return row[k]; }
    return null;
  };

  const handleSave = async()=>{
    setSaving(true);
    try {
      if (editing) {
        const upd = updateEndpoint || endpoint.replace('/list','');
        const rowId = getRowId(editing);
        await API.put(`${upd}/${rowId}`, form);
      } else {
        if (!createEndpoint) { setSnack({open:true,msg:"Create not supported for this module.",sev:"warning"}); setSaving(false); return; }
        const crt = createEndpoint;
        await API.post(crt, form);
      }
      setSnack({open:true,msg:`${title} ${editing?"updated":"created"} successfully!`,sev:"success"});
      setModal(false); setEditing(null); load();
    } catch(e) {
      const msg = e?.response?.data?.message || e?.response?.data || "Save failed. Please try again.";
      setSnack({open:true,msg:String(msg).slice(0,120),sev:"error"});
    }
    finally { setSaving(false); }
  };

  const handleDelete = async()=>{
    if (!deleteEndpoint) {
      setSnack({open:true,msg:"Delete is not supported for this module.",sev:"warning"});
      setDelItem(null);
      return;
    }
    try {
      const del = deleteEndpoint;
      const rowId = getRowId(delItem);
      await API.delete(`${del}/${rowId}`);
      setSnack({open:true,msg:"Record deleted.",sev:"success"});
      const delId = getRowId(delItem);
      setDelItem(null); load();
    } catch(e) {
      const msg = e?.response?.data?.message || "Delete failed.";
      setSnack({open:true,msg:String(msg).slice(0,120),sev:"error"});
    }
  };

  const fi = (k,v)=>setForm(p=>({...p,[k]:v}));

  const filtered = rows.filter(r=>{
    const matchSearch = !search || Object.values(r).some(v=>String(v).toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter==="all" || (filterOptions?.find(f=>f.value===filter)?.match?.(r));
    return matchSearch && matchFilter;
  });

  const kpis = (kpiCards||[]).map(k=>({...k, value: k.compute ? k.compute(rows) : (rows.length)}));

  const today = new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"});

  return (
    <>
    <style>{CSS}</style>
    <div className="hm-app">
    <div className="tab-content-wrap">

      {/* Module Header — like Service Management reference */}
      <div className="mod-header">
        <div className="mod-header-left">
          <div className="mod-header-icon">{icon}</div>
          <div>
            <div className="mod-header-title">{title}</div>
            <div className="mod-header-sub">Hospital Management · {title}</div>
          </div>
        </div>
        <div className="mod-header-right">
          <div className="mod-header-date">📅 {today}</div>
          <div className="mod-header-actions">
            <button className="mod-hdr-btn" onClick={load}>🔄 Refresh</button>
            <button className="mod-hdr-btn" onClick={openAdd}>{IcPlus} Add {title}</button>
          </div>
        </div>
      </div>

      {kpis.length>0 && (
        <>
          <div className="kpi-section-hdr">
            <div className="kpi-section-title">Overview · {title}</div>
            <div style={{fontSize:11,color:"var(--hm-text-faint)",fontWeight:600}}>{filtered.length} records</div>
          </div>
          <div style={{padding:"0 20px 16px"}}>
            <div className={`kpi-grid cols-${Math.min(kpis.length,4)}`}>
              {kpis.map((k,i)=><KpiCard key={i} label={k.label} value={k.value} color={k.color||"teal"} icon={k.icon} sub={k.sub}/>)}
            </div>
          </div>
        </>
      )}

      <div className="sec-hdr">
        <div className="sec-title">
          <div className="sec-title-icon">{icon}</div>
          {title}
          <span className="tab-badge" style={{marginLeft:4}}>{filtered.length}</span>
        </div>
        <div className="sec-right">
          <div className="view-toggle-group" style={{marginRight:8}}>
            <button className={`view-toggle-btn ${viewMode==="table"?"active":""}`} onClick={()=>setViewMode("table")} title="Table View">
              📄 Table
            </button>
            <button className={`view-toggle-btn ${viewMode==="grid"?"active":""}`} onClick={()=>setViewMode("grid")} title="Grid View">
              🎴 Grid
            </button>
          </div>
          <div className="search-wrap">
            {IcSearch}
            <input className="search-input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <button className="btn-primary" onClick={openAdd}>{IcPlus} Add {title}</button>
        </div>
      </div>

      {filterOptions?.length>0 && (
        <div className="filter-row">
          <button className={`filter-pill ${filter==="all"?"active":""}`} onClick={()=>setFilter("all")}>All ({rows.length})</button>
          {filterOptions.map(f=>(
            <button key={f.value} className={`filter-pill ${filter===f.value?"active":""}`} onClick={()=>setFilter(f.value)}>
              {f.label} ({rows.filter(f.match).length})
            </button>
          ))}
        </div>
      )}

      {viewMode === "table" ? (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                {columns.map(c=><th key={c.key}>{c.label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <Loading/> : filtered.length===0 ? <EmptyState msg={`No ${title} found`} icon={emptyIcon}/> :
                filtered.map((row,i)=>(
                  <tr key={getRowId(row)||i}>
                    <td className="num-cell">{i+1}</td>
                    {columns.map(c=>(
                      <td key={c.key}>
                        {c.render ? c.render(row[c.key], row)
                          : c.key===statusField ? <StatusBadge value={row[c.key]}/>
                          : c.isName ? (
                            <div className="name-cell">
                              {av(String(row[c.key]||"?"))}
                              <div>
                                <div className="name-text">{row[c.key]||"—"}</div>
                                {c.sub && <div className="name-sub">{row[c.sub]||""}</div>}
                              </div>
                            </div>
                          ) : (row[c.key]??<span style={{color:"#CBD5E1"}}>—</span>)}
                      </td>
                    ))}
                    <td>
                      <div className="actions-cell" onClick={e=>e.stopPropagation()}>
                        <button className="btn-icon-sm edit" title="Edit" onClick={()=>openEdit(row)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#047857" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {isInsurance && (
                          <button className="btn-icon-sm" title="Print Claim" onClick={()=>setPrintClaim(row)} style={{color:"#2563EB"}}>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2563EB" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          </button>
                        )}
                        {deleteEndpoint && (
                        <button className="btn-icon-sm del" title="Delete" onClick={()=>setDelItem(row)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      ) : (
        <div className="hm-grid-wrap">
          {loading ? (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:48,color:"var(--hm-text-faint)"}}><span className="spin-anim" style={{marginRight:8}}>{IcSpin}</span> Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:48}}>
              <div className="empty-icon-wrap" style={{width:60,height:60,borderRadius:14,background:"#F0FDF4",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:28}}>{emptyIcon || "🏥"}</div>
              <div className="empty-title" style={{fontSize:14,fontWeight:600,color:"#94A3B8"}}>No {title} found</div>
            </div>
          ) : (
            <div className="hm-grid">
              {filtered.map((row, i) => {
                if (config.renderGridCard) {
                  return config.renderGridCard(row, i, { openEdit, setDelItem, getRowId });
                }
                const firstVal = row[columns[0]?.key];
                const statusVal = row[statusField];
                return (
                  <div key={getRowId(row) || i} className="hm-card">
                    <div className="hm-card-header">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div className="hm-card-title">{firstVal || "Record Details"}</div>
                        {statusField && (
                          <span style={{ flexShrink: 0 }} onClick={e=>e.stopPropagation()}>
                            <StatusBadge value={statusVal} />
                          </span>
                        )}
                      </div>
                      <div className="hm-card-subtitle">ID: {getRowId(row) || "—"}</div>
                    </div>
                    <div className="hm-card-body">
                      <div className="hm-card-info-grid">
                        {columns.slice(1).map(c => {
                          const val = row[c.key];
                          if (val === undefined || val === null || val === "") return null;
                          return (
                            <div className="hm-card-info-item" key={c.key}>
                              <span className="hm-card-info-icon">🔹</span>
                              <strong style={{fontSize:12,color:"var(--hm-text-muted)"}}>{c.label}:</strong>
                              <span style={{fontSize:13,color:"var(--hm-text)"}}>{c.render ? c.render(val, row) : String(val)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="hm-card-footer" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon-sm edit" title="Edit" onClick={() => openEdit(row)}>
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#047857" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {deleteEndpoint && (
                        <button className="btn-icon-sm del" title="Delete" onClick={() => setDelItem(row)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}



      <Modal open={modal} size={title === "Prescription Management" ? "xl" : "lg"} onClose={()=>setModal(false)}
        iconEmoji={icon} title={`${editing?"Edit":"Add"} ${title}`}
        subtitle={editing?"Update existing record":"Create new record"}
        footer={
          <>
            <button className="btn-outline" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-primary" disabled={saving} onClick={handleSave}>
              {saving?<><span className="spin-anim" style={{fontSize:12}}>{IcSpin}</span>Saving…</>:<>{IcPlus} {editing?"Update":"Create"}</>}
            </button>
          </>
        }
      >
        {title === "Prescription Management" ? (
          <div style={{ display: "flex", gap: "24px", minHeight: "480px" }}>
            {/* Left Column: Form Fields */}
            <div style={{ flex: 1.2 }}>
              {(formFields||[]).map((section,si)=>(
                <div key={si}>
                  {section.section && <div className="sec-divider">{section.section}</div>}
                  <div className={`form-grid-${section.cols||2}`} style={{marginBottom:16}}>
                    {(section.fields||[]).map(f=>(
                      <FG key={f.key} label={f.label} req={f.req} error={f.req&&!form[f.key]&&saving?`${f.label} is required`:""}>
                        {f.type==="hospitalSelect" || (f.key==="hospitalId" && hospitals.length>0)
                          ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                              value={form[f.key]||""} onChange={e=>fi(f.key,Number(e.target.value)||e.target.value)}>
                              <option value="">— Select Hospital —</option>
                              {hospitals.map(h=><option key={h.value} value={h.value}>{h.label}</option>)}
                            </select>
                        : f.type==="wardSelect"
                          ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                              value={form[f.key]||""} onChange={e=>{fi(f.key,Number(e.target.value)); fi("bedId","");}}>
                              <option value="">— Select Ward —</option>
                              {wards.length>0
                                ? wards.map(w=><option key={w.value} value={w.value}>{w.label}</option>)
                                : <option disabled>No wards found</option>}
                            </select>
                        : f.type==="bedSelect"
                          ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                              value={form[f.key]||""} onChange={e=>fi(f.key,Number(e.target.value))}>
                              <option value="">— Select Bed —</option>
                              {(form.wardId
                                ? availableBeds.filter(b=>b.wardId===form.wardId)
                                : availableBeds
                              ).length>0
                                ? (form.wardId ? availableBeds.filter(b=>b.wardId===form.wardId) : availableBeds)
                                    .map(b=><option key={b.value} value={b.value}>{b.label}</option>)
                                : <option disabled>{form.wardId ? "No available beds in this ward" : "Select a ward first"}</option>}
                            </select>
                        : f.type==="admissionSelect"
                          ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                              value={form[f.key]||""} onChange={e=>fi(f.key,Number(e.target.value))}>
                              <option value="">— Select Active Admission —</option>
                              {activeAdmissions.length>0
                                ? activeAdmissions.map(a=><option key={a.value} value={a.value}>{a.label}</option>)
                                : <option disabled>No active admissions found</option>}
                            </select>
                        : (f.key==="billingCleared" || f.key==="doctorApproved" || f.type==="booleanSelect" || f.key==="isActive")
                          ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                              value={form[f.key]===true?"true":form[f.key]===false?"false":""}
                              onChange={e=>fi(f.key, e.target.value==="true" ? true : e.target.value==="false" ? false : null)}>
                              <option value="">Select...</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                        : f.type==="select"
                          ? <FS value={form[f.key]} onChange={e=>fi(f.key,e.target.value)}
                              options={f.lookupType ? getValues(f.lookupType) : (f.options||[])}
                              placeholder={f.placeholder}/>
                        : f.type==="textarea"
                          ? <FT value={form[f.key]} onChange={e=>fi(f.key,e.target.value)} placeholder={f.placeholder} rows={f.rows}/>
                        : f.autoGen
                          ? <div style={{display:"flex",gap:6,alignItems:"center"}}>
                              <input className="form-input" readOnly value={form[f.key]||"(Auto-generated by server)"} style={{background:"var(--hm-sec-hdr)",color:"var(--hm-text-muted)",cursor:"default",fontFamily:"'DM Mono',monospace",fontSize:12}}/>
                              <span title="Auto-generated" style={{fontSize:14,flexShrink:0}}>🔒</span>
                            </div>
                        : f.type==="number"
                          ? <FI type="number" name={f.key} value={form[f.key]??""} onChange={e=>fi(f.key,e.target.value===""?null:Number(e.target.value))} placeholder={f.placeholder}/>
                        : <FI type={f.type||"text"} name={f.key} value={form[f.key]??""} maxLength={f.maxLength}
                            onChange={e=>{
                              let v = e.target.value;
                              if (f.digitsOnly) v = v.replace(/\D/g,"");
                              fi(f.key, v);
                            }} placeholder={f.placeholder}/>
                        }
                      </FG>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: AI Medicine Recommendation */}
            <div style={{ flex: 1, borderLeft: "1.5px solid var(--hm-divider)", paddingLeft: "24px" }}>
              <AIMedicineRecommendation form={form} setForm={setForm} />
            </div>
          </div>
        ) : (
          (formFields||[]).map((section,si)=>(
            <div key={si}>
              {section.section && <div className="sec-divider">{section.section}</div>}
              <div className={`form-grid-${section.cols||2}`} style={{marginBottom:16}}>
                {(section.fields||[]).map(f=>(
                  <FG key={f.key} label={f.label} req={f.req} error={f.req&&!form[f.key]&&saving?`${f.label} is required`:""}>
                    {f.type==="hospitalSelect" || (f.key==="hospitalId" && hospitals.length>0)
                      ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                          value={form[f.key]||""} onChange={e=>fi(f.key,Number(e.target.value)||e.target.value)}>
                          <option value="">— Select Hospital —</option>
                          {hospitals.map(h=><option key={h.value} value={h.value}>{h.label}</option>)}
                        </select>
                    : f.type==="wardSelect"
                      ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                          value={form[f.key]||""} onChange={e=>{fi(f.key,Number(e.target.value)); fi("bedId","");}}>
                          <option value="">— Select Ward —</option>
                          {wards.length>0
                            ? wards.map(w=><option key={w.value} value={w.value}>{w.label}</option>)
                            : <option disabled>No wards found</option>}
                        </select>
                    : f.type==="bedSelect"
                      ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                          value={form[f.key]||""} onChange={e=>fi(f.key,Number(e.target.value))}>
                          <option value="">— Select Bed —</option>
                          {(form.wardId
                            ? availableBeds.filter(b=>b.wardId===form.wardId)
                            : availableBeds
                          ).length>0
                            ? (form.wardId ? availableBeds.filter(b=>b.wardId===form.wardId) : availableBeds)
                                .map(b=><option key={b.value} value={b.value}>{b.label}</option>)
                            : <option disabled>{form.wardId ? "No available beds in this ward" : "Select a ward first"}</option>}
                        </select>
                    : f.type==="admissionSelect"
                      ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                          value={form[f.key]||""} onChange={e=>fi(f.key,Number(e.target.value))}>
                          <option value="">— Select Active Admission —</option>
                          {activeAdmissions.length>0
                            ? activeAdmissions.map(a=><option key={a.value} value={a.value}>{a.label}</option>)
                            : <option disabled>No active admissions found</option>}
                        </select>
                    : (f.key==="billingCleared" || f.key==="doctorApproved" || f.type==="booleanSelect" || f.key==="isActive")
                      ? <select style={{width:"100%",padding:"8px 10px",border:"1.5px solid var(--hm-input-border)",borderRadius:8,fontSize:13,background:"var(--hm-input-bg)",color:"var(--hm-text)"}}
                          value={form[f.key]===true?"true":form[f.key]===false?"false":""}
                          onChange={e=>fi(f.key, e.target.value==="true" ? true : e.target.value==="false" ? false : null)}>
                          <option value="">Select...</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                    : f.type==="select"
                      ? <FS value={form[f.key]} onChange={e=>fi(f.key,e.target.value)}
                          options={f.lookupType ? getValues(f.lookupType) : (f.options||[])}
                          placeholder={f.placeholder}/>
                    : f.type==="textarea"
                      ? <FT value={form[f.key]} onChange={e=>fi(f.key,e.target.value)} placeholder={f.placeholder} rows={f.rows}/>
                    : f.autoGen
                      ? <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <input className="form-input" readOnly value={form[f.key]||"(Auto-generated by server)"} style={{background:"var(--hm-sec-hdr)",color:"var(--hm-text-muted)",cursor:"default",fontFamily:"'DM Mono',monospace",fontSize:12}}/>
                          <span title="Auto-generated" style={{fontSize:14,flexShrink:0}}>🔒</span>
                        </div>
                    : f.type==="number"
                      ? <FI type="number" name={f.key} value={form[f.key]??""} onChange={e=>fi(f.key,e.target.value===""?null:Number(e.target.value))} placeholder={f.placeholder}/>
                    : <FI type={f.type||"text"} name={f.key} value={form[f.key]??""} maxLength={f.maxLength}
                        onChange={e=>{
                          let v = e.target.value;
                          if (f.digitsOnly) v = v.replace(/\D/g,"");
                          fi(f.key, v);
                        }} placeholder={f.placeholder}/>
                    }
                  </FG>
                ))}
              </div>
            </div>
          ))
        )}
      </Modal>

      <DeleteDialog open={!!delItem} onClose={()=>setDelItem(null)} onConfirm={handleDelete} itemName={delItem?.[columns[0]?.key]||"record"}/>

      {isInsurance && <InsurancePrintModal claim={printClaim} onClose={()=>setPrintClaim(null)}/>}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={()=>setSnack(p=>({...p,open:false}))} anchorOrigin={{vertical:"bottom",horizontal:"right"}}>
        <Alert severity={snack.sev} onClose={()=>setSnack(p=>({...p,open:false}))} sx={{borderRadius:"10px",fontWeight:600}}>{snack.msg}</Alert>
      </Snackbar>
    </div>
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB CONFIGS (unchanged)
═══════════════════════════════════════════════════════════════════════ */
const PATIENT_CONFIG = {
  title:"Patients", icon:"🧑‍⚕️", idField:"patientId", endpoint:"/hospital/patient/list", createEndpoint:"/hospital/patient/register", updateEndpoint:"/hospital/patient", deleteEndpoint:"/hospital/patient", statusField:"status", emptyIcon:"🧑‍⚕️",
  kpiCards:[
    {label:"Total Patients",  color:"teal",  icon:"🏥", compute:r=>r.length},
    {label:"Admitted",        color:"blue",  icon:"🛏️", compute:r=>r.filter(p=>(p.status||"").toLowerCase()==="admitted").length},
    {label:"OPD Today",       color:"amber", icon:"📅", compute:r=>r.filter(p=>p.patientType==="OPD"&&p.createdAt?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Discharged",      color:"green", icon:"✅", compute:r=>r.filter(p=>(p.status||"").toLowerCase()==="discharged").length},
  ],
  filterOptions:[
    {label:"Admitted",  value:"admitted",  match:r=>(r.status||"").toLowerCase()==="admitted"},
    {label:"OPD",       value:"opd",       match:r=>r.patientType==="OPD"},
    {label:"Discharged",value:"discharged",match:r=>(r.status||"").toLowerCase()==="discharged"},
  ],
  columns:[
    {key:"patientName",  label:"Patient",isName:true,sub:"uhid"},
    {key:"mobileNumber", label:"Mobile"},
    {key:"age",          label:"Age"},
    {key:"gender",       label:"Gender"},
    {key:"problem",      label:"Complaint"},
    {key:"patientType",  label:"Type"},
    {key:"status",       label:"Status"},
    {key:"createdAt",    label:"Registered",render:v=>fmt(v)},
  ],
  formFields:[
    {section:"Patient Information", cols:2, fields:[
      {key:"patientName",  label:"Full Name",    req:true,placeholder:"Patient full name"},
      {key:"mobileNumber", label:"Mobile", req:true, placeholder:"10-digit mobile", maxLength:10, digitsOnly:true},
      {key:"age",          label:"Age",          type:"number",placeholder:"Age"},
      {key:"gender",       label:"Gender",       type:"select",lookupType:"GENDER"},
      {key:"dateOfBirth",  label:"Date of Birth",type:"date"},
      {key:"bloodGroup",   label:"Blood Group",  type:"select",lookupType:"BLOOD_GROUP"},
      {key:"email",        label:"Email",        placeholder:"Email address"},
      {key:"emergencyContact",label:"Emergency Contact",placeholder:"Emergency mobile"},
    ]},
    {section:"Medical Details", cols:2, fields:[
      {key:"problem",      label:"Problem / Complaint",req:true,placeholder:"Chief complaint"},
      {key:"patientType",  label:"Patient Type",type:"select",lookupType:"PATIENT_TYPE"},
      {key:"allergies",    label:"Allergies",   placeholder:"Known allergies"},
      {key:"medicalHistory",label:"Medical History",type:"textarea",placeholder:"Past medical history",rows:2},
      {key:"status",       label:"Status",      type:"select",lookupType:"ACTIVE_STATUS"},
    ]},
    {section:"Address", cols:1, fields:[
      {key:"address",      label:"Address",req:true,type:"textarea",placeholder:"Full address",rows:2},
    ]},
  ],
};

const DOCTOR_CONFIG = {
  title:"Doctors", icon:"👨‍⚕️", idField:"doctorId", endpoint:"/hospital/doctor/list", createEndpoint:"/hospital/doctor", updateEndpoint:"/hospital/doctor", deleteEndpoint:"/hospital/doctor", statusField:"status", emptyIcon:"👨‍⚕️",
  kpiCards:[
    {label:"Total Doctors",   color:"blue",  icon:"👨‍⚕️",compute:r=>r.length},
    {label:"Active",          color:"green", icon:"✅",  compute:r=>r.filter(d=>(d.status||"").toLowerCase()==="active").length},
    {label:"Specializations", color:"violet",icon:"🩺",  compute:r=>new Set(r.map(d=>d.specialization)).size},
    {label:"Avg Fees",        color:"amber", icon:"💰",  compute:r=>r.length?`₹${Math.round(r.reduce((s,d)=>s+Number(d.consultationFees||0),0)/r.length).toLocaleString("en-IN")}`:"—"},
  ],
  filterOptions:[
    {label:"Active",   value:"active",   match:r=>(r.status||"").toLowerCase()==="active"},
    {label:"Inactive", value:"inactive", match:r=>(r.status||"").toLowerCase()==="inactive"},
  ],
  columns:[
    {key:"doctorName",     label:"Doctor",isName:true,sub:"doctorId"},
    {key:"mobileNumber",   label:"Mobile"},
    {key:"specialization", label:"Specialization"},
    {key:"qualification",  label:"Qualification"},
    {key:"consultationFees",label:"Fees",render:v=>inr(v)},
    {key:"status",         label:"Status"},
  ],
  formFields:[
    {section:"Doctor Information", cols:2, fields:[
      {key:"doctorName",     label:"Full Name",         req:true,placeholder:"Dr. Full Name"},
      {key:"mobileNumber", label:"Mobile", req:true, placeholder:"10-digit mobile", maxLength:10, digitsOnly:true},
      {key:"email",          label:"Email",             placeholder:"Email address"},
      {key:"specialization", label:"Specialization",    req:true,type:"select",lookupType:"SPECIALIZATION"},
      {key:"consultationFees",label:"Consultation Fees",req:true,type:"number",placeholder:"Fee in INR"},
      {key:"experience",     label:"Experience (yrs)",  placeholder:"Years of experience"},
      {key:"qualification",  label:"Qualification",     placeholder:"MBBS, MD, etc."},
      {key:"licenseNumber",  label:"License Number",    placeholder:"Medical license no."},
      {key:"gender",         label:"Gender",            type:"select",lookupType:"GENDER"},
      {key:"status",         label:"Status",            type:"select",lookupType:"STAFF_STATUS"},
    ]},
    {section:"Address", cols:1, fields:[
      {key:"address",label:"Address",type:"textarea",placeholder:"Doctor's address",rows:2},
    ]},
  ],
};

const APPOINTMENT_CONFIG = {
  title:"Appointments", icon:"📅", idField:"consultationId", endpoint:"/hospital/appointment/list", createEndpoint:"/hospital/consultation", updateEndpoint:"/hospital/consultation", deleteEndpoint:null, statusField:"consultationStatus", emptyIcon:"📅",
  kpiCards:[
    {label:"Total",     color:"teal",  icon:"📅",compute:r=>r.length},
    {label:"Today",     color:"blue",  icon:"🕐",compute:r=>r.filter(a=>a.consultationDate?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Scheduled", color:"amber", icon:"⏳",compute:r=>r.filter(a=>(a.consultationStatus||"").toLowerCase()==="scheduled").length},
    {label:"Completed", color:"green", icon:"✅",compute:r=>r.filter(a=>(a.consultationStatus||"").toLowerCase()==="completed").length},
  ],
  filterOptions:[
    {label:"Scheduled", value:"scheduled", match:r=>(r.consultationStatus||"").toLowerCase()==="scheduled"},
    {label:"Completed", value:"completed", match:r=>(r.consultationStatus||"").toLowerCase()==="completed"},
    {label:"Cancelled", value:"cancelled", match:r=>(r.consultationStatus||"").toLowerCase()==="cancelled"},
  ],
  columns:[
    {key:"consultationNumber", label:"Consult #",isName:true},
    {key:"patientId",          label:"Patient ID"},
    {key:"doctorId",           label:"Doctor ID"},
    {key:"diagnosis",          label:"Diagnosis"},
    {key:"consultationDate",   label:"Date",render:v=>fmt(v)},
    {key:"consultationStatus", label:"Status"},
  ],
  formFields:[
    {section:"Consultation Details", cols:2, fields:[
      {key:"patientId",         label:"Patient ID",       req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",          label:"Doctor ID",        req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"consultationDate",  label:"Consultation Date",req:true,type:"date"},
      {key:"consultationType",  label:"Type",             type:"select",lookupType:"CONSULTATION_TYPE"},
      {key:"consultationStatus",label:"Status",           type:"select",lookupType:"CONSULTATION_STATUS"},
    ]},
    {section:"Clinical Info", cols:2, fields:[
      {key:"symptoms",          label:"Symptoms",         type:"textarea",placeholder:"Patient symptoms",rows:2},
      {key:"diagnosis",         label:"Diagnosis",        req:true,type:"textarea",placeholder:"Primary diagnosis",rows:2},
      {key:"clinicalFindings",  label:"Clinical Findings",type:"textarea",placeholder:"Examination findings",rows:2},
      {key:"doctorNotes",       label:"Doctor Notes",     type:"textarea",placeholder:"Treatment notes",rows:2},
    ]},
    {section:"Vitals", cols:3, fields:[
      {key:"vitalsBloodPressure",label:"Blood Pressure",placeholder:"e.g. 120/80"},
      {key:"vitalsPulse",        label:"Pulse",           placeholder:"e.g. 72 bpm"},
      {key:"vitalsTemperature",  label:"Temperature",     placeholder:"e.g. 98.6°F"},
      {key:"vitalsSpO2",         label:"SpO2",            placeholder:"e.g. 98%"},
      {key:"vitalsWeight",       label:"Weight (kg)",     placeholder:"e.g. 70"},
      {key:"vitalsHeight",       label:"Height (cm)",     placeholder:"e.g. 170"},
    ]},
  ],
};

const IPD_CONFIG = {
  title:"IPD / Admissions", icon:"🛏️", idField:"admissionId", endpoint:"/hospital/admission/list", createEndpoint:"/hospital/admission/create", updateEndpoint:"/hospital/admission", deleteEndpoint:null, statusField:"admissionStatus", emptyIcon:"🛏️",
  kpiCards:[
    {label:"Total Admissions", color:"teal",  icon:"🛏️",compute:r=>r.length},
    {label:"Admitted",         color:"blue",  icon:"✅",compute:r=>r.filter(a=>(a.admissionStatus||"").toLowerCase()==="admitted").length},
    {label:"Critical",         color:"red",   icon:"🚨",compute:r=>r.filter(a=>(a.priority||"").toLowerCase()==="critical").length},
    {label:"Discharged",       color:"green", icon:"🏠",compute:r=>r.filter(a=>(a.admissionStatus||"").toLowerCase()==="discharged").length},
  ],
  filterOptions:[
    {label:"Admitted",   value:"admitted",   match:r=>(r.admissionStatus||"").toLowerCase()==="admitted"},
    {label:"Critical",   value:"critical",   match:r=>(r.priority||"").toLowerCase()==="critical"},
    {label:"Discharged", value:"discharged", match:r=>(r.admissionStatus||"").toLowerCase()==="discharged"},
  ],
  columns:[
    {key:"admissionNumber",  label:"Admission #",isName:true},
    {key:"patientId",        label:"Patient ID"},
    {key:"doctorId",         label:"Doctor ID"},
    {key:"admissionType",    label:"Type"},
    {key:"admissionDate",    label:"Admitted",render:v=>fmt(v)},
    {key:"admissionStatus",  label:"Status"},
    {key:"priority",         label:"Priority"},
  ],
  formFields:[
    {section:"Admission Details", cols:2, fields:[
      {key:"patientId",      label:"Patient ID",     req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",       label:"Doctor ID",      req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"wardId",         label:"Ward",           req:true,type:"wardSelect"},
      {key:"bedId",          label:"Bed",            req:true,type:"bedSelect"},
      {key:"admissionDate",  label:"Admission Date", type:"date"},
      {key:"admissionType",  label:"Admission Type", type:"select",lookupType:"ADMISSION_TYPE"},
      {key:"priority",       label:"Priority",       type:"select",lookupType:"PRIORITY"},
      {key:"depositAmount",  label:"Deposit Amount", type:"number",placeholder:"Amount in INR"},
    ]},
    {section:"Clinical", cols:1, fields:[
      {key:"admissionReason",     label:"Admission Reason",     req:true,type:"textarea",placeholder:"Reason for admission",rows:2},
      {key:"diagnosisOnAdmission",label:"Diagnosis on Admission",type:"textarea",placeholder:"Initial diagnosis",rows:2},
      {key:"admissionNotes",      label:"Notes",                type:"textarea",placeholder:"Additional notes",rows:2},
    ]},
  ],
};

const OPD_CONFIG = {
  title:"OPD", icon:"🩺", idField:"consultationId", endpoint:"/hospital/consultation/list", createEndpoint:"/hospital/consultation", updateEndpoint:"/hospital/consultation", deleteEndpoint:null, statusField:"consultationStatus", emptyIcon:"🩺",
  kpiCards:[
    {label:"Total OPD",  color:"teal",  icon:"🩺",compute:r=>r.length},
    {label:"Today",      color:"blue",  icon:"📅",compute:r=>r.filter(o=>o.consultationDate?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Completed",  color:"green", icon:"✅",compute:r=>r.filter(o=>(o.consultationStatus||"").toLowerCase()==="completed").length},
    {label:"Follow-up",  color:"amber", icon:"🔄",compute:r=>r.filter(o=>o.followUpDate).length},
  ],
  columns:[
    {key:"consultationNumber",label:"Consult #",isName:true},
    {key:"patientId",         label:"Patient ID"},
    {key:"doctorId",          label:"Doctor ID"},
    {key:"diagnosis",         label:"Diagnosis"},
    {key:"consultationDate",  label:"Date",render:v=>fmt(v)},
    {key:"consultationStatus",label:"Status"},
  ],
  formFields:[
    {section:"OPD Consultation", cols:2, fields:[
      {key:"patientId",         label:"Patient ID",   req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",          label:"Doctor ID",    req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"consultationDate",  label:"Visit Date",   req:true,type:"date"},
      {key:"consultationType",  label:"Type",         type:"select",lookupType:"CONSULTATION_TYPE"},
      {key:"consultationStatus",label:"Status",       type:"select",lookupType:"CONSULTATION_STATUS"},
    ]},
    {section:"Clinical Info", cols:2, fields:[
      {key:"symptoms",    label:"Symptoms",        type:"textarea",placeholder:"Patient symptoms",rows:2},
      {key:"diagnosis",   label:"Diagnosis",       req:true,type:"textarea",placeholder:"Primary diagnosis",rows:2},
      {key:"doctorNotes", label:"Doctor Notes",    type:"textarea",placeholder:"Treatment notes",rows:2},
      {key:"clinicalFindings",label:"Clinical Findings",type:"textarea",placeholder:"Examination findings",rows:2},
    ]},
    {section:"Vitals", cols:3, fields:[
      {key:"vitalsBloodPressure",label:"Blood Pressure",placeholder:"e.g. 120/80"},
      {key:"vitalsPulse",        label:"Pulse",          placeholder:"e.g. 72 bpm"},
      {key:"vitalsTemperature",  label:"Temperature",    placeholder:"e.g. 98.6°F"},
      {key:"vitalsSpO2",         label:"SpO2",           placeholder:"e.g. 98%"},
      {key:"vitalsWeight",       label:"Weight (kg)",    placeholder:"e.g. 70"},
      {key:"vitalsHeight",       label:"Height (cm)",    placeholder:"e.g. 170"},
    ]},
  ],
};

const WARD_CONFIG = {
  title:"Wards & Beds", icon:"🏨", idField:"wardId", endpoint:"/hospital/ward/list", createEndpoint:"/hospital/ward", updateEndpoint:"/hospital/ward", deleteEndpoint:"/hospital/ward", statusField:"status", emptyIcon:"🏨",
  kpiCards:[
    {label:"Total Wards",  color:"teal",  icon:"🏨",compute:r=>r.length},
    {label:"Total Beds",   color:"blue",  icon:"🛏️",compute:r=>r.reduce((s,w)=>s+(Number(w.totalBeds)||0),0)},
    {label:"Available",    color:"green", icon:"🟢",compute:r=>r.reduce((s,w)=>s+(Number(w.availableBeds)||0),0)},
    {label:"Active",       color:"amber", icon:"✅",compute:r=>r.filter(w=>(w.status||"").toLowerCase()==="active").length},
  ],
  columns:[
    {key:"wardName",     label:"Ward",isName:true},
    {key:"wardType",     label:"Type"},
    {key:"totalBeds",    label:"Total Beds"},
    {key:"availableBeds",label:"Available"},
    {key:"floor",        label:"Floor"},
    {key:"status",       label:"Status"},
  ],
  formFields:[
    {section:"Ward Details", cols:2, fields:[
      {key:"wardName",    label:"Ward Name",  req:true,placeholder:"Ward name"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"wardType",    label:"Ward Type",  type:"select",lookupType:"WARD_TYPE"},
      {key:"totalBeds",   label:"Total Beds", type:"number",req:true,placeholder:"Total beds"},
      {key:"availableBeds",label:"Available Beds",type:"number",placeholder:"Available beds"},
      {key:"floor",       label:"Floor",      placeholder:"Floor number"},
      {key:"description", label:"Description",type:"textarea",placeholder:"Ward description",rows:2},
      {key:"status",      label:"Status",     type:"select",lookupType:"OPERATIONAL_STATUS"},
    ]},
  ],
};

const EMERGENCY_CONFIG = {
  title:"Emergency", icon:"🚨", idField:"emergencyId", endpoint:"/hospital/emergency/list", createEndpoint:"/hospital/emergency/register", updateEndpoint:"/hospital/emergency", deleteEndpoint:null, statusField:"emergencyStatus", emptyIcon:"🚨",
  kpiCards:[
    {label:"Total Cases",  color:"red",   icon:"🚨",compute:r=>r.length},
    {label:"Critical",     color:"red",   icon:"🔴",compute:r=>r.filter(e=>(e.severityLevel||"").toLowerCase()==="critical").length},
    {label:"Active",       color:"amber", icon:"⚡",compute:r=>r.filter(e=>(e.emergencyStatus||"").toLowerCase()==="active").length},
    {label:"Resolved",     color:"green", icon:"✅",compute:r=>r.filter(e=>(e.emergencyStatus||"").toLowerCase()==="stabilized"||(e.emergencyStatus||"").toLowerCase()==="discharged").length},
  ],
  filterOptions:[
    {label:"Critical", value:"critical", match:r=>(r.severityLevel||"").toLowerCase()==="critical"},
    {label:"High",     value:"high",     match:r=>(r.severityLevel||"").toLowerCase()==="high"},
    {label:"Active",   value:"active",   match:r=>(r.emergencyStatus||"").toLowerCase()==="active"},
  ],
  columns:[
    {key:"patientName",    label:"Patient",isName:true},
    {key:"chiefComplaint", label:"Complaint"},
    {key:"severityLevel",  label:"Severity",render:v=>{const c={critical:"red",high:"amber",moderate:"blue",low:"green"}[v?.toLowerCase()]||"slate";return <Badge color={c}>{v||"—"}</Badge>;}},
    {key:"assignedDoctorId",label:"Doctor ID"},
    {key:"arrivalTime",    label:"Arrival",render:v=>fmt(v)},
    {key:"emergencyStatus",label:"Status"},
  ],
  formFields:[
    {section:"Emergency Case", cols:2, fields:[
      {key:"patientName",    label:"Patient Name",    placeholder:"Walk-in patient name"},
      {key:"patientAge",     label:"Age",             type:"number",placeholder:"Age"},
      {key:"patientGender",  label:"Gender",          type:"select",lookupType:"GENDER"},
      {key:"patientMobile", label:"Mobile", placeholder:"Patient mobile", maxLength:10, digitsOnly:true},
      {key:"assignedDoctorId",label:"Doctor ID",      req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId", label:"Hospital", type:"hospitalSelect"},
      {key:"chiefComplaint", label:"Chief Complaint", req:true,type:"textarea",placeholder:"Presenting complaint",rows:2},
      {key:"severityLevel",  label:"Severity",        req:true,type:"select",lookupType:"SEVERITY_LEVEL"},
      {key:"arrivalTime",    label:"Arrival Time",    type:"datetime-local"},
      {key:"transportMode",  label:"Transport Mode",  type:"select",lookupType:"TRANSPORT_MODE"},
      {key:"triageCategory", label:"Triage Category", type:"select",lookupType:"TRIAGE_CATEGORY"},
      {key:"emergencyStatus",label:"Status",          type:"select",lookupType:"EMERGENCY_STATUS"},
    ]},
    {section:"Notes", cols:1, fields:[
      {key:"notes",label:"Clinical Notes",type:"textarea",placeholder:"Observations, treatment notes",rows:3},
    ]},
  ],
};

const PHARMACY_CONFIG = {
  title:"Pharmacy", icon:"💊", idField:"medicineId", endpoint:"/hospital/pharmacy/medicine/list", createEndpoint:"/hospital/pharmacy/medicine", updateEndpoint:"/hospital/pharmacy/medicine", deleteEndpoint:null, statusField:"isActive", emptyIcon:"💊",
  kpiCards:[
    {label:"Total Medicines",color:"teal",  icon:"💊",compute:r=>r.length},
    {label:"Low Stock",      color:"red",   icon:"⚠️",compute:r=>r.filter(m=>Number(m.quantity||0)<Number(m.lowStockAlertLevel||10)).length},
    {label:"Expiring Soon",  color:"amber", icon:"📅",compute:r=>r.filter(m=>{const d=new Date(m.expiryDate);const n=new Date();return d>n&&(d-n)<30*86400000;}).length},
    {label:"Total Value",    color:"green", icon:"💰",compute:r=>inr(r.reduce((s,m)=>s+(Number(m.sellingPrice||0)*Number(m.quantity||0)),0))},
  ],
  filterOptions:[
    {label:"Low Stock", value:"lowstock", match:r=>Number(r.quantity||0)<Number(r.lowStockAlertLevel||10)},
    {label:"Expiring",  value:"expiring", match:r=>{const d=new Date(r.expiryDate);const n=new Date();return d>n&&(d-n)<30*86400000;}},
  ],
  columns:[
    {key:"medicineName",   label:"Medicine",isName:true,sub:"batchNumber"},
    {key:"medicineCategory",label:"Category"},
    {key:"manufacturer",   label:"Manufacturer"},
    {key:"quantity",       label:"Stock",render:(v,r)=><span style={{color:Number(v)<Number(r.lowStockAlertLevel||10)?"#DC2626":"#059669",fontWeight:700}}>{v}</span>},
    {key:"sellingPrice",   label:"Price",render:v=>inr(v)},
    {key:"expiryDate",     label:"Expiry",render:v=>fmt(v)},
  ],
  formFields:[
    {section:"Medicine Details", cols:2, fields:[
      {key:"medicineName",    label:"Medicine Name",   req:true,placeholder:"Medicine name"},
      {key:"genericName",     label:"Generic Name",    placeholder:"Generic / compound name"},
      {key:"medicineCategory",label:"Category",        type:"select",lookupType:"MEDICINE_CATEGORY"},
      {key:"manufacturer",    label:"Manufacturer",    placeholder:"Manufacturer name"},
      {key:"batchNumber",     label:"Batch Number",    autoGen:true,placeholder:"Auto-generated"},
      {key:"quantity",        label:"Quantity",        type:"number",req:true,placeholder:"Stock quantity"},
      {key:"unit",            label:"Unit",            placeholder:"e.g. Strips, Vials, Bottles"},
      {key:"lowStockAlertLevel",label:"Low Stock Level",type:"number",placeholder:"Reorder threshold"},
      {key:"purchasePrice",   label:"Purchase Price (₹)",type:"number",placeholder:"Cost price"},
      {key:"sellingPrice",    label:"Selling Price (₹)", type:"number",placeholder:"Selling price"},
      {key:"expiryDate",      label:"Expiry Date",     req:true,type:"date"},
      {key:"supplier",        label:"Supplier",        placeholder:"Supplier name"},
      {key:"storageLocation", label:"Storage Location",placeholder:"Shelf / rack location"},
      {key:"hospitalId", label:"Hospital", type:"hospitalSelect"},
    ]},
  ],
};

const LAB_CONFIG = {
  title:"Lab & Reports", icon:"🔬", idField:"labTestId", endpoint:"/hospital/lab/list", createEndpoint:"/hospital/lab/order", updateEndpoint:"/hospital/lab", deleteEndpoint:null, statusField:"testStatus", emptyIcon:"🔬",
  kpiCards:[
    {label:"Total Tests",  color:"teal",  icon:"🔬",compute:r=>r.length},
    {label:"Pending",      color:"amber", icon:"⏳",compute:r=>r.filter(l=>(l.testStatus||"").toLowerCase()==="ordered"||(l.sampleStatus||"").toLowerCase()==="pending_collection").length},
    {label:"Completed",    color:"green", icon:"✅",compute:r=>r.filter(l=>(l.testStatus||"").toLowerCase()==="completed").length},
    {label:"Critical",     color:"red",   icon:"🚨",compute:r=>r.filter(l=>l.isCritical).length},
  ],
  filterOptions:[
    {label:"Ordered",    value:"ordered",    match:r=>(r.testStatus||"").toLowerCase()==="ordered"},
    {label:"Completed",  value:"completed",  match:r=>(r.testStatus||"").toLowerCase()==="completed"},
    {label:"Critical",   value:"critical",   match:r=>!!r.isCritical},
  ],
  columns:[
    {key:"labOrderNumber",label:"Order #",isName:true},
    {key:"patientId",     label:"Patient ID"},
    {key:"testName",      label:"Test"},
    {key:"testCategory",  label:"Category"},
    {key:"orderedDate",   label:"Ordered",render:v=>fmt(v)},
    {key:"result",        label:"Result"},
    {key:"testStatus",    label:"Status"},
  ],
  formFields:[
    {section:"Lab Test", cols:2, fields:[
      {key:"patientId",   label:"Patient ID",  req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",    label:"Doctor ID",   req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId", label:"Hospital", type:"hospitalSelect"},
      {key:"testName",    label:"Test Name",   req:true,placeholder:"e.g. CBC, LFT, Blood Sugar"},
      {key:"testCategory",label:"Category",    type:"select",lookupType:"LAB_TEST_CATEGORY"},
      {key:"orderedDate", label:"Ordered Date",type:"date"},
      {key:"sampleStatus",label:"Sample Status",req:true,type:"select",lookupType:"SAMPLE_STATUS"},
      {key:"testStatus",  label:"Test Status", type:"select",lookupType:"TEST_STATUS"},
      {key:"testCharges", label:"Test Charges (₹)",type:"number",placeholder:"Amount"},
    ]},
    {section:"Results", cols:2, fields:[
      {key:"result",       label:"Result",        type:"textarea",placeholder:"Test result",rows:2},
      {key:"resultStatus", label:"Result Status", type:"select",lookupType:"RESULT_STATUS"},
      {key:"notes",        label:"Notes",         type:"textarea",placeholder:"Additional notes",rows:2},
    ]},
  ],
};

const BILLING_CONFIG = {
  title:"Billing", icon:"💳", idField:"invoiceId", endpoint:"/hospital/billing/list", createEndpoint:"/hospital/billing/generate", updateEndpoint:"/hospital/billing", deleteEndpoint:null, statusField:"paymentStatus", emptyIcon:"💳",
  kpiCards:[
    {label:"Total Bills",    color:"teal",  icon:"💳",compute:r=>r.length},
    {label:"Total Revenue",  color:"green", icon:"💰",compute:r=>inr(r.filter(b=>(b.paymentStatus||"").toLowerCase()==="paid").reduce((s,b)=>s+Number(b.totalAmount||0),0))},
    {label:"Pending",        color:"amber", icon:"⏳",compute:r=>inr(r.filter(b=>(b.paymentStatus||"").toLowerCase()==="pending").reduce((s,b)=>s+Number(b.totalAmount||0),0))},
    {label:"Overdue",        color:"red",   icon:"⚠️",compute:r=>r.filter(b=>(b.paymentStatus||"").toLowerCase()==="overdue").length},
  ],
  filterOptions:[
    {label:"Paid",    value:"paid",    match:r=>(r.paymentStatus||"").toLowerCase()==="paid"},
    {label:"Pending", value:"pending", match:r=>(r.paymentStatus||"").toLowerCase()==="pending"},
    {label:"Overdue", value:"overdue", match:r=>(r.paymentStatus||"").toLowerCase()==="overdue"},
  ],
  columns:[
    {key:"invoiceNumber",    label:"Invoice #",isName:true},
    {key:"patientId",        label:"Patient ID"},
    {key:"billingCategory",  label:"Category"},
    {key:"totalAmount",      label:"Total",render:v=>inr(v)},
    {key:"paidAmount",       label:"Paid",render:v=>inr(v)},
    {key:"pendingAmount",    label:"Pending",render:v=>inr(v)},
    {key:"invoiceDate",      label:"Date",render:v=>fmt(v)},
    {key:"paymentStatus",    label:"Status"},
  ],
  formFields:[
    {section:"Bill Details", cols:2, fields:[
      {key:"patientId",           label:"Patient ID",          req:true, type:"number",placeholder:"Patient ID"},
      {key:"hospitalId", label:"Hospital", type:"hospitalSelect"},
      {key:"admissionId",         label:"Admission ID",        type:"number",placeholder:"Admission ID (IPD)"},
      {key:"consultationId",      label:"Consultation ID",     type:"number",placeholder:"Consultation ID (OPD)"},
      {key:"billingCategory",     label:"Billing Category",    req:true, placeholder:"e.g. OPD, IPD, Emergency"},
      {key:"invoiceDate",         label:"Invoice Date",        type:"date"},
    ]},
    {section:"Charges Breakdown", cols:3, fields:[
      {key:"consultationCharges", label:"Consultation",        type:"number",placeholder:"0"},
      {key:"roomCharges",         label:"Room / Bed",          type:"number",placeholder:"0"},
      {key:"nursingCharges",      label:"Nursing",             type:"number",placeholder:"0"},
      {key:"labCharges",          label:"Lab & Reports",       type:"number",placeholder:"0"},
      {key:"pharmacyCharges",     label:"Pharmacy",            type:"number",placeholder:"0"},
      {key:"otCharges",           label:"OT / Surgery",        type:"number",placeholder:"0"},
      {key:"emergencyCharges",    label:"Emergency",           type:"number",placeholder:"0"},
      {key:"otherCharges",        label:"Other",               type:"number",placeholder:"0"},
    ]},
    {section:"Discount & Payment", cols:2, fields:[
      {key:"discountAmount",      label:"Discount Amount",     type:"number",placeholder:"0"},
      {key:"discountPercent",     label:"Discount %",          type:"number",placeholder:"0"},
      {key:"discountReason",      label:"Discount Reason",     placeholder:"Reason for discount"},
      {key:"gstPercent",          label:"GST %",               type:"number",placeholder:"0"},
      {key:"advancePaid",         label:"Advance Paid",        type:"number",placeholder:"0"},
      {key:"insuranceDeduction",  label:"Insurance Deduction", type:"number",placeholder:"0"},
      {key:"insurancePolicyNumber",label:"Insurance Policy No.",placeholder:"Policy number"},
      {key:"insuranceProvider",   label:"Insurance Provider",  placeholder:"Provider name"},
      {key:"paymentStatus",       label:"Payment Status",      type:"select",lookupType:"PAYMENT_STATUS"},
      {key:"notes",               label:"Notes",               type:"textarea",placeholder:"Bill notes",rows:2},
    ]},
  ],
};

const INSURANCE_CONFIG = {
  title:"Insurance", icon:"🛡️", idField:"claimId", endpoint:"/hospital/insurance/list", createEndpoint:"/hospital/insurance/claim", updateEndpoint:"/hospital/insurance", deleteEndpoint:null, statusField:"claimStatus", emptyIcon:"🛡️",
  kpiCards:[
    {label:"Total Claims",    color:"teal",  icon:"🛡️",compute:r=>r.length},
    {label:"Approved",        color:"green", icon:"✅",compute:r=>r.filter(i=>(i.claimStatus||"").toLowerCase()==="approved").length},
    {label:"Pending",         color:"amber", icon:"⏳",compute:r=>r.filter(i=>(i.claimStatus||"").toLowerCase()==="pending").length},
    {label:"Total Claimed",   color:"blue",  icon:"💰",compute:r=>inr(r.reduce((s,i)=>s+Number(i.claimAmount||0),0))},
  ],
  columns:[
    {key:"claimNumber",       label:"Claim #",isName:true},
    {key:"patientId",         label:"Patient ID"},
    {key:"insuranceProvider", label:"Insurer"},
    {key:"policyNumber",      label:"Policy No."},
    {key:"claimAmount",       label:"Claim Amount",render:v=>inr(v)},
    {key:"claimSubmissionDate",label:"Claim Date",render:v=>fmt(v)},
    {key:"claimStatus",       label:"Status"},
  ],
  formFields:[
    {section:"Insurance Claim", cols:2, fields:[
      {key:"patientId",          label:"Patient ID",         req:true, type:"number",placeholder:"Patient ID"},
      {key:"hospitalId", label:"Hospital", type:"hospitalSelect"},
      {key:"admissionId",        label:"Admission ID",       type:"number",placeholder:"Admission ID"},
      {key:"invoiceId",          label:"Invoice ID",         type:"number",placeholder:"Invoice ID"},
      {key:"insuranceProvider",  label:"Insurance Company",  req:true,placeholder:"Insurance provider name"},
      {key:"policyNumber",       label:"Policy Number",      req:true,placeholder:"Policy no."},
      {key:"policyExpiry",       label:"Policy Expiry",      req:true,type:"date"},
      {key:"tpaName",            label:"TPA Name",           placeholder:"Third party administrator"},
      {key:"authorizationCode",  label:"Authorization Code", placeholder:"Auth code"},
      {key:"coverageAmount",     label:"Coverage Amount",    type:"number",placeholder:"Max coverage in INR"},
      {key:"claimAmount",        label:"Claim Amount",       type:"number",placeholder:"Amount in INR"},
      {key:"approvedAmount",     label:"Approved Amount",    type:"number",placeholder:"Approved in INR"},
      {key:"claimStatus",        label:"Status",             type:"select",lookupType:"INSURANCE_CLAIM_STATUS"},
      {key:"claimSubmissionDate",label:"Claim Date",         type:"date"},
      {key:"remarks",            label:"Notes / Remarks",    type:"textarea",placeholder:"Claim notes",rows:2},
    ]},
  ],
};

const OT_CONFIG = {
  title:"Operation Theatre", icon:"🔪", idField:"otId", endpoint:"/hospital/ot/list", createEndpoint:"/hospital/ot/schedule", updateEndpoint:"/hospital/ot", deleteEndpoint:null, statusField:"otStatus", emptyIcon:"🔪",
  kpiCards:[
    {label:"Total OTs",   color:"teal",  icon:"🔪",compute:r=>r.length},
    {label:"Scheduled",   color:"blue",  icon:"📅",compute:r=>r.filter(o=>(o.otStatus||"").toUpperCase()==="SCHEDULED").length},
    {label:"Completed",   color:"green", icon:"✅",compute:r=>r.filter(o=>(o.otStatus||"").toUpperCase()==="COMPLETED").length},
    {label:"Emergency OT",color:"red",   icon:"🚨",compute:r=>r.filter(o=>o.otType==="Emergency").length},
  ],
  columns:[
    {key:"otNumber",      label:"OT #",isName:true},
    {key:"patientId",     label:"Patient ID"},
    {key:"surgeonId",     label:"Surgeon ID"},
    {key:"procedureName", label:"Procedure"},
    {key:"otRoom",        label:"OT Room"},
    {key:"scheduledStartTime",label:"Scheduled",render:v=>fmt(v)},
    {key:"otStatus",      label:"Status"},
  ],
  formFields:[
    {section:"Operation Theatre Details", cols:2, fields:[
      {key:"patientId",     label:"Patient ID",    req:true,type:"number",placeholder:"Patient ID"},
      {key:"surgeonId",     label:"Surgeon ID",    req:true,type:"number",placeholder:"Surgeon Doctor ID"},
      {key:"admissionId",   label:"Admission ID",  type:"number",placeholder:"Admission ID"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"procedureName", label:"Procedure",     req:true,placeholder:"Surgery/procedure name"},
      {key:"otRoom",        label:"OT Room",       placeholder:"Theatre room no."},
      {key:"anesthesiaType",label:"Anesthesia",    type:"select",lookupType:"ANESTHESIA_TYPE"},
      {key:"anesthesiaDoctorId",label:"Anesthesiologist ID",placeholder:"Doctor ID"},
      {key:"otStatus",      label:"Status",        type:"select",lookupType:"OT_STATUS"},
      {key:"otCharges",     label:"OT Charges",    type:"number",placeholder:"Amount in INR"},
    ]},
    {section:"Schedule", cols:2, fields:[
      {key:"scheduledStartTime", label:"Scheduled Start Time", req:true, type:"datetime-local"},
      {key:"scheduledEndTime",   label:"Scheduled End Time",   req:true, type:"datetime-local"},
    ]},
    {section:"Notes", cols:2, fields:[
      {key:"preOpNotes",  label:"Pre-Op Notes",  type:"textarea",placeholder:"Pre-operative notes",rows:2},
      {key:"postOpNotes", label:"Post-Op Notes", type:"textarea",placeholder:"Post-operative notes",rows:2},
    ]},
  ],
};

const DISCHARGE_CONFIG = {
  title:"Discharge", icon:"🏠", idField:"dischargeId", endpoint:"/hospital/discharge/list", createEndpoint:"/hospital/discharge", updateEndpoint:"/hospital/discharge", deleteEndpoint:null, statusField:"status", emptyIcon:"🏠",
  kpiCards:[
    {label:"Total Discharges",  color:"teal",  icon:"🏠",compute:r=>r.length},
    {label:"Today",             color:"blue",  icon:"📅",compute:r=>r.filter(d=>d.dischargeDate?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Draft",             color:"amber", icon:"⏳",compute:r=>r.filter(d=>(d.status||"").toLowerCase()==="draft").length},
    {label:"Finalized",         color:"green", icon:"✅",compute:r=>r.filter(d=>(d.status||"").toLowerCase()==="finalized").length},
  ],
  columns:[
    {key:"dischargeId",    label:"Discharge #",isName:true},
    {key:"patientId",      label:"Patient ID"},
    {key:"doctorId",       label:"Doctor ID"},
    {key:"dischargeDate",  label:"Discharged",render:v=>fmt(v)},
    {key:"finalDiagnosis", label:"Diagnosis"},
    {key:"dischargeType",  label:"Type"},
    {key:"status",         label:"Status"},
  ],
  formFields:[
    {section:"Discharge Details", cols:2, fields:[
      {key:"admissionId",        label:"Admission",        req:true,type:"admissionSelect"},
      {key:"patientId",          label:"Patient ID",       req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",           label:"Doctor ID",        req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId", label:"Hospital", type:"hospitalSelect"},
      {key:"dischargeDate",      label:"Discharge Date",   type:"date"},
      {key:"finalDiagnosis",     label:"Final Diagnosis",  req:true,placeholder:"Discharge diagnosis"},
      {key:"dischargeCondition", label:"Discharge Condition",type:"select",lookupType:"DISCHARGE_CONDITION"},
      {key:"dischargeType",      label:"Discharge Type",   type:"select",lookupType:"DISCHARGE_TYPE"},
      {key:"followUpDate",       label:"Follow-up Date",   type:"date"},
      {key:"billingCleared",     label:"Billing Cleared",  type:"select",lookupType:"YES_NO"},
      {key:"doctorApproved",     label:"Doctor Approved",  type:"select",lookupType:"YES_NO"},
      {key:"status",             label:"Status",           type:"select",lookupType:"DOCUMENT_STATUS"},
    ]},
    {section:"Clinical Summary", cols:1, fields:[
      {key:"treatmentSummary",     label:"Treatment Summary",     type:"textarea",placeholder:"Summary of treatment given",rows:2},
      {key:"dischargeMedications", label:"Discharge Medications", type:"textarea",placeholder:"Medicines at discharge",rows:2},
      {key:"followUpInstructions", label:"Follow-up Instructions",type:"textarea",placeholder:"Post-discharge instructions",rows:2},
      {key:"specialInstructions",  label:"Special Instructions",  type:"textarea",placeholder:"Special care notes",rows:2},
    ]},
  ],
};

const STAFF_CONFIG = {
  title:"Staff", icon:"👥", idField:"staffId", endpoint:"/hospital/staff/list", createEndpoint:"/hospital/staff", updateEndpoint:"/hospital/staff", deleteEndpoint:"/hospital/staff", statusField:"status", emptyIcon:"👥",
  kpiCards:[
    {label:"Total Staff",  color:"teal",  icon:"👥",compute:r=>r.length},
    {label:"Nurses",       color:"blue",  icon:"👩‍⚕️",compute:r=>r.filter(s=>(s.staffRole||"").toLowerCase().includes("nurse")).length},
    {label:"Technicians",  color:"violet",icon:"🔬",compute:r=>r.filter(s=>(s.staffRole||"").toLowerCase().includes("technician")).length},
    {label:"Active",       color:"green", icon:"✅",compute:r=>r.filter(s=>(s.status||"").toLowerCase()==="active").length},
  ],
  filterOptions:[
    {label:"Active",     value:"active",  match:r=>(r.status||"").toLowerCase()==="active"},
    {label:"Nurses",     value:"nurses",  match:r=>(r.staffRole||"").toLowerCase().includes("nurse")},
    {label:"On Leave",   value:"leave",   match:r=>(r.status||"").toLowerCase()==="on_leave"},
  ],
  columns:[
    {key:"staffName",    label:"Staff",isName:true,sub:"staffCode"},
    {key:"staffRole",    label:"Role"},
    {key:"mobileNumber", label:"Mobile"},
    {key:"shiftType",    label:"Shift"},
    {key:"qualification",label:"Qualification"},
    {key:"status",       label:"Status"},
  ],
  formFields:[
    {section:"Staff Information", cols:2, fields:[
      {key:"staffName",   label:"Full Name",    req:true,placeholder:"Staff full name"},
      {key:"mobileNumber", label:"Mobile", req:true, placeholder:"10-digit mobile", maxLength:10, digitsOnly:true},
      {key:"email",       label:"Email",        placeholder:"Email address"},
      {key:"gender",      label:"Gender",       type:"select",lookupType:"GENDER"},
      {key:"staffRole",   label:"Role",         req:true,type:"select",lookupType:"STAFF_ROLE"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"shiftType",   label:"Shift",        type:"select",lookupType:"SHIFT_TYPE"},
      {key:"staffCode",   label:"Staff Code",   autoGen:true,placeholder:"Auto-generated"},
      {key:"qualification",label:"Qualification",placeholder:"Degrees/certifications"},
      {key:"licenseNumber",label:"License Number",placeholder:"License no."},
      {key:"joiningDate", label:"Joining Date", type:"date"},
      {key:"status",      label:"Status",       type:"select",lookupType:"STAFF_STATUS"},
    ]},
    {section:"Address", cols:1, fields:[
      {key:"address",label:"Address",type:"textarea",placeholder:"Staff address",rows:2},
    ]},
  ],
};

const REPORTS_CONFIG = {
  title:"Reports", icon:"📊", idField:"invoiceId", endpoint:"/hospital/billing/list", createEndpoint:null, updateEndpoint:"/hospital/billing", deleteEndpoint:null, statusField:"paymentStatus", emptyIcon:"📊",
  kpiCards:[
    {label:"Total Invoices", color:"teal",  icon:"📊",compute:r=>r.length},
    {label:"This Month",     color:"blue",  icon:"📅",compute:r=>r.filter(r2=>r2.invoiceDate&&new Date(r2.invoiceDate).getMonth()===new Date().getMonth()).length},
    {label:"Financial",      color:"green", icon:"💰",compute:r=>inr(r.reduce((s,i)=>s+Number(i.totalAmount||0),0))},
    {label:"Pending",        color:"amber", icon:"⏳",compute:r=>r.filter(r2=>(r2.paymentStatus||"").toUpperCase()==="PENDING").length},
  ],
  columns:[
    {key:"invoiceNumber",   label:"Invoice #",isName:true},
    {key:"patientId",       label:"Patient ID"},
    {key:"billingCategory", label:"Category"},
    {key:"totalAmount",     label:"Total",render:v=>inr(v)},
    {key:"paidAmount",      label:"Paid",render:v=>inr(v)},
    {key:"pendingAmount",   label:"Pending",render:v=>inr(v)},
    {key:"invoiceDate",     label:"Date",render:v=>fmt(v)},
    {key:"paymentStatus",   label:"Status"},
  ],
  formFields:[],
};

/* ═══════════════════════════════════════════════════════════════════════
   NAV CONFIG
═══════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════
   MISSING EPIC CONFIGS — Department, Admin, Relationship, Hospital,
   Nursing Notes, Prescription, Advance Payment
═══════════════════════════════════════════════════════════════════════ */
const HOSPITAL_CONFIG = {
  title:"Hospital Management", icon:"🏥",
  idField:"hospitalId",
  endpoint:"/hospital/list",
  createEndpoint:"/hospital/register",
  updateEndpoint:"/hospital",
  deleteEndpoint:"/hospital",
  statusField:"isActive", emptyIcon:"🏥",
  defaultView: "grid",
  kpiCards:[
    {label:"Total Hospitals",   color:"teal",   icon:"🏥",compute:r=>r.length},
    {label:"Active Hospitals",  color:"green",  icon:"✅",compute:r=>r.filter(h=>h.isActive===true||h.isActive===1).length},
    {label:"Total Bed Capacity",color:"blue",   icon:"🛏️",compute:r=>r.reduce((s,h)=>s+(Number(h.totalBeds)||0),0)},
    {label:"Private Type",      color:"violet", icon:"🩺",compute:r=>r.filter(h=>(h.hospitalType||"").toUpperCase()==="PRIVATE").length},
    {label:"Covered Cities",    color:"amber",  icon:"📍",compute:r=>new Set(r.map(h=>h.city).filter(Boolean)).size},
  ],
  columns:[
    {key:"hospitalName",      label:"Hospital",isName:true,sub:"registrationNumber"},
    {key:"registrationNumber",label:"Reg. Number"},
    {key:"address",           label:"Address"},
    {key:"phone",             label:"Contact"},
    {key:"city",              label:"City"},
    {key:"hospitalType",      label:"Type"},
  ],
  formFields:[
    {section:"Hospital Information", cols:2, fields:[
      {key:"hospitalName",       label:"Hospital Name",        req:true,placeholder:"Full hospital name"},
      {key:"registrationNumber", label:"Registration Number",  req:true,placeholder:"e.g. MH-2024-HOSP-001"},
      {key:"phone", label:"Phone (10 digits)", placeholder:"10-digit phone", maxLength:10, digitsOnly:true},
      {key:"email",              label:"Email",                placeholder:"Email address"},
      {key:"address",            label:"Address",              placeholder:"Street address"},
      {key:"city",               label:"City",                 placeholder:"City"},
      {key:"state",              label:"State",                placeholder:"State"},
      {key:"pincode",            label:"Pincode",              placeholder:"6-digit pincode"},
      {key:"hospitalType",       label:"Hospital Type",        type:"select",lookupType:"HOSPITAL_TYPE"},
      {key:"totalBeds",          label:"Total Beds",           type:"number",placeholder:"Total bed count"},
      {key:"website",            label:"Website",              placeholder:"https://..."},
      {key:"isActive",           label:"Is Active?",           type:"booleanSelect"},
      {key:"description",        label:"Description",          type:"textarea",placeholder:"About the hospital",rows:2},
    ]},
  ],
  renderGridCard: (row, i, { openEdit, setDelItem }) => {
    const isActive = row.isActive === true || row.isActive === 1;
    return (
      <div key={row.hospitalId || i} className="hm-card">
        <div className={`hm-card-header ${!isActive ? 'inactive' : ''}`}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div className="hm-card-title">{row.hospitalName}</div>
            <span className="hm-card-badge" style={{ background: isActive ? "#D1FAE5" : "#FEE2E2", color: isActive ? "#065F46" : "#991B1B", fontWeight: 700, borderRadius: 20, padding: "2px 8px", fontSize: 10 }}>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="hm-card-subtitle">Reg No: {row.registrationNumber || "—"}</div>
        </div>
        <div className="hm-card-body">
          {row.description && (
            <div className="hm-card-desc" style={{ marginBottom: 6 }}>
              {row.description}
            </div>
          )}
          <div className="hm-card-info-grid">
            <div className="hm-card-info-item">
              <span className="hm-card-info-icon">📍</span>
              <span style={{ fontSize: 13, color: "var(--hm-text)" }}>
                {row.address || "—"}{row.city ? `, ${row.city}` : ""}{row.state ? `, ${row.state}` : ""}
              </span>
            </div>
            <div className="hm-card-info-item">
              <span className="hm-card-info-icon">📞</span>
              <span style={{ fontSize: 13, color: "var(--hm-text)" }}>{row.phone || "—"}</span>
            </div>
            {row.email && (
              <div className="hm-card-info-item">
                <span className="hm-card-info-icon">✉️</span>
                <span style={{ fontSize: 12.5, color: "var(--hm-text)", wordBreak: "break-all" }}>{row.email}</span>
              </div>
            )}
            {row.website && (
              <div className="hm-card-info-item">
                <span className="hm-card-info-icon">🌐</span>
                <a href={row.website.startsWith("http") ? row.website : `https://${row.website}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#047857", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
                  {row.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>
          <div className="hm-card-badges">
            <span className="badge badge-teal">🏥 {row.hospitalType || "GENERAL"}</span>
            {row.totalBeds && <span className="badge badge-blue">🛏️ {row.totalBeds} Beds</span>}
            {row.pincode && <span className="badge badge-slate">📮 {row.pincode}</span>}
          </div>
        </div>
        <div className="hm-card-footer" onClick={e => e.stopPropagation()}>
          <button className="btn-icon-sm edit" title="Edit" onClick={() => openEdit(row)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#047857" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button className="btn-icon-sm del" title="Delete" onClick={() => setDelItem(row)}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#DC2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    );
  }
};

const DEPARTMENT_CONFIG = {
  title:"Department Management", icon:"🏢",
  idField:"deptId",
  endpoint:"/hospital/department/list",
  createEndpoint:"/hospital/department",
  updateEndpoint:"/hospital/department",
  deleteEndpoint:"/hospital/department",
  statusField:"operationalStatus", emptyIcon:"🏢",
  kpiCards:[
    {label:"Total Departments",color:"teal",  icon:"🏢",compute:r=>r.length},
    {label:"Active",           color:"green", icon:"✅",compute:r=>r.filter(d=>(d.operationalStatus||"").toUpperCase()==="ACTIVE").length},
  ],
  columns:[
    {key:"deptName",          label:"Department",isName:true},
    {key:"hospitalId",        label:"Hospital ID"},
    {key:"headDoctorId",      label:"Head Doctor"},
    {key:"operationalStatus", label:"Status"},
    {key:"description",       label:"Description"},
  ],
  formFields:[
    {section:"Department Details", cols:2, fields:[
      {key:"deptName",          label:"Department Name",    req:true,placeholder:"e.g. Cardiology, Orthopedics"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"headDoctorId",      label:"Head Doctor ID",     placeholder:"Doctor ID (optional)"},
      {key:"description",       label:"Description",        type:"textarea",placeholder:"Department description",rows:2},
      {key:"operationalStatus", label:"Status",             type:"select",lookupType:"ACTIVE_STATUS"},
    ]},
  ],
};

const ADMIN_CONFIG = {
  title:"Admin Management", icon:"⚙️",
  idField:"staffId",
  endpoint:"/hospital/staff/list",
  createEndpoint:"/hospital/staff",
  updateEndpoint:"/hospital/staff",
  deleteEndpoint:"/hospital/staff",
  statusField:"status", emptyIcon:"⚙️",
  kpiCards:[
    {label:"Total Staff",   color:"teal",  icon:"⚙️",compute:r=>r.length},
    {label:"Active",        color:"green", icon:"✅",compute:r=>r.filter(a=>(a.status||"").toUpperCase()==="ACTIVE").length},
    {label:"On Leave",      color:"amber", icon:"🌴",compute:r=>r.filter(a=>(a.status||"").toUpperCase()==="ON_LEAVE").length},
  ],
  columns:[
    {key:"staffName",   label:"Staff",isName:true,sub:"staffCode"},
    {key:"email",       label:"Email"},
    {key:"staffRole",   label:"Role"},
    {key:"mobileNumber",label:"Mobile"},
    {key:"hospitalId",  label:"Hospital ID"},
    {key:"status",      label:"Status"},
  ],
  formFields:[
    {section:"Staff Information", cols:2, fields:[
      {key:"staffName",    label:"Full Name",   req:true,placeholder:"Staff full name"},
      {key:"mobileNumber", label:"Mobile", req:true, placeholder:"10-digit mobile", maxLength:10, digitsOnly:true},
      {key:"email",        label:"Email",        placeholder:"Staff email"},
      {key:"staffRole",    label:"Role",         req:true,type:"select",lookupType:"STAFF_ROLE"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"deptId",       label:"Department ID",type:"number",placeholder:"Department ID"},
      {key:"shiftType",    label:"Shift",        type:"select",lookupType:"SHIFT_TYPE"},
      {key:"gender",       label:"Gender",       type:"select",lookupType:"GENDER"},
      {key:"qualification",label:"Qualification",placeholder:"Degree / certification"},
      {key:"status",       label:"Status",       type:"select",lookupType:"STAFF_STATUS"},
    ]},
  ],
};

const RELATIONSHIP_CONFIG = {
  title:"Relationship Management", icon:"🤝",
  idField:"patientId",
  endpoint:"/hospital/patient/list",
  createEndpoint:"/hospital/patient/register",
  updateEndpoint:"/hospital/patient",
  deleteEndpoint:"/hospital/patient",
  statusField:"status", emptyIcon:"🤝",
  kpiCards:[
    {label:"Total Patients",color:"teal",  icon:"🤝", compute:r=>r.length},
    {label:"Active",        color:"green", icon:"✅",  compute:r=>r.filter(p=>(p.status||"").toUpperCase()==="ACTIVE").length},
    {label:"OPD",           color:"blue",  icon:"🩺",  compute:r=>r.filter(p=>p.patientType==="OPD").length},
    {label:"IPD",           color:"amber", icon:"🛏️", compute:r=>r.filter(p=>p.patientType==="IPD").length},
  ],
  columns:[
    {key:"patientName",  label:"Patient",isName:true,sub:"uhid"},
    {key:"mobileNumber", label:"Mobile"},
    {key:"patientType",  label:"Type"},
    {key:"insuranceProvider",label:"Insurance Provider"},
    {key:"insurancePolicyNumber",label:"Policy No."},
    {key:"status",       label:"Status"},
  ],
  formFields:[
    {section:"Patient Details", cols:2, fields:[
      {key:"patientName",  label:"Patient Name",    req:true,placeholder:"Full name"},
      {key:"mobileNumber", label:"Mobile", req:true, placeholder:"10-digit mobile", maxLength:10, digitsOnly:true},
      {key:"email",        label:"Email",            placeholder:"Email address"},
      {key:"address",      label:"Address",          req:true,placeholder:"Full address"},
      {key:"gender",       label:"Gender",           type:"select",lookupType:"GENDER"},
      {key:"age",          label:"Age",              type:"number",placeholder:"Age in years"},
      {key:"bloodGroup",   label:"Blood Group",      type:"select",lookupType:"BLOOD_GROUP"},
      {key:"patientType",  label:"Patient Type",     type:"select",lookupType:"PATIENT_TYPE"},
      {key:"insuranceProvider",      label:"Insurance Provider", placeholder:"Provider name"},
      {key:"insurancePolicyNumber",  label:"Policy Number",      placeholder:"Policy number"},
      {key:"status",       label:"Status",           type:"select",lookupType:"ACTIVE_STATUS"},
    ]},
  ],
};

const PRESCRIPTION_CONFIG = {
  title:"Prescription Management", icon:"📝",
  idField:"prescriptionId",
  endpoint:"/hospital/prescription/list", createEndpoint:"/hospital/prescription/create",
  updateEndpoint:"/hospital/prescription",
  deleteEndpoint:null,
  statusField:"status", emptyIcon:"📝",
  kpiCards:[
    {label:"Total",     color:"teal",  icon:"📝",compute:r=>r.length},
    {label:"Today",     color:"blue",  icon:"📅",compute:r=>r.filter(p=>p.prescriptionDate?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Active",    color:"green", icon:"✅",compute:r=>r.filter(p=>(p.status||"").toLowerCase()==="active").length},
    {label:"Refillable",color:"amber", icon:"🔄",compute:r=>r.filter(p=>p.isRefillAllowed).length},
  ],
  filterOptions:[
    {label:"Active",   value:"active",   match:r=>(r.status||"").toLowerCase()==="active"},
    {label:"Completed",value:"completed",match:r=>(r.status||"").toLowerCase()==="completed"},
  ],
  columns:[
    {key:"prescriptionNumber",label:"Rx #",isName:true},
    {key:"patientId",         label:"Patient ID"},
    {key:"doctorId",          label:"Doctor ID"},
    {key:"prescriptionType",  label:"Type"},
    {key:"prescriptionDate",  label:"Date",render:v=>fmt(v)},
    {key:"status",            label:"Status"},
  ],
  formFields:[
    {section:"Prescription Details", cols:2, fields:[
      {key:"patientId",       label:"Patient ID",    req:true,type:"number",placeholder:"Patient ID"},
      {key:"doctorId",        label:"Doctor ID",     req:true,type:"number",placeholder:"Doctor ID"},
      {key:"hospitalId", label:"Hospital", type:"hospitalSelect"},
      {key:"consultationId",  label:"Consultation ID",type:"number",placeholder:"Consultation ID (optional)"},
      {key:"admissionId",     label:"Admission ID",  type:"number",placeholder:"Admission ID (optional)"},
      {key:"prescriptionDate",label:"Date",          type:"date"},
      {key:"prescriptionType",label:"Type",          type:"select",lookupType:"PRESCRIPTION_TYPE"},
      {key:"status",          label:"Status",        type:"select",lookupType:"PRESCRIPTION_STATUS"},
    ]},
    {section:"Medicines", cols:1, fields:[
      {key:"medicines",label:"Medicines",req:true,type:"textarea",placeholder:"List medicines with dosage, frequency, duration (e.g. Paracetamol 500mg - Twice daily - 5 days)",rows:4},
      {key:"notes",    label:"Notes",    type:"textarea",placeholder:"Special instructions",rows:2},
    ]},
  ],
};

const NURSING_CONFIG = {
  title:"Nursing Notes", icon:"🩺",
  idField:"noteId",
  endpoint:"/hospital/nursing/list", createEndpoint:"/hospital/nursing/note",
  updateEndpoint:"/hospital/nursing",
  deleteEndpoint:null,
  statusField:"noteType", emptyIcon:"🩺",
  kpiCards:[
    {label:"Total Notes",color:"teal",  icon:"🩺",compute:r=>r.length},
    {label:"Today",      color:"blue",  icon:"📅",compute:r=>r.filter(n=>n.recordedAt?.startsWith(new Date().toISOString().slice(0,10))).length},
    {label:"Night Shift",color:"violet",icon:"🌙",compute:r=>r.filter(n=>(n.shift||"").toLowerCase()==="night").length},
  ],
  columns:[
    {key:"nurseName",           label:"Nurse",isName:true},
    {key:"patientId",           label:"Patient ID"},
    {key:"admissionId",         label:"Admission ID"},
    {key:"shift",               label:"Shift"},
    {key:"vitalsBloodPressure", label:"BP"},
    {key:"recordedAt",          label:"Recorded",render:v=>fmt(v)},
  ],
  formFields:[
    {section:"Nursing Note", cols:2, fields:[
      {key:"admissionId",        label:"Admission",      req:true,type:"admissionSelect"},
      {key:"patientId",          label:"Patient ID",     req:true,type:"number",placeholder:"Patient ID"},
      {key:"nurseName",          label:"Nurse Name",     placeholder:"Nurse name"},
      {key:"nurseId",            label:"Nurse ID",       type:"number",placeholder:"Nurse staff ID"},
      {key:"hospitalId", label:"Hospital", type:"hospitalSelect"},
      {key:"shift",              label:"Shift",          type:"select",lookupType:"SHIFT_TYPE"},
      {key:"noteType",           label:"Note Type",      type:"select",lookupType:"NURSING_NOTE_TYPE"},
      {key:"recordedAt",         label:"Recorded At",    type:"datetime-local"},
    ]},
    {section:"Vitals", cols:3, fields:[
      {key:"vitalsBloodPressure",label:"Blood Pressure", placeholder:"e.g. 120/80"},
      {key:"vitalsPulse",        label:"Pulse",          placeholder:"e.g. 72 bpm"},
      {key:"vitalsTemperature",  label:"Temperature",    placeholder:"e.g. 98.6°F"},
      {key:"vitalsSpO2",         label:"SpO2",           placeholder:"e.g. 98%"},
      {key:"vitalsWeight",       label:"Weight (kg)",    placeholder:"e.g. 70"},
    ]},
    {section:"Notes", cols:1, fields:[
      {key:"notes",label:"Clinical Notes",type:"textarea",placeholder:"Observations, medications given, handover notes",rows:3},
    ]},
  ],
};

const ADVANCE_PAYMENT_CONFIG = {
  title:"Advance Payment", icon:"💵",
  idField:"advanceId",
  endpoint:"/hospital/billing/advance/all", createEndpoint:"/hospital/billing/advance",
  updateEndpoint:"/hospital/billing/advance",
  deleteEndpoint:null,
  statusField:"advanceStatus", emptyIcon:"💵",
  kpiCards:[
    {label:"Total Advances",color:"teal",  icon:"💵",compute:r=>r.length},
    {label:"Total Amount",  color:"green", icon:"💰",compute:r=>inr(r.reduce((s,a)=>s+Number(a.amount||0),0))},
    {label:"Adjusted",      color:"amber", icon:"✅",compute:r=>r.filter(a=>(a.advanceStatus||"").toUpperCase()==="ADJUSTED").length},
    {label:"Pending",       color:"blue",  icon:"⏳",compute:r=>r.filter(a=>(a.advanceStatus||"").toUpperCase()==="PENDING").length},
  ],
  columns:[
    {key:"advanceReference",label:"Reference",isName:true},
    {key:"patientId",      label:"Patient ID"},
    {key:"amount",         label:"Amount",render:v=>inr(v)},
    {key:"paymentMode",    label:"Payment Mode"},
    {key:"receiptNumber",  label:"Receipt No."},
    {key:"paymentDate",    label:"Date",render:v=>fmt(v)},
    {key:"advanceStatus",  label:"Status"},
  ],
  filterOptions:[
    {label:"Pending",  value:"pending",  match:r=>(r.advanceStatus||"").toUpperCase()==="PENDING"},
    {label:"Adjusted", value:"adjusted", match:r=>(r.advanceStatus||"").toUpperCase()==="ADJUSTED"},
    {label:"Refunded", value:"refunded", match:r=>(r.advanceStatus||"").toUpperCase()==="REFUNDED"},
  ],
  formFields:[
    {section:"Advance Payment Details", cols:2, fields:[
      {key:"patientId",    label:"Patient ID",    req:true,type:"number",placeholder:"Patient ID"},
      {key:"admissionId",  label:"Admission ID",  type:"number",placeholder:"Admission ID (if IPD)"},
      {key:"hospitalId", label:"Hospital", req:true, type:"hospitalSelect"},
      {key:"amount",       label:"Amount (₹)",    req:true,type:"number",placeholder:"Amount"},
      {key:"advanceType",  label:"Advance Type",  type:"select",lookupType:"ADVANCE_TYPE"},
      {key:"paymentMode",  label:"Payment Mode",  type:"select",lookupType:"PAYMENT_MODE"},
      {key:"transactionId",label:"Transaction ID",placeholder:"UPI/card reference"},
      {key:"paymentDate",  label:"Payment Date",  type:"date"},
      {key:"collectedBy",  label:"Collected By",  placeholder:"Staff name"},
      {key:"advanceStatus",label:"Status",        type:"select",lookupType:"ADVANCE_STATUS"},
      {key:"notes",        label:"Notes",         type:"textarea",placeholder:"Payment notes",rows:2},
    ]},
  ],
};

const NAV = [
  {
    section: "Overview",
    items: [
      { key:"dashboard",     label:"Dashboard",            emoji:"📊", cls:"dash-tab" },
    ]
  },
  {
    section: "Clinical",
    items: [
      { key:"patients",      label:"Patients",             emoji:"🧑‍⚕️" },
      { key:"doctors",       label:"Doctors",              emoji:"👨‍⚕️" },
      { key:"appointments",  label:"Appointments",         emoji:"📅", cls:"blue-tab" },
      { key:"opd",           label:"OPD",                  emoji:"🩺" },
      { key:"ipd",           label:"IPD / Admissions",     emoji:"🛏️", cls:"blue-tab" },
      { key:"discharge",     label:"Discharge",            emoji:"🏠" },
      { key:"emergency",     label:"Emergency",            emoji:"🚨", cls:"red-tab" },
    ]
  },
  {
    section: "Procedures",
    items: [
      { key:"ot",            label:"Operation Theatre",    emoji:"🔪", cls:"red-tab" },
      { key:"lab",           label:"Lab & Reports",        emoji:"🔬" },
      { key:"pharmacy",      label:"Pharmacy",             emoji:"💊", cls:"amber-tab" },
      { key:"prescription",  label:"Prescriptions",        emoji:"📝" },
      { key:"nursing",       label:"Nursing Notes",        emoji:"🩺", cls:"blue-tab" },
    ]
  },
  {
    section: "Administration",
    items: [
      { key:"wards",         label:"Wards & Beds",         emoji:"🏨", cls:"blue-tab" },
      { key:"insurance",     label:"Insurance",            emoji:"🛡️" },
      { key:"billing",       label:"Billing",              emoji:"💳", cls:"amber-tab" },
      { key:"advancepay",    label:"Advance Payment",      emoji:"💵", cls:"green-tab" },
      { key:"staff",         label:"Staff",                emoji:"👥" },
    ]
  },
  {
    section: "Management",
    items: [
      { key:"hospitals",     label:"Hospital Mgmt",        emoji:"🏥" },
      { key:"departments",   label:"Departments",          emoji:"🏢", cls:"blue-tab" },
      { key:"admin",         label:"Admin",                emoji:"⚙️" },
      { key:"relationship",  label:"Relationships",        emoji:"🤝" },
      { key:"reports",       label:"Reports",              emoji:"📊", cls:"blue-tab" },
    ]
  },
];

export const TAB_CONFIG_MAP = {
  patients: PATIENT_CONFIG, doctors: DOCTOR_CONFIG, appointments: APPOINTMENT_CONFIG,
  opd: OPD_CONFIG, ipd: IPD_CONFIG, discharge: DISCHARGE_CONFIG, emergency: EMERGENCY_CONFIG,
  ot: OT_CONFIG, lab: LAB_CONFIG, pharmacy: PHARMACY_CONFIG,
  wards: WARD_CONFIG, insurance: INSURANCE_CONFIG, billing: BILLING_CONFIG,
  staff: STAFF_CONFIG, reports: REPORTS_CONFIG,
  hospitals: HOSPITAL_CONFIG, departments: DEPARTMENT_CONFIG, admin: ADMIN_CONFIG,
  relationship: RELATIONSHIP_CONFIG, prescription: PRESCRIPTION_CONFIG,
  nursing: NURSING_CONFIG, advancepay: ADVANCE_PAYMENT_CONFIG,
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function HospitalManagement({ activeTab: propTab }) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabFromPath = location.pathname.split("/hospital/")[1]?.split("/")[0] || "dashboard";
  const [activeTab, setActiveTab] = useState(propTab || tabFromPath || "dashboard");

  useEffect(()=>{
    const t = location.pathname.split("/hospital/")[1]?.split("/")[0];
    if (t && t!==activeTab) setActiveTab(t);
  },[location.pathname]);

  const goTab = (key) => {
    setActiveTab(key);
    navigate(`/hospital/${key}`, {replace:true});
  };

  const [counts, setCounts] = useState({});
  useEffect(()=>{
    API.get("/hospital/dashboard/summary").then(r=>{
      const d=r.data||{};
      setCounts({
        patients: d.totalPatients||"",
        appointments: d.todayAppointments||"",
        emergency: d.emergencyCases||"",
        ipd: d.activeAdmissions||"",
      });
    }).catch(()=>{});
  },[]);

  const today = new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  return (
    <>
      <style>{CSS}</style>
      <div className="hm-app">

        {/* Content Area */}
        <div className="hm-content">
          {activeTab==="dashboard" ? <DashboardTab key="dashboard"/> :
            TAB_CONFIG_MAP[activeTab] ? <CrudTab key={activeTab} config={TAB_CONFIG_MAP[activeTab]}/> :
            <div style={{padding:40,textAlign:"center",color:"var(--hm-text-faint)"}}>Tab not found</div>
          }
        </div>

      </div>
    </>
  );
}