import React, { useState, useEffect } from "react";
import API from "../../api/api";

const CSS = `
  .compose-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .compose-modal-container {
    width: 800px;
    height: 550px;
    background: #0F1D33;
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    display: flex;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }

  .compose-main-form {
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
  }

  .compose-sidebar {
    width: 280px;
    border-left: 1px solid var(--sb-border, #111C30);
    background: rgba(10, 22, 40, 0.2);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
  }

  .compose-title {
    font-size: 18px;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .compose-close-btn {
    background: transparent;
    border: none;
    color: #94A3B8;
    font-size: 18px;
    cursor: pointer;
  }

  .compose-close-btn:hover {
    color: #FFFFFF;
  }

  .compose-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .compose-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
  }

  .compose-select, .compose-input, .compose-textarea {
    background: rgba(17, 28, 48, 0.5);
    border: 1px solid var(--sb-border, #111C30);
    color: #FFFFFF;
    border-radius: 6px;
    padding: 10px;
    font-size: 13px;
    outline: none;
    font-family: inherit;
  }

  .compose-select:focus, .compose-input:focus, .compose-textarea:focus {
    border-color: #34D399;
  }

  .compose-textarea {
    flex: 1;
    min-height: 180px;
    resize: none;
  }

  .compose-btn-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }

  .compose-send-btn {
    background: linear-gradient(135deg, #059669, #10B981);
    color: #FFFFFF;
    border: none;
    border-radius: 6px;
    padding: 10px 24px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
    transition: all 0.2s;
  }

  .compose-send-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(5, 150, 105, 0.35);
  }

  .compose-attachment-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--sb-border, #111C30);
    color: #94A3B8;
    border-radius: 6px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  /* Attachment Pill */
  .attachment-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(5, 150, 105, 0.1);
    border: 1px solid rgba(5, 150, 105, 0.2);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    color: #34D399;
    margin-right: 8px;
    margin-top: 8px;
  }

  .attachment-pill-remove {
    cursor: pointer;
    color: #F87171;
  }

  /* AI Generator Sidebar */
  .ai-sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ai-prompt-input {
    background: rgba(17, 28, 48, 0.6);
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 6px;
    padding: 10px;
    color: #FFFFFF;
    font-size: 12px;
    min-height: 80px;
    resize: none;
    outline: none;
  }

  .ai-prompt-input:focus {
    border-color: #059669;
  }

  .ai-generate-btn {
    width: 100%;
    padding: 10px;
    background: linear-gradient(135deg, #4F46E5, #3B82F6);
    color: #FFFFFF;
    border: none;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    transition: all 0.2s;
  }

  .ai-generate-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
  }

  /* Light Theme Adjustments */
  [data-theme="light"] .compose-modal-container {
    background: #FFFFFF;
    border-color: #E2E8F0;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  }
  [data-theme="light"] .compose-title {
    color: #0F172A;
  }
  [data-theme="light"] .compose-sidebar {
    background: #F8FAFC;
    border-color: #E2E8F0;
  }
  [data-theme="light"] .compose-select,
  [data-theme="light"] .compose-input,
  [data-theme="light"] .compose-textarea,
  [data-theme="light"] .ai-prompt-input {
    background: #FFFFFF;
    border-color: #E2E8F0;
    color: #0F172A;
  }
  [data-theme="light"] .compose-attachment-btn {
    border-color: #CBD5E1;
    color: #475569;
  }
`;

const TEMPLATES = [
  {
    name: "Doctor Availability Request",
    subject: "Doctor Schedule Availability Inquiry",
    body: "Dear Doctor,\n\nCould you please report your availability/consultation hours for tomorrow so we can finalize the booking schedule?\n\nRegards,\nHospital Admin"
  },
  {
    name: "Appointment Reminder",
    subject: "Upcoming Medical Appointment Confirmation Alert",
    body: "Dear Patient,\n\nThis is a friendly reminder of your scheduled outpatient consultation at Vantoor MedCity. Please report 15 minutes before your time.\n\nRegards,\nHospital Desk"
  },
  {
    name: "Patient Follow-up Inquiry",
    subject: "Follow-up Health Status Check",
    body: "Dear Patient,\n\nWe would like to check on your post-treatment recovery status. Please feel free to reach out if you experience any side effects or need a refill.\n\nRegards,\nHospital Care Team"
  },
  {
    name: "Medicine Stock Request",
    subject: "Pharmacy Stocks & Inventory Request",
    body: "Dear Pharmacy Team,\n\nPlease provide a current report on low stock or critical out-of-stock medicines.\n\nRegards,\nHospital Admin"
  },
  {
    name: "Emergency Alert circular",
    subject: "⚠️ CRITICAL: Hospital Emergency Circular Alert",
    body: "ATTENTION ALL STAFF,\n\nAn emergency situation has been declared. All duty teams are requested to immediately report to the emergency wing / ICU ward.\n\nRegards,\nChief Operations"
  },
  {
    name: "Meeting Invitation",
    subject: "Scheduled Clinical Department Meeting",
    body: "Dear Team,\n\nYou are invited to attend the general clinical staff meeting today at 4:00 PM in Conference Hall A.\n\nRegards,\nClinical Director"
  }
];

