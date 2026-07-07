import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../hooks/useAuth";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy-950: #04091A;
  --navy-900: #070E24;
  --navy-800: #0C1535;
  --navy-700: #111D47;
  --navy-600: #162359;
  --navy-500: #1C2D75;
  --navy-400: #2540A8;

  --gold-100: #FDF6E3;
  --gold-200: #F9E8B5;
  --gold-300: #F0CC72;
  --gold-400: #D4A843;
  --gold-500: #B8892A;
  --gold-600: #9A6E18;
  --gold-700: #7A5310;

  --teal-400: #0EA5AF;
  --teal-300: #22C2CC;
  --teal-100: #E0F7F8;

  --red-soft: #FDECEA;
  --red-text: #C0392B;
  --red-border: #F5B7B1;

  --white: #FFFFFF;
  --off-white: #F7F8FC;
  --slate-100: #E8EBF4;
  --slate-200: #C8CEDF;
  --slate-400: #8B93AF;
  --slate-500: #5F6B8A;
  --slate-700: #2E3756;
}

.lp-root {
  min-height: 100vh;
  display: flex;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--navy-950);
  overflow: hidden;
  position: relative;
}

/* ── Ambient bg ── */
.lp-root::before {
  content: '';
  position: fixed; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 700px 500px at 0% 0%, rgba(25,45,117,0.45) 0%, transparent 70%),
    radial-gradient(ellipse 500px 400px at 100% 100%, rgba(212,168,67,0.08) 0%, transparent 60%);
  z-index: 0;
}

/* ══════════ LEFT PANEL ══════════ */
.lp-left {
  width: 48%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 52px 56px;
  background: linear-gradient(160deg, var(--navy-800) 0%, var(--navy-900) 55%, var(--navy-950) 100%);
  border-right: 1px solid rgba(212,168,67,0.12);
  overflow: hidden;
  z-index: 1;
}

/* Gold geometric lines */
.lp-left::before {
  content: '';
  position: absolute; top: 0; right: 0;
  width: 1px; height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(212,168,67,0.35) 30%, rgba(212,168,67,0.35) 70%, transparent 100%);
}

/* Subtle cross pattern overlay */
.lp-geo-pattern {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(212,168,67,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,168,67,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}

/* Large translucent circle */
.lp-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.lp-orb-1 {
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(21,45,117,0.55) 0%, transparent 65%);
  top: -160px; left: -160px;
}
.lp-orb-2 {
  width: 360px; height: 360px;
  background: radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 65%);
  bottom: -100px; right: -80px;
}

/* ── Top logo strip ── */
.lp-logo-strip {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 14px;
}
.lp-logo-mark {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, var(--gold-400) 0%, var(--gold-500) 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 1px rgba(212,168,67,0.3), 0 8px 32px rgba(212,168,67,0.25);
  flex-shrink: 0;
}
.lp-logo-mark svg { width: 26px; height: 26px; }
.lp-logo-text { }
.lp-logo-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px; font-weight: 700;
  color: var(--white); letter-spacing: 0.5px; line-height: 1;
}
.lp-logo-name em { color: var(--gold-400); font-style: normal; }
.lp-logo-sub {
  font-size: 10px; font-weight: 500;
  color: var(--slate-400); letter-spacing: 2px;
  text-transform: uppercase; margin-top: 3px;
}

/* ── Centre brand copy ── */
.lp-center { position: relative; z-index: 2; }

.lp-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 14px;
  background: rgba(212,168,67,0.1);
  border: 1px solid rgba(212,168,67,0.25);
  border-radius: 100px;
  font-size: 11px; font-weight: 600;
  color: var(--gold-300); letter-spacing: 2px;
  text-transform: uppercase; margin-bottom: 24px;
}
.lp-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold-400);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}

.lp-headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: 48px; font-weight: 600; line-height: 1.08;
  color: var(--white); letter-spacing: -0.5px;
  margin-bottom: 18px;
}
.lp-headline em { color: var(--gold-300); font-style: italic; }

