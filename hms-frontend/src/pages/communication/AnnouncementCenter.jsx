import React, { useState, useEffect } from "react";
import API from "../../api/api";
import { useAuth } from "../../hooks/useAuth";

const CSS = `
  .ann-center-root {
    display: flex;
    height: 550px;
  }

  .ann-list-pane {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    border-right: 1px solid var(--sb-border, #111C30);
  }

  .ann-form-pane {
    width: 320px;
    padding: 24px;
    background: rgba(10, 22, 40, 0.15);
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .ann-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    transition: all 0.2s;
  }

  .ann-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    background: rgba(255, 255, 255, 0.05);
  }

  .ann-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 8px;
  }

  .ann-card-title {
    font-size: 14px;
    font-weight: 700;
    color: #34D399;
  }

  .ann-card-date {
    font-size: 10px;
    color: var(--sb-text-muted, #475569);
  }

  .ann-card-content {
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--sb-text-secondary, #94A3B8);
    white-space: pre-wrap;
  }

  .ann-card-dept {
    display: inline-block;
    background: rgba(59, 130, 246, 0.15);
    color: #60A5FA;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    margin-top: 8px;
    text-transform: uppercase;
  }

  /* Form Elements */
  .ann-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ann-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
  }

  .ann-input, .ann-textarea {
    background: rgba(17, 28, 48, 0.5);
    border: 1px solid var(--sb-border, #111C30);
    color: #FFFFFF;
    border-radius: 6px;
    padding: 10px;
    font-size: 13px;
    outline: none;
    font-family: inherit;
  }

  .ann-input:focus, .ann-textarea:focus {
    border-color: #34D399;
  }

  .ann-textarea {
    min-height: 120px;
    resize: none;
  }

  .ann-submit-btn {
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, #059669, #10B981);
    color: #FFFFFF;
    border: none;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
    transition: all 0.2s;
  }

  .ann-submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(5, 150, 105, 0.35);
  }

  /* AI Announcement Panel */
  .ai-ann-box {
    border: 1px solid rgba(59, 130, 246, 0.25);
    background: rgba(59, 130, 246, 0.05);
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ai-ann-title {
    font-size: 11px;
    font-weight: 700;
    color: #60A5FA;
    text-transform: uppercase;
  }

  .ai-ann-prompt {
    background: rgba(17, 28, 48, 0.6);
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 4px;
    padding: 8px;
    color: #FFFFFF;
    font-size: 12px;
    min-height: 50px;
    resize: none;
    outline: none;
  }

  .ai-ann-btn {
    padding: 8px;
    background: linear-gradient(135deg, #4F46E5, #3B82F6);
    color: #FFFFFF;
    border: none;
    border-radius: 4px;
    font-weight: 700;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s;
  }

  .ai-ann-btn:hover {
    background: #3B82F6;
  }

  /* Light Theme Adjustments */
  [data-theme="light"] .ann-form-pane {
    background: #F8FAFC;
    border-color: #E2E8F0;
  }
  [data-theme="light"] .ann-list-pane {
    border-color: #E2E8F0;
  }
  [data-theme="light"] .ann-card {
    background: #FFFFFF;
    border-color: #E2E8F0;
  }
  [data-theme="light"] .ann-card:hover {
    background: #F8FAFC;
  }
  [data-theme="light"] .ann-card-title {
    color: #047857;
  }
  [data-theme="light"] .ann-card-content {
    color: #475569;
  }
  [data-theme="light"] .ann-input,
  [data-theme="light"] .ann-textarea,
  [data-theme="light"] .ai-ann-prompt {
    background: #FFFFFF;
    border-color: #E2E8F0;
    color: #0F172A;
  }
`;

export default function AnnouncementCenter() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  
  // AI Generator States
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  const isAdmin = user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ROLE_HOSPITAL_ADMIN");

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/api/announcement/all");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await API.post("/api/announcement/create", {
        title,
        content,
        targetDepartment: targetDepartment || null,
      });
      alert("Announcement published successfully!");
      setTitle("");
      setContent("");
      setTargetDepartment("");
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to create announcement:", err);
      alert("Error publishing announcement.");
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await API.post("/api/announcement/ai/generate", { prompt: aiPrompt });
      const parsed = JSON.parse(res.data.data);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.content) setContent(parsed.content);
    } catch (err) {
      console.error("AI Circular generation failed:", err);
      alert("AI Circular generation failed!");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ann-center-root">
        {/* Left pane announcements timeline */}
        <div className="ann-list-pane">
          <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
            Circular Timeline & Updates
          </h2>
          {announcements.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--sb-text-muted)", padding: "48px 0" }}>
              📢 No announcements published yet.
            </div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="ann-card">
                <div className="ann-card-header">
                  <span className="ann-card-title">{a.title}</span>
                  <span className="ann-card-date">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="ann-card-content">{a.content}</div>
                {a.targetDepartment && (
                  <span className="ann-card-dept">{a.targetDepartment} Only</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right pane create announcement form (Admin only) */}
        {isAdmin ? (
          <form className="ann-form-pane" onSubmit={handleSubmit}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#FFFFFF" }}>
              Publish Announcement
            </h3>

            {/* AI Generator Box */}
            <div className="ai-ann-box">
              <span className="ai-ann-title">🤖 AI Circular Generator</span>
              <textarea
                className="ai-ann-prompt"
                placeholder="e.g. Circular about maintenance of water pipes tomorrow morning"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button
                type="button"
                className="ai-ann-btn"
                onClick={handleAIGenerate}
                disabled={aiGenerating}
              >
                {aiGenerating ? "Generating..." : "✨ Generate Circular"}
              </button>
            </div>

            <div className="ann-field">
              <label className="ann-label">Title</label>
              <input
                className="ann-input"
                type="text"
                placeholder="Enter title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="ann-field">
              <label className="ann-label">Target Department (Optional)</label>
              <input
                className="ann-input"
                type="text"
                placeholder="e.g. Cardiology, Nursing"
                value={targetDepartment}
                onChange={(e) => setTargetDepartment(e.target.value)}
              />
            </div>

            <div className="ann-field">
              <label className="ann-label">Content Body</label>
              <textarea
                className="ann-textarea"
                placeholder="Enter memo/announcement text..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="ann-submit-btn">
              📢 Publish Circular
            </button>
          </form>
        ) : (
          <div className="ann-form-pane" style={{ justifyContent: "center", alignItems: "center", color: "var(--sb-text-muted)", textAlign: "center" }}>
            <span>🔒</span>
            <span style={{ fontSize: "12px", marginTop: "8px" }}>
              Only Administrators can publish announcements.
            </span>
          </div>
        )}
      </div>
    </>
  );
}
