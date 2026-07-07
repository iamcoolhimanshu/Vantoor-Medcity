import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const ROLES = [
  "ROLE_ADMIN",
  "ROLE_HOSPITAL_ADMIN",
  "ROLE_DOCTOR",
  "ROLE_RECEPTIONIST",
  "ROLE_BILLING_EXECUTIVE",
  "ROLE_WARD_MANAGER",
  "ROLE_FINANCE_ADMIN"
];

export default function AnalyticsStudio() {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promptText, setPromptText] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [shareDashboard, setShareDashboard] = useState(null);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/dashboard/all");
      setDashboards(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load dashboards", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/hospital/analytics/create");
  };

  const handleEdit = (id) => {
    navigate(`/hospital/analytics/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/hospital/analytics/view/${id}`);
  };

  const handleClone = async (id) => {
    try {
      await API.post(`/api/dashboard/clone/${id}`);
      loadDashboards();
    } catch (err) {
      alert("Failed to clone dashboard");
    }
  };

  const handlePublish = async (id) => {
    try {
      await API.post(`/api/dashboard/publish/${id}`);
      loadDashboards();
    } catch (err) {
      alert("Failed to publish dashboard");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dashboard?")) return;
    try {
      await API.delete(`/api/dashboard/delete/${id}`);
      loadDashboards();
    } catch (err) {
      alert("Failed to delete dashboard");
    }
  };

  const handleSetDefault = async (id, dashboardName, description, roleType, status) => {
    try {
      await API.put(`/api/dashboard/update/${id}`, {
        dashboardName,
        description,
        roleType,
        status,
        isDefault: true
      });
      loadDashboards();
    } catch (err) {
      alert("Failed to set as default");
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setAiGenerating(true);
    try {
      const res = await API.post("/api/dashboard/ai-generate", { prompt: promptText });
      setPromptText("");
      if (res.data && res.data.id) {
        navigate(`/hospital/analytics/edit/${res.data.id}`);
      } else {
        loadDashboards();
      }
    } catch (err) {
      alert("AI Generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  const openShareModal = (dashboard) => {
    setShareDashboard(dashboard);
    const existing = dashboard.permissions || [];
    // Initialize permissions list for all roles
    const list = ROLES.map(role => {
      const match = existing.find(p => p.roleName === role);
      return {
        roleName: role,
        canView: match ? !!match.canView : false,
        canEdit: match ? !!match.canEdit : false,
        canDelete: match ? !!match.canDelete : false
      };
    });
    setPermissions(list);
  };

  const togglePermission = (role, key) => {
    setPermissions(prev => prev.map(p => {
      if (p.roleName === role) {
        return { ...p, [key]: !p[key] };
      }
      return p;
    }));
  };

  const saveShareSettings = async () => {
    try {
      await API.post(`/api/dashboard/share/${shareDashboard.id}`, permissions);
      setShareDashboard(null);
      loadDashboards();
    } catch (err) {
      alert("Failed to save sharing settings");
    }
  };

  return (
    <div className="ast-container">
      <style>{`
        .ast-container {
          padding: 24px 30px;
          min-height: calc(100vh - 52px);
          background: #F8FAFC;
          color: #0F172A;
          font-family: 'DM Sans', sans-serif;
        }
        [data-theme="dark"] .ast-container {
          background: #090F1C;
          color: #E2E8F0;
        }
        
        .ast-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .ast-title {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .ast-subtitle {
          font-size: 13px;
          color: #64748B;
          margin-top: 4px;
        }
        [data-theme="dark"] .ast-subtitle {
          color: #94A3B8;
        }
        
        .btn-primary {
          background: #059669;
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(5,150,105,0.2);
        }
        .btn-primary:hover {
          background: #047857;
          transform: translateY(-1px);
        }
        
        /* ── AI Generator Bar ── */
        .ai-bar {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 1px 10px rgba(15,23,42,0.05);
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        [data-theme="dark"] .ai-bar {
          background: #0F172A;
          border-color: #1E293B;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .ai-bar::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 5px;
          background: linear-gradient(to bottom, #7C3AED, #8B5CF6);
        }
        .ai-bar-title {
          font-size: 14px;
          font-weight: 800;
          color: #7C3AED;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-form {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .ai-input {
          flex: 1;
          border: 1px solid #CBD5E1;
          background: #F8FAFC;
          color: inherit;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.15s;
        }
        [data-theme="dark"] .ai-input {
          border-color: #334155;
          background: #090F1C;
        }
        .ai-input:focus {
          border-color: #7C3AED;
        }
        .btn-ai {
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          color: #fff;
          border: none;
          padding: 0 24px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(124,58,237,0.25);
        }
        .btn-ai:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(124,58,237,0.35);
        }
        .btn-ai:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        /* ── Grid View ── */
        .dash-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        
        .dash-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 1px 6px rgba(15,23,42,0.04);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        [data-theme="dark"] .dash-card {
          background: #0F172A;
          border-color: #1E293B;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .dash-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15,23,42,0.08);
          border-color: #CBD5E1;
        }
        [data-theme="dark"] .dash-card:hover {
          border-color: #334155;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        }
        
        .dash-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .dash-name-wrap {
          flex: 1;
          min-width: 0;
          margin-right: 8px;
        }
        .dash-name {
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dash-desc {
          font-size: 12px;
          color: #64748B;
          margin-top: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 32px;
        }
        [data-theme="dark"] .dash-desc {
          color: #94A3B8;
        }
        
        .badge-status {
          font-size: 10px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .badge-published { background: rgba(5,150,105,0.1); color: #059669; border: 1px solid rgba(5,150,105,0.2); }
        .badge-draft { background: rgba(100,116,139,0.1); color: #64748B; border: 1px solid rgba(100,116,139,0.2); }
        
        .dash-meta {
          border-top: 1px solid #F1F5F9;
          padding-top: 12px;
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          font-size: 11.5px;
          color: #64748B;
        }
        [data-theme="dark"] .dash-meta {
          border-color: #1E293B;
          color: #94A3B8;
        }
        .dash-role {
          font-weight: 700;
          background: rgba(37,99,235,0.1);
          color: #2563EB;
          padding: 2px 7px;
          border-radius: 4px;
        }
        
        .dash-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-top: 16px;
          border-top: 1px solid #F1F5F9;
          padding-top: 14px;
        }
        [data-theme="dark"] .dash-actions {
          border-color: #1E293B;
        }
        .action-btn {
          border: 1px solid #E2E8F0;
          background: #fff;
          color: inherit;
          padding: 6px 4px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        [data-theme="dark"] .action-btn {
          background: #1E293B;
          border-color: #334155;
        }
        .action-btn:hover {
          background: #F1F5F9;
        }
        [data-theme="dark"] .action-btn:hover {
          background: #334155;
        }
        .action-btn.delete:hover {
          background: rgba(220,38,38,0.1);
          color: #DC2626;
          border-color: rgba(220,38,38,0.2);
        }
        .action-btn.primary {
          background: rgba(13,148,136,0.1);
          color: #0D9488;
          border-color: rgba(13,148,136,0.25);
        }
        .action-btn.primary:hover {
          background: #0D9488;
          color: #fff;
        }
        
        /* ── Share Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-card {
          background: #fff;
          border-radius: 16px;
          width: 500px;
          max-width: 90%;
          padding: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: dsh-up 0.2s ease both;
        }
        [data-theme="dark"] .modal-card {
          background: #0F172A;
          border: 1px solid #1E293B;
        }
        .modal-hdr {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .modal-body {
          max-height: 320px;
          overflow-y: auto;
          margin-bottom: 20px;
        }
        .perm-row {
          display: grid;
          grid-template-columns: 180px repeat(3, 1fr);
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #F1F5F9;
        }
        [data-theme="dark"] .perm-row {
          border-color: #1E293B;
        }
        .perm-role {
          font-size: 12.5px;
          font-weight: 600;
        }
        .perm-chk-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 10px;
          font-weight: 700;
          color: #64748B;
          cursor: pointer;
        }
        .modal-foot {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .btn-sec {
          background: transparent;
          border: 1px solid #CBD5E1;
          color: inherit;
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        [data-theme="dark"] .btn-sec {
          border-color: #334155;
        }
        
        .loading-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 250px;
          flex-direction: column;
          gap: 12px;
          color: #059669;
          font-weight: 600;
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ast-header">
        <div>
          <h1 className="ast-title">Analytics Studio</h1>
          <p className="ast-subtitle">Create and manage dynamic dashboards for clinic metrics, billing, inventory, and AI forecasting.</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <span>➕</span> Create Dashboard
        </button>
      </div>

      {/* AI Dashboard Generator */}
      <div className="ai-bar">
        <div className="ai-bar-title">
          <span>✨</span> AI Dashboard Builder
        </div>
        <form className="ai-form" onSubmit={handleAiGenerate}>
          <input
            className="ai-input"
            type="text"
            placeholder="Describe the dashboard you want (e.g., 'Create a Doctor Dashboard with patient queue and AI medicine warnings'...)"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={aiGenerating}
          />
          <button className="btn-ai" type="submit" disabled={aiGenerating || !promptText.trim()}>
            {aiGenerating ? (
              <>
                <span className="spinner">🔄</span> Generating layout...
              </>
            ) : (
              <>
                <span>🔮</span> Auto-Generate
              </>
            )}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <span className="spinner" style={{ fontSize: 24 }}>🔄</span>
          Loading dashboards list...
        </div>
      ) : dashboards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748B" }}>
          <p style={{ fontSize: 18, fontWeight: 700 }}>No Custom Dashboards Found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Get started by creating one or use the AI builder to auto-generate a layout.</p>
        </div>
      ) : (
        <div className="dash-grid">
          {dashboards.map((dash) => (
            <div key={dash.id} className="dash-card">
              <div>
                <div className="dash-card-header">
                  <span className="dash-name" title={dash.dashboardName}>{dash.dashboardName}</span>
                  <span className={`badge-status ${dash.status === "PUBLISHED" ? "badge-published" : "badge-draft"}`}>
                    {dash.status || "DRAFT"}
                  </span>
                </div>
                <p className="dash-desc">{dash.description || "No description provided."}</p>
                
                <div className="dash-meta">
                  <span>Scope: <span className="dash-role">{dash.roleType || "All"}</span></span>
                  {dash.isDefault && <span style={{ color: "#0D9488", fontWeight: 800 }}>⭐ Default</span>}
                </div>
              </div>

              <div className="dash-actions">
                <button className="action-btn primary" onClick={() => handleView(dash.id)}>
                  👁️ View
                </button>
                <button className="action-btn" onClick={() => handleEdit(dash.id)}>
                  ✏️ Edit
                </button>
                <button className="action-btn" onClick={() => handleClone(dash.id)}>
                  📋 Copy
                </button>
                <button className="action-btn" onClick={() => openShareModal(dash)}>
                  🔗 Share
                </button>
                {dash.status !== "PUBLISHED" ? (
                  <button className="action-btn" onClick={() => handlePublish(dash.id)}>
                    📢 Publish
                  </button>
                ) : (
                  <button 
                    className="action-btn" 
                    disabled={dash.isDefault}
                    onClick={() => handleSetDefault(dash.id, dash.dashboardName, dash.description, dash.roleType, dash.status)}
                    style={{ opacity: dash.isDefault ? 0.5 : 1 }}
                  >
                    ⭐ Default
                  </button>
                )}
                <button className="action-btn delete" onClick={() => handleDelete(dash.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareDashboard && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-hdr">Share Dashboard: {shareDashboard.dashboardName}</h3>
            
            <div className="perm-row" style={{ borderBottom: "2px solid #CBD5E1", paddingBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Role Name</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textAlign: "center" }}>View</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textAlign: "center" }}>Edit</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textAlign: "center" }}>Delete</span>
            </div>

            <div className="modal-body">
              {permissions.map((p) => (
                <div key={p.roleName} className="perm-row">
                  <span className="perm-role">{p.roleName.replace("ROLE_", "").replace("_", " ")}</span>
                  <label className="perm-chk-label">
                    <input 
                      type="checkbox" 
                      checked={p.canView} 
                      onChange={() => togglePermission(p.roleName, "canView")}
                    />
                  </label>
                  <label className="perm-chk-label">
                    <input 
                      type="checkbox" 
                      checked={p.canEdit} 
                      onChange={() => togglePermission(p.roleName, "canEdit")}
                    />
                  </label>
                  <label className="perm-chk-label">
                    <input 
                      type="checkbox" 
                      checked={p.canDelete} 
                      onChange={() => togglePermission(p.roleName, "canDelete")}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="modal-foot">
              <button className="btn-sec" onClick={() => setShareDashboard(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveShareSettings}>Save Sharing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
