import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Chip, Stepper, Step, StepLabel, TextField
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PublicIcon from "@mui/icons-material/Public";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import environment from "../../config/environment";
import { useTheme } from "../../hooks/useTheme";

// Uses a plain axios instance (no auth) for public endpoints
const PUB = axios.create({ baseURL: environment.backendUrl });

const G = {
  accent: "#16a064",
  accentDark: "#0d6b45",
  accentLight: "#bbf7d0",
  accentSoft: "#f0fdf4",
  border: "#e2e8f0",
  muted: "#64748b",
  headerBg: "linear-gradient(135deg, #0d6b45 0%, #16a064 45%, #22c77a 80%, #5ee6a8 100%)",
};

const fmt = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-";
const fmtTime = (t) => t ? t.substring(0, 5) : "-";

export default function PublicBookingPage() {
  const { slug } = useParams();
  const { isDark } = useTheme();

  const [profile, setProfile] = useState(null);
  const [calendarDates, setCalendarDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(false); // FIX: separate loading state for dates
  const [selectedDate, setSelectedDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [holdToken, setHoldToken] = useState(null);
  const [holdExpiry, setHoldExpiry] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ customerName: "", customerEmail: "", customerPhone: "", visitorMessage: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [visitorSession] = useState(() => Math.random().toString(36).substring(2));

  // Load profile
  useEffect(() => {
    PUB.get(`/public/book/${slug}`)
      .then(r => setProfile(r.data))
      .catch(() => setError("This booking page is not available."))
      .finally(() => setLoading(false));
  }, [slug]);

  // FIX: Load available dates with error handling + loading state
  useEffect(() => {
    if (!profile) return;
    setDatesLoading(true);
    const today = new Date().toISOString().substring(0, 10);
    const to = new Date();
    to.setDate(to.getDate() + (profile.bookingWindowDays || 30));
    const toStr = to.toISOString().substring(0, 10);
    PUB.get(`/public/book/${slug}/available-dates?from=${today}&to=${toStr}`)
      .then(r => {
        const raw = r.data || [];
        const normalized = raw.map(d => {
          if (Array.isArray(d)) {
            const [y, m, day] = d;
            return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          }
          return String(d).substring(0, 10);
        });
        setCalendarDates(normalized);
      })
      .catch(() => setError("Could not load available dates. Please refresh the page.")) // FIX: was silently failing
      .finally(() => setDatesLoading(false));
  }, [profile, slug]);

  // FIX: Load slots with error handling
  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    setError("");
    PUB.get(`/public/book/${slug}/slots?date=${selectedDate}`)
      .then(r => setSlots(r.data?.slots || []))
      .catch(() => setError("Could not load time slots. Please go back and try again.")) // FIX: was silently failing
      .finally(() => setLoading(false));
  }, [selectedDate, slug]);

  // Countdown timer
  useEffect(() => {
    if (!holdExpiry) return;
    const iv = setInterval(() => {
      const rem = Math.max(0, Math.floor((new Date(holdExpiry) - Date.now()) / 1000));
      setCountdown(rem);
      if (rem === 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [holdExpiry]);

  const availableDateSet = new Set(calendarDates);
  // If the backend returned available dates, use them.
  // Fallback: block weekends (Sat=6, Sun=0) — only Mon–Fri are working days by default.
  const isDateAvailable = (dateStr) => {
    if (calendarDates.length > 0) return availableDateSet.has(dateStr);
    if (datesLoading) return false; // don't enable any dates while loading
    const dow = new Date(dateStr + "T00:00:00").getDay(); // 0=Sun … 6=Sat
    return dow !== 0 && dow !== 6; // block both Sunday and Saturday in fallback
  };

  // FIX: Respect profile.bookingWindowDays instead of hardcoded 42
  const getDateGrid = () => {
    const dates = [];
    const windowDays = profile?.bookingWindowDays || 30;
    const start = new Date();
    for (let i = 0; i < windowDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().substring(0, 10));
    }
    return dates;
  };

  const handleSelectSlot = async (slot) => {
    if (!slot.available) return;
    setLoading(true); setError("");
    try {
      const r = await PUB.post("/public/book/hold", {
        bookingProfileId: profile.id,
        slotDate: selectedDate,
        slotStart: slot.startTime,
        visitorSession,
      });
      setSelectedSlot(slot);
      setHoldToken(r.data.holdToken);
      setHoldExpiry(r.data.expiresAt);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.error || "Could not reserve slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true); setError("");
    try {
      const r = await PUB.post("/public/book/confirm", { holdToken, ...form });
      setSuccess(r.data);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.error || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: isDark ? "#0F172A" : "#f8fafc" }}>
        <CircularProgress sx={{ color: G.accent }} />
      </Box>
    );
  }

  if (error && !profile) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: isDark ? "#0F172A" : "#f8fafc" }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: isDark ? "#0F172A" : "#f8fafc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper sx={{ maxWidth: 640, width: "100%", borderRadius: 3, overflow: "hidden", boxShadow: isDark ? "0 4px 32px rgba(0,0,0,0.5)" : "0 4px 32px rgba(0,0,0,0.10)", background: isDark ? "#1E293B" : "#fff" }}>
        {/* Header — FIX: component="div" prevents <h2> nesting <h6> DOM violation */}
        <Box sx={{ background: G.headerBg, p: 3, color: "#fff" }}>
          <Typography variant="h5" fontWeight={800} component="div">{profile?.name}</Typography>
          {profile?.description && <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>{profile.description}</Typography>}
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Chip icon={<ScheduleIcon sx={{ color: "#fff !important" }} />}
              label={`${profile?.meetingDurationMinutes} min`}
              sx={{ background: "rgba(255,255,255,0.25)", color: "#fff", fontWeight: 600 }} />
            <Chip icon={<PublicIcon sx={{ color: "#fff !important" }} />}
              label={profile?.timezone}
              sx={{ background: "rgba(255,255,255,0.25)", color: "#fff", fontWeight: 600 }} />
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Stepper activeStep={step} sx={{ mb: 3, "& .MuiStepLabel-label": { color: isDark ? "#94A3B8" : undefined }, "& .MuiStepLabel-label.Mui-active": { color: isDark ? "#fff" : undefined }, "& .MuiStepLabel-label.Mui-completed": { color: isDark ? "#4ADE80" : G.accent }, "& .MuiStepIcon-root": { color: isDark ? "#334155" : undefined }, "& .MuiStepIcon-root.Mui-active": { color: G.accent }, "& .MuiStepIcon-root.Mui-completed": { color: G.accent }, "& .MuiStepConnector-line": { borderColor: isDark ? "#334155" : undefined } }}>
            {["Select Date", "Pick a Time", "Your Info", "Confirmed"].map(l => (
              <Step key={l}><StepLabel>{l}</StepLabel></Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Date selection */}
          {step === 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>When works for you?</Typography>

              {/* FIX: show spinner while available-dates is loading */}
              {datesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress sx={{ color: G.accent }} />
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {calendarDates.length === 0 && !datesLoading && (
                    <Alert severity="info" sx={{ width: "100%" }}>
                      Working hours not configured yet — showing all weekdays as selectable.
                    </Alert>
                  )}
                  {getDateGrid().map(dateStr => {
                    const isAvailable = isDateAvailable(dateStr);
                    const d = new Date(dateStr + "T00:00:00");
                    const isSelected = selectedDate === dateStr;
                    return (
                      <Button key={dateStr}
                        variant={isSelected ? "contained" : "outlined"}
                        disabled={!isAvailable}
                        onClick={() => { setSelectedDate(dateStr); setStep(1); }}
                        sx={{
                          minWidth: 70, flexDirection: "column", py: 1, borderRadius: 2,
                          background: isSelected ? G.accent : isDark ? "rgba(255,255,255,0.04)" : "transparent",
                          borderColor: isAvailable ? G.accent : isDark ? "#334155" : G.border,
                          color: isSelected ? "#fff" : isAvailable ? (isDark ? "#4ADE80" : G.accentDark) : (isDark ? "#475569" : G.muted),
                          "&:hover": { background: isAvailable ? (isDark ? "rgba(22,160,100,0.18)" : G.accentLight) : "transparent" },
                          "&.Mui-disabled": { borderColor: isDark ? "#1E293B" : G.border, color: isDark ? "#334155" : G.muted },
                        }}>
                        <Typography variant="caption" fontWeight={700}>{d.toLocaleDateString("en-IN", { weekday: "short" })}</Typography>
                        <Typography fontWeight={800}>{d.getDate()}</Typography>
                        <Typography variant="caption">{d.toLocaleDateString("en-IN", { month: "short" })}</Typography>
                      </Button>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}

          {/* Slot selection */}
          {step === 1 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Button size="small" onClick={() => setStep(0)} sx={{ color: G.accent }}>← Back</Button>
                <Typography variant="subtitle1" fontWeight={600}>{fmt(selectedDate)}</Typography>
              </Box>
              {loading ? <CircularProgress sx={{ color: G.accent }} /> : (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {slots.length === 0 && <Typography color={isDark ? "#64748B" : "text.secondary"}>No slots available. Please choose another date.</Typography>}
                  {slots.map(slot => (
                    <Button key={slot.startTime}
                      variant={slot.available ? "outlined" : "text"}
                      disabled={!slot.available}
                      onClick={() => handleSelectSlot(slot)}
                      sx={{
                        minWidth: 100, borderRadius: 2,
                        borderColor: slot.available ? G.accent : (isDark ? "#334155" : G.border),
                        color: slot.available ? (isDark ? "#4ADE80" : G.accentDark) : (isDark ? "#475569" : G.muted),
                        "&:hover": { background: slot.available ? (isDark ? "rgba(22,160,100,0.15)" : G.accentLight) : "transparent" },
                        "&.Mui-disabled": { color: isDark ? "#334155" : G.muted },
                      }}>
                      {fmtTime(slot.startTime)}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Details form */}
          {step === 2 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Button size="small" onClick={() => setStep(1)} sx={{ color: G.accent }}>← Back</Button>
                <Typography variant="subtitle1" fontWeight={600}>Your Details</Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>{fmt(selectedDate)}</strong> at <strong>{fmtTime(selectedSlot?.startTime)}</strong>
                {countdown !== null && countdown > 0 && (
                  <> — reserved for {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")} min</>
                )}
                {countdown === 0 && <> — <strong>Reservation expired. Go back and reselect.</strong></>}
              </Alert>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {profile?.collectName !== false && (
                  <TextField fullWidth label="Full Name *" value={form.customerName}
                    onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: isDark ? "#334155" : undefined }, "&:hover fieldset": { borderColor: isDark ? "#4ADE80" : undefined } }, "& .MuiInputBase-input": { color: isDark ? "#E2E8F0" : undefined }, "& .MuiInputLabel-root": { color: isDark ? "#94A3B8" : undefined }, backgroundColor: isDark ? "#0F172A" : undefined, borderRadius: 1 }} />
                )}
                {profile?.collectEmail !== false && (
                  <TextField fullWidth label="Email Address *" type="email" value={form.customerEmail}
                    onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                    sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: isDark ? "#334155" : undefined }, "&:hover fieldset": { borderColor: isDark ? "#4ADE80" : undefined } }, "& .MuiInputBase-input": { color: isDark ? "#E2E8F0" : undefined }, "& .MuiInputLabel-root": { color: isDark ? "#94A3B8" : undefined }, backgroundColor: isDark ? "#0F172A" : undefined, borderRadius: 1 }} />
                )}
                {profile?.collectPhone !== false && (
                  <TextField fullWidth label="Phone Number" value={form.customerPhone}
                    onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                    sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: isDark ? "#334155" : undefined }, "&:hover fieldset": { borderColor: isDark ? "#4ADE80" : undefined } }, "& .MuiInputBase-input": { color: isDark ? "#E2E8F0" : undefined }, "& .MuiInputLabel-root": { color: isDark ? "#94A3B8" : undefined }, backgroundColor: isDark ? "#0F172A" : undefined, borderRadius: 1 }} />
                )}
                {profile?.collectNotes !== false && (
                  <TextField fullWidth label="Message / Notes (optional)" multiline rows={3} value={form.visitorMessage}
                    onChange={e => setForm(f => ({ ...f, visitorMessage: e.target.value }))}
                    sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: isDark ? "#334155" : undefined }, "&:hover fieldset": { borderColor: isDark ? "#4ADE80" : undefined } }, "& .MuiInputBase-input": { color: isDark ? "#E2E8F0" : undefined }, "& .MuiInputLabel-root": { color: isDark ? "#94A3B8" : undefined }, backgroundColor: isDark ? "#0F172A" : undefined, borderRadius: 1 }} />
                )}
                <Button fullWidth variant="contained" size="large"
                  disabled={loading || countdown === 0 || !form.customerName || !form.customerEmail}
                  onClick={handleConfirm}
                  sx={{ background: G.accent, "&:hover": { background: G.accentDark }, borderRadius: 2, py: 1.5, fontWeight: 700 }}>
                  {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Book Appointment"}
                </Button>
              </Box>
            </Box>
          )}

          {/* Success */}
          {step === 3 && success && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: G.accent, mb: 2 }} />
              <Typography variant="h5" fontWeight={800} mb={1} component="div">You're booked!</Typography>
              <Typography color={isDark ? "#94A3B8" : "text.secondary"} mb={3}>{success.message}</Typography>
              <Paper sx={{ p: 3, borderRadius: 2, background: isDark ? "rgba(13,107,69,0.15)" : G.accentSoft, border: isDark ? "1px solid rgba(74,222,128,0.2)" : undefined, textAlign: "left" }}>
                <Typography mb={0.5} sx={{ color: isDark ? "#E2E8F0" : undefined }}><strong style={{ color: isDark ? "#4ADE80" : G.accentDark }}>Reference:</strong> {success.appointmentNumber}</Typography>
                <Typography mb={0.5} sx={{ color: isDark ? "#E2E8F0" : undefined }}><strong style={{ color: isDark ? "#4ADE80" : G.accentDark }}>Date:</strong> {success.date}</Typography>
                <Typography mb={0.5} sx={{ color: isDark ? "#E2E8F0" : undefined }}><strong style={{ color: isDark ? "#4ADE80" : G.accentDark }}>Time:</strong> {success.startTime} – {success.endTime}</Typography>
                <Typography mb={0.5} sx={{ color: isDark ? "#E2E8F0" : undefined }}><strong style={{ color: isDark ? "#4ADE80" : G.accentDark }}>Name:</strong> {success.customerName}</Typography>
                <Typography sx={{ color: isDark ? "#E2E8F0" : undefined }}><strong style={{ color: isDark ? "#4ADE80" : G.accentDark }}>Status:</strong> {success.status}</Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}