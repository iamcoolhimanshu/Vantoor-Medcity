import React, { useState, useEffect, useCallback } from "react";
import API from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import ComposeMail from "./ComposeMail";

const CSS = `
  .email-hub-root {
    display: flex;
    height: 600px;
    background: transparent;
  }

  /* ── Left Sidebar Pane ── */
  .email-left-pane {
    width: 200px;
    border-right: 1px solid var(--sb-border, #111C30);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: rgba(10, 22, 40, 0.15);
    flex-shrink: 0;
  }

  .email-compose-btn {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #059669, #10B981);
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
    transition: all 0.2s;
    margin-bottom: 12px;
  }

  .email-compose-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
  }

  .email-folder-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--sb-text-secondary, #94A3B8);
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .email-folder-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--sb-text-primary, #F8FAFC);
  }

  .email-folder-item.active {
    background: rgba(5, 150, 105, 0.15);
    color: #34D399;
    border-color: rgba(5, 150, 105, 0.2);
  }

  .email-folder-badge {
    background: #EF4444;
    color: #FFFFFF;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 20px;
  }

  /* ── Center List Pane ── */
  .email-center-pane {
    flex: 1;
    border-right: 1px solid var(--sb-border, #111C30);
    display: flex;
    flex-direction: column;
    background: transparent;
    overflow: hidden;
  }

  .email-search-bar {
    padding: 16px;
    border-bottom: 1px solid var(--sb-border, #111C30);
    display: flex;
    gap: 8px;
  }

  .email-search-input {
    flex: 1;
    background: rgba(17, 28, 48, 0.5);
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 6px;
    padding: 8px 12px;
    color: var(--sb-text-primary, #F8FAFC);
    outline: none;
    font-size: 13px;
  }

  .email-search-input:focus {
    border-color: #34D399;
  }

  .email-list {
    flex: 1;
    overflow-y: auto;
  }

  .email-list-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--sb-text-muted, #475569);
    gap: 12px;
    font-size: 14px;
  }

  .email-item {
    display: flex;
    flex-direction: column;
    padding: 12px 16px;
    border-bottom: 1px solid var(--sb-border, #111C30);
    cursor: pointer;
    transition: all 0.15s;
    background: rgba(10, 22, 40, 0.05);
    position: relative;
  }

  .email-item:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .email-item.active {
    background: rgba(5, 150, 105, 0.05);
    border-left: 3px solid #34D399;
  }

  .email-item.unread {
    font-weight: 700;
    background: rgba(10, 22, 40, 0.2);
  }

  .email-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .email-item-sender {
    font-size: 13px;
    color: var(--sb-text-primary, #F8FAFC);
  }

  .email-item-date {
    font-size: 11px;
    color: var(--sb-text-muted, #475569);
  }

  .email-item-subject {
    font-size: 12px;
    color: var(--sb-text-secondary, #94A3B8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 6px;
  }

  .email-item-badges {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .priority-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
  }
  .priority-low { background: rgba(148, 163, 184, 0.15); color: #94A3B8; }
  .priority-medium { background: rgba(59, 130, 246, 0.15); color: #60A5FA; }
  .priority-high { background: rgba(245, 158, 11, 0.15); color: #FBBF24; }
  .priority-critical { background: rgba(239, 68, 68, 0.15); color: #F87171; animation: blink 1.5s infinite; }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .category-badge {
    background: rgba(16, 185, 129, 0.15);
    color: #34D399;
    font-size: 9px;
    font-weight: 600;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
  }

  /* ── Right Details Pane ── */
  .email-right-pane {
    width: 450px;
    display: flex;
    flex-direction: column;
    background: rgba(10, 22, 40, 0.1);
    overflow-y: auto;
    flex-shrink: 0;
  }

  .email-details-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--sb-text-muted, #475569);
    font-size: 13px;
    padding: 24px;
    text-align: center;
  }

  .email-details-header {
    padding: 20px;
    border-bottom: 1px solid var(--sb-border, #111C30);
  }

  .email-details-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .email-action-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--sb-border, #111C30);
    color: var(--sb-text-secondary, #94A3B8);
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .email-action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--sb-text-primary, #F8FAFC);
  }

  .email-details-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--sb-text-primary, #F8FAFC);
    margin-bottom: 8px;
  }

  .email-details-meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--sb-text-secondary, #94A3B8);
  }

  .email-details-body {
    padding: 20px;
    flex: 1;
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--sb-text-secondary, #94A3B8);
    white-space: pre-wrap;
    border-bottom: 1px solid var(--sb-border, #111C30);
  }

  .email-details-attachments {
    padding: 16px 20px;
    border-bottom: 1px solid var(--sb-border, #111C30);
  }

  .email-attachment-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--sb-border, #111C30);
    padding: 6px 12px;
    border-radius: 4px;
    color: #34D399;
    text-decoration: none;
    font-size: 12px;
    margin-right: 8px;
    margin-top: 8px;
    transition: all 0.2s;
  }

  .email-attachment-link:hover {
    background: rgba(52, 211, 153, 0.1);
  }

  /* ── Interactive Card (Accept/Reject Doctor Availability) ── */
  .doctor-interactive-card {
    margin: 20px;
    padding: 16px;
    border-radius: 8px;
    background: rgba(5, 150, 105, 0.08);
    border: 1px solid rgba(5, 150, 105, 0.2);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .doctor-card-title {
    font-size: 13px;
    font-weight: 700;
    color: #34D399;
  }

  .doctor-card-btns {
    display: flex;
    gap: 12px;
  }

  .doctor-btn-accept {
    flex: 1;
    padding: 8px;
    border: none;
    background: #059669;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 700;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .doctor-btn-accept:hover {
    background: #047857;
  }

  .doctor-btn-reject {
    flex: 1;
    padding: 8px;
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #F87171;
    font-size: 12px;
    font-weight: 700;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .doctor-btn-reject:hover {
    background: rgba(239, 68, 68, 0.25);
  }

  /* ── AI Smart Replies ── */
  .smart-reply-pane {
    padding: 16px 20px;
    background: rgba(17, 28, 48, 0.2);
  }

  .smart-reply-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--sb-text-muted, #475569);
    text-transform: uppercase;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .smart-reply-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .smart-reply-pill {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--sb-border, #111C30);
    border-radius: 6px;
    color: var(--sb-text-secondary, #94A3B8);
    font-size: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
  }

  .smart-reply-pill:hover {
    background: rgba(5, 150, 105, 0.08);
    border-color: rgba(5, 150, 105, 0.25);
    color: #34D399;
  }

  /* Light Theme Adjustments */
  [data-theme="light"] .email-left-pane {
    background: #F1F5F9;
    border-color: #E2E8F0;
  }
  [data-theme="light"] .email-folder-item {
    color: #475569;
  }
  [data-theme="light"] .email-folder-item:hover {
    background: rgba(0, 0, 0, 0.03);
    color: #0F172A;
  }
  [data-theme="light"] .email-folder-item.active {
    background: rgba(5, 150, 105, 0.08);
    color: #047857;
  }
  [data-theme="light"] .email-center-pane,
  [data-theme="light"] .email-right-pane {
    border-color: #E2E8F0;
    background: #FFFFFF;
  }
  [data-theme="light"] .email-search-bar,
  [data-theme="light"] .email-item,
  [data-theme="light"] .email-details-header,
  [data-theme="light"] .email-details-body,
  [data-theme="light"] .email-details-attachments {
    border-color: #E2E8F0;
  }
  [data-theme="light"] .email-search-input {
    background: #F8FAFC;
    border-color: #CBD5E1;
    color: #0F172A;
  }
  [data-theme="light"] .email-item {
    background: #FFFFFF;
  }
  [data-theme="light"] .email-item:hover {
    background: #F8FAFC;
  }
  [data-theme="light"] .email-item.active {
    background: rgba(5, 150, 105, 0.04);
  }
  [data-theme="light"] .email-item.unread {
    background: #F1F5F9;
  }
  [data-theme="light"] .email-item-sender {
    color: #0F172A;
  }
  [data-theme="light"] .email-item-subject {
    color: #475569;
  }
  [data-theme="light"] .email-details-title {
    color: #0F172A;
  }
  [data-theme="light"] .email-details-body {
    color: #334155;
  }
  [data-theme="light"] .smart-reply-pane {
    background: #F8FAFC;
  }
  [data-theme="light"] .smart-reply-pill {
    background: #FFFFFF;
    border-color: #E2E8F0;
    color: #475569;
  }
  [data-theme="light"] .smart-reply-pill:hover {
    background: rgba(5, 150, 105, 0.05);
    color: #047857;
  }
`;

