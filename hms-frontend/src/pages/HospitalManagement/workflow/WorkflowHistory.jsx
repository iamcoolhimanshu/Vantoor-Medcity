import React, { useState, useEffect } from "react";
import API from "../../../api/api";

export default function WorkflowHistory({ isDark, onSelectEdit, onWorkflowChanged }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState(null);
  const [msg, setMsg] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid | table
  const [search, setSearch] = useState("");
  const [filterTrigger, setFilterTrigger] = useState("ALL");

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const r = await API.get("/api/workflow/all");
      setWorkflows(r.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const toggleStatus = async (wf) => {
    const isAct = wf.status === "ACTIVE";
    const endpoint = isAct ? `/api/workflow/deactivate/${wf.id}` : `/api/workflow/activate/${wf.id}`;
    try {
      await API.post(endpoint);
      loadWorkflows();
      if (onWorkflowChanged) onWorkflowChanged();
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualExecute = async (wf) => {
    setExecutingId(wf.id);
    setMsg("");
    try {
      const res = await API.post("/api/workflow/execute", {
        workflowId: wf.id,
        triggerType: wf.triggerType,
        entityId: "TEST-101",
        entityType: "MANUAL_TEST",
        payload: { testTime: new Date().toISOString() }
      });
      setMsg(`Workflow "${wf.workflowName}" executed successfully! Log status: ${res.data?.status || "SUCCESS"}`);
      if (onWorkflowChanged) onWorkflowChanged();
    } catch (e) {
      console.error(e);
      setMsg("Execution failed.");
    } finally {
      setExecutingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this automation workflow?")) return;
    try {
      await API.delete(`/api/workflow/delete/${id}`);
      loadWorkflows();
      if (onWorkflowChanged) onWorkflowChanged();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.workflowName?.toLowerCase().includes(search.toLowerCase()) ||
      w.triggerType?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterTrigger === "ALL" || w.triggerType === filterTrigger;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {msg && (
        <div style={{ padding: "12px 18px", background: "#F0FDF4", color: "#0D6B45", fontWeight: 700, fontSize: 13, borderBottom: "1px solid #BBF7D0", display: "flex", justifyContent: "space-between" }}>
          <span>✓ {msg}</span>
          <button style={{ background: "none", border: "none", color: "#0D6B45", cursor: "pointer", fontWeight: 800 }} onClick={() => setMsg("")}>✕</button>
        </div>
      )}

      {/* Toolbar matching AppointmentManagement */}
      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search hospital automations by name or event..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select className="filter-select" value={filterTrigger} onChange={e => setFilterTrigger(e.target.value)}>
          <option value="ALL">All Trigger Events</option>
          <option value="PATIENT_ADMITTED">PATIENT_ADMITTED</option>
          <option value="APPOINTMENT_CONFIRMED">APPOINTMENT_CONFIRMED</option>
          <option value="LOW_STOCK">LOW_STOCK</option>
          <option value="PATIENT_DISCHARGED">PATIENT_DISCHARGED</option>
        </select>

        <button className={`btn-outline ${viewMode === "grid" ? "active" : ""}`} style={{ borderColor: viewMode === "grid" ? "#16A064" : undefined, color: viewMode === "grid" ? "#16A064" : undefined }} onClick={() => setViewMode("grid")}>
          🌁 Grid View
        </button>
        <button className={`btn-outline ${viewMode === "table" ? "active" : ""}`} style={{ borderColor: viewMode === "table" ? "#16A064" : undefined, color: viewMode === "table" ? "#16A064" : undefined }} onClick={() => setViewMode("table")}>
          ☰ List View
        </button>
        <button className="btn-outline" onClick={loadWorkflows}>
          🔄 Refresh
        </button>
      </div>

      {/* Grid View Mode matching AppointmentManagement profiles-grid */}
      {viewMode === "grid" && (
        <div style={{ minHeight: 320 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>Loading automations grid...</div>
          ) : filteredWorkflows.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#94A3B8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? "#E2E8F0" : "#0F172A" }}>No Workflows Found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Use "Visual Canvas Builder" or AI Workflow Generator to create one.</div>
            </div>
          ) : (
            <div className="profiles-grid">
              {filteredWorkflows.map(wf => {
                const isActive = wf.status === "ACTIVE";
                return (
                  <div key={wf.id} className={`profile-card ${!isActive ? "inactive" : ""}`}>
                    {/* Card Header matching profile-card-hdr */}
                    <div className={`profile-card-hdr ${!isActive ? "inactive-hdr" : ""}`}>
                      <div>
                        <div className="profile-card-name">{wf.workflowName}</div>
                        <div className="profile-card-desc">TRIGGER: {wf.triggerType}</div>
                      </div>
                      <span className="active-badge" onClick={() => toggleStatus(wf)} style={{ cursor: "pointer" }}>
                        ● {wf.status}
                      </span>
                    </div>

                    {/* Card Body matching profile-card-body */}
                    <div className="profile-card-body">
                      <div style={{ fontSize: 13, color: isDark ? "#CBD5E1" : "#475569", marginBottom: 14, minHeight: 38 }}>
                        {wf.description || "Automated hospital event pipeline listening to real-time triggers."}
                      </div>

                      <div className="meta-pills">
                        <span className="meta-pill pill-green">⚡ {wf.steps?.length || 0} Steps</span>
                        <span className="meta-pill pill-blue">🎯 {wf.triggerType}</span>
                        <span className="meta-pill pill-amber">👤 {wf.createdBy || "ADMIN"}</span>
                      </div>
                    </div>

                    {/* Card Footer matching profile-card-footer */}
                    <div className="profile-card-footer">
                      <button
                        className="btn-primary"
                        style={{ padding: "6px 14px", fontSize: 12 }}
                        onClick={() => handleManualExecute(wf)}
                        disabled={executingId === wf.id}
                      >
                        {executingId === wf.id ? "Running..." : "▶ Run Test Trigger"}
                      </button>
                      <button className="btn-danger-sm" onClick={() => handleDelete(wf.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Table View Mode */}
      {viewMode === "table" && (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Workflow Name</th>
                <th>Trigger Event</th>
                <th>Steps</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Loading automations...</td></tr>
              ) : filteredWorkflows.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>No active workflows created yet.</td></tr>
              ) : filteredWorkflows.map(wf => (
                <tr key={wf.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: isDark ? "#E2E8F0" : "#0F172A" }}>{wf.workflowName}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{wf.description || "Automated background process"}</div>
                  </td>
                  <td>
                    <span className="meta-pill pill-blue">{wf.triggerType}</span>
                  </td>
                  <td>
                    <span className="meta-pill pill-green">{wf.steps?.length || 0} Steps</span>
                  </td>
                  <td>
                    <span className="active-badge" style={{ background: wf.status === "ACTIVE" ? "#16A064" : "#64748B", cursor: "pointer" }} onClick={() => toggleStatus(wf)}>
                      {wf.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>{wf.createdBy || "ADMIN"}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-primary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => handleManualExecute(wf)} disabled={executingId === wf.id}>
                        {executingId === wf.id ? "Running..." : "▶ Test"}
                      </button>
                      <button className="btn-danger-sm" onClick={() => handleDelete(wf.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
