import React, { useState } from "react";
import API from "../../../api/api";

const NODE_TYPES = [
  { type: "START", label: "Start Event", icon: "🚀", bg: "#ECFDF5", border: "#10B981" },
  { type: "CONDITION", label: "IF Condition", icon: "🔀", bg: "#FEF3C7", border: "#F59E0B" },
  { type: "ACTION", label: "Action Task", icon: "⚡", bg: "#EFF6FF", border: "#3B82F6" },
  { type: "EMAIL", label: "Send Email", icon: "✉️", bg: "#F5F3FF", border: "#8B5CF6" },
  { type: "SMS", label: "Send SMS", icon: "📱", bg: "#FDF2F8", border: "#EC4899" },
  { type: "NOTIFICATION", label: "Notification", icon: "🔔", bg: "#F0FDF4", border: "#059669" },
  { type: "AI_ACTION", label: "AI Process", icon: "🤖", bg: "#F0FDFA", border: "#0D9488" },
  { type: "END", label: "End Event", icon: "🏁", bg: "#F1F5F9", border: "#64748B" },
];

const ACTION_OPTIONS = [
  { value: "ASSIGN_DOCTOR", label: "Assign Doctor" },
  { value: "ASSIGN_NURSE", label: "Assign Nurse" },
  { value: "SEND_NOTIFICATION", label: "Send Push Notification" },
  { value: "SEND_EMAIL", label: "Send Email Notification" },
  { value: "SEND_SMS", label: "Send SMS Ticket" },
  { value: "GENERATE_BILL", label: "Generate Initial Bill" },
  { value: "CREATE_TASK", label: "Create Staff Duty Task" },
  { value: "CREATE_PURCHASE_REQUEST", label: "Create Purchase Request" },
  { value: "GENERATE_DISCHARGE_SUMMARY", label: "Generate Discharge Summary" },
];

