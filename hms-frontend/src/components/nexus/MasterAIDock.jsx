import React, { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import AIVoiceAssistant from "./AIVoiceAssistant";
import NexusAssistant from "./NexusAssistant";
import AIAppointmentChatbot from "./AIAppointmentChatbot";
import "./MasterAIDock.css";

export default function MasterAIDock() {
  const { isDark } = useTheme();
  const [activeAI, setActiveAI] = useState(null); // null | 'voice' | 'nexus' | 'care'

  const toggleAI = (type) => {
    setActiveAI((prev) => (prev === type ? null : type));
  };

  return (
    <>
      {/* AI Assistant Panels (Only 1 active at a time, hiding default triggers) */}
      <AIVoiceAssistant
        isOpen={activeAI === "voice"}
        onClose={() => setActiveAI(null)}
        hideTrigger={true}
      />
      <NexusAssistant
        isOpen={activeAI === "nexus"}
        onClose={() => setActiveAI(null)}
        hideTrigger={true}
      />
      <AIAppointmentChatbot
        isOpen={activeAI === "care"}
        onClose={() => setActiveAI(null)}
        hideTrigger={true}
      />

      {/* Unified Master Floating AI Dock */}
      <div
        className="master-ai-dock-wrap"
        data-dock-theme={isDark ? "dark" : "light"}
      >
        <div className="dock-pill-bar">
          <button
            className={`dock-btn jarvis ${activeAI === "voice" ? "active" : ""}`}
            onClick={() => toggleAI("voice")}
            title="JARVIS AI Voice Assistant"
          >
            <span className="dock-btn-icon">🎤</span>
            <span className="dock-btn-label">JARVIS VOICE</span>
          </button>

          <div className="dock-divider" />

          <button
            className={`dock-btn care ${activeAI === "care" ? "active" : ""}`}
            onClick={() => toggleAI("care")}
            title="Vantoor Care Desk Chatbot"
          >
            <span className="dock-btn-icon">💬</span>
            <span className="dock-btn-label">CARE DESK</span>
          </button>

          <div className="dock-divider" />

          <button
            className={`dock-btn nexus ${activeAI === "nexus" ? "active" : ""}`}
            onClick={() => toggleAI("nexus")}
            title="Nexus Clinical AI"
          >
            <span className="dock-btn-icon">✨</span>
            <span className="dock-btn-label">NEXUS AI</span>
          </button>
        </div>
      </div>
    </>
  );
}