.lp-desc {
  font-size: 14px; font-weight: 400; line-height: 1.75;
  color: var(--slate-400); max-width: 340px;
}

/* ── Stat row ── */
.lp-stats {
  display: flex; gap: 0;
  margin-top: 40px;
  border: 1px solid rgba(212,168,67,0.1);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255,255,255,0.025);
}
.lp-stat {
  flex: 1; padding: 20px 22px;
  border-right: 1px solid rgba(212,168,67,0.1);
}
.lp-stat:last-child { border-right: none; }
.lp-stat-val {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px; font-weight: 700;
  color: var(--gold-300); line-height: 1;
}
.lp-stat-lbl {
  font-size: 11px; font-weight: 500;
  color: var(--slate-400); margin-top: 5px;
  letter-spacing: 0.5px;
}

/* ── Feature list ── */
.lp-feats {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; gap: 10px;
}
.lp-feat {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  transition: border-color 0.2s, background 0.2s;
  cursor: default;
}
.lp-feat:hover {
  background: rgba(255,255,255,0.055);
  border-color: rgba(212,168,67,0.18);
}
.lp-feat-icon {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.lp-feat-icon svg { width: 18px; height: 18px; }
.lp-feat-body { flex: 1; }
.lp-feat-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.82); }
.lp-feat-sub   { font-size: 11px; color: var(--slate-400); margin-top: 2px; }
.lp-feat-badge {
  font-size: 10px; font-weight: 700;
  padding: 3px 9px; border-radius: 100px; letter-spacing: 0.5px;
}

/* ── Footer ── */
.lp-left-foot {
  position: relative; z-index: 2;
  font-size: 11px; color: rgba(255,255,255,0.18);
  letter-spacing: 0.5px;
}
.lp-left-foot a { color: rgba(255,255,255,0.25); text-decoration: none; }

/* ══════════ RIGHT PANEL ══════════ */
.lp-right {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 48px 56px;
  background: var(--off-white);
  position: relative; z-index: 1;
  overflow: hidden;
}

/* subtle background pattern */
.lp-right::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(21,45,117,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

/* top accent line */
.lp-right::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent 0%, var(--gold-400) 40%, var(--teal-400) 100%);
}

/* ── Form card ── */
.lp-card {
  width: 100%; max-width: 420px;
  position: relative; z-index: 1;
}

/* top badge */
.lp-card-badge {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 30px;
}
.lp-card-badge-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, var(--slate-200));
}
.lp-card-badge-text {
  font-size: 10px; font-weight: 700; letter-spacing: 2.5px;
  text-transform: uppercase; color: var(--slate-400);
  white-space: nowrap;
}

.lp-card-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 34px; font-weight: 600; line-height: 1.1;
  color: var(--navy-900); letter-spacing: -0.3px;
}
.lp-card-title em { color: var(--navy-500); font-style: italic; }
.lp-card-sub {
  font-size: 13.5px; color: var(--slate-500);
  margin-top: 8px; margin-bottom: 32px; line-height: 1.6;
}

/* ── Form ── */
.lp-form { display: flex; flex-direction: column; gap: 20px; }

.lp-field { display: flex; flex-direction: column; gap: 7px; }

.lp-label {
  font-size: 12px; font-weight: 700;
  color: var(--slate-700); letter-spacing: 0.8px;
  text-transform: uppercase;
}

.lp-input-wrap { position: relative; }

.lp-input-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--slate-400); pointer-events: none;
  display: flex; align-items: center;
}
.lp-input-icon svg { width: 17px; height: 17px; }

