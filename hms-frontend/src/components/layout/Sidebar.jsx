import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const NAV = [
  { key: "dashboard", icon: "📊", label: "Dashboard" },
  { key: "analytics", icon: "📐", label: "Analytics Studio" },
  { key: "workflow", icon: "⚡", label: "Automation Engine" },
  { key: "appointment", icon: "📅", label: "Appointments" },
  { key: "communication", icon: "💬", label: "Communication Hub" },
  { key: "hospitals", icon: "🏥", label: "Hospitals" },
  { key: "departments", icon: "🏢", label: "Departments" },
  { key: "staff", icon: "👥", label: "Staff" },
  { key: "doctors", icon: "🧑‍⚕️", label: "Doctors" },
  { key: "patients", icon: "🧑", label: "Patients" },
  { key: "wards", icon: "🛏️", label: "Wards & Beds" },
  { key: "ipd", icon: "🏨", label: "IPD Admissions" },
  { key: "opd", icon: "🩺", label: "OPD / Consultation" },
  { key: "prescription", icon: "💊", label: "Prescriptions" },
  { key: "lab", icon: "🔬", label: "Lab Tests" },
  { key: "pharmacy", icon: "🧪", label: "Pharmacy" },
  { key: "emergency", icon: "🚨", label: "Emergency" },
  { key: "ot", icon: "🔪", label: "OT Schedule" },
  { key: "nursing", icon: "💉", label: "Nursing Notes" },
  { key: "discharge", icon: "📋", label: "Discharge Summary" },
  { key: "billing", icon: "🧾", label: "Billing" },
  { key: "insurance", icon: "🛡️", label: "Insurance" },
  { key: "advancepay", icon: "💳", label: "Advance Payment" },
  { key: "relationship", icon: "🤝", label: "Relationships" },
  { key: "reports", icon: "📈", label: "Reports" },
  { key: "forms", icon: "📋", label: "Dynamic Forms" },
  { key: "admin", icon: "⚙️", label: "Admin" },
];

const SECTIONS = [
  { label: "Overview", keys: ["dashboard", "analytics", "workflow", "appointment", "communication"] },
  { label: "Hospital", keys: ["hospitals", "departments", "staff", "doctors"] },
  { label: "Patients", keys: ["patients", "wards", "ipd", "opd", "prescription", "lab", "pharmacy", "emergency", "ot", "nursing", "discharge"] },
  { label: "Finance", keys: ["billing", "insurance", "advancepay"] },
  { label: "More", keys: ["relationship", "reports", "forms", "admin"] },
];

