import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  CircularProgress,
  Zoom,
  Slide,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/Person";
import { useLocation } from "react-router-dom";
import axios from "axios";
import environment from "../../config/environment";
import { useTheme } from "../../hooks/useTheme";

/* ---------------------------------------------------------------------- */
/*  Vantoor heritage tokens — navy / gold, matching the HMS brand system  */
/* ---------------------------------------------------------------------- */
const T = {
  ink: "#0B1B2B",
  inkSoft: "#13283D",
  teal: "#0F3D3E",
  gold: "#C9A24B",
  goldSoft: "#E4C77E",
  parchment: "#FAF7F1",
  parchmentDeep: "#F1ECE0",
  slate: "#5B6B7C",
  danger: "#B5443A",
  dangerSoft: "#F7E9E7",
  info: "#2F5D8C",
  infoSoft: "#E9F0F7",
  headerGrad: "linear-gradient(135deg, #0B1B2B 0%, #13283D 55%, #0F3D3E 100%)",
  fontDisplay: "'Cormorant Garamond', 'Georgia', serif",
  fontBody: "'Plus Jakarta Sans', 'Inter', sans-serif",
};

const darkInk = {
  panelBg: "#0E1A28",
  msgBg: "#162739",
  textPrimary: "#F2EEE3",
  textSecondary: "#9FB0C0",
  border: "#22384B",
  inputBg: "#0B1722",
};

