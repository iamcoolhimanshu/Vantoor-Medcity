import React, { useState, useEffect } from "react";
import API from "../../../api/api";
import { useTheme } from "../../../hooks/useTheme";
import WorkflowBuilder from "./WorkflowBuilder";
import WorkflowHistory from "./WorkflowHistory";
import WorkflowExecutionLogs from "./WorkflowExecutionLogs";

const buildCss = (isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body, #root { font-family: 'DM Sans', sans-serif; background: ${isDark ? '#0F172A' : '#EEF2F7'}; min-height: 100vh; color: ${isDark ? '#E2E8F0' : '#0F172A'}; }

  .wf-app { padding: 28px; width: 100%; }

  /* ── HEADER ── */
  .wf-header {
    background: linear-gradient(135deg, #0D6B45 0%, #16A064 45%, #22C77A 80%, #5EE6A8 100%);
    border-radius: 16px; padding: 22px 28px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden; margin-bottom: 22px;
    box-shadow: 0 8px 32px rgba(13,107,69,0.28);
  }
  .wf-header::before { content:''; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.06); }
  .wf-header::after  { content:''; position:absolute; bottom:-40px; right:160px; width:120px; height:120px; border-radius:50%; background:rgba(255,255,255,0.04); }
  .hdr-left  { display:flex; align-items:center; gap:14px; position:relative; z-index:1; }
  .hdr-icon  { width:44px; height:44px; background:rgba(255,255,255,0.18); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; border:1px solid rgba(255,255,255,0.25); }
  .hdr-title { font-size:20px; font-weight:800; color:#fff; line-height:1.2; }
  .hdr-sub   { font-size:12px; color:rgba(255,255,255,0.68); margin-top:3px; }
  .hdr-right { display:flex; align-items:center; gap:8px; position:relative; z-index:1; }

  /* ── KPI ROW ── */
  .kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
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

  /* ── PROFILES CARDS GRID ── */
  .profiles-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(310px,1fr)); gap:20px; padding:20px; }
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
    display:flex; justify-content:space-between; align-items:flex-start;
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
  .profile-card-footer { padding:12px 16px; border-top:1px solid ${isDark?'#334155':'#F1F5F9'}; display:flex; align-items:center; justify-content:space-between; gap:8px; background:${isDark?'#0F172A':'#FAFBFD'}; }

  /* ── BTNS ── */
  .btn-primary { background:#16A064; color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; padding:9px 18px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.15s; }
  .btn-primary:hover { background:#0D6B45; transform:translateY(-1px); }
  .btn-outline { background:${isDark?'transparent':'#fff'}; color:${isDark?'#CBD5E1':'#475569'}; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:8px 16px; border-radius:8px; border:1.5px solid ${isDark?'#475569':'#CBD5E1'}; cursor:pointer; transition:all 0.15s; display:inline-flex; align-items:center; gap:6px; }
  .btn-outline:hover { border-color:#16A064; color:#16A064; background:${isDark?'rgba(22,160,100,0.10)':'#F0FDF4'}; }
  .btn-ghost { background:rgba(255,255,255,0.18); color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; padding:9px 18px; border-radius:9px; border:1px solid rgba(255,255,255,0.32); cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.15s; position:relative; z-index:1; }
  .btn-ghost:hover { background:rgba(255,255,255,0.28); }
  .btn-danger-sm { background:${isDark?'rgba(220,38,38,0.2)':'#FEE2E2'}; color:#DC2626; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px; transition:all 0.12s; }
  .btn-danger-sm:hover { background:#DC2626; color:#fff; }

  /* ── MODAL OVERLAY ── */
  .modal-overlay { position:fixed; top:64px; left:0; right:0; bottom:0; background:rgba(${isDark?'0,0,0,0.65':'15,23,42,0.48'}); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(3px); padding:20px; }
  .modal-box { background:${isDark?'#1E293B':'#fff'}; border-radius:16px; width:100%; max-width:640px; box-shadow:0 24px 60px rgba(0,0,0,0.25); overflow:hidden; display:flex; flex-direction:column; }
  .modal-hdr { background:linear-gradient(135deg,#0D6B45 0%,#16A064 50%,#22C77A 100%); padding:18px 24px; display:flex; align-items:center; justify-content:space-between; }
  .modal-hdr-title { font-size:16px; font-weight:800; color:#fff; }
  .modal-hdr-sub { font-size:12px; color:rgba(255,255,255,0.75); margin-top:2px; }
  .modal-close { background:none; border:none; cursor:pointer; color:#fff; font-size:18px; }
  .modal-body { padding:22px; overflow-y:auto; flex:1; background:${isDark?'#0F172A':'#F8FAFC'}; }
  .modal-footer { padding:14px 22px; border-top:1px solid ${isDark?'#334155':'#E2E8F0'}; display:flex; justify-content:flex-end; gap:10px; background:${isDark?'#1E293B':'#fff'}; }
  .form-group { display:flex; flex-direction:column; gap:6px; }
  .form-label { font-size:11px; font-weight:700; color:${isDark?'#94A3B8':'#64748B'}; text-transform:uppercase; letter-spacing:0.06em; }
  .form-textarea { font-family:'DM Sans',sans-serif; font-size:13px; color:${isDark?'#E2E8F0':'#0F172A'}; background:${isDark?'#0F172A':'#fff'}; border:1.5px solid ${isDark?'#334155':'#E2E8F0'}; border-radius:9px; padding:10px 13px; width:100%; outline:none; }
`;

export default function WorkflowDashboard() {
  const { theme } = useTheme?.() || { theme: "light" };
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("history");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    successRate: 100,
    avgDuration: "0ms"
  });

  const fetchStats = () => {
    API.get("/api/workflow/stats")
      .then(r => {
        if (r.data) {
          setStats({
            total: r.data.total || 0,
            active: r.data.active || 0,
            successRate: r.data.successRate != null ? r.data.successRate : 100,
            avgDuration: r.data.avgDuration || "0ms"
          });
        }
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchStats();
    API.get("/api/workflow/ai/suggestions")
      .then(r => setSuggestions(r.data || []))
      .catch(e => console.error(e));
  }, []);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const r = await API.post("/api/workflow/ai/generate", { prompt: aiPrompt });
      setAiResult(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAiWorkflow = async () => {
    if (!aiResult) return;
    try {
      await API.post("/api/workflow/create", aiResult);
      setShowAiModal(false);
      setAiResult(null);
      setAiPrompt("");
      fetchStats();
      setActiveTab("history");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="wf-app">
      <style>{buildCss(isDark)}</style>

      {/* Header matching AppointmentManagement */}
      <div className="wf-header">
        <div className="hdr-left">
          <div className="hdr-icon">⚡</div>
          <div>
            <div className="hdr-title">Smart Automation & Workflow Engine</div>
            <div className="hdr-sub">Enterprise ERP Event-Driven Automation · Dynamic Node Sequencing · Groq AI Generator</div>
          </div>
        </div>
        <div className="hdr-right">
          <button className="btn-ghost" onClick={() => setShowAiModal(true)}>
            🤖 AI Workflow Generator
          </button>
        </div>
      </div>

      {/* KPI Row matching AppointmentManagement */}
      <div className="kpi-row">
        <div className="kpi-card kpi-teal">
          <div>
            <div className="kpi-label">Total Automations</div>
            <div className="kpi-value">{stats.total}</div>
          </div>
          <div className="kpi-icon">⚡</div>
        </div>
        <div className="kpi-card kpi-green">
          <div>
            <div className="kpi-label">Active Engine Status</div>
            <div className="kpi-value">{stats.active}</div>
          </div>
          <div className="kpi-icon">🟢</div>
        </div>
        <div className="kpi-card kpi-amber">
          <div>
            <div className="kpi-label">Success Rate</div>
            <div className="kpi-value">{stats.successRate}%</div>
          </div>
          <div className="kpi-icon">📈</div>
        </div>
        <div className="kpi-card kpi-purple">
          <div>
            <div className="kpi-label">Avg Execution Speed</div>
            <div className="kpi-value">{stats.avgDuration}</div>
          </div>
          <div className="kpi-icon">⏱</div>
        </div>
      </div>

      {/* Main Card holding Tabs and Views */}
      <div className="main-card">
        <div className="tab-bar">
          <button className={`tab-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
            📋 Workflow Roster
          </button>
          <button className={`tab-btn ${activeTab === "builder" ? "active" : ""}`} onClick={() => setActiveTab("builder")}>
            ⚡ Visual Canvas Builder
          </button>
          <button className={`tab-btn ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>
            📜 Audit Trail & Logs
          </button>
        </div>

        {activeTab === "history" && <WorkflowHistory isDark={isDark} onSelectEdit={() => setActiveTab("builder")} onWorkflowChanged={fetchStats} />}
        {activeTab === "builder" && <WorkflowBuilder isDark={isDark} onWorkflowSaved={() => { fetchStats(); setActiveTab("history"); }} />}
        {activeTab === "logs" && <WorkflowExecutionLogs isDark={isDark} />}
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <div className="modal-hdr-title">🤖 AI Workflow Generator</div>
                <div className="modal-hdr-sub">Describe your hospital process in plain English</div>
              </div>
              <button className="modal-close" onClick={() => setShowAiModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Natural Language Automation Prompt</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="e.g. When patient is admitted assign doctor, notify nurse and create initial bill"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
              </div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: 12 }} onClick={handleAiGenerate} disabled={aiLoading || !aiPrompt.trim()}>
                {aiLoading ? "Groq LLM Compiling Workflow..." : "✨ Generate Workflow Schema"}
              </button>

              {aiResult && (
                <div style={{ marginTop: 20, background: isDark ? "#0F172A" : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#CBD5E1"}` }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: isDark ? "#E2E8F0" : "#0F172A", marginBottom: 6 }}>Generated: {aiResult.workflowName}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>Trigger: <span className="meta-pill pill-blue">{aiResult.triggerType}</span></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {aiResult.steps?.map((st, idx) => (
                      <div key={idx} style={{ fontSize: 12, fontWeight: 600, color: isDark ? "#CBD5E1" : "#334155", background: isDark ? "#1E293B" : "#FFFFFF", padding: "8px 12px", borderRadius: 8, border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}` }}>
                        Step {st.stepOrder}: {st.stepType} {st.actionType ? `(${st.actionType})` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowAiModal(false)}>Cancel</button>
              {aiResult && <button className="btn-primary" onClick={handleSaveAiWorkflow}>💾 Save & Activate Workflow</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
