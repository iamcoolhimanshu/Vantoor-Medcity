import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../../hooks/useTheme";

// ── NEXUS AI ASSISTANT ── Powered by Groq ──────────────────────
// Uses Groq API (OpenAI-compatible format).
// Set VITE_GROQ_API_KEY in .env to connect real Groq
// ───────────────────────────────────────────────────────────────

const NEXUS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  /* ── Theme variables ── */
  .nx-wrap[data-nx-theme="dark"] {
    --nx-panel-bg:      #080C1A;
    --nx-panel-border:  rgba(255,255,255,0.08);
    --nx-header-bg:     rgba(8,12,26,0.6);
    --nx-grid-line:     rgba(255,255,255,0.02);
    --nx-text-primary:  rgba(255,255,255,0.88);
    --nx-text-muted:    rgba(255,255,255,0.4);
    --nx-text-sub:      rgba(255,255,255,0.2);
    --nx-bubble-bot-bg: rgba(255,255,255,0.06);
    --nx-bubble-bot-bd: rgba(255,255,255,0.08);
    --nx-bubble-user-bg:rgba(108,99,255,0.35);
    --nx-bubble-user-bd:rgba(108,99,255,0.4);
    --nx-input-area-bg: rgba(8,12,26,0.6);
    --nx-input-wrap-bg: rgba(255,255,255,0.05);
    --nx-input-wrap-bd: rgba(255,255,255,0.1);
    --nx-textarea-color:rgba(255,255,255,0.88);
    --nx-textarea-ph:   rgba(255,255,255,0.25);
    --nx-quick-bg:      rgba(255,255,255,0.04);
    --nx-quick-bd:      rgba(255,255,255,0.06);
    --nx-quick-lbl:     rgba(255,255,255,0.75);
    --nx-quick-desc:    rgba(255,255,255,0.35);
    --nx-mode-color:    rgba(255,255,255,0.45);
    --nx-mode-bd:       rgba(255,255,255,0.08);
    --nx-hbtn-bg:       rgba(255,255,255,0.05);
    --nx-hbtn-bd:       rgba(255,255,255,0.08);
    --nx-hbtn-color:    rgba(255,255,255,0.5);
    --nx-panel-shadow:  0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.12);
    --nx-trigger-bg:    #0D1829;
    --nx-trigger-color: #F1F5F9;
    --nx-powered-color: rgba(255,255,255,0.2);
    --nx-char-color:    rgba(255,255,255,0.2);
    --nx-sub-dot:       rgba(255,255,255,0.4);
  }

  .nx-wrap[data-nx-theme="light"] {
    --nx-panel-bg:      #FFFFFF;
    --nx-panel-border:  rgba(0,0,0,0.08);
    --nx-header-bg:     rgba(255,255,255,0.85);
    --nx-grid-line:     rgba(0,0,0,0.025);
    --nx-text-primary:  #0F172A;
    --nx-text-muted:    #64748B;
    --nx-text-sub:      #94A3B8;
    --nx-bubble-bot-bg: #F1F5F9;
    --nx-bubble-bot-bd: #E2E8F0;
    --nx-bubble-user-bg:rgba(108,99,255,0.12);
    --nx-bubble-user-bd:rgba(108,99,255,0.3);
    --nx-input-area-bg: rgba(248,250,252,0.9);
    --nx-input-wrap-bg: #F8FAFC;
    --nx-input-wrap-bd: #E2E8F0;
    --nx-textarea-color:#0F172A;
    --nx-textarea-ph:   #94A3B8;
    --nx-quick-bg:      #F8FAFC;
    --nx-quick-bd:      #E2E8F0;
    --nx-quick-lbl:     #334155;
    --nx-quick-desc:    #94A3B8;
    --nx-mode-color:    #64748B;
    --nx-mode-bd:       #E2E8F0;
    --nx-hbtn-bg:       #F1F5F9;
    --nx-hbtn-bd:       #E2E8F0;
    --nx-hbtn-color:    #64748B;
    --nx-panel-shadow:  0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
    --nx-trigger-bg:    #FFFFFF;
    --nx-trigger-color: #0F172A;
    --nx-powered-color: #94A3B8;
    --nx-char-color:    #94A3B8;
    --nx-sub-dot:       #64748B;
  }

  /* ── Root variables (accent - same for both themes) ── */
  .nx-wrap {
    --nx-accent:   #6C63FF;
    --nx-accent-2: #00D4FF;
    --nx-accent-3: #FF6B9D;
    --nx-glow:     rgba(108,99,255,0.35);
  }

  /* ── Trigger pill button ── */
  .nx-trigger-wrap {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9990;
    border-radius: 50px;
    padding: 2.5px;
    background: linear-gradient(135deg, #6EC6F5, #A8E6B0, #F7E26B, #6EC6F5);
    background-size: 300% 300%;
    animation: nx-border-spin 4s linear infinite;
    box-shadow: 0 4px 20px rgba(110,198,245,0.3), 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
  }
  .nx-trigger-wrap:hover {
    transform: scale(1.06) translateY(-2px);
    box-shadow: 0 8px 36px rgba(110,198,245,0.5), 0 4px 14px rgba(0,0,0,0.15);
  }
  .nx-trigger-wrap:active { transform: scale(0.97) translateY(0); }

  @keyframes nx-border-spin {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .nx-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px 11px 15px;
    border-radius: 48px;
    border: none;
    outline: none;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: -0.2px;
    white-space: nowrap;
    transition: background 0.25s ease, color 0.25s ease;
    background: var(--nx-trigger-bg);
    color: var(--nx-trigger-color);
  }

  .nx-trigger-sparkle {
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  .nx-trigger-wrap:hover .nx-trigger-sparkle { transform: rotate(20deg) scale(1.2); }
  .nx-trigger-sparkle.open { transform: rotate(45deg) scale(0.9); opacity: 0.7; }

  .nx-trigger-label {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    transition: opacity 0.2s;
  }
  .nx-trigger-label.open { opacity: 0.55; }

  /* ── Panel ── */
  .nx-panel {
    position: fixed;
    bottom: 96px;
    right: 28px;
    z-index: 9991;
    width: 420px;
    max-width: calc(100vw - 40px);
    height: 620px;
    max-height: calc(100vh - 140px);
    border-radius: 24px;
    display: flex; flex-direction: column;
    overflow: hidden;
    box-shadow: var(--nx-panel-shadow);
    transform-origin: bottom right;
    animation: nx-panel-in 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
    font-family: 'Inter', sans-serif;
    background: var(--nx-panel-bg);
  }
  .nx-panel.closing {
    animation: nx-panel-out 0.3s cubic-bezier(0.55,0,1,0.45) forwards;
  }

  @keyframes nx-panel-in {
    from { opacity: 0; transform: scale(0.7) translateY(40px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes nx-panel-out {
    from { opacity: 1; transform: scale(1) translateY(0); }
    to   { opacity: 0; transform: scale(0.7) translateY(40px); }
  }

  /* Panel background */
  .nx-panel-bg {
    position: absolute; inset: 0; z-index: 0;
    border-radius: 24px;
    overflow: hidden;
  }
  .nx-wrap[data-nx-theme="dark"] .nx-panel-bg::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 40% at 20% 0%, rgba(108,99,255,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,212,255,0.12) 0%, transparent 60%);
  }
  .nx-wrap[data-nx-theme="light"] .nx-panel-bg::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 40% at 20% 0%, rgba(108,99,255,0.06) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(0,212,255,0.04) 0%, transparent 60%);
  }
  .nx-panel-bg-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(var(--nx-grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--nx-grid-line) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  /* ── Header ── */
  .nx-header {
    position: relative; z-index: 1;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--nx-panel-border);
    flex-shrink: 0;
    background: var(--nx-header-bg);
    backdrop-filter: blur(12px);
  }
  .nx-header-top {
    display: flex; align-items: center; gap: 12px;
  }
  .nx-logo-ring {
    position: relative; flex-shrink: 0;
    width: 42px; height: 42px;
  }
  .nx-logo-ring svg {
    position: absolute; inset: 0; width: 100%; height: 100%;
    animation: nx-logo-spin 8s linear infinite;
  }
  @keyframes nx-logo-spin { to { transform: rotate(360deg); } }
  .nx-logo-core {
    position: absolute; inset: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6C63FF, #00D4FF);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 800;
    color: #fff;
    font-family: 'Syne', sans-serif;
    box-shadow: 0 0 16px rgba(108,99,255,0.6);
  }
  .nx-header-info { flex: 1; min-width: 0; }
  .nx-name {
    font-family: 'Syne', sans-serif;
    font-size: 17px; font-weight: 800;
    background: linear-gradient(90deg, #6C63FF, #00D4FF, #FF6B9D);
    background-size: 200% 100%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: nx-name-flow 4s ease infinite;
    letter-spacing: -0.3px;
  }
  @keyframes nx-name-flow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  .nx-sub {
    font-size: 11px; font-weight: 500;
    color: var(--nx-sub-dot);
    display: flex; align-items: center; gap: 5px;
    margin-top: 2px;
  }
  .nx-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #34D399;
    box-shadow: 0 0 6px #34D399;
    animation: nx-blink 1.5s ease infinite;
    flex-shrink: 0;
  }
  @keyframes nx-blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
  }
  .nx-header-actions {
    display: flex; align-items: center; gap: 6px;
  }
  .nx-hbtn {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--nx-hbtn-bg); border: 1px solid var(--nx-hbtn-bd);
    color: var(--nx-hbtn-color); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; transition: all 0.15s;
    flex-shrink: 0;
  }
  .nx-hbtn:hover { background: rgba(108,99,255,0.15); color: var(--nx-accent); border-color: rgba(108,99,255,0.3); }

  /* Mode pills */
  .nx-mode-bar {
    display: flex; gap: 6px; margin-top: 10px;
    flex-wrap: wrap;
  }
  .nx-mode-pill {
    padding: 4px 10px; border-radius: 20px;
    font-size: 10px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    border: 1px solid var(--nx-mode-bd);
    color: var(--nx-mode-color);
    background: transparent;
    white-space: nowrap;
  }
  .nx-mode-pill.active {
    background: linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1));
    border-color: rgba(108,99,255,0.5);
    color: #6C63FF;
  }
  .nx-mode-pill:hover { border-color: rgba(108,99,255,0.4); color: var(--nx-accent); }

  /* ── Messages ── */
  .nx-messages {
    flex: 1; overflow-y: auto; overflow-x: hidden;
    padding: 16px 16px 8px;
    position: relative; z-index: 1;
    display: flex; flex-direction: column; gap: 12px;
    scrollbar-width: thin;
    scrollbar-color: rgba(108,99,255,0.3) transparent;
  }
  .nx-messages::-webkit-scrollbar { width: 3px; }
  .nx-messages::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.3); border-radius: 3px; }

  /* Welcome state */
  .nx-welcome {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; flex: 1; text-align: center;
    gap: 8px; padding: 20px 10px;
    animation: nx-fade-up 0.6s ease;
  }
  @keyframes nx-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .nx-welcome-orb {
    width: 80px; height: 80px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.15));
    border: 1px solid rgba(108,99,255,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; margin-bottom: 8px;
    animation: nx-orb-float 3s ease-in-out infinite;
    box-shadow: 0 0 40px rgba(108,99,255,0.2);
  }
  @keyframes nx-orb-float {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-6px) scale(1.03); }
  }
  .nx-welcome-title {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
    background: linear-gradient(90deg, #6C63FF, #00D4FF);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .nx-welcome-sub {
    font-size: 12px; color: var(--nx-text-muted); line-height: 1.6; max-width: 280px;
  }

  /* Quick prompts */
  .nx-quick-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 6px; margin-top: 8px; width: 100%;
  }
  .nx-quick-card {
    background: var(--nx-quick-bg); border: 1px solid var(--nx-quick-bd);
    border-radius: 12px; padding: 10px 12px; cursor: pointer;
    text-align: left; transition: all 0.2s;
    animation: nx-fade-up 0.6s ease both;
  }
  .nx-quick-card:nth-child(2) { animation-delay: 0.05s; }
  .nx-quick-card:nth-child(3) { animation-delay: 0.1s; }
  .nx-quick-card:nth-child(4) { animation-delay: 0.15s; }
  .nx-quick-card:hover {
    background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.3);
    transform: translateY(-2px);
  }
  .nx-quick-card-icon { font-size: 18px; margin-bottom: 5px; }
  .nx-quick-card-label { font-size: 11px; font-weight: 600; color: var(--nx-quick-lbl); line-height: 1.4; }
  .nx-quick-card-desc { font-size: 10px; color: var(--nx-quick-desc); margin-top: 2px; }

  /* Message bubbles */
  .nx-msg {
    display: flex; align-items: flex-end; gap: 8px;
    animation: nx-msg-in 0.35s cubic-bezier(0.34,1.4,0.64,1) both;
  }
  @keyframes nx-msg-in {
    from { opacity: 0; transform: translateY(10px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .nx-msg.user { flex-direction: row-reverse; }

  .nx-msg-avatar {
    width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
  }
  .nx-msg-avatar.bot {
    background: linear-gradient(135deg, #6C63FF, #00D4FF);
    box-shadow: 0 0 12px rgba(108,99,255,0.5);
    font-family: 'Syne', sans-serif;
    color: #fff;
  }
  .nx-msg-avatar.user {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
  }

  .nx-bubble {
    max-width: 85%; padding: 10px 14px;
    border-radius: 16px; font-size: 13px; line-height: 1.65;
    font-weight: 400;
  }
  .nx-msg.bot .nx-bubble {
    background: var(--nx-bubble-bot-bg);
    border: 1px solid var(--nx-bubble-bot-bd);
    color: var(--nx-text-primary);
    border-bottom-left-radius: 4px;
  }
  .nx-msg.user .nx-bubble {
    background: var(--nx-bubble-user-bg);
    border: 1px solid var(--nx-bubble-user-bd);
    color: var(--nx-text-primary);
    border-bottom-right-radius: 4px;
    text-align: right;
  }

  /* Typing indicator */
  .nx-typing {
    display: flex; align-items: center; gap: 4px;
    padding: 10px 14px;
  }
  .nx-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(108,99,255,0.7);
    animation: nx-dot-bounce 1.4s ease-in-out infinite both;
  }
  .nx-dot:nth-child(2) { animation-delay: 0.15s; background: rgba(0,212,255,0.7); }
  .nx-dot:nth-child(3) { animation-delay: 0.3s; background: rgba(255,107,157,0.7); }
  @keyframes nx-dot-bounce {
    0%, 80%, 100% { transform: translateY(0) scale(0.85); opacity: 0.6; }
    40% { transform: translateY(-8px) scale(1); opacity: 1; }
  }

  /* Streaming cursor */
  .nx-cursor {
    display: inline-block; width: 2px; height: 13px;
    background: #6C63FF; margin-left: 2px; vertical-align: middle;
    animation: nx-cursor-blink 0.8s ease infinite;
    border-radius: 1px;
  }
  @keyframes nx-cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

  /* Timestamp */
  .nx-msg-meta {
    font-size: 9.5px; color: var(--nx-text-sub);
    margin-top: 3px; padding: 0 14px; text-align: right;
  }
  .nx-msg.bot .nx-msg-meta { text-align: left; padding-left: 38px; }

  /* ── Input ── */
  .nx-input-area {
    position: relative; z-index: 1;
    padding: 12px 14px 14px;
    border-top: 1px solid var(--nx-panel-border);
    background: var(--nx-input-area-bg);
    backdrop-filter: blur(12px);
    flex-shrink: 0;
  }
  .nx-input-wrap {
    display: flex; align-items: flex-end; gap: 8px;
    background: var(--nx-input-wrap-bg);
    border: 1px solid var(--nx-input-wrap-bd);
    border-radius: 16px; padding: 8px 10px;
    transition: border-color 0.2s, box-shadow 0.2s;
    position: relative;
  }
  .nx-input-wrap.focused {
    border-color: rgba(108,99,255,0.5);
    box-shadow: 0 0 0 3px rgba(108,99,255,0.12), inset 0 0 20px rgba(108,99,255,0.04);
  }
  .nx-input-glow {
    position: absolute; inset: -1px; border-radius: 17px;
    background: linear-gradient(135deg, #6C63FF, #00D4FF, #FF6B9D);
    opacity: 0; transition: opacity 0.3s; z-index: -1;
  }
  .nx-input-wrap.focused .nx-input-glow { opacity: 0.1; }

  .nx-textarea {
    flex: 1; background: none; border: none; outline: none;
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400;
    color: var(--nx-textarea-color); resize: none;
    min-height: 22px; max-height: 120px; line-height: 1.5;
    padding: 2px 0;
    scrollbar-width: none;
  }
  .nx-textarea::placeholder { color: var(--nx-textarea-ph); }
  .nx-textarea::-webkit-scrollbar { display: none; }

  .nx-send-btn {
    width: 36px; height: 36px; border-radius: 11px; flex-shrink: 0;
    border: none; cursor: pointer;
    background: linear-gradient(135deg, #6C63FF, #00D4FF);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 15px;
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(108,99,255,0.4);
  }
  .nx-send-btn:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(108,99,255,0.6); }
  .nx-send-btn:active { transform: scale(0.94); }
  .nx-send-btn:disabled { opacity: 0.4; transform: none; cursor: not-allowed; box-shadow: none; }

  .nx-input-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 7px; padding: 0 2px;
  }
  .nx-powered {
    font-size: 9px; font-weight: 600;
    color: var(--nx-powered-color);
    display: flex; align-items: center; gap: 4px;
  }
  .nx-powered-glow {
    background: linear-gradient(90deg, #6C63FF, #00D4FF);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .nx-char-count { font-size: 9px; color: var(--nx-char-color); font-weight: 500; }
  .nx-char-count.warn { color: rgba(255,107,107,0.7); }

  /* ── Particle canvas ── */
  .nx-canvas {
    position: absolute; inset: 0; z-index: 0;
    pointer-events: none; border-radius: 24px;
    opacity: 0.4;
  }

  /* ── Error toast ── */
  .nx-error {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; border-radius: 10px; margin: 0 0 4px;
    background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
    font-size: 11.5px; color: #EF4444; animation: nx-fade-up 0.3s ease;
    font-weight: 500;
  }
`;

const GROQ_CONFIG = {
  apiBase: "https://api.groq.com/openai/v1/chat/completions",
  model:   "llama3-8b-8192",
  apiKey:  import.meta.env?.VITE_GROQ_API_KEY || "",
};

const SYSTEM_PROMPT = `You are Nexus, a brilliant AI assistant embedded inside a Hospital Management System.
You are powered by Groq. You speak concisely, intelligently, and with confidence.
You understand hospital workflows: patient management, IPD/OPD, billing, lab tests, pharmacy, emergency, doctors, nursing, discharge, insurance, ward/bed management.
You help hospital staff with:
- Explaining how to use features in the app
- Clinical workflow guidance
- Quick calculations (drug dosage, BMI, billing estimates)
- Report generation advice
- Data interpretation help
Keep answers focused and practical. Use bullet points sparingly and only when listing steps. 
When you don't know something specific about this hospital's data, say so honestly.
Respond in the same language the user uses.`;

const QUICK_PROMPTS = [
  { icon: "🏥", label: "Patient Admission", desc: "IPD workflow guide" },
  { icon: "💊", label: "Drug Dosage", desc: "Quick calculation" },
  { icon: "🧾", label: "Billing Help", desc: "Invoice & insurance" },
  { icon: "📊", label: "Reports", desc: "Generate insights" },
];

// ── Groq API call ─────────────────────────────────────────────────
async function callGroq(messages, onChunk, signal) {
  const key = GROQ_CONFIG.apiKey;

  if (!key) {
    await demoStream(messages[messages.length - 1].content, onChunk, signal);
    return;
  }

  const res = await fetch(GROQ_CONFIG.apiBase, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GROQ_CONFIG.model,
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!res.ok) throw new Error(`Groq API error ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content || "";
        if (delta) onChunk(delta);
      } catch {}
    }
  }
}

// ── Demo streaming (when no API key) ─────────────────────────────
async function demoStream(userMsg, onChunk, signal) {
  const q = userMsg.toLowerCase();
  let response = "";
  if (q.includes("admission") || q.includes("ipd"))
    response = "For IPD admission, navigate to **IPD Admissions** in the sidebar. Click + New Admission, select the patient, choose the ward/bed, set the admitting doctor, and confirm. The system will auto-generate the admission number and alert nursing staff. Need step-by-step details for any specific part?";
  else if (q.includes("billing") || q.includes("invoice"))
    response = "Billing is under the 💰 Billing section. You can generate invoices linked to IPD/OPD episodes, add medicine dispense charges automatically from pharmacy records, apply insurance adjustments, and mark payments. For advance payments, use the Advance Payment module first.";
  else if (q.includes("drug") || q.includes("dosage"))
    response = "I can help with basic dosage calculations. Please share the drug name, patient weight, and frequency you're targeting. For pediatric dosing, I can apply mg/kg formulas. Note: always confirm with a clinical pharmacist for critical medications.";
  else if (q.includes("report"))
    response = "Reports are available under 📈 Reports. You can generate:\n• Daily OPD/IPD census\n• Revenue summaries\n• Lab turnaround times\n• Bed occupancy rates\n• Doctor-wise patient stats\n\nFor custom date ranges, use the filter panel at the top of the Reports page.";
  else if (q.includes("hi") || q.includes("hello") || q.includes("hey"))
    response = "Hello! I'm Nexus, your hospital management AI. I'm here to help you navigate workflows, answer clinical questions, or assist with data. What can I help you with today?";
  else
    response = `I understand you're asking about "${userMsg}". To give you the most accurate guidance for this hospital system, could you be a bit more specific? For example, are you looking for help with a particular module, a workflow issue, or a clinical calculation?`;

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  for (const ch of response) {
    if (signal?.aborted) return;
    onChunk(ch);
    if (Math.random() < 0.08) await delay(18 + Math.random() * 20);
    else await delay(6 + Math.random() * 8);
  }
}

// ── Particle animation ────────────────────────────────────────────
function useParticles(canvasRef, active, isDark) {
  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    const COLORS = isDark
      ? ["rgba(108,99,255,", "rgba(0,212,255,", "rgba(255,107,157,"]
      : ["rgba(108,99,255,", "rgba(0,150,200,", "rgba(150,100,220,"];

    const pts = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: isDark ? (0.2 + Math.random() * 0.5) : (0.1 + Math.random() * 0.2),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + p.a + ")";
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [active, isDark]);
}

