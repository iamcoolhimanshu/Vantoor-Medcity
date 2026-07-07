import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Card, CardContent, Grid, 
  Paper, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, CircularProgress, Alert, 
  Tooltip, Divider, Badge
} from "@mui/material";
import { 
  Add, SmartToy, AutoMode, QrCode, ContentCopy, Publish, 
  Edit, Delete, BarChart, Visibility, InsertDriveFile, Close 
} from "@mui/icons-material";
import API from "../../../api/api";
import DynamicFormBuilder from "./DynamicFormBuilder";
import FormSubmissionDashboard from "./FormSubmissionDashboard";
import DynamicFormRenderer from "./DynamicFormRenderer";

// Default Form Templates List
const DEFAULT_TEMPLATES = [
  {
    formName: "Patient Registration Form",
    description: "Standard details for registering new patients.",
    fields: [
      { fieldName: "patientName", fieldLabel: "Patient Name", fieldType: "TEXT", required: true, displayOrder: 1 },
      { fieldName: "dateOfBirth", fieldLabel: "Date of Birth", fieldType: "DATE", required: true, displayOrder: 2 },
      { fieldName: "gender", fieldLabel: "Gender", fieldType: "DROPDOWN", required: true, optionsJson: '["Male", "Female", "Other"]', displayOrder: 3 },
      { fieldName: "mobileNumber", fieldLabel: "Mobile Number", fieldType: "PHONE", required: true, displayOrder: 4 },
      { fieldName: "email", fieldLabel: "Email Address", fieldType: "EMAIL", required: false, displayOrder: 5 },
      { fieldName: "emergencyContact", fieldLabel: "Emergency Contact Details", fieldType: "TEXTAREA", required: true, displayOrder: 6 }
    ]
  },
  {
    formName: "Insurance Claim Form",
    description: "Submit details to process medical insurance claims.",
    fields: [
      { fieldName: "policyNumber", fieldLabel: "Policy Number", fieldType: "TEXT", required: true, displayOrder: 1 },
      { fieldName: "insuranceProvider", fieldLabel: "Insurance Provider Name", fieldType: "DROPDOWN", required: true, optionsJson: '["Star Health", "Max Bupa", "HDFC Ergo", "LIC India"]', displayOrder: 2 },
      { fieldName: "claimAmount", fieldLabel: "Estimated Claim Amount (INR)", fieldType: "NUMBER", required: true, displayOrder: 3 },
      { fieldName: "claimDetails", fieldLabel: "Diagnosis / Treatment Details", fieldType: "TEXTAREA", required: true, displayOrder: 4 },
      { fieldName: "claimDocuments", fieldLabel: "Upload Support Invoices / Documents", fieldType: "FILE_UPLOAD", required: true, displayOrder: 5 }
    ]
  },
  {
    formName: "COVID-19 Screening Form",
    description: "Pre-admission health check screening questionnaire.",
    fields: [
      { fieldName: "patientName", fieldLabel: "Patient Name", fieldType: "TEXT", required: true, displayOrder: 1 },
      { fieldName: "temperature", fieldLabel: "Body Temperature (°F)", fieldType: "NUMBER", required: true, validationJson: '{"minValue":94, "maxValue":108}', displayOrder: 2 },
      { fieldName: "symptoms", fieldLabel: "Select Current Symptoms", fieldType: "CHECKBOX", optionsJson: '["Fever / Chills", "Dry Cough", "Shortness of breath", "Loss of taste/smell", "Fatigue", "None of the above"]', displayOrder: 3 },
      { fieldName: "travelHistory", fieldLabel: "International Travel History (Last 14 days)", fieldType: "RADIO_BUTTON", optionsJson: '["Yes", "No"]', displayOrder: 4 },
      { fieldName: "vaccinationStatus", fieldLabel: "Vaccination Status", fieldType: "DROPDOWN", required: true, optionsJson: '["Fully Vaccinated (2+ doses)", "Partially Vaccinated (1 dose)", "Unvaccinated"]', displayOrder: 5 }
    ]
  },
  {
    formName: "Blood Donation Form",
    description: "Donor screening assessment criteria.",
    fields: [
      { fieldName: "donorName", fieldLabel: "Donor Full Name", fieldType: "TEXT", required: true, displayOrder: 1 },
      { fieldName: "bloodGroup", fieldLabel: "Blood Group", fieldType: "DROPDOWN", required: true, optionsJson: '["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]', displayOrder: 2 },
      { fieldName: "donorWeight", fieldLabel: "Weight (kg)", fieldType: "NUMBER", required: true, validationJson: '{"minValue":45}', displayOrder: 3 },
      { fieldName: "lastDonationDate", fieldLabel: "Last Donation Date (if any)", fieldType: "DATE", required: false, displayOrder: 4 },
      { fieldName: "healthDeclaration", fieldLabel: "I certify that I am healthy and fit to donate blood", fieldType: "SWITCH", required: true, displayOrder: 5 }
    ]
  },
  {
    formName: "Surgery Consent Form",
    description: "Official legal declaration sign-off for clinical operations.",
    fields: [
      { fieldName: "patientName", fieldLabel: "Patient / Guardian Name", fieldType: "TEXT", required: true, displayOrder: 1 },
      { fieldName: "surgeryName", fieldLabel: "Surgery / Procedure Name", fieldType: "TEXT", required: true, displayOrder: 2 },
      { fieldName: "consentDeclaration", fieldLabel: "Consent Declaration text", fieldType: "SECTION_HEADER", displayOrder: 3, validationJson: '{"helpText":"I hereby consent to the performance of the surgery procedure described above. I understand the associated risks."}' },
      { fieldName: "patientSignature", fieldLabel: "Patient/Guardian Signature", fieldType: "SIGNATURE_PAD", required: true, displayOrder: 4 }
    ]
  },
  {
    formName: "Patient Feedback Form",
    description: "Collect experience responses for hospital service improvements.",
    fields: [
      { fieldName: "doctorRating", fieldLabel: "Rate Consultation Experience", fieldType: "RATING", required: true, displayOrder: 1 },
      { fieldName: "cleanlinessRating", fieldLabel: "Rate Hospital Cleanliness & Hygiene", fieldType: "RATING", required: true, displayOrder: 2 },
      { fieldName: "comments", fieldLabel: "Any suggestions / comments?", fieldType: "TEXTAREA", required: false, displayOrder: 3 }
    ]
  },
  {
    formName: "Doctor Evaluation Form",
    description: "Internal performance appraisal audit template.",
    fields: [
      { fieldName: "doctorName", fieldLabel: "Doctor Under Review", fieldType: "TEXT", required: true, displayOrder: 1 },
      { fieldName: "evaluationPeriod", fieldLabel: "Evaluation Period", fieldType: "DROPDOWN", optionsJson: '["Q1", "Q2", "Q3", "Q4", "Annual Review"]', required: true, displayOrder: 2 },
      { fieldName: "clinicalSkills", fieldLabel: "Clinical Skills rating", fieldType: "RATING", required: true, displayOrder: 3 },
      { fieldName: "notes", fieldLabel: "Reviewer comments & feedback", fieldType: "RICH_TEXT_EDITOR", required: false, displayOrder: 4 }
    ]
  },
  {
    formName: "Medical History Form",
    description: "Capture clinical history profiles.",
    fields: [
      { fieldName: "allergies", fieldLabel: "Do you have any drug or food allergies?", fieldType: "RADIO_BUTTON", optionsJson: '["Yes", "No"]', required: true, displayOrder: 1 },
      { fieldName: "allergyDetails", fieldLabel: "If yes, please list allergies:", fieldType: "TEXTAREA", required: false, conditionalJson: '{"field":"allergies", "operator":"EQUALS", "value":"Yes"}', displayOrder: 2 },
      { fieldName: "chronicConditions", fieldLabel: "Check chronic conditions that apply", fieldType: "CHECKBOX", optionsJson: '["Hypertension", "Diabetes", "Asthma", "Thyroid Disorder", "None"]', displayOrder: 3 }
    ]
  }
];