export default function AIAppointmentChatbot({ isOpen: externalIsOpen, onClose: externalOnClose, hideTrigger = false }) {
  const { isDark } = useTheme();
  const location = useLocation();

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

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isHospitalRoute = location.pathname.startsWith("/hospital");

  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem("hms_chat_session_id");
    if (!id) {
      id = "session_" + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem("hms_chat_session_id", id);
    }
    return id;
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${environment.backendUrl}/api/ai/history/${sessionId}`)
      .then((r) => {
        const history = r.data || [];
        if (history.length === 0) {
          setMessages([
            {
              sender: "bot",
              reply:
                "Welcome to Vantoor Care. I can help you check doctor availability, book, reschedule or cancel an appointment, describe symptoms, or share hospital timings. How may I assist you today?",
              action: "GENERAL_QUERY",
              data: {},
            },
          ]);
        } else {
          const mapped = history.map((h) => {
            const isUser = h.action === "USER_MESSAGE";
            return {
              sender: isUser ? "user" : "bot",
              reply: h.reply,
              action: h.action,
              data: h.data || {},
            };
          });
          setMessages(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
      });
  }, [sessionId]);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput("");

    setMessages((prev) => [...prev, { sender: "user", reply: text }]);
    setLoading(true);

    try {
      const r = await axios.post(`${environment.backendUrl}/api/ai/chat`, {
        message: text,
        sessionId: sessionId,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          reply: r.data.reply,
          action: r.data.action,
          data: r.data.data || {},
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          reply:
            "I couldn't reach the care desk just now. Please try again in a moment.",
          action: "GENERAL_QUERY",
          data: {},
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (msg) => handleSend(msg);

  const handleSlotClick = (slotTime, docName, dateStr) => {
    const bookMsg = `Book slot ${slotTime} on ${dateStr} with ${docName}`;
    handleSend(bookMsg);
  };

  const suggestedChips = [
    { label: "Book Appointment", icon: <EventAvailableIcon sx={{ fontSize: 15 }} /> },
    { label: "Available Doctors", icon: <PersonIcon sx={{ fontSize: 15 }} /> },
    { label: "I have fever", icon: <AutoAwesomeIcon sx={{ fontSize: 15 }} /> },
    { label: "Reschedule Appointment", icon: <SwapHorizIcon sx={{ fontSize: 15 }} /> },
    { label: "Hospital Timings", icon: null },
  ];

  // --- theme-derived surface colors -------------------------------------
  const panelBg = isDark ? darkInk.panelBg : T.parchment;
  const msgListBg = isDark ? "#0B1520" : T.parchmentDeep;
  const botBubbleBg = isDark ? darkInk.msgBg : "#FFFFFF";
  const botText = isDark ? darkInk.textPrimary : T.ink;
  const borderCol = isDark ? darkInk.border : "#E6DFCF";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: isHospitalRoute ? 140 : 24,
        zIndex: 9999,
        fontFamily: T.fontBody,
      }}
    >
      {/* ---------------- Floating Action Button ---------------- */}
      {!hideTrigger && (
        <Zoom in={!open}>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              background: T.headerGrad,
              color: T.goldSoft,
              width: 58,
              height: 58,
              border: `1px solid rgba(201,162,75,0.45)`,
              boxShadow: "0 8px 24px rgba(11,27,43,0.45)",
              position: "relative",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 12px 30px rgba(11,27,43,0.55)",
              },
              transition: "all 0.25s ease",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: `1px solid ${T.gold}`,
                opacity: 0.35,
                animation: "vantoorRing 2.8s ease-out infinite",
              },
              "@keyframes vantoorRing": {
                "0%": { transform: "scale(0.85)", opacity: 0.45 },
                "100%": { transform: "scale(1.35)", opacity: 0 },
              },
            }}
          >
            <ChatIcon sx={{ fontSize: 26 }} />
          </IconButton>
        </Zoom>
      )}

      {/* ---------------- Chat Window ---------------- */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            bottom: 96,
            right: { xs: 16, sm: 28 },
            width: { xs: "calc(100vw - 32px)", sm: 420 },
            height: { xs: "calc(100vh - 120px)", sm: 580 },
            maxHeight: "calc(100vh - 120px)",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: isDark
              ? "0 24px 60px rgba(0,0,0,0.55)"
              : "0 24px 60px rgba(11,27,43,0.22)",
            background: panelBg,
            border: `1px solid ${isDark ? "rgba(201,162,75,0.18)" : "rgba(11,27,43,0.08)"}`,
          }}
        >
          {/* ---------- Header ---------- */}
          <Box
            sx={{
              background: T.headerGrad,
              color: T.parchment,
              px: 2.5,
              py: 2,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1.5px solid ${T.gold}`,
                  background: "rgba(201,162,75,0.10)",
                }}
              >
                <AutoAwesomeIcon sx={{ color: T.goldSoft, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: T.fontDisplay,
                    fontSize: "1.32rem",
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    lineHeight: 1.1,
                  }}
                >
                  Vantoor Care Desk
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mt: 0.3 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#5FCB8A",
                      boxShadow: "0 0 0 0 rgba(95,203,138,0.6)",
                      animation: "vantoorPulse 2s infinite",
                      "@keyframes vantoorPulse": {
                        "0%": { boxShadow: "0 0 0 0 rgba(95,203,138,0.55)" },
                        "70%": { boxShadow: "0 0 0 5px rgba(95,203,138,0)" },
                        "100%": { boxShadow: "0 0 0 0 rgba(95,203,138,0)" },
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.75, fontSize: "0.72rem", letterSpacing: 0.4 }}
                  >
                    Assistant online
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton
              onClick={() => setOpen(false)}
              size="small"
              sx={{ color: T.parchment, opacity: 0.8, "&:hover": { opacity: 1 } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {/* gold hairline */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(201,162,75,0.65), transparent)",
              }}
            />
          </Box>

          {/* ---------- Messages ---------- */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1.75,
              bgcolor: msgListBg,
              "&::-webkit-scrollbar": { width: 5 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: isDark ? "#28415A" : "#D9CDA9",
                borderRadius: 3,
              },
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.sender === "user";
              return (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    maxWidth: "92%",
                    alignSelf: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 0.9,
                      flexDirection: isUser ? "row-reverse" : "row",
                    }}
                  >
                    {!isUser && (
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: T.headerGrad,
                          border: `1px solid ${T.gold}`,
                        }}
                      >
                        <AutoAwesomeIcon sx={{ fontSize: 13, color: T.goldSoft }} />
                      </Box>
                    )}

                    <Box
                      sx={{
                        py: 1.1,
                        px: 1.6,
                        borderRadius: isUser
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                        bgcolor: isUser ? T.ink : botBubbleBg,
                        color: isUser ? T.parchment : botText,
                        boxShadow: isDark
                          ? "0 2px 10px rgba(0,0,0,0.35)"
                          : "0 2px 10px rgba(11,27,43,0.08)",
                        border: isUser
                          ? "1px solid rgba(201,162,75,0.35)"
                          : `1px solid ${borderCol}`,
                        fontSize: "0.91rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {m.reply}
                    </Box>
                  </Box>

                  {/* ----- Slot card — styled as an appointment ticket ----- */}
                  {!isUser && m.action === "CHECK_SLOTS" && m.data?.slots && (
                    <Box
                      sx={{
                        mt: 1.2,
                        ml: 4.3,
                        borderRadius: "12px",
                        bgcolor: isDark ? darkInk.msgBg : "#FFFFFF",
                        border: `1px solid ${borderCol}`,
                        borderLeft: `3px solid ${T.gold}`,
                        boxShadow: isDark
                          ? "0 4px 14px rgba(0,0,0,0.3)"
                          : "0 4px 14px rgba(11,27,43,0.08)",
                        maxWidth: 300,
                        overflow: "hidden",
                      }}
                    >
                      <Box sx={{ p: 1.6, pb: 1.2 }}>
                        <Typography
                          sx={{
                            fontFamily: T.fontDisplay,
                            fontWeight: 600,
                            fontSize: "1.05rem",
                            color: isDark ? T.parchment : T.ink,
                          }}
                        >
                          {m.data.doctorName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: isDark ? darkInk.textSecondary : T.slate, display: "block" }}
                        >
                          {m.data.specialization} · {m.data.date}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          borderTop: `1px dashed ${isDark ? "#2C4760" : "#DCD2B5"}`,
                          p: 1.4,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.7,
                        }}
                      >
                        {m.data.slots.length === 0 ? (
                          <Typography variant="caption" sx={{ color: T.danger }}>
                            No slots available — try another day.
                          </Typography>
                        ) : (
                          m.data.slots.map((sTime) => (
                            <Box
                              key={sTime}
                              onClick={() =>
                                handleSlotClick(sTime, m.data.doctorName, m.data.date)
                              }
                              sx={{
                                px: 1.3,
                                py: 0.5,
                                borderRadius: "999px",
                                border: `1px solid ${T.gold}`,
                                color: isDark ? T.goldSoft : T.teal,
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                letterSpacing: 0.2,
                                transition: "all 0.15s ease",
                                "&:hover": {
                                  bgcolor: T.gold,
                                  color: T.ink,
                                },
                              }}
                            >
                              {sTime}
                            </Box>
                          ))
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* ----- Booking confirmed ----- */}
                  {!isUser && m.action === "BOOK_APPOINTMENT" && m.data?.appointmentNumber && (
                    <StatusCard
                      isDark={isDark}
                      tone="success"
                      icon={<CheckCircleIcon sx={{ fontSize: 19 }} />}
                      title="Booking confirmed"
                      rows={[
                        ["Ref", m.data.appointmentNumber],
                        ["Doctor", m.data.doctorName],
                        ["Date", m.data.date],
                        ["Time", m.data.startTime],
                        ["Status", m.data.status],
                      ]}
                    />
                  )}

                  {/* ----- Cancelled ----- */}
                  {!isUser && m.action === "CANCEL_APPOINTMENT" && m.data?.appointmentNumber && (
                    <StatusCard
                      isDark={isDark}
                      tone="danger"
                      icon={<CancelIcon sx={{ fontSize: 19 }} />}
                      title="Appointment cancelled"
                      rows={[
                        ["Ref", m.data.appointmentNumber],
                        ["Status", "CANCELLED"],
                      ]}
                    />
                  )}

                  {/* ----- Rescheduled ----- */}
                  {!isUser && m.action === "RESCHEDULE_APPOINTMENT" && m.data?.appointmentNumber && (
                    <StatusCard
                      isDark={isDark}
                      tone="info"
                      icon={<SwapHorizIcon sx={{ fontSize: 19 }} />}
                      title="Rescheduled successfully"
                      rows={[
                        ["New ref", m.data.appointmentNumber],
                        ...(m.data.oldAppointmentNumber
                          ? [["Old ref", `${m.data.oldAppointmentNumber} (cancelled)`]]
                          : []),
                        ["New date", m.data.date],
                        ["New time", m.data.startTime],
                        ["Status", m.data.status],
                      ]}
                    />
                  )}
                </Box>
              );
            })}

            {/* ----- Typing indicator ----- */}
            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: T.headerGrad,
                    border: `1px solid ${T.gold}`,
                  }}
                >
                  <AutoAwesomeIcon sx={{ fontSize: 13, color: T.goldSoft }} />
                </Box>
                <Box
                  sx={{
                    py: 1.1,
                    px: 1.6,
                    borderRadius: "16px 16px 16px 4px",
                    bgcolor: botBubbleBg,
                    border: `1px solid ${borderCol}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {[0, 0.18, 0.36].map((delay, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        bgcolor: T.gold,
                        animation: `vantoorDot 1.3s infinite ease-in-out both`,
                        animationDelay: `${delay}s`,
                        "@keyframes vantoorDot": {
                          "0%, 80%, 100%": { transform: "scale(0.4)", opacity: 0.4 },
                          "40%": { transform: "scale(1)", opacity: 1 },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* ---------- Suggestions ---------- */}
          <Box
            sx={{
              px: 1.4,
              py: 1.1,
              display: "flex",
              gap: 0.7,
              overflowX: "auto",
              bgcolor: isDark ? darkInk.panelBg : "#FFFFFF",
              borderTop: `1px solid ${borderCol}`,
              "&::-webkit-scrollbar": { height: 0 },
            }}
          >
            {suggestedChips.map((chip) => (
              <Box
                key={chip.label}
                onClick={() => handleChipClick(chip.label)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.3,
                  py: 0.65,
                  borderRadius: "999px",
                  border: `1px solid ${isDark ? "#2C4760" : "#E1D8BD"}`,
                  color: isDark ? darkInk.textPrimary : T.ink,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: T.gold,
                    borderColor: T.gold,
                    color: T.ink,
                  },
                }}
              >
                {chip.icon}
                {chip.label}
              </Box>
            ))}
          </Box>

          {/* ---------- Input ---------- */}
          <Box
            sx={{
              p: 1.4,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: isDark ? darkInk.panelBg : "#FFFFFF",
              borderTop: `1px solid ${borderCol}`,
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              size="small"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  bgcolor: isDark ? darkInk.inputBg : T.parchmentDeep,
                  "& fieldset": { borderColor: isDark ? "#2C4760" : "#E1D8BD" },
                  "&:hover fieldset": { borderColor: T.gold },
                  "&.Mui-focused fieldset": { borderColor: T.gold, borderWidth: 1.5 },
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.9rem",
                  color: isDark ? darkInk.textPrimary : T.ink,
                  py: 1.05,
                },
              }}
            />
            <IconButton
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              sx={{
                background: T.headerGrad,
                color: T.goldSoft,
                width: 40,
                height: 40,
                "&:hover": { filter: "brightness(1.15)" },
                "&.Mui-disabled": {
                  background: isDark ? "#1C2E40" : "#E6DFCF",
                  color: isDark ? "#3E5670" : "#B8AC8A",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={18} sx={{ color: "inherit" }} />
              ) : (
                <SendIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared status card for booking / cancel / reschedule confirmations */
/* ------------------------------------------------------------------ */
function StatusCard({ isDark, tone, icon, title, rows }) {
  const palette = {
    success: { accent: "#3E8E5C", bgLight: "#EEF6EF", bgDark: "rgba(62,142,92,0.14)" },
    danger: { accent: T.danger, bgLight: T.dangerSoft, bgDark: "rgba(181,68,58,0.14)" },
    info: { accent: T.info, bgLight: T.infoSoft, bgDark: "rgba(47,93,140,0.14)" },
  }[tone];

  return (
    <Box
      sx={{
        mt: 1.2,
        ml: 4.3,
        borderRadius: "12px",
        bgcolor: isDark ? palette.bgDark : palette.bgLight,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        borderLeft: `3px solid ${palette.accent}`,
        p: 1.6,
        display: "flex",
        gap: 1.2,
        maxWidth: 300,
      }}
    >
      <Box sx={{ color: palette.accent, mt: 0.1 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontFamily: T.fontDisplay,
            fontWeight: 600,
            fontSize: "1rem",
            color: palette.accent,
            mb: 0.4,
          }}
        >
          {title}
        </Typography>
        {rows.map(([label, val]) => (
          <Box
            key={label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              color: isDark ? darkInk.textSecondary : T.slate,
              py: 0.2,
            }}
          >
            <span>{label}</span>
            <span style={{ fontWeight: 600, color: isDark ? darkInk.textPrimary : T.ink }}>
              {val}
            </span>
          </Box>
        ))}
      </Box>
    </Box>
  );
}