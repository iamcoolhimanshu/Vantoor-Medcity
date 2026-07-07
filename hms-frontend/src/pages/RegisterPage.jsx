import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

const ROLES = [
  {
    value: "HOSPITAL_ADMIN",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    label: "Hospital Admin",
    desc: "Manage entire hospital data",
    color: "#D4A843", bg: "rgba(212,168,67,0.12)", border: "rgba(212,168,67,0.3)",
    selBg: "rgba(212,168,67,0.1)", selBorder: "#D4A843",
  },
  {
    value: "DOCTOR",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
    label: "Doctor",
    desc: "Patients, OPD, prescriptions",
    color: "#22C2CC", bg: "rgba(14,165,175,0.12)", border: "rgba(14,165,175,0.3)",
    selBg: "rgba(14,165,175,0.1)", selBorder: "#0EA5AF",
  },
  {
    value: "RECEPTIONIST",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    label: "Receptionist",
    desc: "Appointments & front desk",
    color: "#7B9BE8", bg: "rgba(37,64,168,0.12)", border: "rgba(37,64,168,0.3)",
    selBg: "rgba(37,64,168,0.1)", selBorder: "#2540A8",
  },
  {
    value: "BILLING_EXECUTIVE",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
    label: "Billing Executive",
    desc: "Invoices & payments",
    color: "#6EE7B7", bg: "rgba(5,150,105,0.12)", border: "rgba(5,150,105,0.3)",
    selBg: "rgba(5,150,105,0.1)", selBorder: "#059669",
  },
  {
    value: "WARD_MANAGER",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" /><line x1="9" y1="12" x2="15" y2="12" /></svg>,
    label: "Ward Manager",
    desc: "Beds, wards & nursing",
    color: "#D580ED", bg: "rgba(180,80,200,0.12)", border: "rgba(180,80,200,0.3)",
    selBg: "rgba(180,80,200,0.1)", selBorder: "#B450C8",
  },
  {
    value: "FINANCE_ADMIN",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    label: "Finance Admin",
    desc: "Financial reports & refunds",
    color: "#FCA5A5", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)",
    selBg: "rgba(239,68,68,0.08)", selBorder: "#EF4444",
  },
];

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

  --gold-300: #F0CC72;
  --gold-400: #D4A843;
  --gold-500: #B8892A;

  --teal-400: #0EA5AF;
  --teal-300: #22C2CC;

  --red-soft: #FDECEA;
  --red-text: #C0392B;
  --red-border: #F5B7B1;

  --green-soft: #EDFAF5;
  --green-text: #065F46;
  --green-border: #A7F3D0;

  --white: #FFFFFF;
  --off-white: #F7F8FC;
  --slate-100: #E8EBF4;
  --slate-200: #C8CEDF;
  --slate-400: #8B93AF;
  --slate-500: #5F6B8A;
  --slate-700: #2E3756;
}

/* ── Root layout: two-column like login ── */
.rp-root {
  min-height: 100vh;
  display: flex;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--navy-950);
  overflow: hidden;
  position: relative;
}

.rp-root::before {
  content: '';
  position: fixed; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 700px 500px at 0% 0%, rgba(25,45,117,0.45) 0%, transparent 70%),
    radial-gradient(ellipse 500px 400px at 100% 100%, rgba(212,168,67,0.08) 0%, transparent 60%);
  z-index: 0;
}

/* ══════════ LEFT PANEL ══════════ */
.rp-left {
  width: 40%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 52px 48px;
  background: linear-gradient(160deg, var(--navy-800) 0%, var(--navy-900) 55%, var(--navy-950) 100%);
  border-right: 1px solid rgba(212,168,67,0.12);
  overflow: hidden;
  z-index: 1;
  flex-shrink: 0;
}

.rp-geo {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(212,168,67,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,168,67,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}
.rp-orb {
  position: absolute; border-radius: 50%; pointer-events: none;
}
.rp-orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(21,45,117,0.55) 0%, transparent 65%);
  top: -140px; left: -140px;
}
.rp-orb-2 {
  width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 65%);
  bottom: -80px; right: -60px;
}