.lp-input {
  width: 100%; padding: 14px 16px 14px 48px;
  background: var(--white);
  border: 1.5px solid var(--slate-200);
  border-radius: 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; color: var(--navy-900);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.lp-input::placeholder { color: var(--slate-200); }
.lp-input:focus {
  border-color: var(--navy-500);
  box-shadow: 0 0 0 4px rgba(21,45,117,0.08);
}
.lp-input.is-error {
  border-color: #E57373;
  box-shadow: 0 0 0 4px rgba(229,115,115,0.1);
}

/* password toggle */
.lp-pw-toggle {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--slate-400); padding: 4px; border-radius: 6px;
  display: flex; align-items: center;
  transition: color 0.15s;
}
.lp-pw-toggle:hover { color: var(--navy-500); }
.lp-pw-toggle svg { width: 17px; height: 17px; }

/* ── Forgot row ── */
.lp-forgot-row {
  display: flex; justify-content: flex-end; margin-top: -10px;
}
.lp-forgot {
  font-size: 12px; font-weight: 600; color: var(--navy-500);
  text-decoration: none; letter-spacing: 0.2px;
  transition: color 0.15s;
}
.lp-forgot:hover { color: var(--gold-500); }

/* ── Error alert ── */
.lp-alert {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  background: var(--red-soft);
  border: 1px solid var(--red-border);
  border-radius: 12px;
  animation: slideDown 0.25s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lp-alert-icon { flex-shrink: 0; margin-top: 1px; }
.lp-alert-icon svg { width: 17px; height: 17px; color: var(--red-text); }
.lp-alert-text {
  font-size: 13px; color: var(--red-text); line-height: 1.5;
}

/* ── Submit button ── */
.lp-submit {
  width: 100%; padding: 15px 24px;
  background: linear-gradient(135deg, var(--navy-600) 0%, var(--navy-700) 100%);
  border: none; border-radius: 12px; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px; font-weight: 700;
  color: var(--white); letter-spacing: 0.3px;
  box-shadow: 0 6px 20px rgba(7,14,36,0.3), 0 2px 4px rgba(0,0,0,0.15);
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  position: relative; overflow: hidden;
}
.lp-submit::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%);
}
.lp-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(7,14,36,0.4), 0 4px 8px rgba(0,0,0,0.1);
  background: linear-gradient(135deg, var(--navy-500) 0%, var(--navy-600) 100%);
}
.lp-submit:active:not(:disabled) { transform: translateY(0); }
.lp-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

/* Gold accent line under button */
.lp-submit-accent {
  height: 2px; border-radius: 1px; margin-top: 8px;
  background: linear-gradient(90deg, var(--gold-400) 0%, var(--teal-400) 100%);
  opacity: 0.6;
}

/* ── Spinner ── */
.lp-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Divider ── */
.lp-divider {
  display: flex; align-items: center; gap: 14px; margin: 4px 0;
}
.lp-divider-line { flex: 1; height: 1px; background: var(--slate-100); }
.lp-divider-text {
  font-size: 11px; font-weight: 600;
  color: var(--slate-400); letter-spacing: 1px;
  text-transform: uppercase; white-space: nowrap;
}

/* ── Register row ── */
.lp-register {
  text-align: center;
  font-size: 13px; color: var(--slate-500);
}
.lp-register a {
  color: var(--navy-500); font-weight: 700;
  text-decoration: none; transition: color 0.15s;
}
.lp-register a:hover { color: var(--gold-500); }

/* ── Trust indicators ── */
.lp-trust {
  display: flex; align-items: center; justify-content: center;
  gap: 20px; margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--slate-100);
}
.lp-trust-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 600;
  color: var(--slate-400); letter-spacing: 0.3px;
}
.lp-trust-item svg { width: 14px; height: 14px; color: var(--teal-400); }

/* ── Right footer ── */
.lp-right-foot {
  position: absolute; bottom: 20px;
  font-size: 11px; color: var(--slate-400); text-align: center;
}

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 900px) {
  .lp-left { width: 42%; padding: 40px 36px; }
  .lp-headline { font-size: 38px; }
  .lp-right { padding: 40px 32px; }
}

@media (max-width: 680px) {
  .lp-left { display: none; }
  .lp-right { padding: 32px 24px; }
  .lp-right::after { height: 4px; }
}

