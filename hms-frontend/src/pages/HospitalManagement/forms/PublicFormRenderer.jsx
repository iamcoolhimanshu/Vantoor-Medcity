import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  Box, Container, Paper, Typography, CircularProgress, 
  Alert, Card, CardContent, Divider 
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import DynamicFormRenderer from "./DynamicFormRenderer";
import API from "../../../api/api";

export default function PublicFormRenderer() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState({});

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/api/forms/${id}`);
      const data = res.data;
      
      // Safety check: ensure form is published and public
      if (!data.publicAccess || !"PUBLISHED".equalsIgnoreCase(data.status)) {
        setError("This form is not available for public access.");
      } else {
        setForm(data);
      }
    } catch (e) {
      setError("Unable to load the requested form. It may not exist or is private.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setSubmissionErrors({});
    try {
      await API.post(`/api/forms/submit/${id}`, values);
      setSubmitted(true);
    } catch (e) {
      const errData = e.response?.data;
      if (errData && errData.message && errData.message.includes("Validation failed")) {
        // Extract validation errors if possible
        setError("Form validation failed. Please check the fields and try again.");
      } else {
        setError("Submission failed: " + (errData?.error || e.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
        <CircularProgress sx={{ color: "#059669" }} />
        <Typography sx={{ ml: 2, fontWeight: 700, color: "#475569" }}>Loading patient form...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#F0F4FA", py: 6, px: 2 }}>
      <Container maxWidth="sm">
        {/* Premium Brand Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 4 }}>
          <Typography variant="h3" sx={{ fontSize: 32 }}>🏥</Typography>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0A1628", letterSpacing: "-0.5px" }}>
              Vantoor MedCity
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Smart Portal Link
            </Typography>
          </Box>
        </Box>

        {submitted ? (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: "18px", 
              textCenter: "center", 
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #E2E8F0"
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
              <CheckCircleOutline sx={{ fontSize: 72, color: "#059669", mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 1 }}>
                Form Submitted Successfully
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", mb: 3 }}>
                Your responses have been recorded in our medical records system.
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                You can now close this browser tab safely.
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: "18px", 
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid #E2E8F0"
            }}
          >
            {/* Form Header Banner */}
            <Box 
              sx={{ 
                p: 3, 
                color: "#fff", 
                background: "linear-gradient(135deg, #0A1628 0%, #065F46 100%)",
                borderTopLeftRadius: "18px",
                borderTopRightRadius: "18px"
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {form?.formName}
              </Typography>
              {form?.description && (
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mt: 1 }}>
                  {form.description}
                </Typography>
              )}
            </Box>

            <CardContent sx={{ p: 4 }}>
              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: "10px" }}>{error}</Alert>}
              {form && (
                <DynamicFormRenderer
                  formStructure={form}
                  onSubmit={handleSubmit}
                  isSubmitting={submitting}
                  externalErrors={submissionErrors}
                />
              )}
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 4, textCenter: "center" }}>
          <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>
            Powered by Vantoor AI-Hospital Management Systems
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