/* Logo */
.rp-logo-strip {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 14px;
 
}
.rp-logo-mark {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, var(--gold-400) 0%, var(--gold-500) 100%);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 1px rgba(212,168,67,0.3), 0 8px 32px rgba(212,168,67,0.25);
  flex-shrink: 0;
}
.rp-logo-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px; font-weight: 700;
  color: var(--white); letter-spacing: 0.5px; line-height: 1;
}
.rp-logo-name em { color: var(--gold-400); font-style: normal; }
.rp-logo-sub {
  font-size: 10px; font-weight: 500;
  color: var(--slate-400); letter-spacing: 2px;
  text-transform: uppercase; margin-top: 3px;
}

/* Center copy */
.rp-center { position: relative; z-index: 2; }
.rp-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 14px;
  background: rgba(212,168,67,0.1);
  border: 1px solid rgba(212,168,67,0.25);
  border-radius: 100px;
  font-size: 11px; font-weight: 600;
  color: var(--gold-300); letter-spacing: 2px;
  text-transform: uppercase; margin-bottom: 22px;
}
.rp-eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold-400);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.7); }
}
.rp-headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: 40px; font-weight: 600; line-height: 1.1;
  color: var(--white); letter-spacing: -0.5px;
  margin-bottom: 16px;
}
.rp-headline em { color: var(--gold-300); font-style: italic; }
.rp-desc {
  font-size: 13.5px; font-weight: 400; line-height: 1.75;
  color: var(--slate-400); max-width: 300px;
}

/* Steps */
.rp-steps {
  position: relative; z-index: 2;
  margin-top: 36px;
  display: flex; flex-direction: column; gap: 0;
}
.rp-step {
  display: flex; gap: 16px; align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.rp-step:last-child { border-bottom: none; }
.rp-step-num {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: rgba(212,168,67,0.12);
  border: 1px solid rgba(212,168,67,0.25);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 14px; font-weight: 700; color: var(--gold-300);
  margin-top: 1px;
}
.rp-step-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); }
.rp-step-sub   { font-size: 11.5px; color: var(--slate-400); margin-top: 2px; line-height: 1.5; }

/* Bottom role pills */
.rp-role-pills {
  position: relative; z-index: 2;
  display: flex; flex-wrap: wrap; gap: 7px;
}
.rp-role-pill {
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.3px;
}

.rp-left-foot {
  position: relative; z-index: 2;
  font-size: 11px; color: rgba(255,255,255,0.18);
  letter-spacing: 0.5px;
}
.rp-left-foot a { color: rgba(255,255,255,0.25); text-decoration: none; }

/* ══════════ RIGHT PANEL ══════════ */
.rp-right {
  flex: 1;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 48px 52px;
  background: var(--off-white);
  position: relative; z-index: 1;
  overflow-y: auto;
}

.rp-right::before {
  content: '';
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 60%;
  background-image: radial-gradient(circle, rgba(21,45,117,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}
.rp-right::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent 0%, var(--gold-400) 40%, var(--teal-400) 100%);
}

/* ── Form card ── */
.rp-card {
  width: 100%; max-width: 480px;
  position: relative; z-index: 1;
  padding-top: 8px;
  animation: fadeUp 0.5s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Back link */
.rp-back {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 12.5px; font-weight: 600;
  color: var(--slate-500); text-decoration: none;
  margin-bottom: 28px;
  transition: color 0.15s;
  letter-spacing: 0.2px;
}
.rp-back svg { width: 14px; height: 14px; transition: transform 0.15s; }
.rp-back:hover { color: var(--navy-500); }
.rp-back:hover svg { transform: translateX(-2px); }

/* Header */
.rp-badge-row {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 22px;
}
.rp-badge-line  { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--slate-200)); }
.rp-badge-line2 { flex: 1; height: 1px; background: linear-gradient(90deg, var(--slate-200), transparent); }
.rp-badge-txt {
  font-size: 9.5px; font-weight: 700; letter-spacing: 2.5px;
  text-transform: uppercase; color: var(--slate-400); white-space: nowrap;
}

.rp-card-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 34px; font-weight: 600; line-height: 1.1;
  color: var(--navy-900); letter-spacing: -0.3px;
}
.rp-card-title em { color: var(--navy-500); font-style: italic; }
.rp-card-sub {
  font-size: 13.5px; color: var(--slate-500);
  margin-top: 8px; margin-bottom: 32px; line-height: 1.6;
}

