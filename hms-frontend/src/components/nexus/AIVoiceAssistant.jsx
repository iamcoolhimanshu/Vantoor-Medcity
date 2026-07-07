import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import API from "../../api/api";
import "./AIVoiceAssistant.css";

export default function AIVoiceAssistant({ isOpen: externalIsOpen, onClose: externalOnClose, hideTrigger = false }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof externalIsOpen !== "undefined";
  const open = isControlled ? externalIsOpen : internalOpen;
  const setOpen = (val) => {
    if (isControlled) {
      if (!val && externalOnClose) externalOnClose();
    } else {
      setInternalOpen(val);
    }
  };

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState({
    reply: "Jarvis online and listening. Click the microphone or say 'Hey Jarvis' to start.",
    intent: "SYSTEM_READY",
    actionCompleted: true,
    suggestedActions: [
      "Show available doctors",
      "Show patient Himanshu",
      "Check Paracetamol stock",
      "Generate bill for Patient 102"
    ],
  });
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [language, setLanguage] = useState("en-US"); // 'en-US' or 'hi-IN'
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [continuousMode, setContinuousMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  // ── Initialize Speech Recognition & Wake Word Engine ──────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language;

    rec.onresult = (event) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);

      // Check Wake Word when continuous listening is enabled
      const lower = currentTranscript.toLowerCase();
      if (lower.includes("hey jarvis") || lower.includes("hey hospital")) {
        setOpen(true);
      }

      if (event.results[event.results.length - 1].isFinal) {
        const finalMsg = currentTranscript.trim();
        if (finalMsg) {
          handleProcessCommand(finalMsg);
        }
      }
    };

    rec.onerror = (err) => {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      if (continuousMode) {
        try { rec.start(); setIsListening(true); } catch (e) {}
      }
    };

    recognitionRef.current = rec;

    return () => {
      try { rec.stop(); } catch (e) {}
    };
  }, [language, continuousMode]);

  // Fetch voice command history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/api/voice/history");
      if (res.data) {
        setHistory(res.data);
      }
    } catch (e) {
      console.warn("Could not load voice command history:", e);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setOpen(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  const handleProcessCommand = async (text) => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await API.post("/api/voice/process", {
        message: text,
        language: language,
      });

      const data = res.data;
      setResponse(data);
      fetchHistory();

      // Speak response automatically
      if (autoSpeak && data.reply) {
        speakText(data.reply);
      }

      // Voice Controlled Navigation
      if (data.navigationTarget) {
        setTimeout(() => {
          navigate(data.navigationTarget);
        }, 1200);
      }
    } catch (err) {
      console.error("Voice processing error:", err);
      setResponse({
        reply: "Sorry, I could not connect to the voice assistant service.",
        intent: "ERROR",
        actionCompleted: false,
        suggestedActions: ["Try again"],
      });
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel(); // Stop ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="jarvis-floating-wrap" data-jarvis-theme={isDark ? "dark" : "light"}>
      {/* Floating Pill Button */}
      {!hideTrigger && (
        <button
          className={`jarvis-trigger-btn ${isListening ? "listening" : ""}`}
          onClick={() => setOpen(!open)}
          title="JARVIS AI Voice Assistant"
        >
          <div className="jarvis-mic-icon-wrap">🎤</div>
          <span>{isListening ? "LISTENING..." : "JARVIS VOICE"}</span>
        </button>
      )}

      {/* Main Glassmorphism Panel */}
      {open && (
        <div className={`jarvis-panel ${isListening ? "listening" : ""}`}>
          {/* Header */}
          <div className="jarvis-header">
            <div className="jarvis-brand">
              <div className="jarvis-core-reactor">⚡</div>
              <div>
                <div className="jarvis-title-text">JARVIS AI</div>
                <div className="jarvis-subtitle-text">
                  <span className="jarvis-live-dot"></span> Voice Roster Active
                </div>
              </div>
            </div>
            <div className="jarvis-header-actions">
              <button
                className={`jarvis-icon-btn ${language === "hi-IN" ? "active" : ""}`}
                onClick={() => setLanguage(language === "en-US" ? "hi-IN" : "en-US")}
                title="Toggle English / Hindi"
              >
                {language === "en-US" ? "EN" : "HI"}
              </button>
              <button
                className={`jarvis-icon-btn ${autoSpeak ? "active" : ""}`}
                onClick={() => setAutoSpeak(!autoSpeak)}
                title="Toggle Text to Speech"
              >
                🔊
              </button>
              <button
                className={`jarvis-icon-btn ${showHistory ? "active" : ""}`}
                onClick={() => setShowHistory(!showHistory)}
                title="Voice History"
              >
                📜
              </button>
              <button className="jarvis-icon-btn" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="jarvis-body">
            {showHistory ? (
              <div>
                <div className="jarvis-label">📜 Voice Command History</div>
                {history.length === 0 ? (
                  <div style={{ color: "var(--jrv-text-color)", opacity: 0.7, fontSize: 13 }}>No recorded interactions yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {history.map((h, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--jrv-box-bg)",
                          padding: 10,
                          borderRadius: 12,
                          border: "1px solid var(--jrv-box-border)",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "var(--jrv-subtitle-color)", fontWeight: 700 }}>{h.command}</div>
                        <div style={{ fontSize: 10, color: "var(--jrv-text-color)", opacity: 0.7, marginTop: 4 }}>
                          Intent: {h.intent} | Status: {h.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Equalizer Audio Wave */}
                <div className="jarvis-wave-container">
                  <div className="jarvis-wave-bar"></div>
                  <div className="jarvis-wave-bar"></div>
                  <div className="jarvis-wave-bar"></div>
                  <div className="jarvis-wave-bar"></div>
                  <div className="jarvis-wave-bar"></div>
                </div>

                {/* Speech Transcript */}
                <div className="jarvis-transcript-box">
                  <div className="jarvis-label">🎙️ Spoken Input</div>
                  <div>{transcript || (isListening ? "Listening to your voice..." : "Click microphone button below to speak.")}</div>
                </div>

                {/* AI Response Box */}
                <div className="jarvis-response-box">
                  <div className="jarvis-label">🤖 Jarvis Response</div>
                  {response.intent && (
                    <span className="jarvis-intent-tag">{response.intent}</span>
                  )}
                  <div>{loading ? "Processing speech with Groq LLM..." : response.reply}</div>

                  {response.reply && autoSpeak && (
                    <button
                      onClick={() => speakText(response.reply)}
                      style={{
                        marginTop: 10,
                        background: "rgba(2,132,199,0.12)",
                        border: "1px solid var(--jrv-btn-border)",
                        color: "var(--jrv-subtitle-color)",
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🔊 Replay Voice
                    </button>
                  )}
                </div>

                {/* Smart Suggestions */}
                {response.suggestedActions && response.suggestedActions.length > 0 && (
                  <div>
                    <div className="jarvis-label">💡 Smart Actions</div>
                    <div className="jarvis-suggestions-grid">
                      {response.suggestedActions.map((act, idx) => (
                        <button
                          key={idx}
                          className="jarvis-chip"
                          onClick={() => {
                            setTranscript(act);
                            handleProcessCommand(act);
                          }}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer controls */}
          <div className="jarvis-footer">
            <button
              className={`jarvis-main-mic-btn ${isListening ? "listening" : ""}`}
              onClick={toggleListening}
            >
              🎤 {isListening ? "STOP LISTENING" : "START SPEAKING"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