export default function DynamicFormBuilderDashboard() {
  const [view, setView] = useState("list"); // list, build, submissions
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeForm, setActiveForm] = useState(null); // Form loaded for edit/build
  const [selectedSubmissionsFormId, setSelectedSubmissionsFormId] = useState(null);

  // Modals state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewForm, setPreviewForm] = useState(null);

  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/api/forms/all");
      setForms(res.data || []);
    } catch (e) {
      setError("Failed to fetch forms: " + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setActiveForm({
      formName: "",
      description: "",
      roleBasedAccess: "",
      workflowIntegration: "",
      publicAccess: false,
      fields: []
    });
    setView("build");
  };

  const handleSelectTemplate = (template) => {
    setActiveForm({ ...template });
    setShowTemplateModal(false);
    setView("build");
  };

  const handleEdit = (form) => {
    setActiveForm(form);
    setView("build");
  };

  const handleSaveForm = async (payload) => {
    setLoading(true);
    try {
      if (payload.id) {
        await API.put(`/api/forms/update/${payload.id}`, payload);
      } else {
        await API.post("/api/forms/create", payload);
      }
      setView("list");
      loadForms();
    } catch (e) {
      alert("Failed to save form template: " + (e.response?.data?.error || e.message));
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this custom form?")) return;
    try {
      await API.delete(`/api/forms/delete/${id}`);
      loadForms();
    } catch (e) {
      alert("Failed to delete form: " + (e.response?.data?.error || e.message));
    }
  };

  const handlePublish = async (id) => {
    try {
      await API.post(`/api/forms/publish/${id}`);
      loadForms();
    } catch (e) {
      alert("Failed to publish form: " + (e.response?.data?.error || e.message));
    }
  };

  const handleClone = async (id) => {
    try {
      await API.post(`/api/forms/clone/${id}`);
      loadForms();
    } catch (e) {
      alert("Failed to clone form: " + (e.response?.data?.error || e.message));
    }
  };

  const handleViewQr = (form) => {
    const url = `${window.location.origin}/public/form/${form.id}`;
    setQrUrl(url);
    setShowQrModal(true);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await API.post("/api/forms/ai-generate", { prompt: aiPrompt });
      const generated = res.data;
      
      // Parse values if needed
      const fields = (generated.fields || []).map(f => {
        return {
          ...f,
          optionsJson: typeof f.optionsJson === "object" && f.optionsJson !== null ? JSON.stringify(f.optionsJson) : f.optionsJson,
          validationJson: typeof f.validationJson === "object" && f.validationJson !== null ? JSON.stringify(f.validationJson) : f.validationJson,
          conditionalJson: typeof f.conditionalJson === "object" && f.conditionalJson !== null ? JSON.stringify(f.conditionalJson) : f.conditionalJson
        };
      });

      setActiveForm({
        formName: generated.formName || "AI Form",
        description: generated.description || "",
        fields
      });
      
      setShowAiModal(false);
      setAiPrompt("");
      setView("build");
    } catch (e) {
      alert("AI Generation failed: " + (e.response?.data?.error || e.message));
    } finally {
      setAiLoading(false);
    }
  };
  // KPIs
  const totalCount = forms.length;
  const publishedCount = forms.filter(f => f.status === "PUBLISHED").length;
  const draftCount = forms.filter(f => f.status === "DRAFT").length;
  const archivedCount = forms.filter(f => f.status === "ARCHIVED").length;
  if (view === "build") {
    return (
      <DynamicFormBuilder 
        formStructure={activeForm}
        onSave={handleSaveForm}
        onCancel={() => setView("list")}
      />
    );
  }

  if (view === "submissions") {
    return (
      <FormSubmissionDashboard 
        formId={selectedSubmissionsFormId}
        onBack={() => setView("list")}
      />
    );
  }

  return (
    <Box sx={{ p: 2, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Banner */}
      <Box 
        sx={{
          background: "linear-gradient(135deg, #0A1628 0%, #0C2244 30%, #047857 65%, #065F46 100%)",
          borderRadius: "14px", p: 3, display: "flex", alignItems: "center", 
          justifyContent: "space-between", mb: 3, color: "#fff", flexWrap: "wrap", gap: 2,
          boxShadow: "0 10px 30px rgba(4,120,87,0.2)"
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>📋 Dynamic Form Builder</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Empower hospital admins to construct custom layouts, configure validation parameters, and retrieve patient submission data.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowTemplateModal(true)} 
            startIcon={<AutoMode />} 
            sx={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff", textTransform: "none", fontWeight: 700 }}
          >
            Use Template
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setShowAiModal(true)} 
            startIcon={<SmartToy />} 
            sx={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", textTransform: "none", fontWeight: 700, color: "#fff" }}
          >
            AI Generate
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateNew} 
            startIcon={<Add />} 
            sx={{ background: "#059669", "&:hover": { background: "#047857" }, textTransform: "none", fontWeight: 700 }}
          >
            New Blank Form
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>{error}</Alert>}

      {/* KPIs Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", background: "var(--hm-card)", borderColor: "var(--hm-card-border)" }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>Total Templates</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{totalCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", background: "var(--hm-card)", borderColor: "var(--hm-card-border)" }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>Active Published</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: "#059669" }}>{publishedCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", background: "var(--hm-card)", borderColor: "var(--hm-card-border)" }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>Pending Drafts</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: "#D97706" }}>{draftCount}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "12px", background: "var(--hm-card)", borderColor: "var(--hm-card-border)" }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>Archived Copies</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: "#64748B" }}>{archivedCount}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Forms Grid View */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#059669" }} />
        </Box>
      ) : forms.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 8, textCenter: "center", borderRadius: "14px", border: "1.5px dashed var(--hm-card-border)", background: "var(--hm-card)" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="h1" sx={{ opacity: 0.3, mb: 1 }}>📋</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>No Custom Forms Found</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>Create form configurations manually or request our AI helper to bootstrap one.</Typography>
            <Button variant="contained" onClick={handleCreateNew} startIcon={<Add />} sx={{ background: "#059669" }}>Create Form</Button>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {forms.map((form) => (
            <Grid item xs={12} sm={6} md={4} key={form.id}>
              <Card 
                sx={{ 
                  borderRadius: "14px", 
                  border: "1.5px solid var(--hm-card-border)", 
                  background: "var(--hm-card)",
                  transition: "transform 0.18s, box-shadow 0.18s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    borderColor: "#6EE7B7"
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: "var(--hm-text)" }}>
                      {form.formName}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          fontSize: 10, px: 1, py: 0.2, fontWeight: 700, 
                          color: form.status === "PUBLISHED" ? "#059669" : form.status === "DRAFT" ? "#D97706" : "#475569",
                          borderColor: form.status === "PUBLISHED" ? "#A7F3D0" : form.status === "DRAFT" ? "#FDE68A" : "#CBD5E1",
                          background: form.status === "PUBLISHED" ? "#ECFDF5" : form.status === "DRAFT" ? "#FFFBEB" : "#F1F5F9"
                        }}
                      >
                        {form.status}
                      </Paper>
                      <Paper variant="outlined" sx={{ fontSize: 10, px: 1, py: 0.2, fontWeight: 700 }}>
                        V{form.version}
                      </Paper>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ color: "var(--hm-text-muted)", fontSize: 12.5, minHeight: 40, mb: 2, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {form.description || "No description provided."}
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2.5, fontSize: 11.5, color: "var(--hm-text-muted)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Fields Count:</span>
                      <strong>{form.fields?.length || 0} fields</strong>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Public Link:</span>
                      <strong>{form.publicAccess ? "Enabled (Public)" : "Disabled (Private)"}</strong>
                    </Box>
                    {form.workflowIntegration && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Workflow integration:</span>
                        <strong>{form.workflowIntegration}</strong>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Actions Drawer */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Preview Form layout">
                        <IconButton size="small" onClick={() => { setPreviewForm(form); setShowPreviewModal(true); }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Submissions report">
                        <IconButton size="small" onClick={() => { setSelectedSubmissionsFormId(form.id); setView("submissions"); }}>
                          <BarChart fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {form.publicAccess && form.status === "PUBLISHED" && (
                        <Tooltip title="QR Code Link access">
                          <IconButton size="small" onClick={() => handleViewQr(form)}>
                            <QrCode fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Clone form configuration">
                        <IconButton size="small" onClick={() => handleClone(form.id)}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {form.status !== "PUBLISHED" && (
                        <Tooltip title="Publish to active mode">
                          <IconButton size="small" color="success" onClick={() => handlePublish(form.id)}>
                            <Publish fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit form definition">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(form)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete form">
                        <IconButton size="small" color="error" onClick={() => handleDelete(form.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* AI Generate Prompt Modal */}
      <Dialog 
        open={showAiModal} 
        onClose={() => !aiLoading && setShowAiModal(false)}
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#6D28D9", display: "flex", alignItems: "center", gap: 1 }}>
          <SmartToy /> AI Form Generator
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "var(--hm-divider)" }}>
          <Typography variant="body2" sx={{ mb: 2, color: "var(--hm-text-muted)" }}>
            Describe the clinical or administrative form you want to create (e.g. "Create a blood donation screening form with weight limit and vaccination details"). Vantoor AI will generate the fields, layouts, options and validations.
          </Typography>
          <TextField
            label="What form would you like to build?"
            placeholder="e.g. Surgery consent form, COVID screening, patient feedback..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            fullWidth
            multiline
            rows={3}
            disabled={aiLoading}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowAiModal(false)} disabled={aiLoading}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAiGenerate}
            disabled={aiLoading || !aiPrompt.trim()}
            sx={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", color: "#fff", px: 3, fontWeight: 700 }}
          >
            {aiLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Generate Form"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pre-Defined Templates Modal */}
      <Dialog 
        open={showTemplateModal} 
        onClose={() => setShowTemplateModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#065F46" }}>
          Select Form Template
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "var(--hm-divider)" }}>
          <Grid container spacing={2}>
            {DEFAULT_TEMPLATES.map((tmpl, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <Paper 
                  variant="outlined" 
                  onClick={() => handleSelectTemplate(tmpl)}
                  sx={{ 
                    p: 2.5, 
                    borderRadius: "12px", 
                    cursor: "pointer", 
                    borderColor: "var(--hm-card-border)", 
                    background: "var(--hm-input-bg)",
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: "#059669",
                      background: "#F0FDF4"
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 800, mb: 0.5, color: "#047857" }}>
                    {tmpl.formName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "var(--hm-text-muted)", display: "block" }}>
                    {tmpl.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowTemplateModal(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Display Modal */}
      <Dialog 
        open={showQrModal} 
        onClose={() => setShowQrModal(false)}
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Access QR Link</span>
          <IconButton size="small" onClick={() => setShowQrModal(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", pb: 3 }}>
          <Paper variant="outlined" sx={{ p: 2.5, background: "#fff", display: "inline-block", mb: 3 }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}`} 
              alt="QR Link" 
              style={{ display: "block" }} 
            />
          </Paper>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "var(--hm-text)" }}>
            Scan QR code to access form
          </Typography>
          <TextField
            value={qrUrl}
            size="small"
            fullWidth
            InputProps={{
              readOnly: true,
              style: { fontFamily: "monospace", fontSize: 12.5 },
              endAdornment: (
                <Button 
                  size="small" 
                  onClick={() => { navigator.clipboard.writeText(qrUrl); alert("URL copied to clipboard!"); }}
                  sx={{ fontWeight: 700 }}
                >
                  Copy
                </Button>
              )
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Layout Modal */}
      <Dialog 
        open={showPreviewModal} 
        onClose={() => setShowPreviewModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Preview Form: {previewForm?.formName}</span>
          <IconButton size="small" onClick={() => setShowPreviewModal(false)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "var(--hm-divider)" }}>
          {previewForm && (
            <DynamicFormRenderer 
              formStructure={previewForm} 
              onSubmit={(vals) => { alert("Preview Submit Successful!\n" + JSON.stringify(vals, null, 2)); setShowPreviewModal(false); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