export default function EmailManagement() {
  const { user } = useAuth();
  const [folder, setFolder] = useState("inbox");
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // AI Smart Reply State
  const [smartReplies, setSmartReplies] = useState([]);
  const [smartRepliesLoading, setSmartRepliesLoading] = useState(false);

  // 1. Fetch unread counts
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await API.get("/api/email/unread");
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // 2. Fetch emails for active folder
  const fetchEmails = useCallback(async () => {
    try {
      const res = await API.get(`/api/email/${folder}`);
      setEmails(res.data);
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    }
  }, [folder, fetchUnreadCount]);

  useEffect(() => {
    fetchEmails();
    setSelectedEmail(null);
    setSmartReplies([]);
  }, [folder, fetchEmails]);

  // 3. Mark email as read
  const handleMarkAsRead = async (emailId) => {
    try {
      await API.post(`/api/email/mark-read?emailId=${emailId}`);
      fetchUnreadCount();
      // Update local status
      setEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, isRead: true } : e))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // 4. Fetch email details
  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    setSmartReplies([]);
    if (!email.isRead) {
      handleMarkAsRead(email.id);
    }

    // Fetch attachments
    try {
      const attRes = await API.get(`/api/email/${email.id}/attachments`);
      setAttachments(attRes.data);
    } catch (err) {
      console.error("Failed to load attachments:", err);
    }

    // Fetch AI smart replies
    setSmartRepliesLoading(true);
    try {
      const replyRes = await API.post("/api/email/ai/reply", {
        emailContent: email.message,
      });
      const parsed = JSON.parse(replyRes.data.data);
      setSmartReplies(parsed.replies || []);
    } catch (err) {
      console.error("Failed to load AI Smart Replies:", err);
    } finally {
      setSmartRepliesLoading(false);
    }
  };

  // Star action
  const handleStar = async (emailId) => {
    try {
      await API.post(`/api/email/star?emailId=${emailId}`);
      fetchEmails();
      if (selectedEmail && selectedEmail.id === emailId) {
        setSelectedEmail((prev) => {
          const isSender = prev.senderId === user.userId;
          return {
            ...prev,
            isStarredBySender: isSender ? !prev.isStarredBySender : prev.isStarredBySender,
            isStarredByReceiver: !isSender ? !prev.isStarredByReceiver : prev.isStarredByReceiver,
          };
        });
      }
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };

  // Archive action
  const handleArchive = async (emailId) => {
    try {
      await API.post(`/api/email/archive?emailId=${emailId}`);
      fetchEmails();
      setSelectedEmail(null);
    } catch (err) {
      console.error("Failed to toggle archive:", err);
    }
  };

  // Delete action
  const handleDelete = async (emailId) => {
    try {
      await API.post(`/api/email/delete?emailId=${emailId}`);
      fetchEmails();
      setSelectedEmail(null);
    } catch (err) {
      console.error("Failed to delete email:", err);
    }
  };

  // Respond Doctor schedule check Accept/Reject
  const handleDoctorResponse = async (emailId, accept) => {
    try {
      await API.post(`/api/email/respond-availability?emailId=${emailId}&accept=${accept}`);
      alert(accept ? "Availability ACCEPTED. Patient has been notified." : "Availability REJECTED/BUSY. Status logged.");
      fetchEmails();
      setSelectedEmail(null);
    } catch (err) {
      console.error("Failed to submit doctor response:", err);
    }
  };

  // AI Smart reply insertion to composer
  const [initialComposeMsg, setInitialComposeMsg] = useState("");
  const [initialComposeSubject, setInitialComposeSubject] = useState("");
  const [composeRecipientId, setComposeRecipientId] = useState(null);

  const handleUseSmartReply = (replyText) => {
    if (selectedEmail) {
      setInitialComposeSubject("RE: " + selectedEmail.subject);
      setComposeRecipientId(selectedEmail.senderId);
      setInitialComposeMsg(`\n\nOn ${new Date(selectedEmail.createdAt).toLocaleString()}, in response to:\n> ${selectedEmail.message.split("\n").join("\n> ")}\n\nI say: ${replyText}`);
      setShowCompose(true);
    }
  };

  // Filter list by search query
  const filteredEmails = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="email-hub-root">
        {/* Left pane Folder list */}
        <div className="email-left-pane">
          <button className="email-compose-btn" onClick={() => {
            setInitialComposeMsg("");
            setInitialComposeSubject("");
            setComposeRecipientId(null);
            setShowCompose(true);
          }}>
            ➕ Compose Mail
          </button>
          
          <div
            className={`email-folder-item${folder === "inbox" ? " active" : ""}`}
            onClick={() => setFolder("inbox")}
          >
            <span>📥 Inbox</span>
            {unreadCount > 0 && <span className="email-folder-badge">{unreadCount}</span>}
          </div>

          <div
            className={`email-folder-item${folder === "sent" ? " active" : ""}`}
            onClick={() => setFolder("sent")}
          >
            <span>📤 Sent Mail</span>
          </div>

          <div
            className={`email-folder-item${folder === "starred" ? " active" : ""}`}
            onClick={() => setFolder("starred")}
          >
            <span>⭐ Starred</span>
          </div>

          <div
            className={`email-folder-item${folder === "archive" ? " active" : ""}`}
            onClick={() => setFolder("archive")}
          >
            <span>🗄️ Archive</span>
          </div>

          <div
            className={`email-folder-item${folder === "trash" ? " active" : ""}`}
            onClick={() => setFolder("trash")}
          >
            <span>🗑️ Trash</span>
          </div>
        </div>

        {/* Center pane Mail list */}
        <div className="email-center-pane">
          <div className="email-search-bar">
            <input
              className="email-search-input"
              type="text"
              placeholder="Search mail subject or body..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="email-list">
            {filteredEmails.length === 0 ? (
              <div className="email-list-empty">
                <span>📭</span>
                <span>No messages found in this folder</span>
              </div>
            ) : (
              filteredEmails.map((e) => {
                const isStarred = e.senderId === user.userId ? e.isStarredBySender : e.isStarredByReceiver;
                return (
                  <div
                    key={e.id}
                    className={`email-item${selectedEmail?.id === e.id ? " active" : ""}${!e.isRead && e.senderId !== user.userId ? " unread" : ""}`}
                    onClick={() => handleSelectEmail(e)}
                  >
                    <div className="email-item-header">
                      <span className="email-item-sender">
                        {e.senderId === user.userId ? "To: Me" : `User ID: ${e.senderId}`}
                      </span>
                      <span className="email-item-date">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="email-item-subject">
                      {e.subject || "(No Subject)"}
                    </div>
                    <div className="email-item-header">
                      <div className="email-item-badges">
                        <span className={`priority-badge priority-${e.priority.toLowerCase()}`}>
                          {e.priority}
                        </span>
                        {e.category && (
                          <span className="category-badge">
                            {e.category}
                          </span>
                        )}
                      </div>
                      <span
                        style={{ cursor: "pointer", fontSize: "14px" }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleStar(e.id);
                        }}
                      >
                        {isStarred ? "⭐" : "☆"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane Read view */}
        <div className="email-right-pane">
          {selectedEmail ? (
            <>
              <div className="email-details-header">
                <div className="email-details-actions">
                  <button className="email-action-btn" onClick={() => handleStar(selectedEmail.id)}>
                    ⭐ Star
                  </button>
                  <button className="email-action-btn" onClick={() => handleArchive(selectedEmail.id)}>
                    🗄️ Archive
                  </button>
                  <button className="email-action-btn" onClick={() => handleDelete(selectedEmail.id)}>
                    🗑️ Delete
                  </button>
                </div>

                <h2 className="email-details-title">
                  {selectedEmail.subject || "(No Subject)"}
                </h2>
                <div className="email-details-meta">
                  <span>Sender ID: {selectedEmail.senderId}</span>
                  <span>{new Date(selectedEmail.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Interactive Card: Doctor availability request */}
              {(selectedEmail.category === "APPOINTMENT" || selectedEmail.message.toLowerCase().includes("doctor available")) &&
                user?.roles?.includes("ROLE_DOCTOR") &&
                !selectedEmail.message.includes("--- DOCTOR RESPONSE") && (
                  <div className="doctor-interactive-card">
                    <span className="doctor-card-title">📅 Interactive Availability Request</span>
                    <span style={{ fontSize: "12px", color: "var(--sb-text-secondary)" }}>
                      Admin wants to know if you are available tomorrow.
                    </span>
                    <div className="doctor-card-btns">
                      <button
                        className="doctor-btn-accept"
                        onClick={() => handleDoctorResponse(selectedEmail.id, true)}
                      >
                        Accept slots (Mark Available)
                      </button>
                      <button
                        className="doctor-btn-reject"
                        onClick={() => handleDoctorResponse(selectedEmail.id, false)}
                      >
                        Decline (Mark Busy)
                      </button>
                    </div>
                  </div>
                )}

              <div className="email-details-body">
                {selectedEmail.message}
              </div>

              {attachments.length > 0 && (
                <div className="email-details-attachments">
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--sb-text-muted)" }}>
                    📎 ATTACHMENTS ({attachments.length})
                  </div>
                  {attachments.map((att) => (
                    <a
                      key={att.id}
                      className="email-attachment-link"
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📄 {att.fileName}
                    </a>
                  ))}
                </div>
              )}

              {/* AI Smart Replies */}
              <div className="smart-reply-pane">
                <span className="smart-reply-title">💡 AI Smart Reply Suggested</span>
                {smartRepliesLoading ? (
                  <span style={{ fontSize: "12px", color: "var(--sb-text-muted)" }}>
                    Generating context suggestions...
                  </span>
                ) : smartReplies.length > 0 ? (
                  <div className="smart-reply-options">
                    {smartReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        className="smart-reply-pill"
                        onClick={() => handleUseSmartReply(reply)}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--sb-text-muted)" }}>
                    No suggested replies available
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="email-details-empty">
              <span>📧</span>
              <h3>Select a message to read</h3>
              <p style={{ fontSize: "11px", marginTop: "4px" }}>
                Click on any message in the list to view its contents, attachments, and actions.
              </p>
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeMail
          onClose={() => setShowCompose(false)}
          onSendSuccess={() => {
            setShowCompose(false);
            fetchEmails();
          }}
          initialMsg={initialComposeMsg}
          initialSubject={initialComposeSubject}
          initialRecipientId={composeRecipientId}
        />
      )}
    </>
  );
}
