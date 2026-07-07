import React, { useState, useEffect } from "react";
import API from "../../api/api";

const CSS = `
  .notif-center-root {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 550px;
    overflow-y: auto;
  }

  .notif-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--sb-border, #111C30);
    padding-bottom: 12px;
  }

  .notif-btn-clear {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--sb-border, #111C30);
    color: #34D399;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .notif-btn-clear:hover {
    background: rgba(52, 211, 153, 0.1);
  }

  .notif-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .notif-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    transition: all 0.2s;
  }

  .notif-card.unread {
    background: rgba(5, 150, 105, 0.03);
    border-color: rgba(5, 150, 105, 0.15);
    border-left: 4px solid #34D399;
  }

  .notif-card-icon {
    font-size: 20px;
    flex-shrink: 0;
  }

  .notif-card-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .notif-card-title {
    font-size: 13.5px;
    font-weight: 700;
    color: #FFFFFF;
  }

  .notif-card-msg {
    font-size: 12.5px;
    color: var(--sb-text-secondary, #94A3B8);
  }

  .notif-card-date {
    font-size: 10px;
    color: var(--sb-text-muted, #475569);
    margin-top: 4px;
  }

  .notif-card-type-badge {
    align-self: flex-start;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .badge-appointment { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
  .badge-emergency { background: rgba(239, 68, 68, 0.15); color: #F87171; }
  .badge-inventory { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }
  .badge-duty { background: rgba(16, 185, 129, 0.15); color: #34D399; }
  .badge-meeting { background: rgba(139, 92, 246, 0.15); color: #A78BFA; }
  .badge-general { background: rgba(148, 163, 184, 0.15); color: #94A3B8; }

  .notif-btn-read {
    background: transparent;
    border: none;
    color: #059669;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
  }

  .notif-btn-read:hover {
    text-decoration: underline;
  }

  /* Light Theme Adjustments */
  [data-theme="light"] .notif-header {
    border-color: #E2E8F0;
  }
  [data-theme="light"] .notif-btn-clear {
    border-color: #CBD5E1;
    color: #047857;
  }
  [data-theme="light"] .notif-card {
    background: #FFFFFF;
    border-color: #E2E8F0;
  }
  [data-theme="light"] .notif-card.unread {
    background: rgba(5, 150, 105, 0.02);
  }
  [data-theme="light"] .notif-card-title {
    color: #0F172A;
  }
  [data-theme="light"] .notif-card-msg {
    color: #475569;
  }
`;

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/api/notifications/all");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.post(`/api/notifications/${id}/read`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.post("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
      alert("All notifications marked as read!");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "APPOINTMENT": return "📅";
      case "EMERGENCY": return "🚨";
      case "INVENTORY": return "🧪";
      case "DUTY_ASSIGNMENT": return "🧑‍⚕️";
      case "MEETING": return "👥";
      default: return "🔔";
    }
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case "APPOINTMENT": return "appointment";
      case "EMERGENCY": return "emergency";
      case "INVENTORY": return "inventory";
      case "DUTY_ASSIGNMENT": return "duty";
      case "MEETING": return "meeting";
      default: return "general";
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="notif-center-root">
        <div className="notif-header">
          <h2 style={{ fontSize: "16px", fontWeight: "700" }}>Live In-App Notifications</h2>
          <button className="notif-btn-clear" onClick={handleMarkAllAsRead}>
            ✓ Mark All As Read
          </button>
        </div>

        <div className="notif-list">
          {notifications.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--sb-text-muted)", padding: "48px 0" }}>
              🔔 No notifications found.
            </div>
          ) : (
            notifications.map((n) => {
              const icon = getNotifIcon(n.notificationType);
              const badgeClass = getBadgeClass(n.notificationType);
              const isUnread = n.status === "UNREAD";
              return (
                <div key={n.id} className={`notif-card${isUnread ? " unread" : ""}`}>
                  <span className="notif-card-icon">{icon}</span>
                  <div className="notif-card-main">
                    <span className="notif-card-title">{n.title}</span>
                    <span className="notif-card-msg">{n.message}</span>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                      <span className={`notif-card-type-badge badge-${badgeClass}`}>
                        {n.notificationType || "General"}
                      </span>
                      <span className="notif-card-date">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {isUnread && (
                    <button
                      className="notif-btn-read"
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