// ── Main Component ────────────────────────────────────────────────
export default function NexusAssistant({ isOpen: externalIsOpen, onClose: externalOnClose, hideTrigger = false }) {
  const { isDark } = useTheme();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof externalIsOpen !== "undefined";
  const open = isControlled ? externalIsOpen : internalOpen;
  const setOpen = (val) => {
    if (isControlled) {
      if (!val && externalOnClose) externalOnClose();
    } else {
      setInternalOpen(val);
    }
  };

  const [closing,   setClosing]   = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [focused,   setFocused]   = useState(false);
  const [mode,      setMode]      = useState("general");

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const abortRef       = useRef(null);
  const canvasRef      = useRef(null);

  const theme = isDark ? "dark" : "light";

  useParticles(canvasRef, open, isDark);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
  }, [input]);

  const handleOpen = () => {
    setOpen(true);
    setClosing(false);
    setTimeout(() => textareaRef.current?.focus(), 400);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 290);
    abortRef.current?.abort();
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
    setError("");
  };

  const sendMessage = useCallback(async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setError("");

    const userMsg = { role: "user", content: msg, ts: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    abortRef.current = new AbortController();
    const botId = Date.now() + 1;

    setMessages(prev => [...prev, { role: "assistant", content: "", id: botId, ts: Date.now(), streaming: true }]);

    try {
      await callGroq(
        history.map(m => ({ role: m.role, content: m.content })),
        (chunk) => {
          setMessages(prev =>
            prev.map(m => m.id === botId ? { ...m, content: m.content + chunk } : m)
          );
        },
        abortRef.current.signal
      );
      setMessages(prev =>
        prev.map(m => m.id === botId ? { ...m, streaming: false } : m)
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Connection error. Please check your API key or try again.");
        setMessages(prev => prev.filter(m => m.id !== botId));
      }
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const MODES = [
    { id: "general",  label: "General" },
    { id: "clinical", label: "Clinical" },
    { id: "billing",  label: "Billing" },
    { id: "reports",  label: "Reports" },
  ];

  const modePrompts = {
    clinical: "How do I document a clinical note for a patient?",
    billing:  "How do I create an invoice for a discharged patient?",
    reports:  "What reports are available for the finance team?",
  };

  return (
    <div className="nx-wrap" data-nx-theme={theme}>
      <style>{NEXUS_CSS}</style>

      {/* ── Floating trigger pill ── */}
      {!hideTrigger && (
        <div
          className="nx-trigger-wrap"
          onClick={open ? handleClose : handleOpen}
          title={open ? "Close Nexus" : "Ask Nexus AI"}
          role="button"
          aria-label="Open Nexus AI Assistant"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && (open ? handleClose() : handleOpen())}
        >
          <button className="nx-trigger">
            <span className={`nx-trigger-sparkle${open ? " open" : ""}`}>
              {open ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round"
                  stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                    fill="currentColor" opacity="0.9"/>
                  <path d="M19 2L19.8 4.2L22 5L19.8 5.8L19 8L18.2 5.8L16 5L18.2 4.2L19 2Z"
                    fill="currentColor" opacity="0.7"/>
                  <path d="M5 16L5.6 17.4L7 18L5.6 18.6L5 20L4.4 18.6L3 18L4.4 17.4L5 16Z"
                    fill="currentColor" opacity="0.6"/>
                </svg>
              )}
            </span>
            <span className={`nx-trigger-label${open ? " open" : ""}`}>
              {open ? "Close" : "AI"}
            </span>
          </button>
        </div>
      )}

      {/* ── Chat panel ── */}
      {open && (
        <div className={`nx-panel${closing ? " closing" : ""}`} role="dialog" aria-label="Nexus AI Assistant">

          {/* Background */}
          <div className="nx-panel-bg">
            <div className="nx-panel-bg-grid" />
          </div>
          <canvas ref={canvasRef} className="nx-canvas" />

          {/* Header */}
          <div className="nx-header">
            <div className="nx-header-top">
              <div className="nx-logo-ring">
                <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="21" cy="21" r="19" stroke="url(#nx-ring-grad)" strokeWidth="1.5" strokeDasharray="4 3"/>
                  <defs>
                    <linearGradient id="nx-ring-grad" x1="0" y1="0" x2="42" y2="42">
                      <stop offset="0%" stopColor="#6C63FF"/>
                      <stop offset="50%" stopColor="#00D4FF"/>
                      <stop offset="100%" stopColor="#FF6B9D"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="nx-logo-core">N</div>
              </div>
              <div className="nx-header-info">
                <div className="nx-name">Nexus</div>
                <div className="nx-sub">
                  <span className="nx-live-dot" />
                  <span>Powered by Groq · Hospital AI</span>
                </div>
              </div>
              <div className="nx-header-actions">
                <button className="nx-hbtn" title="Clear chat" onClick={handleClear}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
                </button>
                <button className="nx-hbtn" title="Close" onClick={handleClose}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="nx-mode-bar">
              {MODES.map(m => (
                <button
                  key={m.id}
                  className={`nx-mode-pill${mode === m.id ? " active" : ""}`}
                  onClick={() => {
                    setMode(m.id);
                    if (modePrompts[m.id] && messages.length === 0) sendMessage(modePrompts[m.id]);
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="nx-messages">
            {messages.length === 0 ? (
              <div className="nx-welcome">
                <div className="nx-welcome-orb">🧠</div>
                <div className="nx-welcome-title">How may I help you?</div>
                <div className="nx-welcome-sub">
                  I'm Nexus — your intelligent hospital assistant. Ask me anything about workflows, patients, billing, or clinical guidance.
                </div>
                <div className="nx-quick-grid">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <div key={i} className="nx-quick-card" onClick={() => sendMessage(qp.label + " — " + qp.desc)}>
                      <div className="nx-quick-card-icon">{qp.icon}</div>
                      <div className="nx-quick-card-label">{qp.label}</div>
                      <div className="nx-quick-card-desc">{qp.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={m.id || i}>
                    <div className={`nx-msg ${m.role === "user" ? "user" : "bot"}`}>
                      <div className={`nx-msg-avatar ${m.role === "user" ? "user" : "bot"}`}>
                        {m.role === "user" ? "U" : "N"}
                      </div>
                      <div className="nx-bubble">
                        {m.content || (m.streaming && <span className="nx-typing"><span className="nx-dot"/><span className="nx-dot"/><span className="nx-dot"/></span>)}
                        {m.streaming && m.content && <span className="nx-cursor"/>}
                      </div>
                    </div>
                    <div className="nx-msg-meta">
                      {m.role === "assistant" ? "Nexus · Groq" : "You"} · {new Date(m.ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                ))}

                {loading && !messages.find(m => m.streaming) && (
                  <div className="nx-msg bot">
                    <div className="nx-msg-avatar bot">N</div>
                    <div className="nx-bubble">
                      <div className="nx-typing">
                        <span className="nx-dot"/><span className="nx-dot"/><span className="nx-dot"/>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && <div className="nx-error">⚠️ {error}</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="nx-input-area">
            <div className={`nx-input-wrap${focused ? " focused" : ""}`}>
              <div className="nx-input-glow" />
              <textarea
                ref={textareaRef}
                className="nx-textarea"
                placeholder="Ask Nexus anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                rows={1}
                maxLength={2000}
                disabled={loading}
              />
              <button
                className="nx-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                title="Send"
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div className="nx-input-footer">
              <div className="nx-powered">
                Powered by <span className="nx-powered-glow">Groq · llama3</span>
              </div>
              <div className={`nx-char-count${input.length > 1800 ? " warn" : ""}`}>
                {input.length > 0 ? `${input.length}/2000` : "⏎ send · Shift+⏎ newline"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}