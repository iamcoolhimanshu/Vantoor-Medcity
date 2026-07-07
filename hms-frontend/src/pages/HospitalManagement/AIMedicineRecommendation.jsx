import React, { useState, useEffect } from "react";
import API from "../../api/api";
import { CircularProgress } from "@mui/material";

export default function AIMedicineRecommendation({ form, setForm }) {
  const patientId = form?.patientId;
  const [symptomsInput, setSymptomsInput] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history when patientId is available
  const loadHistory = async () => {
    if (!patientId) return;
    try {
      const res = await API.get(`/api/ai/medicine/history/${patientId}`);
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load recommendation history", err);
    }
  };

  useEffect(() => {
    loadHistory();
    // Pre-populate diagnosis if already filled in notes or patient context
    if (form?.problem) {
      setSymptomsInput(form.problem);
    }
  }, [patientId]);

  const handleGetSuggestions = async () => {
    if (!patientId) {
      setError("Please select or enter a Patient ID first.");
      return;
    }
    if (!symptomsInput.trim()) {
      setError("Please describe the symptoms.");
      return;
    }

    setError("");
    setLoading(true);
    setSuggestions(null);

    const symptomsList = symptomsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await API.post("/api/ai/medicine/recommend", {
        patientId: Number(patientId),
        symptoms: symptomsList,
        diagnosis: diagnosis.trim() || "Unspecified",
      });
      setSuggestions(res.data);
      loadHistory();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to get suggestions. Please verify the patient ID and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPrescription = (rec) => {
    const current = form.medicines || "";
    const suffix = `${rec.medicine} — Purpose: ${rec.purpose} (${rec.dosage})`;
    const newValue = current ? `${current}\n${suffix}` : suffix;
    setForm((prev) => ({
      ...prev,
      medicines: newValue,
    }));
  };

  const handleIgnoreRecommendation = (index) => {
    if (!suggestions) return;
    const updated = suggestions.recommendations.filter((_, i) => i !== index);
    setSuggestions({
      ...suggestions,
      recommendations: updated,
    });
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return "#059669"; // Green
    if (score >= 70) return "#D97706"; // Amber
    return "#DC2626"; // Red
  };

  return (
    <>
      <style>{`
        .ai-recommendation-panel {
          font-family: 'DM Sans', sans-serif;
          color: var(--hm-text);
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
        }
        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.5px solid var(--hm-divider);
          padding-bottom: 10px;
        }
        .ai-title {
          font-size: 14px;
          font-weight: 800;
          color: #047857;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-history-btn {
          background: none;
          border: none;
          color: #2563EB;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .ai-history-btn:hover {
          background: rgba(37, 99, 235, 0.08);
        }
        .ai-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ai-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--hm-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .ai-input {
          font-size: 13px;
          color: var(--hm-text);
          background: var(--hm-input);
          border: 1.5px solid var(--hm-input-border);
          border-radius: 9px;
          padding: 8px 12px;
          outline: none;
          transition: border-color 0.15s;
        }
        .ai-input:focus {
          border-color: #047857;
        }
        .ai-textarea {
          resize: vertical;
          min-height: 50px;
        }
        .ai-actions {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }
        .btn-ai-suggest {
          flex: 1;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          border: none;
          border-radius: 9px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(4, 120, 87, 0.15);
          transition: transform 0.1s, box-shadow 0.15s;
        }
        .btn-ai-suggest:hover {
          box-shadow: 0 6px 16px rgba(4, 120, 87, 0.25);
        }
        .btn-ai-suggest:active {
          transform: translateY(1px);
        }
        .btn-ai-suggest:disabled {
          background: var(--hm-input-border);
          color: var(--hm-text-faint);
          cursor: not-allowed;
          box-shadow: none;
        }
        .ai-error-box {
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          color: #991B1B;
          border-radius: 9px;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .ai-warnings-panel {
          background: #FFFBEB;
          border: 1.5px solid #FCD34D;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ai-warning-title {
          font-size: 12px;
          font-weight: 800;
          color: #B45309;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ai-warning-item {
          font-size: 12px;
          color: #78350F;
          font-weight: 500;
          padding-left: 18px;
          position: relative;
        }
        .ai-warning-item::before {
          content: "•";
          position: absolute;
          left: 6px;
          color: #D97706;
          font-weight: bold;
        }
        .ai-results-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          max-height: 380px;
          padding-right: 4px;
        }
        .ai-reasoning-card {
          background: var(--hm-thead);
          border: 1px dashed var(--hm-divider);
          border-radius: 9px;
          padding: 10px 12px;
          font-size: 12.5px;
          line-height: 1.4;
        }
        .ai-card {
          background: var(--hm-card);
          border: 1.5px solid var(--hm-card-border);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ai-card:hover {
          border-color: #059669;
          box-shadow: 0 4px 12px var(--hm-shadow);
        }
        .ai-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ai-med-name {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--hm-text);
        }
        .ai-confidence-badge {
          font-size: 10px;
          font-weight: 800;
          color: white;
          padding: 3px 6px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .ai-med-detail {
          font-size: 12px;
          color: var(--hm-text-muted);
          line-height: 1.35;
        }
        .ai-med-detail strong {
          color: var(--hm-text);
        }
        .ai-card-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 4px;
          border-top: 1px solid var(--hm-divider);
          padding-top: 8px;
        }
        .btn-ai-action {
          font-size: 11px;
          font-weight: 700;
          border: none;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.12s;
        }
        .btn-ai-action.add {
          background: #E6F4EA;
          color: #137333;
        }
        .btn-ai-action.add:hover {
          background: #CEEAD6;
        }
        .btn-ai-action.ignore {
          background: #F1F3F4;
          color: var(--hm-text-muted);
        }
        .btn-ai-action.ignore:hover {
          background: #E8EAED;
        }
        .ai-history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 240px;
          overflow-y: auto;
          border: 1px solid var(--hm-divider);
          border-radius: 9px;
          padding: 8px;
          background: var(--hm-thead);
        }
        .ai-history-item {
          border-bottom: 1px solid var(--hm-divider);
          padding-bottom: 6px;
          font-size: 11px;
        }
        .ai-history-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .ai-history-meta {
          display: flex;
          justify-content: space-between;
          color: var(--hm-text-faint);
          font-weight: bold;
          margin-bottom: 2px;
        }
      `}</style>

      <div className="ai-recommendation-panel">
        <div className="ai-header">
          <div className="ai-title">
            <span>✨</span> AI Medicine Suggestions
          </div>
          {patientId && history.length > 0 && (
            <button
              type="button"
              className="ai-history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "✕ Close History" : `📜 History (${history.length})`}
            </button>
          )}
        </div>

        {showHistory && (
          <div className="ai-history-list">
            {history.map((h, i) => {
              let parsedRes = { recommendations: [], reasoning: "" };
              try {
                parsedRes = JSON.parse(h.aiResponse);
              } catch (e) { }

              return (
                <div key={h.id || i} className="ai-history-item">
                  <div className="ai-history-meta">
                    <span>Encounter #{h.id}</span>
                    <span>
                      {h.createdAt
                        ? new Date(h.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                  <div>
                    <strong>Diagnosis:</strong> {h.diagnosis || "N/A"}
                  </div>
                  <div>
                    <strong>Symptoms:</strong> {h.symptoms || "N/A"}
                  </div>
                  <div style={{ marginTop: 4, color: "#047857" }}>
                    <strong>Meds Recommended:</strong>{" "}
                    {parsedRes.recommendations
                      ?.map((r) => r.medicine)
                      .join(", ") || "None"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="ai-form-group">
          <label className="ai-label">Symptoms</label>
          <input
            className="ai-input"
            value={symptomsInput}
            onChange={(e) => setSymptomsInput(e.target.value)}
            placeholder="e.g. Cough, high fever, headache"
          />
        </div>

        <div className="ai-form-group">
          <label className="ai-label">Diagnosis</label>
          <input
            className="ai-input"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Seasonal flu, viral fever"
          />
        </div>

        <div className="ai-actions">
          <button
            type="button"
            className="btn-ai-suggest"
            onClick={handleGetSuggestions}
            disabled={loading || !patientId}
          >
            {loading ? (
              <>
                <CircularProgress size={16} color="inherit" /> Fetching Suggestions...
              </>
            ) : (
              <>🤖 Get AI Suggestions</>
            )}
          </button>
        </div>

        {error && <div className="ai-error-box">{error}</div>}

        {suggestions && (
          <div className="ai-results-section">
            {suggestions.warnings && suggestions.warnings.length > 0 && (
              <div className="ai-warnings-panel">
                <div className="ai-warning-title">⚠️ Safety Alerts</div>
                {suggestions.warnings.map((w, idx) => (
                  <div key={idx} className="ai-warning-item">
                    {w.warning}
                  </div>
                ))}
              </div>
            )}

            {suggestions.reasoning && (
              <div className="ai-reasoning-card">
                <strong>AI Reasoning:</strong> {suggestions.reasoning}
              </div>
            )}

            {suggestions.recommendations &&
              suggestions.recommendations.map((rec, idx) => (
                <div key={idx} className="ai-card">
                  <div className="ai-card-header">
                    <span className="ai-med-name">{rec.medicine}</span>
                    <span
                      className="ai-confidence-badge"
                      style={{
                        backgroundColor: getConfidenceColor(rec.confidence),
                      }}
                    >
                      {rec.confidence}% Confidence
                    </span>
                  </div>
                  <div className="ai-med-detail">
                    <strong>Purpose:</strong> {rec.purpose}
                  </div>
                  <div className="ai-med-detail">
                    <strong>Suggested Dosage:</strong> {rec.dosage}
                  </div>
                  <div className="ai-card-actions">
                    <button
                      type="button"
                      className="btn-ai-action ignore"
                      onClick={() => handleIgnoreRecommendation(idx)}
                    >
                      Ignore
                    </button>
                    <button
                      type="button"
                      className="btn-ai-action add"
                      onClick={() => handleAddToPrescription(rec)}
                    >
                      + Add to Rx
                    </button>
                  </div>
                </div>
              ))}

            {suggestions.recommendations?.length === 0 && (
              <div style={{ textAlign: "center", padding: 20, color: "var(--hm-text-faint)" }}>
                No safe medicines to recommend.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