const ROLE_MENUS = {
  ROLE_ADMIN: null,
  ROLE_HOSPITAL_ADMIN: null,

  ROLE_DOCTOR: [
    "dashboard",
    "appointment",
    "communication",
    "patients", "ipd", "opd", "prescription",
    "lab", "discharge", "ot", "nursing",
  ],

  ROLE_RECEPTIONIST: [
    "dashboard",
    "appointment",
    "communication",
    "patients", "ipd", "opd",
    "billing", "advancepay",
    "emergency",
  ],

  ROLE_BILLING_EXECUTIVE: [
    "dashboard",
    "communication",
    "patients",
    "billing", "insurance", "advancepay",
    "reports",
  ],

  ROLE_WARD_MANAGER: [
    "dashboard",
    "communication",
    "patients", "wards", "ipd",
    "nursing", "discharge",
  ],

  ROLE_FINANCE_ADMIN: [
    "dashboard",
    "communication",
    "billing", "insurance", "advancepay",
    "reports",
  ],
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

  /* ── Sidebar shell ── */
  .sidebar-root {
    width: 240px; flex-shrink: 0;
    background: var(--sb-bg);
    border-right: 1px solid var(--sb-border);
    display: flex; flex-direction: column;
    height: 100vh; position: fixed; left: 0; top: 0; z-index: 300;
    transition: width 0.25s ease, background 0.25s ease;
    font-family: 'DM Sans', sans-serif;
  }
  .sidebar-root.collapsed { width: 64px; }

  /* ── Brand ── */
  .sidebar-brand {
    height: 52px;
    padding: 0 16px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid var(--sb-border);
    flex-shrink: 0;
  }
  .sidebar-brand-icon {
    width: 38px; height: 38px; flex-shrink: 0;
    background: linear-gradient(135deg, #059669, #047857);
    border-radius: 10px; display: flex; align-items: center;
    justify-content: center; font-size: 20px;
    box-shadow: 0 4px 12px rgba(5,150,105,0.35);
  }
  .sidebar-brand-text { overflow: hidden; white-space: nowrap; }
  .sidebar-brand-name { font-size: 15px; font-weight: 800; color: var(--sb-text-primary); letter-spacing: -0.3px; }
  .sidebar-brand-sub  { font-size: 10px; color: var(--sb-text-muted); font-weight: 500; margin-top: 1px; }

  /* ── Toggle button ── */
  .sidebar-toggle {
    position: absolute; right: -13px; top: 14px;
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--sb-toggle-bg); border: 1.5px solid var(--sb-border);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: var(--sb-text-muted); transition: all 0.15s; z-index: 400;
  }
  .sidebar-toggle:hover { background: #059669; color: #fff; border-color: #059669; }

  /* ── Nav ── */
  .sidebar-nav {
    flex: 1; overflow-y: auto; padding: 10px 8px;
    scrollbar-width: thin; scrollbar-color: var(--sb-scrollbar) transparent;
  }
  .sidebar-nav::-webkit-scrollbar { width: 4px; }
  .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: var(--sb-scrollbar); border-radius: 4px; }

  .sidebar-section-label {
    font-size: 9.5px; font-weight: 700; color: var(--sb-text-muted); letter-spacing: 0.1em;
    text-transform: uppercase; padding: 10px 10px 4px;
    white-space: nowrap; overflow: hidden;
  }

  .sidebar-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 9px; cursor: pointer;
    transition: all 0.15s; margin-bottom: 1px;
    white-space: nowrap; overflow: hidden;
    border: 1px solid transparent;
  }
  .sidebar-item:hover { background: var(--sb-item-hover); }
  .sidebar-item.active {
    background: rgba(5,150,105,0.15);
    border-color: rgba(5,150,105,0.25);
  }
  .sidebar-item-icon { font-size: 17px; flex-shrink: 0; width: 22px; text-align: center; }
  .sidebar-item-label { font-size: 13px; font-weight: 600; color: var(--sb-text-secondary); transition: color 0.15s; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-item.active .sidebar-item-label { color: #34D399; }
  .sidebar-item:hover .sidebar-item-label { color: var(--sb-text-primary); }

  .sidebar-item-badge {
    margin-left: auto; padding: 2px 6px; border-radius: 20px;
    background: rgba(239,68,68,0.2); color: #F87171;
    font-size: 10px; font-weight: 700; flex-shrink: 0;
  }

  /* ── Footer ── */
  .sidebar-footer {
    padding: 12px 14px; border-top: 1px solid var(--sb-border);
    flex-shrink: 0;
  }
  .sidebar-footer-text {
    font-size: 10px; color: var(--sb-text-muted); text-align: center; font-weight: 500;
  }

  /* ── Tooltip ── */
  .tooltip-wrap { position: relative; }
  .tooltip-tip {
    position: absolute; left: 52px; top: 50%; transform: translateY(-50%);
    background: var(--sb-tooltip-bg); color: var(--sb-text-primary);
    padding: 5px 10px; border-radius: 7px; font-size: 12px; font-weight: 600;
    white-space: nowrap; pointer-events: none; opacity: 0;
    transition: opacity 0.15s; z-index: 999;
    border: 1px solid var(--sb-border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
  .tooltip-wrap:hover .tooltip-tip { opacity: 1; }

  /* ── CSS variables: dark ── */
  [data-theme="dark"] {
    --sb-bg:           #080F1E;
    --sb-border:       #111C30;
    --sb-toggle-bg:    #1E2D45;
    --sb-text-primary: #F8FAFC;
    --sb-text-secondary:#94A3B8;
    --sb-text-muted:   #334155;
    --sb-item-hover:   #111C30;
    --sb-scrollbar:    #1E2D45;
    --sb-btn-bg:       rgba(255,255,255,0.07);
    --sb-btn-hover:    rgba(255,255,255,0.13);
    --sb-dropdown-bg:  #0F1D33;
    --sb-tooltip-bg:   #1E2D45;
  }

  /* ── CSS variables: light ── */
  [data-theme="light"] {
    --sb-bg:           #FFFFFF;
    --sb-border:       #E2E8F0;
    --sb-toggle-bg:    #F1F5F9;
    --sb-text-primary: #0F172A;
    --sb-text-secondary:#475569;
    --sb-text-muted:   #94A3B8;
    --sb-item-hover:   #F1F5F9;
    --sb-scrollbar:    #CBD5E1;
    --sb-btn-bg:       rgba(0,0,0,0.05);
    --sb-btn-hover:    rgba(0,0,0,0.09);
    --sb-dropdown-bg:  #FFFFFF;
    --sb-tooltip-bg:   #1E293B;
  }
`;

// Role display helpers
const ROLE_LABELS = {
  ROLE_ADMIN: { label: "Super Admin", color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
  ROLE_HOSPITAL_ADMIN: { label: "Hospital Admin", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  ROLE_DOCTOR: { label: "Doctor", color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  ROLE_RECEPTIONIST: { label: "Receptionist", color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  ROLE_BILLING_EXECUTIVE: { label: "Billing", color: "#EC4899", bg: "rgba(236,72,153,0.15)" },
  ROLE_WARD_MANAGER: { label: "Ward Manager", color: "#14B8A6", bg: "rgba(20,184,166,0.15)" },
  ROLE_FINANCE_ADMIN: { label: "Finance Admin", color: "#10B981", bg: "rgba(16,185,129,0.15)" },
};

export default function Sidebar({ collapsed, setCollapsed, counts = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const activeKey = location.pathname.split("/hospital/")[1]?.split("/")[0] || "dashboard";
  const goTab = (key) => navigate(`/hospital/${key}`);

  // ── Determine allowed keys for this role ──────────────────────
  const userRole = user?.roles?.[0] || "";                    // e.g. "ROLE_DOCTOR"
  const allowed = ROLE_MENUS[userRole];                      // null = all, array = restricted
  const canSee = (key) => allowed === null || !allowed || allowed.includes(key);

  return (
    <>
      <style>{CSS}</style>
      <aside className={`sidebar-root${collapsed ? " collapsed" : ""}`}>

        {/* Toggle */}
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "▶" : "◀"}
        </button>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🏥</div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <div className="sidebar-brand-name">Vantoor</div>
              <div className="sidebar-brand-sub">Hospital MedCity</div>
            </div>
          )}
        </div>

        {/* Nav — filtered by role */}
        <nav className="sidebar-nav">
          {SECTIONS.map(sec => {
            const items = NAV.filter(n => sec.keys.includes(n.key) && canSee(n.key));
            if (items.length === 0) return null;
            return (
              <div key={sec.label}>
                {!collapsed && <div className="sidebar-section-label">{sec.label}</div>}
                {items.map(item => (
                  <div key={item.key} className="tooltip-wrap">
                    <div
                      className={`sidebar-item${activeKey === item.key ? " active" : ""}`}
                      onClick={() => goTab(item.key)}
                    >
                      <span className="sidebar-item-icon">{item.icon}</span>
                      {!collapsed && <span className="sidebar-item-label">{item.label}</span>}
                      {!collapsed && counts[item.key] && (
                        <span className="sidebar-item-badge">{counts[item.key]}</span>
                      )}
                    </div>
                    {collapsed && <span className="tooltip-tip">{item.label}</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-text">© 2026 codewithhimanshu</div>
          </div>
        )}

      </aside>
    </>
  );
}