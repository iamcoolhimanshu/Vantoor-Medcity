import React, { useState, useEffect } from "react";
import API from "../../../api/api";

export default function WorkflowExecutionLogs({ isDark }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const r = await API.get("/api/workflow/logs");
      setLogs(r.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div>
      <div className="toolbar">
        <div style={{ fontWeight: 800, fontSize: 14, color: isDark ? "#E2E8F0" : "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
          <span>📜</span> Execution Audit Trail & Logs ({logs.length})
        </div>
        <div style={{ marginLeft: "auto" }}>
          <button className="btn-outline" onClick={loadLogs}>🔄 Refresh Logs</button>
        </div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Executed At</th>
              <th>Workflow Name</th>
              <th>Entity ID</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Execution Summary</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Loading audit trail...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>No workflow execution logs recorded yet.</td></tr>
            ) : logs.map(l => (
              <tr key={l.id}>
                <td className="mono" style={{ fontSize: 11, color: "#64748B" }}>
                  {l.executedAt ? new Date(l.executedAt).toLocaleString("en-IN") : "Just now"}
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: isDark ? "#E2E8F0" : "#0F172A" }}>{l.workflowName || `Workflow #${l.workflowId}`}</div>
                </td>
                <td>
                  <span className="meta-pill pill-blue">{l.entityType || "ENTITY"}: #{l.entityId}</span>
                </td>
                <td>
                  <span className="meta-pill pill-green" style={{ background: l.status === "SUCCESS" ? (isDark ? "rgba(13,107,69,0.25)" : "#F0FDF4") : (isDark ? "rgba(220,38,38,0.2)" : "#FEE2E2"), color: l.status === "SUCCESS" ? (isDark ? "#4ADE80" : "#0D6B45") : "#DC2626" }}>
                    ● {l.status}
                  </span>
                </td>
                <td className="mono" style={{ fontSize: 12, fontWeight: 700, color: isDark ? "#E2E8F0" : "#0F172A" }}>
                  {l.executionTimeMs != null ? `${l.executionTimeMs} ms` : "0 ms"}
                </td>
                <td style={{ fontSize: 12, color: isDark ? "#CBD5E1" : "#475569", maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={l.message}>
                  {l.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