/* ── Form ── */
.rp-form { display: flex; flex-direction: column; gap: 22px; }

/* Row: two fields side by side */
.rp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.rp-field { display: flex; flex-direction: column; gap: 7px; }

.rp-label {
  font-size: 11px; font-weight: 700;
  color: var(--slate-700); letter-spacing: 0.8px;
  text-transform: uppercase;
}
.rp-label-opt {
  font-size: 10px; font-weight: 500;
  color: var(--slate-400); text-transform: none;
  letter-spacing: 0; margin-left: 4px;
}

.rp-input-wrap { position: relative; }
.rp-input-icon {
  position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
  color: var(--slate-400); pointer-events: none;
  display: flex; align-items: center;
}
.rp-input-icon svg { width: 16px; height: 16px; }

.rp-input {
  width: 100%; padding: 13px 14px 13px 46px;
  background: var(--white);
  border: 1.5px solid var(--slate-200);
  border-radius: 11px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px; color: var(--navy-900);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.rp-input::placeholder { color: #cdd3e0; }
.rp-input:focus {
  border-color: var(--navy-500);
  box-shadow: 0 0 0 4px rgba(21,45,117,0.08);
}
.rp-input.is-error {
  border-color: #E57373;
  box-shadow: 0 0 0 4px rgba(229,115,115,0.1);
}
.rp-input.is-ok {
  border-color: #059669;
  box-shadow: 0 0 0 4px rgba(5,150,105,0.08);
}

/* pw toggle */
.rp-pw-toggle {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--slate-400); padding: 4px; border-radius: 5px;
  display: flex; align-items: center; transition: color 0.15s;
}
.rp-pw-toggle:hover { color: var(--navy-500); }
.rp-pw-toggle svg { width: 16px; height: 16px; }

/* pw strength bar */
.rp-pw-strength { margin-top: 7px; }
.rp-pw-bars {
  display: flex; gap: 4px; margin-bottom: 5px;
}
.rp-pw-bar {
  flex: 1; height: 3px; border-radius: 2px;
  background: var(--slate-100);
  transition: background 0.3s;
}
.rp-pw-label {
  font-size: 11px; font-weight: 600;
}

/* ── Role grid ── */
.rp-role-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.rp-role-btn {
  padding: 12px 10px; border-radius: 11px; cursor: pointer;
  border: 1.5px solid var(--slate-200);
  background: var(--white);
  transition: all 0.15s; text-align: left;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.rp-role-btn:hover {
  border-color: var(--slate-400);
  background: var(--off-white);
  transform: translateY(-1px);
}
.rp-role-btn.selected {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.1);
}
.rp-role-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px; flex-shrink: 0;
}
.rp-role-icon svg { width: 16px; height: 16px; }
.rp-role-lbl {
  font-size: 12px; font-weight: 700;
  color: var(--navy-900); line-height: 1.2;
}
.rp-role-desc {
  font-size: 10.5px; color: var(--slate-400);
  margin-top: 3px; line-height: 1.4;
}
.rp-role-check {
  display: flex; justify-content: flex-end; margin-top: 5px;
}
.rp-role-check-dot {
  width: 16px; height: 16px; border-radius: 50%;
  border: 1.5px solid var(--slate-200);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.rp-role-check-dot.active {
  border-color: transparent;
  background: var(--navy-500);
}
.rp-role-check-dot.active::after {
  content: '';
  width: 6px; height: 6px; border-radius: 50%;
  background: #fff;
}

/* ── Alerts ── */
.rp-alert {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  animation: slideDown 0.25s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rp-alert-icon svg { width: 17px; height: 17px; }
.rp-alert-text { font-size: 13px; line-height: 1.5; }
.rp-alert.error {
  background: var(--red-soft);
  border: 1px solid var(--red-border);
}
.rp-alert.error .rp-alert-icon svg { color: var(--red-text); }
.rp-alert.error .rp-alert-text { color: var(--red-text); }
.rp-alert.success {
  background: var(--green-soft);
  border: 1px solid var(--green-border);
}
.rp-alert.success .rp-alert-icon svg { color: var(--green-text); }
.rp-alert.success .rp-alert-text { color: var(--green-text); font-weight: 600; }

/* ── Submit ── */
.rp-submit {
  width: 100%; padding: 14px 24px;
  background: linear-gradient(135deg, var(--navy-600) 0%, var(--navy-700) 100%);
  border: none; border-radius: 11px; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px; font-weight: 700;
  color: var(--white); letter-spacing: 0.3px;
  box-shadow: 0 6px 20px rgba(7,14,36,0.3);
  transition: all 0.2s; margin-top: 4px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  position: relative; overflow: hidden;
}
.rp-submit::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%);
}
.rp-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(7,14,36,0.4);
  background: linear-gradient(135deg, var(--navy-500) 0%, var(--navy-600) 100%);
}
.rp-submit:active:not(:disabled) { transform: translateY(0); }
.rp-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.rp-submit-accent {
  height: 2px; border-radius: 1px; margin-top: 8px;
  background: linear-gradient(90deg, var(--gold-400) 0%, var(--teal-400) 100%);
  opacity: 0.6;
}

