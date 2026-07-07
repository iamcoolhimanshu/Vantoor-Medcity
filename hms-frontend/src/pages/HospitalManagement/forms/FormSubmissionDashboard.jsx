import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Button, TextField, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  IconButton, Card, CardContent, Grid, Divider, Alert, 
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions 
} from "@mui/material";
import { 
  ArrowBack, Download, Print, Search, Visibility, Delete 
} from "@mui/icons-material";
import API from "../../../api/api";

export default function FormSubmissionDashboard({ formId, onBack }) {
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  
  // Modal for viewing a single submission in detail
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadData();
  }, [formId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [formRes, subRes] = await Promise.all([
        API.get(`/api/forms/${formId}`),
        API.get(`/api/forms/submissions/${formId}`)
      ]);
      setForm(formRes.data);
      
      // Parse submissionJson for each submission
      const parsedSubs = (subRes.data || []).map(sub => {
        let values = {};
        try {
          values = sub.submissionJson ? JSON.parse(sub.submissionJson) : {};
        } catch (e) {
          console.warn("Failed to parse submission JSON:", sub.submissionJson);
        }
        return {
          ...sub,
          parsedValues: values
        };
      });
      setSubmissions(parsedSubs);
    } catch (e) {
      setError("Failed to load submissions: " + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const getHeaders = () => {
    if (!form || !form.fields) return [];
    // Show only first 4 non-header/divider fields in the main table to keep it tidy
    return form.fields
      .filter(f => f.fieldType !== "SECTION_HEADER" && f.fieldType !== "DIVIDER")
      .slice(0, 4);
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    
    // Search in submittedBy or in any field values
    const inSubmitter = (sub.submittedBy || "").toLowerCase().includes(term);
    const inValues = Object.values(sub.parsedValues).some(val => {
      if (typeof val === "object" && val !== null) {
        return (val.fileName || "").toLowerCase().includes(term);
      }
      return String(val).toLowerCase().includes(term);
    });
    
    return inSubmitter || inValues;
  });

  // Export Submissions to CSV
  const exportToCSV = () => {
    if (!form || !submissions.length) return;
    
    const fields = form.fields.filter(f => f.fieldType !== "SECTION_HEADER" && f.fieldType !== "DIVIDER");
    
    // Headers
    const csvHeaders = ["Submission ID", "Submitted By", "Submitted At", ...fields.map(f => f.fieldLabel)];
    
    // Rows
    const csvRows = filteredSubmissions.map(sub => {
      const row = [
        sub.id,
        sub.submittedBy,
        new Date(sub.createdAt).toLocaleString("en-IN"),
        ...fields.map(f => {
          const val = sub.parsedValues[f.fieldName];
          if (val === undefined || val === null) return "";
          if (typeof val === "object") return val.fileName || "File";
          return String(val).replace(/"/g, '""'); // escape quotes
        })
      ];
      return row.map(cell => `"${cell}"`).join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [csvHeaders.join(","), ...csvRows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${form.formName.replace(/\s+/g, "_")}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger print overlay for the submission list or analytics
  const handlePrint = () => {
    window.print();
  };

  // In-Memory Analytics: Aggregate field values for visual statistics
  const getAnalytics = () => {
    if (!form || !submissions.length) return [];
    
    const analytics = [];
    const fields = form.fields.filter(f => ["DROPDOWN", "RADIO_BUTTON", "CHECKBOX", "RATING", "SWITCH"].includes(f.fieldType));

    fields.slice(0, 3).forEach(field => {
      const frequencies = {};
      let totalCount = 0;

      submissions.forEach(sub => {
        const val = sub.parsedValues[field.fieldName];
        if (val !== undefined && val !== null && val !== "") {
          const vals = Array.isArray(val) ? val : [val];
          vals.forEach(v => {
            const label = String(v);
            frequencies[label] = (frequencies[label] || 0) + 1;
            totalCount++;
          });
        }
      });

      if (totalCount > 0) {
        const sorted = Object.entries(frequencies)
          .map(([value, count]) => ({
            value,
            count,
            pct: Math.round((count / totalCount) * 100)
          }))
          .sort((a, b) => b.count - a.count);

        analytics.push({
          label: field.fieldLabel,
          fieldName: field.fieldName,
          data: sorted,
          total: totalCount
        });
      }
    });

    return analytics;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <CircularProgress sx={{ color: "#059669" }} />
        <Typography sx={{ ml: 2, fontWeight: 700, color: "var(--hm-text-muted)" }}>Loading report log...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>Back</Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const tableHeaders = getHeaders();
  const formAnalytics = getAnalytics();

  return (
    <Box sx={{ p: 1 }}>
      {/* Action Header bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={onBack} sx={{ border: "1.5px solid var(--hm-card-border)", borderRadius: "10px" }}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--hm-text)" }}>
              {form?.formName} • Submissions Report
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--hm-text-muted)" }}>
              Manage, search, export, and view analytics of submitted forms
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handlePrint}
            startIcon={<Print />}
            sx={{ textTransform: "none", fontWeight: 700, borderColor: "var(--hm-card-border)", color: "var(--hm-text)" }}
          >
            Print PDF
          </Button>
          <Button
            variant="contained"
            onClick={exportToCSV}
            disabled={filteredSubmissions.length === 0}
            startIcon={<Download />}
            sx={{ textTransform: "none", fontWeight: 700, background: "linear-gradient(135deg, #065F46 0%, #047857 100%)", color: "#fff" }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Analytics Panel */}
      {submissions.length > 0 && formAnalytics.length > 0 && (
        <Card sx={{ mb: 3, borderRadius: "14px", border: "1px solid var(--hm-card-border)", background: "var(--hm-card)" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#065F46", textTransform: "uppercase", mb: 2, letterSpacing: 0.5 }}>
              Field Response Frequencies (Quick Analytics)
            </Typography>
            <Grid container spacing={3}>
              {formAnalytics.map((analytics, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Paper variant="outlined" sx={{ p: 2, background: "var(--hm-input-bg)", borderColor: "var(--hm-card-border)" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: "var(--hm-text)" }}>
                      {analytics.label}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                      {analytics.data.slice(0, 4).map((row, rIdx) => (
                        <Box key={rIdx}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--hm-text-muted)" }}>{row.value}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{row.count} ({row.pct}%)</Typography>
                          </Box>
                          <Box sx={{ width: "100%", height: "6px", background: "var(--hm-card-border)", borderRadius: "10px", overflow: "hidden" }}>
                            <Box sx={{ width: `${row.pct}%`, height: "100%", background: "#059669", borderRadius: "10px" }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Main Table Card */}
      <Card sx={{ borderRadius: "14px", border: "1px solid var(--hm-card-border)", background: "var(--hm-card)" }}>
        <CardContent sx={{ p: 0 }}>
          {/* Search bar */}
          <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--hm-divider)", background: "var(--hm-input-bg)" }}>
            <Box sx={{ position: "relative", width: "100%", maxWidth: 360 }}>
              <TextField
                placeholder="Search report logs..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: <Search sx={{ color: "var(--hm-text-faint)", mr: 1, fontSize: 20 }} />,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "var(--hm-text-muted)", fontWeight: 600 }}>
              Showing {filteredSubmissions.length} of {submissions.length} logs
            </Typography>
          </Box>

          {filteredSubmissions.length === 0 ? (
            <Box sx={{ p: 8, textCenter: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography variant="h2" sx={{ opacity: 0.3, mb: 1 }}>🏥</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "var(--hm-text-muted)" }}>
                No submissions found matching criteria.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ background: "var(--hm-thead)" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: "var(--hm-thead-text)", fontSize: 11, textTransform: "uppercase" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "var(--hm-thead-text)", fontSize: 11, textTransform: "uppercase" }}>Submitted By</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "var(--hm-thead-text)", fontSize: 11, textTransform: "uppercase" }}>Date / Time</TableCell>
                    {tableHeaders.map(h => (
                      <TableCell key={h.fieldName} sx={{ fontWeight: 800, color: "var(--hm-thead-text)", fontSize: 11, textTransform: "uppercase" }}>
                        {h.fieldLabel}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ fontWeight: 800, color: "var(--hm-thead-text)", fontSize: 11, textTransform: "uppercase" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSubmissions.map((sub) => (
                    <TableRow key={sub.id} hover sx={{ "&:hover": { background: "var(--hm-row-hover)" } }}>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>#{sub.id}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{sub.submittedBy}</TableCell>
                      <TableCell sx={{ color: "var(--hm-text-muted)", fontSize: 12.5 }}>
                        {new Date(sub.createdAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </TableCell>
                      {tableHeaders.map(h => {
                        const val = sub.parsedValues[h.fieldName];
                        let renderedVal = "—";
                        if (val !== undefined && val !== null) {
                          if (typeof val === "object") {
                            renderedVal = `✓ ${val.fileName}`;
                          } else if (typeof val === "boolean") {
                            renderedVal = val ? "True" : "False";
                          } else {
                            renderedVal = String(val);
                          }
                        }
                        return (
                          <TableCell key={h.fieldName} sx={{ color: "var(--hm-text)", maxWith: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {renderedVal}
                          </TableCell>
                        );
                      })}
                      <TableCell align="right">
                        <Button 
                          variant="text" 
                          size="small" 
                          startIcon={<Visibility />}
                          onClick={() => setSelectedSubmission(sub)}
                          sx={{ textTransform: "none", fontWeight: 700, color: "#059669" }}
                        >
                          View Full
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog for viewing full submission details */}
      <Dialog 
        open={!!selectedSubmission} 
        onClose={() => setSelectedSubmission(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "18px", p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#065F46", pb: 1 }}>
          Submission Record #{selectedSubmission?.id}
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: "var(--hm-divider)" }}>
          {selectedSubmission && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Submitted By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedSubmission.submittedBy}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Submitted At</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {new Date(selectedSubmission.createdAt).toLocaleString("en-IN")}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#047857" }}>
                Form Values
              </Typography>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {form?.fields
                  .filter(f => f.fieldType !== "SECTION_HEADER" && f.fieldType !== "DIVIDER")
                  .map(field => {
                    const val = selectedSubmission.parsedValues[field.fieldName];
                    let rendered = <Typography variant="body2" sx={{ fontWeight: 500 }}>—</Typography>;
                    
                    if (val !== undefined && val !== null && val !== "") {
                      if (field.fieldType === "SIGNATURE_PAD" && typeof val === "string" && val.startsWith("data:image")) {
                        rendered = (
                          <Box sx={{ mt: 0.5, p: 0.5, border: "1px dashed var(--hm-card-border)", background: "#fff", display: "inline-block", borderRadius: "8px" }}>
                            <img src={val} alt="Signature" style={{ maxHeight: 70, display: "block" }} />
                          </Box>
                        );
                      } else if ((field.fieldType === "FILE_UPLOAD" || field.fieldType === "IMAGE_UPLOAD") && typeof val === "object") {
                        rendered = (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>
                              ✓ {val.fileName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "var(--hm-text-faint)" }}>
                              ({(val.fileSize / 1024).toFixed(1)} KB)
                            </Typography>
                          </Box>
                        );
                      } else if (Array.isArray(val)) {
                        rendered = <Typography variant="body2" sx={{ fontWeight: 700 }}>{val.join(", ")}</Typography>;
                      } else if (typeof val === "boolean") {
                        rendered = <Typography variant="body2" sx={{ fontWeight: 700 }}>{val ? "Yes / True" : "No / False"}</Typography>;
                      } else {
                        rendered = <Typography variant="body2" sx={{ fontWeight: 700 }}>{String(val)}</Typography>;
                      }
                    }

                    return (
                      <Box key={field.fieldName} sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "var(--hm-text-muted)" }}>
                          {field.fieldLabel}
                        </Typography>
                        {rendered}
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setSelectedSubmission(null)} sx={{ fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