export default function WorkflowBuilder({ isDark, onWorkflowSaved }) {
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("PATIENT_ADMITTED");
  const [nodes, setNodes] = useState([
    { id: "node-1", stepOrder: 1, stepType: "START", actionType: null, title: "Trigger Event" },
    { id: "node-2", stepOrder: 2, stepType: "ACTION", actionType: "ASSIGN_DOCTOR", title: "Assign Doctor" },
    { id: "node-3", stepOrder: 3, stepType: "NOTIFICATION", actionType: "SEND_NOTIFICATION", title: "Notify Duty Nurse" },
    { id: "node-4", stepOrder: 4, stepType: "ACTION", actionType: "GENERATE_BILL", title: "Generate Initial Bill" },
    { id: "node-5", stepOrder: 5, stepType: "END", actionType: null, title: "Pipeline Completed" }
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const applyTemplate = (type) => {
    if (type === "ADMISSION") {
      setWorkflowName("IPD Patient Admission Fast-Track");
      setTriggerType("PATIENT_ADMITTED");
      setDescription("Automatically allocates on-duty doctor, alerts nurse station, and sets up initial bed billing.");
      setNodes([
        { id: "n1", stepOrder: 1, stepType: "START", actionType: null, title: "Patient Admitted Event" },
        { id: "n2", stepOrder: 2, stepType: "ACTION", actionType: "ASSIGN_DOCTOR", title: "Assign Attending Doctor" },
        { id: "n3", stepOrder: 3, stepType: "NOTIFICATION", actionType: "SEND_NOTIFICATION", title: "Notify Nurse Station" },
        { id: "n4", stepOrder: 4, stepType: "ACTION", actionType: "GENERATE_BILL", title: "Generate Admission Deposit" },
        { id: "n5", stepOrder: 5, stepType: "END", actionType: null, title: "Admission Complete" }
      ]);
    } else if (type === "STOCK") {
      setWorkflowName("Pharmacy Low Stock Reorder Pipeline");
      setTriggerType("LOW_STOCK");
      setDescription("Triggers automated purchase requisition and alerts pharmacy manager when inventory breaches safety levels.");
      setNodes([
        { id: "n1", stepOrder: 1, stepType: "START", actionType: null, title: "Safety Level Breach Event" },
        { id: "n2", stepOrder: 2, stepType: "NOTIFICATION", actionType: "SEND_NOTIFICATION", title: "Alert Pharmacy Manager" },
        { id: "n3", stepOrder: 3, stepType: "ACTION", actionType: "CREATE_PURCHASE_REQUEST", title: "Issue Requisition Order" },
        { id: "n4", stepOrder: 4, stepType: "EMAIL", actionType: "SEND_EMAIL", title: "Email Approved Suppliers" },
        { id: "n5", stepOrder: 5, stepType: "END", actionType: null, title: "Reorder Logged" }
      ]);
    }
  };

  const addNode = (nodeTypeObj) => {
    const newId = `node-${Date.now()}`;
    const newStep = {
      id: newId,
      stepOrder: nodes.length + 1,
      stepType: nodeTypeObj.type,
      actionType: nodeTypeObj.type === "ACTION" ? "ASSIGN_DOCTOR" : nodeTypeObj.type === "NOTIFICATION" ? "SEND_NOTIFICATION" : null,
      title: nodeTypeObj.label
    };
    const endIdx = nodes.findIndex(n => n.stepType === "END");
    if (endIdx !== -1) {
      const updated = [...nodes];
      updated.splice(endIdx, 0, newStep);
      updated.forEach((n, i) => n.stepOrder = i + 1);
      setNodes(updated);
    } else {
      setNodes([...nodes, newStep]);
    }
  };

  const removeNode = (id) => {
    const filtered = nodes.filter(n => n.id !== id);
    filtered.forEach((n, i) => n.stepOrder = i + 1);
    setNodes(filtered);
  };

  const updateNodeAction = (id, actionType) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, actionType } : n));
  };

  const handleSave = async () => {
    if (!workflowName.trim()) {
      setMsg("Please provide a workflow name.");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        workflowName,
        description,
        triggerType,
        status: "ACTIVE",
        steps: nodes.map(n => ({
          stepOrder: n.stepOrder,
          stepType: n.stepType,
          actionType: n.actionType,
          conditionJson: null,
          actionJson: null
        }))
      };
      await API.post("/api/workflow/create", payload);
      setMsg("Workflow created and activated successfully!");
      if (onWorkflowSaved) onWorkflowSaved();
    } catch (e) {
      console.error(e);
      setMsg("Failed to save workflow.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Top Controls Toolbar */}
      <div className="toolbar" style={{ borderBottom: "none", marginBottom: 20, padding: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: isDark ? "#E2E8F0" : "#0F172A" }}>⚡ Visual Drag & Drop Builder</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Design hospital event pipelines visually without code</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" onClick={() => applyTemplate("ADMISSION")} style={{ fontSize: 12 }}>⚡ Admission Template</button>
          <button className="btn-outline" onClick={() => applyTemplate("STOCK")} style={{ fontSize: 12 }}>🧪 Stock Template</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "💾 Save & Activate Workflow"}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: msg.includes("successfully") ? "#F0FDF4" : "#FEE2E2", color: msg.includes("successfully") ? "#0D6B45" : "#DC2626", fontWeight: 700, fontSize: 13, marginBottom: 16 }}>
          {msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label">Workflow Title *</label>
          <input className="form-input" style={{ background: isDark ? "#0F172A" : "#fff", border: `1.5px solid ${isDark ? "#334155" : "#E2E8F0"}`, borderRadius: 9, padding: "9px 12px", color: isDark ? "#E2E8F0" : "#0F172A" }} placeholder="e.g. Emergency Admission Pipeline" value={workflowName} onChange={e => setWorkflowName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Trigger Event *</label>
          <select className="filter-select" style={{ width: "100%" }} value={triggerType} onChange={e => setTriggerType(e.target.value)}>
            <option value="PATIENT_ADMITTED">PATIENT_ADMITTED (IPD Admission)</option>
            <option value="APPOINTMENT_CONFIRMED">APPOINTMENT_CONFIRMED (Booking)</option>
            <option value="LOW_STOCK">LOW_STOCK (Pharmacy Threshold)</option>
            <option value="PATIENT_DISCHARGED">PATIENT_DISCHARGED (Discharge)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" style={{ background: isDark ? "#0F172A" : "#fff", border: `1.5px solid ${isDark ? "#334155" : "#E2E8F0"}`, borderRadius: 9, padding: "9px 12px", color: isDark ? "#E2E8F0" : "#0F172A" }} placeholder="Brief rationale summary" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 20 }}>
        {/* Sidebar Toolbox */}
        <div style={{ background: isDark ? "#0F172A" : "#F8FAFC", padding: 16, borderRadius: 12, border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}` }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Toolbox Elements</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {NODE_TYPES.map(nt => (
              <div
                key={nt.type}
                onClick={() => addNode(nt)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8,
                  background: nt.bg, border: `1.5px solid ${nt.border}`, cursor: "pointer", transition: "all 0.15s ease"
                }}
              >
                <span style={{ fontSize: 16 }}>{nt.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1E293B" }}>{nt.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 14, color: nt.border, fontWeight: 800 }}>+</span>
              </div>
            ))}
          </div>
        </div>

        {/* High Tech Visual Canvas */}
        <div style={{ background: isDark ? "#0F172A" : "#F8FAFC", padding: 24, borderRadius: 12, border: `1px dashed ${isDark ? "#334155" : "#CBD5E1"}`, display: "flex", flexDirection: "column", alignItems: "center", minHeight: 460 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
            FLOW CANVAS · {nodes.length} SEQUENCED NODES
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%", maxWidth: 480 }}>
            {nodes.map((node, idx) => {
              const nt = NODE_TYPES.find(t => t.type === node.stepType) || NODE_TYPES[2];
              return (
                <React.Fragment key={node.id}>
                  <div
                    style={{
                      width: "100%", padding: "14px 18px", borderRadius: 12, background: isDark ? "#1E293B" : "#FFFFFF",
                      border: `2px solid ${nt.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: nt.bg, display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 18, border: `1px solid ${nt.border}`, flexShrink: 0 }}>
                        {nt.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: nt.border, textTransform: "uppercase" }}>STEP {node.stepOrder} · {node.stepType}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#E2E8F0" : "#0F172A" }}>{node.title}</div>
                        
                        {(node.stepType === "ACTION" || node.stepType === "NOTIFICATION" || node.stepType === "EMAIL" || node.stepType === "SMS") && (
                          <div style={{ marginTop: 4 }}>
                            <select
                              className="filter-select"
                              style={{ padding: "3px 24px 3px 8px", fontSize: 11, height: "auto", minWidth: 0 }}
                              value={node.actionType || ""}
                              onChange={e => updateNodeAction(node.id, e.target.value)}
                            >
                              {ACTION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {node.stepType !== "START" && node.stepType !== "END" && (
                      <button
                        onClick={() => removeNode(node.id)}
                        style={{ background: "none", border: "none", color: "#EF4444", fontSize: 15, cursor: "pointer", padding: 4 }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  {idx < nodes.length - 1 && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#16A064" }}>
                      <div style={{ width: 2, height: 14, background: "#16A064" }} />
                      <div style={{ fontSize: 11, fontWeight: 800 }}>▼</div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