export default function ComposeMail({ onClose, onSendSuccess, initialMsg = "", initialSubject = "", initialRecipientId = null }) {
  const [recipients, setRecipients] = useState({ DOCTORS: [], STAFF: [], PATIENTS: [] });
  const [receiverId, setReceiverId] = useState(initialRecipientId || "");
  const [recipientGroup, setRecipientGroup] = useState("");
  
  const [subject, setSubject] = useState(initialSubject || "");
  const [message, setMessage] = useState(initialMsg || "");
  const [priority, setPriority] = useState("LOW");
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Fetch recipients list
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const res = await API.get("/api/email/recipients");
        setRecipients(res.data);
      } catch (err) {
        console.error("Failed to load recipients:", err);
      }
    };
    fetchRecipients();
  }, []);

  // Handle template selection
  const handleSelectTemplate = (e) => {
    const name = e.target.value;
    const temp = TEMPLATES.find((t) => t.name === name);
    if (temp) {
      setSubject(temp.subject);
      setMessage(temp.body);
    }
  };

  // Handle attachment file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await API.post("/api/email/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedFiles((prev) => [...prev, { name: res.data.fileName, url: res.data.fileUrl }]);
    } catch (err) {
      console.error("Attachment upload failed:", err);
      alert("Attachment upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (url) => {
    setUploadedFiles((prev) => prev.filter((f) => f.url !== url));
  };

  // AI Generation trigger
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await API.post("/api/email/ai/generate", { prompt: aiPrompt });
      const parsed = JSON.parse(res.data.data);
      if (parsed.subject) setSubject(parsed.subject);
      if (parsed.message) setMessage(parsed.message);
    } catch (err) {
      console.error("AI Generation failed:", err);
      alert("AI Generation failed!");
    } finally {
      setAiGenerating(false);
    }
  };

  // Submit Send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!receiverId && !recipientGroup) {
      alert("Please select a recipient user or department group.");
      return;
    }
    if (!subject.trim()) {
      alert("Subject line cannot be blank.");
      return;
    }

    try {
      const payload = {
        receiverId: receiverId ? Number(receiverId) : null,
        recipientGroup: recipientGroup || null,
        subject,
        message,
        priority,
        fileUrls: uploadedFiles.map((f) => f.url),
      };
      await API.post("/api/email/send", payload);
      alert("Message sent successfully!");
      onSendSuccess();
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Error sending message.");
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="compose-modal-overlay" onClick={onClose}>
        <div className="compose-modal-container" onClick={(e) => e.stopPropagation()}>
          
          <form className="compose-main-form" onSubmit={handleSend}>
            <div className="compose-title">
              <span>Compose Email</span>
              <button type="button" className="compose-close-btn" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* Recipient Group / Department selector */}
            <div className="compose-field">
              <label className="compose-label">Broadcast Group (Optional)</label>
              <select
                className="compose-select"
                value={recipientGroup}
                onChange={(e) => {
                  setRecipientGroup(e.target.value);
                  if (e.target.value) setReceiverId(""); // Reset single recipient
                }}
              >
                <option value="">-- Select BroadCast Group --</option>
                <option value="ROLE_ADMIN">All Administrators</option>
                <option value="ROLE_DOCTOR">All Doctors</option>
                <option value="ROLE_WARD_MANAGER">All Nurses / Ward Managers</option>
                <option value="ROLE_RECEPTIONIST">All Receptionists</option>
                <option value="ROLE_FINANCE_ADMIN">All Finance Admins</option>
              </select>
            </div>

            {/* Single Recipient Selector */}
            <div className="compose-field">
              <label className="compose-label">Single Recipient</label>
              <select
                className="compose-select"
                value={receiverId}
                disabled={!!recipientGroup}
                onChange={(e) => setReceiverId(e.target.value)}
              >
                <option value="">-- Select Recipient User --</option>
                <optgroup label="Doctors">
                  {recipients.DOCTORS.map((d) => (
                    <option key={d.userId} value={d.userId}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Hospital Staff">
                  {recipients.STAFF.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.name} - {s.role} ({s.email})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Patients">
                  {recipients.PATIENTS.map((p) => (
                    <option key={p.userId} value={p.userId}>
                      {p.name} (Patient - {p.email})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Subject */}
            <div className="compose-field">
              <label className="compose-label">Subject</label>
              <input
                className="compose-input"
                type="text"
                placeholder="Enter subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Priority */}
            <div className="compose-field">
              <label className="compose-label">Priority</label>
              <select
                className="compose-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Message Body */}
            <div className="compose-field" style={{ flex: 1 }}>
              <label className="compose-label">Message Body</label>
              <textarea
                className="compose-textarea"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Uploaded Attachments */}
            {uploadedFiles.length > 0 && (
              <div>
                {uploadedFiles.map((f) => (
                  <span key={f.url} className="attachment-pill">
                    📎 {f.name}
                    <span className="attachment-pill-remove" onClick={() => handleRemoveAttachment(f.url)}>
                      ✕
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* Compose Actions */}
            <div className="compose-btn-row">
              <label className="compose-attachment-btn">
                <span>{uploading ? "Uploading..." : "📎 Attach File"}</span>
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>

              <button type="submit" className="compose-send-btn">
                🚀 Send Message
              </button>
            </div>
          </form>

          {/* Right Sidebar: Reusable Templates & AI Email Generator */}
          <div className="compose-sidebar">
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#FFFFFF", marginBottom: "8px" }}>
              Templates & AI
            </h3>

            {/* Template picker */}
            <div className="compose-field" style={{ marginBottom: "16px" }}>
              <label className="compose-label">Select Template</label>
              <select className="compose-select" onChange={handleSelectTemplate}>
                <option value="">-- Choose Template --</option>
                {TEMPLATES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Generator section */}
            <div className="ai-sidebar-section">
              <label className="compose-label">🤖 AI Email Generator</label>
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                Briefly describe what you want the email to say, and the AI will generate a professional email.
              </span>
              <textarea
                className="ai-prompt-input"
                placeholder="e.g. Ask doctors to confirm their shift timing tomorrow"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button
                type="button"
                className="ai-generate-btn"
                onClick={handleAIGenerate}
                disabled={aiGenerating}
              >
                {aiGenerating ? "Generating..." : "✨ Auto Generate Content"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