/* ── Spinner ── */
.rp-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Divider ── */
.rp-divider {
  display: flex; align-items: center; gap: 14px;
}
.rp-divider-line { flex: 1; height: 1px; background: var(--slate-100); }
.rp-divider-text {
  font-size: 11px; font-weight: 600;
  color: var(--slate-400); letter-spacing: 1px;
  text-transform: uppercase; white-space: nowrap;
}

/* ── Login row ── */
.rp-login-row {
  text-align: center; font-size: 13px; color: var(--slate-500);
}
.rp-login-row a {
  color: var(--navy-500); font-weight: 700;
  text-decoration: none; transition: color 0.15s;
}
.rp-login-row a:hover { color: var(--gold-500); }

/* ── Terms note ── */
.rp-terms {
  text-align: center;
  font-size: 11px; color: var(--slate-400);
  line-height: 1.6;
}
.rp-terms a { color: var(--navy-400); font-weight: 600; text-decoration: none; }

/* ══════════ RESPONSIVE ══════════ */
@media (max-width: 900px) {
  .rp-left { display: none; }
  .rp-right { padding: 32px 24px; }
}
@media (max-width: 560px) {
  .rp-row { grid-template-columns: 1fr; }
  .rp-role-grid { grid-template-columns: 1fr 1fr; }
}
`;

/* ── Icon helpers ── */
const IcoUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IcoMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const IcoLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IcoPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IcoHospital = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IcoEye = ({ off }) => off ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoAlert = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IcoCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IcoArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const HMSCross = () => (
  <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="2" width="6" height="22" rx="1" fill="#0C1535" />
    <rect x="2" y="10" width="22" height="6" rx="1" fill="#0C1535" />
  </svg>
);

/* ── Password strength util ── */
function getPwStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "#EF4444" };
  if (score <= 2) return { score: 2, label: "Fair", color: "#F59E0B" };
  if (score <= 3) return { score: 3, label: "Good", color: "#3B82F6" };
  return { score: 4, label: "Strong", color: "#059669" };
}

const STEPS = [
  { n: "1", title: "Create your credentials", sub: "Set a secure email/username and strong password." },
  { n: "2", title: "Select your role", sub: "Choose the role that matches your position in the hospital." },
  { n: "3", title: "Get your Account ID", sub: "Each hospital gets an isolated, secure data space." },
];

const ROLE_PILLS = [
  { label: "Hospital Admin", bg: "rgba(212,168,67,0.12)", color: "#B8892A", border: "rgba(212,168,67,0.25)" },
  { label: "Doctor", bg: "rgba(14,165,175,0.12)", color: "#0E7A80", border: "rgba(14,165,175,0.25)" },
  { label: "Receptionist", bg: "rgba(37,64,168,0.12)", color: "#2540A8", border: "rgba(37,64,168,0.25)" },
  { label: "Billing", bg: "rgba(5,150,105,0.12)", color: "#047857", border: "rgba(5,150,105,0.25)" },
  { label: "Ward Manager", bg: "rgba(180,80,200,0.1)", color: "#7E22CE", border: "rgba(180,80,200,0.2)" },
  { label: "Finance", bg: "rgba(239,68,68,0.08)", color: "#B91C1C", border: "rgba(239,68,68,0.2)" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hospitalName: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "HOSPITAL_ADMIN",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [touched, setTouched] = useState({});

  const pwStrength = getPwStrength(form.password);
  const pwMatch = form.confirmPassword
    ? form.password === form.confirmPassword
    : null;

  const blur = (field) => setTouched(t => ({ ...t, [field]: true }));
  const fieldErr = (f) => touched[f] && !form[f];

  const handle = async (e) => {
    e.preventDefault();
    setTouched({ hospitalName: true, username: true, password: true, confirmPassword: true, role: true });
    setError("");
    if (!form.username || !form.password) { setError("Email / Username and Password are required."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match. Please re-enter."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        username: form.username,
        password: form.password,
        role: form.role,
        ...(form.hospitalName && { hospitalName: form.hospitalName }),
        ...(form.phone && { phone: form.phone }),
      });
      setSuccess(`Account created! Your Account ID: ${res.data.accountId}`);
      setTimeout(() => navigate("/login"), 2800);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="rp-left">
          <div className="rp-geo" />
          <div className="rp-orb rp-orb-1" />
          <div className="rp-orb rp-orb-2" />

          {/* Logo */}
          {/* Logo */}
          <div className="rp-logo-strip">
            <div className="rp-logo-mark">
              <HMSCross />
            </div>

            <div>
              <div className="rp-logo-name">
                Vantoor <em>MedCity</em>
              </div>

              <div className="rp-logo-sub">
                Hospital Management System
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="rp-center">
            <div className="rp-eyebrow">
              <span className="rp-eyebrow-dot" />
              Hospital Registration
            </div>
            <div className="rp-headline">
              Join the <em>Future</em> of<br />Healthcare Ops
            </div>
            <div className="rp-desc">
              Set up your hospital in minutes. Each account gets a fully isolated, secure data environment.
            </div>

            {/* How it works */}
            <div className="rp-steps">
              {STEPS.map(s => (
                <div className="rp-step" key={s.n}>
                  <div className="rp-step-num">{s.n}</div>
                  <div>
                    <div className="rp-step-title">{s.title}</div>
                    <div className="rp-step-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role pills */}
          <div className="rp-role-pills">
            {ROLE_PILLS.map(p => (
              <div key={p.label} className="rp-role-pill" style={{
                background: p.bg, color: p.color,
                border: `1px solid ${p.border}`,
              }}>{p.label}</div>
            ))}
          </div>

          <div className="rp-left-foot">
            © 2026 Vantoor MedCity · <a href="#">Privacy</a> · <a href="#">Terms</a>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="rp-right">
          <div className="rp-card">

            {/* Back */}
            <Link className="rp-back" to="/login">
              <IcoArrowLeft /> Back to Login
            </Link>

            {/* Header */}
            <div className="rp-badge-row">
              <div className="rp-badge-line" />
              <span className="rp-badge-txt">New Hospital Account</span>
              <div className="rp-badge-line2" />
            </div>
            <div className="rp-card-title">Create <em>Account</em></div>
            <div className="rp-card-sub">
              Register your hospital on Vantoor MedCity. All data is isolated per account.
            </div>

            <form className="rp-form" onSubmit={handle} noValidate>

              {/* Alerts */}
              {error && (
                <div className="rp-alert error">
                  <div className="rp-alert-icon"><IcoAlert /></div>
                  <div className="rp-alert-text">{error}</div>
                </div>
              )}
              {success && (
                <div className="rp-alert success">
                  <div className="rp-alert-icon"><IcoCheckCircle /></div>
                  <div className="rp-alert-text">{success}<br /><span style={{ fontWeight: 400, fontSize: 12 }}>Redirecting to login…</span></div>
                </div>
              )}

              {/* Row 1: Hospital name + Phone */}
              <div className="rp-row">
                <div className="rp-field">
                  <label className="rp-label">
                    Hospital Name <span className="rp-label-opt">(optional)</span>
                  </label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-icon"><IcoHospital /></span>
                    <input
                      className="rp-input"
                      type="text"
                      placeholder="City Medical Centre"
                      value={form.hospitalName}
                      onChange={e => setForm({ ...form, hospitalName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="rp-field">
                  <label className="rp-label">
                    Phone <span className="rp-label-opt">(optional)</span>
                  </label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-icon"><IcoPhone /></span>
                    <input
                      className="rp-input"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="rp-field">
                <label className="rp-label">Email / Username</label>
                <div className="rp-input-wrap">
                  <span className="rp-input-icon"><IcoMail /></span>
                  <input
                    className={`rp-input${fieldErr("username") ? " is-error" : ""}`}
                    type="text"
                    placeholder="admin@vantoor.com"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    onBlur={() => blur("username")}
                    autoComplete="username"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Row 2: Password + Confirm */}
              <div className="rp-row">
                <div className="rp-field">
                  <label className="rp-label">Password</label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-icon"><IcoLock /></span>
                    <input
                      className={`rp-input${fieldErr("password") ? " is-error" : ""}`}
                      type={showPw ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onBlur={() => blur("password")}
                      autoComplete="new-password"
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" className="rp-pw-toggle"
                      onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? "Hide" : "Show"}>
                      <IcoEye off={showPw} />
                    </button>
                  </div>
                  {/* Strength bar */}
                  {form.password && (
                    <div className="rp-pw-strength">
                      <div className="rp-pw-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="rp-pw-bar" style={{
                            background: i <= pwStrength.score ? pwStrength.color : undefined
                          }} />
                        ))}
                      </div>
                      <span className="rp-pw-label" style={{ color: pwStrength.color }}>
                        {pwStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rp-field">
                  <label className="rp-label">Confirm Password</label>
                  <div className="rp-input-wrap">
                    <span className="rp-input-icon"><IcoLock /></span>
                    <input
                      className={`rp-input${form.confirmPassword && !pwMatch ? " is-error"
                          : pwMatch ? " is-ok" : ""
                        }`}
                      type={showCPw ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      onBlur={() => blur("confirmPassword")}
                      autoComplete="new-password"
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" className="rp-pw-toggle"
                      onClick={() => setShowCPw(v => !v)}
                      aria-label={showCPw ? "Hide" : "Show"}>
                      <IcoEye off={showCPw} />
                    </button>
                  </div>
                  {form.confirmPassword && (
                    <div style={{
                      marginTop: 6, fontSize: 11, fontWeight: 600,
                      color: pwMatch ? "#059669" : "#EF4444"
                    }}>
                      {pwMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </div>
                  )}
                </div>
              </div>

              {/* Role selector */}
              <div className="rp-field">
                <label className="rp-label">Your Role</label>
                <div className="rp-role-grid">
                  {ROLES.map(r => {
                    const sel = form.role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        className={`rp-role-btn${sel ? " selected" : ""}`}
                        style={sel ? {
                          borderColor: r.selBorder,
                          background: r.selBg,
                          boxShadow: `0 4px 14px ${r.selBorder}40`,
                        } : {}}
                        onClick={() => setForm({ ...form, role: r.value })}
                      >
                        <div className="rp-role-icon" style={{
                          background: r.bg,
                          border: `1px solid ${r.border}`,
                          color: r.color,
                        }}>{r.icon}</div>
                        <div className="rp-role-lbl">{r.label}</div>
                        <div className="rp-role-desc">{r.desc}</div>
                        <div className="rp-role-check">
                          <div className={`rp-role-check-dot${sel ? " active" : ""}`}
                            style={sel ? { background: r.selBorder } : {}} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div>
                <button className="rp-submit" type="submit" disabled={loading || !!success}>
                  {loading ? (
                    <><div className="rp-spinner" /> Creating Account…</>
                  ) : success ? (
                    <><IcoCheckCircle /> Account Created!</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ width: 17, height: 17, opacity: 0.85 }}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                      Create Hospital Account
                    </>
                  )}
                </button>
                <div className="rp-submit-accent" />
              </div>

              {/* Divider */}
              <div className="rp-divider">
                <div className="rp-divider-line" />
                <span className="rp-divider-text">Have an account?</span>
                <div className="rp-divider-line" />
              </div>

              {/* Login link */}
              <div className="rp-login-row">
                Already registered? <Link to="/login">Sign In →</Link>
              </div>

              {/* Terms */}
              <div className="rp-terms">
                By creating an account you agree to our{" "}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </div>

            </form>
          </div>
        </div>

      </div>
    </>
  );
}