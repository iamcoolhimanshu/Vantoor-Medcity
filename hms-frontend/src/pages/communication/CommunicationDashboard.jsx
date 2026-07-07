import React, { useState } from "react";
import EmailManagement from "./EmailManagement";
import AnnouncementCenter from "./AnnouncementCenter";
import AvailabilityDashboard from "./AvailabilityDashboard";
import NotificationCenter from "./NotificationCenter";

const CSS = `
  .comm-dash-container {
    padding: 24px;
    background: var(--hm-bg, #0A1628);
    min-height: calc(100vh - 52px);
    color: var(--sb-text-primary, #F8FAFC);
    font-family: 'DM Sans', sans-serif;
  }

  .comm-dash-header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--sb-border, #111C30);
    padding-bottom: 16px;
  }

  .comm-dash-title {
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #34D399, #059669);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .comm-dash-tabs {
    display: flex;
    gap: 8px;
    background: rgba(17, 28, 48, 0.4);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid var(--sb-border, #111C30);
  }

  .comm-dash-tab {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: var(--sb-text-secondary, #94A3B8);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .comm-dash-tab:hover {
    color: var(--sb-text-primary, #F8FAFC);
    background: rgba(255, 255, 255, 0.05);
  }

  .comm-dash-tab.active {
    background: #059669;
    color: #FFFFFF;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  }

  .comm-dash-content {
    background: rgba(15, 29, 51, 0.35);
    border-radius: 12px;
    border: 1px solid var(--sb-border, #111C30);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    overflow: hidden;
    min-height: 550px;
  }

  /* Theme settings adaptions */
  [data-theme="light"] .comm-dash-container {
    background: #F8FAFC;
    color: #0F172A;
  }
  [data-theme="light"] .comm-dash-header {
    border-color: #E2E8F0;
  }
  [data-theme="light"] .comm-dash-tabs {
    background: #F1F5F9;
    border-color: #E2E8F0;
  }
  [data-theme="light"] .comm-dash-tab {
    color: #475569;
  }
  [data-theme="light"] .comm-dash-tab:hover {
    color: #0F172A;
    background: rgba(0, 0, 0, 0.05);
  }
  [data-theme="light"] .comm-dash-content {
    background: #FFFFFF;
    border-color: #E2E8F0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }
`;

export default function CommunicationDashboard() {
  const [activeTab, setActiveTab] = useState("email");

  return (
    <>
      <style>{CSS}</style>
      <div className="comm-dash-container">
        <div className="comm-dash-header">
          <div>
            <h1 className="comm-dash-title">Communication Hub</h1>
            <p style={{ fontSize: "12px", color: "var(--sb-text-secondary)", marginTop: "4px" }}>
              Centralized messaging, announcements, live availability & AI assistant
            </p>
          </div>
          <div className="comm-dash-tabs">
            <button
              className={`comm-dash-tab${activeTab === "email" ? " active" : ""}`}
              onClick={() => setActiveTab("email")}
            >
              ✉️ Email Management
            </button>
            <button
              className={`comm-dash-tab${activeTab === "announcements" ? " active" : ""}`}
              onClick={() => setActiveTab("announcements")}
            >
              📢 Announcements
            </button>
            <button
              className={`comm-dash-tab${activeTab === "availability" ? " active" : ""}`}
              onClick={() => setActiveTab("availability")}
            >
              🟢 Live Availability
            </button>
            <button
              className={`comm-dash-tab${activeTab === "notifications" ? " active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              🔔 Notifications
            </button>
          </div>
        </div>

        <div className="comm-dash-content">
          {activeTab === "email" && <EmailManagement />}
          {activeTab === "announcements" && <AnnouncementCenter />}
          {activeTab === "availability" && <AvailabilityDashboard />}
          {activeTab === "notifications" && <NotificationCenter />}
        </div>
      </div>
    </>
  );
}