/* ── Fade-in animation on mount ── */
.lp-card {
  animation: fadeUp 0.5s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/* ─── Icon components ─── */
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = ({ off }) => off ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconCross = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12m0 0V2m0 10H2m10 0h10" />
  </svg>
);

/* ─── Left panel features ─── */
const FEATURES = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    title: "Live Patient Monitoring",
    sub: "IPD, OPD vitals & real-time alerts",
    bg: "rgba(14,165,175,0.15)", stroke: "rgba(14,165,175,0.35)", color: "#22C2CC",
    badge: "LIVE", badgeBg: "rgba(14,165,175,0.15)", badgeColor: "#22C2CC",
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
    title: "Smart Billing & Claims",
    sub: "Insurance, invoices & payment tracking",
    bg: "rgba(212,168,67,0.12)", stroke: "rgba(212,168,67,0.3)", color: "#D4A843",
    badge: "AUTO", badgeBg: "rgba(212,168,67,0.12)", badgeColor: "#D4A843",
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    title: "OT & Ward Scheduling",
    sub: "Theatre booking, bed management & OT notes",
    bg: "rgba(21,45,117,0.35)", stroke: "rgba(37,64,168,0.35)", color: "#6B8BDB",
    badge: "NEW", badgeBg: "rgba(37,64,168,0.15)", badgeColor: "#7B9BE8",
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    title: "Role-Based Access Control",
    sub: "ADMIN · Doctor · Nurse · Reception",
    bg: "rgba(180,80,200,0.12)", stroke: "rgba(180,80,200,0.3)", color: "#D580ED",
    badge: "SECURE", badgeBg: "rgba(180,80,200,0.1)", badgeColor: "#D580ED",
  },
];

