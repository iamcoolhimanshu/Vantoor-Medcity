import React, { useState, useEffect } from "react";
import API from "../../api/api";
import { useAuth } from "../../hooks/useAuth";

const CSS = `
  .avail-board-root {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 550px;
    overflow-y: auto;
  }

  .avail-action-panel {
    background: rgba(17, 28, 48, 0.4);
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .avail-action-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .avail-dropdown-select {
    background: #0F1D33;
    border: 1px solid var(--sb-border, #111C30);
    color: #FFFFFF;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 13px;
    font-weight: 600;
    outline: none;
    cursor: pointer;
  }

  .avail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .avail-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }

  .avail-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .avail-card-status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-available { background: #10B981; box-shadow: 0 0 8px #10B981; }
  .status-busy { background: #F59E0B; box-shadow: 0 0 8px #F59E0B; }
  .status-on-leave { background: #64748B; box-shadow: 0 0 8px #64748B; }
  .status-emergency-duty { background: #EF4444; box-shadow: 0 0 8px #EF4444; }
  .status-offline { background: #334155; }

  .avail-card-name {
    font-size: 14px;
    font-weight: 700;
    color: #FFFFFF;
  }

  .avail-card-role {
    font-size: 11px;
    font-weight: 700;
    color: #34D399;
    text-transform: uppercase;
  }

  .avail-card-meta {
    font-size: 12px;
    color: var(--sb-text-secondary, #94A3B8);
  }

  .avail-card-status-pill {
    align-self: flex-start;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .pill-available { background: rgba(16, 185, 129, 0.15); color: #34D399; }
  .pill-busy { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }
  .pill-on-leave { background: rgba(100, 116, 139, 0.15); color: #94A3B8; }
  .pill-emergency-duty { background: rgba(239, 68, 68, 0.15); color: #F87171; }
  .pill-offline { background: rgba(51, 65, 85, 0.15); color: #64748B; }

  /* Light Theme Adjustments */
  [data-theme="light"] .avail-action-panel {
    background: #F8FAFC;
    border-color: #E2E8F0;
  }
  [data-theme="light"] .avail-dropdown-select {
    background: #FFFFFF;
    border-color: #E2E8F0;
    color: #0F172A;
  }
  [data-theme="light"] .avail-card {
    background: #FFFFFF;
    border-color: #E2E8F0;
  }
  [data-theme="light"] .avail-card-name {
    color: #0F172A;
  }
  [data-theme="light"] .avail-card-role {
    color: #047857;
  }
`;

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "🟢 Available" },
  { value: "BUSY", label: "🟡 Busy" },
  { value: "ON_LEAVE", label: "⚪ On Leave" },
  { value: "EMERGENCY_DUTY", label: "🔴 Emergency Duty" },
  { value: "OFFLINE", label: "⚫ Offline" }
];

export default function AvailabilityDashboard() {
  const { user } = useAuth();
  const [board, setBoard] = useState([]);
  const [myStatus, setMyStatus] = useState("AVAILABLE");

  const canUpdateStatus = user?.roles?.some(
    (role) => ["ROLE_DOCTOR", "ROLE_WARD_MANAGER", "ROLE_RECEPTIONIST"].includes(role)
  );

  const fetchBoard = async () => {
    try {
      const res = await API.get("/api/availability/all");
      setBoard(res.data);

      // Extract my current status if visible on board
      const myRecord = res.data.find(
        (member) => member.email === user.username || member.contact === user.username
      );
      if (myRecord) {
        setMyStatus(myRecord.status);
      }
    } catch (err) {
      console.error("Failed to fetch availability board:", err);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await API.post(`/api/availability/update?status=${newStatus}`);
      setMyStatus(newStatus);
      fetchBoard();
      alert(`Your status updated to: ${newStatus}`);
    } catch (err) {
      console.error("Failed to update availability status:", err);
      alert("Error updating status.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "AVAILABLE": return "available";
      case "BUSY": return "busy";
      case "ON_LEAVE": return "on-leave";
      case "EMERGENCY_DUTY": return "emergency-duty";
      default: return "offline";
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="avail-board-root">
        
        {/* Update status panel for doctors & nurses */}
        {canUpdateStatus && (
          <div className="avail-action-panel">
            <div className="avail-action-left">
              <span style={{ fontSize: "14px", fontWeight: "700" }}>Set Your Live Availability</span>
              <span style={{ fontSize: "12px", color: "var(--sb-text-secondary)" }}>
                Other staff members will see your status updated immediately.
              </span>
            </div>
            <select
              className="avail-dropdown-select"
              value={myStatus}
              onChange={handleStatusChange}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="avail-grid">
          {board.map((member, index) => {
            const statusClass = getStatusClass(member.status);
            return (
              <div key={index} className="avail-card">
                <div className="avail-card-header">
                  <span className="avail-card-role">{member.role}</span>
                  <span className={`avail-card-status-dot status-${statusClass}`} />
                </div>
                <div className="avail-card-name">{member.name}</div>
                <div className="avail-card-meta">
                  {member.specialization && <div>💼 {member.specialization}</div>}
                  {member.contact && <div style={{ marginTop: "4px" }}>📞 {member.contact}</div>}
                </div>
                <span className={`avail-card-status-pill pill-${statusClass}`}>
                  {member.status.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