/* ─── HMS Cross SVG logo ─── */
const HMSLogo = () => (
  <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="2" width="6" height="22" rx="1" fill="#0C1535" />
    <rect x="2" y="10" width="22" height="6" rx="1" fill="#0C1535" />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (token) navigate("/hospital/dashboard", { replace: true });
  }, [token, navigate]);


  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});

  const fieldError = (field) => touched[field] && !form[field];

  const handle = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    setError("");
    if (!form.username || !form.password) {
      setError("Please enter both your username and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      const { token: tokenVal, username, roles } = res.data;
      // roles comes as "[ROLE_ADMIN]" string — strip brackets
      const rolesArray = roles
        ? roles.replace(/[\[\]]/g, "").split(",").map(r => r.trim())
        : [];
      sessionStorage.setItem("hms_token", tokenVal);
      sessionStorage.setItem("hms_user", JSON.stringify({ username, roles: rolesArray }));

      login(tokenVal, { username, roles: rolesArray });
      navigate("/hospital/dashboard", { replace: true });

    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.message
        || "Invalid credentials. Please verify and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="lp-left">
          <div className="lp-geo-pattern" />
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />

          {/* Logo */}
          <div className="lp-logo-strip">
            <div className="lp-logo-mark"><HMSLogo /></div>
            <div className="lp-logo-text">
              <div className="lp-logo-name">Vantoor <em>MedCity</em></div>
              <div className="lp-logo-sub">Hospital Management System</div>
            </div>
          </div>

          {/* Centre copy */}
          <div className="lp-center">
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              Trusted Healthcare Platform
            </div>
            <div className="lp-headline">
              Advanced Care,<br />
              <em>Simplified</em> Operations
            </div>
            <div className="lp-desc">
              A complete hospital management system built for modern clinical environments — from patient admission to discharge, pharmacy, billing, and beyond.
            </div>

            {/* Stats */}
            <div className="lp-stats">
              {[
                { val: "500+", lbl: "Hospitals" },
                { val: "2M+", lbl: "Patients Served" },
                { val: "99.9%", lbl: "Uptime SLA" },
              ].map(s => (
                <div className="lp-stat" key={s.lbl}>
                  <div className="lp-stat-val">{s.val}</div>
                  <div className="lp-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="lp-feats">
            {FEATURES.map(f => (
              <div className="lp-feat" key={f.title}>
                <div className="lp-feat-icon" style={{
                  background: f.bg,
                  border: `1px solid ${f.stroke}`,
                  color: f.color,
                }}>{f.icon}</div>
                <div className="lp-feat-body">
                  <div className="lp-feat-title">{f.title}</div>
                  <div className="lp-feat-sub">{f.sub}</div>
                </div>
                <div className="lp-feat-badge" style={{
                  background: f.badgeBg,
                  color: f.badgeColor,
                  border: `1px solid ${f.badgeColor}33`,
                }}>{f.badge}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {/* <div className="lp-left-foot">
            © 2026 HMS Pro · <a href="#">Privacy Policy</a> · <a href="#">Terms</a>
          </div> */}
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="lp-right">
          <div className="lp-card">

            {/* Top badge */}
            <div className="lp-card-badge">
              <div className="lp-card-badge-line" />
              <span className="lp-card-badge-text">Secure Portal Access</span>
              <div className="lp-card-badge-line" style={{ background: "linear-gradient(90deg, var(--slate-200), transparent)" }} />
            </div>

            <div className="lp-card-title">
              Welcome <em>Back</em>
            </div>
            <div className="lp-card-sub">
              Sign in to your Hospital account to access the hospital management dashboard.
            </div>

            <form className="lp-form" onSubmit={handle} noValidate>

              {/* Error alert */}
              {error && (
                <div className="lp-alert">
                  <div className="lp-alert-icon"><IconAlert /></div>
                  <div className="lp-alert-text">{error}</div>
                </div>
              )}

              {/* Username */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-username">Username / Email</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IconUser /></span>
                  <input
                    id="lp-username"
                    className={`lp-input${fieldError("username") ? " is-error" : ""}`}
                    type="text"
                    placeholder="admin@hospital.com"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    onBlur={() => setTouched(t => ({ ...t, username: true }))}
                    autoComplete="username"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-password">Password</label>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon"><IconLock /></span>
                  <input
                    id="lp-password"
                    className={`lp-input${fieldError("password") ? " is-error" : ""}`}
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                    autoComplete="current-password"
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    <IconEye off={showPw} />
                  </button>
                </div>
              </div>

              {/* Forgot */}
              <div className="lp-forgot-row">
                <Link className="lp-forgot" to="/forgot-password">Forgot password?</Link>
              </div>

              {/* Submit */}
              <div>
                <button className="lp-submit" type="submit" disabled={loading}>
                  {loading
                    ? <><div className="lp-spinner" /> Authenticating…</>
                    : <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17, opacity: 0.85 }}>
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Sign In to Dashboard
                    </>
                  }
                </button>
                <div className="lp-submit-accent" />
              </div>

              {/* Divider */}
              <div className="lp-divider">
                <div className="lp-divider-line" />
                <span className="lp-divider-text">New to HMS ?</span>
                <div className="lp-divider-line" />
              </div>

              {/* Register */}
              <div className="lp-register">
                Register your hospital &nbsp;
                <Link to="/register">Create Account →</Link>
              </div>

            </form>

            {/* Trust indicators */}
            <div className="lp-trust">
              {[
                { icon: <IconShield />, text: "256-bit SSL" },
                { icon: <IconCheck />, text: "HIPAA Compliant" },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, text: "99.9% Uptime" },
              ].map(t => (
                <div className="lp-trust-item" key={t.text}>
                  {t.icon}
                  {t.text}
                </div>
              ))}
            </div>

          </div>

          <div className="lp-right-foot">
            Need help? &nbsp;<a href="mailto:support@hms.com" style={{ color: "var(--navy-400)", fontWeight: 600, textDecoration: "none" }}>support@hmspro.com</a>
          </div>
        </div>

      </div>
    </>
  );
}